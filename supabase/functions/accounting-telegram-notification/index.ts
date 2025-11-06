import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Accounting bot token - جميع إشعارات المحاسبة تستخدم هذا البوت
const ACCOUNTING_BOT_TOKEN = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    console.log('💰 Accounting Telegram notification received')

    const body = await req.json()
    const { bot_token, chat_id, message, transaction_id, transaction_type, amount, report_type } = body

    const botToken = bot_token || ACCOUNTING_BOT_TOKEN
    const chatId = chat_id

    if (!message) {
      console.error('❌ Missing message')
      return new Response(
        JSON.stringify({ error: 'Missing message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send notification to all authenticated admin chats
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const chatIds: string[] = []

    // Add provided chat_id
    if (chatId) {
      chatIds.push(chatId)
    }

    // Try to get accounting telegram config (id = 3) for admin_chat_id
    try {
      const { data: accountingConfig, error: configError } = await supabase
        .from('telegram_config')
        .select('admin_chat_id')
        .eq('id', 3)
        .maybeSingle()

      if (accountingConfig && accountingConfig.admin_chat_id && !chatIds.includes(accountingConfig.admin_chat_id)) {
        chatIds.push(accountingConfig.admin_chat_id)
        console.log('✅ Found admin_chat_id from telegram_config (id=3)')
      }
    } catch (configErr) {
      console.warn('⚠️ Could not get accounting telegram config:', configErr)
    }

    // Get all active authenticated sessions from accounting_telegram_auth
    // These are sessions created after users login via email/password
    try {
      const { data: authSessions, error: authError } = await supabase
        .from('accounting_telegram_auth')
        .select('telegram_chat_id, expires_at, email')
        .eq('is_active', true)

      // Add all authenticated admin chat IDs (only non-expired sessions)
      if (authSessions && !authError) {
        const validSessions = authSessions.filter((session: any) => {
          // Check if session is not expired
          if (!session.expires_at) {
            // If no expires_at, assume it's valid (for backward compatibility)
            return true
          }
          const expiresAt = new Date(session.expires_at)
          const isNotExpired = expiresAt > new Date()
          return isNotExpired && session.telegram_chat_id
        })
        
        validSessions.forEach((session: any) => {
          if (session.telegram_chat_id && !chatIds.includes(session.telegram_chat_id)) {
            chatIds.push(session.telegram_chat_id)
            console.log(`✅ Added authenticated user: ${session.email || 'unknown'} (chat_id: ${session.telegram_chat_id})`)
          }
        })
        console.log(`✅ Found ${validSessions.length} active non-expired session(s) in accounting_telegram_auth`)
      } else if (authError) {
        // If table doesn't exist, treat as not authenticated (same as bot logic)
        if (authError.code === 'PGRST204' || authError.code === 'PGRST116' || authError.code === '42P01') {
          console.warn('⚠️ accounting_telegram_auth table does not exist yet. Users need to login via the bot first.')
        } else {
          console.warn('⚠️ Error querying accounting_telegram_auth:', authError.message)
        }
      }
    } catch (authErr) {
      // Table might not exist, that's OK (same as bot logic)
      console.warn('⚠️ Error checking auth session (table might not exist):', authErr)
      console.warn('💡 Users need to login via the bot first using: /login email:your@email.com password:yourpassword')
    }

    // Check if there are any recipients
    if (chatIds.length === 0) {
      console.warn('⚠️ No recipients found for accounting notification')
      console.warn('💡 To fix this:')
      console.warn('   1. Login to the bot via Telegram using: /login email:your@email.com password:yourpassword')
      console.warn('   2. Or add admin_chat_id to telegram_config table (id=3)')
      console.warn('   3. Or provide chat_id in the request body')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No recipients configured',
          message: 'No chat IDs found. Please:\n1. Login to the bot via Telegram: /login email:your@email.com password:yourpassword\n2. Or add admin_chat_id to telegram_config (id=3)\n3. Or provide chat_id in request',
          details: {
            provided_chat_id: !!chatId,
            checked_config: true,
            checked_auth_table: true,
            note: 'Users must login via the bot first using email/password authentication'
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📤 Sending accounting notification to ${chatIds.length} recipient(s)`)

    // Send message to all chats
    const results = await Promise.allSettled(
      chatIds.map(chatId => sendTelegramMessage(botToken, chatId, message, { parse_mode: 'HTML' }))
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length

    console.log(`✅ Sent notifications to ${successCount} chats, ${failureCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_to: successCount,
        failed: failureCount,
        recipients: chatIds.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Accounting notification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Send Telegram message
async function sendTelegramMessage(botToken: string, chatId: string, text: string, options: any = {}) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        ...options
      })
    })

    const result = await response.json()
    if (!result.ok) {
      console.error('❌ Failed to send Telegram message:', result)
      throw new Error(result.description || 'Failed to send message')
    }
    return result
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error)
    throw error
  }
}
