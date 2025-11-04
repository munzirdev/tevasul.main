import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Accounting bot token - جميع إشعارات المحاسبة تستخدم هذا البوت
const ACCOUNTING_BOT_TOKEN = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('💰 Accounting Telegram notification received')

    const body = await req.json()
    const { bot_token, chat_id, message, transaction_id, transaction_type, amount, report_type } = body

    const botToken = bot_token || ACCOUNTING_BOT_TOKEN
    const chatId = chat_id

    if (!chatId || !message) {
      console.error('❌ Missing chat_id or message')
      return new Response(
        JSON.stringify({ error: 'Missing chat_id or message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send notification to all authenticated admin chats
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active authenticated sessions
    const { data: authSessions, error: authError } = await supabase
      .from('accounting_telegram_auth')
      .select('telegram_chat_id')
      .eq('is_active', true)

    const chatIds: string[] = []

    // Add provided chat_id
    if (chatId) {
      chatIds.push(chatId)
    }

    // Add all authenticated admin chat IDs
    if (authSessions && !authError) {
      authSessions.forEach((session: any) => {
        if (session.telegram_chat_id && !chatIds.includes(session.telegram_chat_id)) {
          chatIds.push(session.telegram_chat_id)
        }
      })
    }

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
        failed: failureCount
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

