import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Accounting bot token
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
    console.log('📄 Generating invoice PDF...')

    const body = await req.json()
    const { invoice_html, invoice_number, bot_token, chat_id } = body

    if (!invoice_html) {
      return new Response(
        JSON.stringify({ error: 'Missing invoice_html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const botToken = bot_token || ACCOUNTING_BOT_TOKEN

    // Get all recipients (same logic as accounting-telegram-notification)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const chatIds: string[] = []

    // Add provided chat_id
    if (chat_id) {
      chatIds.push(chat_id)
    }

    // Try to get accounting telegram config (id = 3) for admin_chat_id
    try {
      const { data: accountingConfig } = await supabase
        .from('telegram_config')
        .select('admin_chat_id')
        .eq('id', 3)
        .maybeSingle()

      if (accountingConfig?.admin_chat_id && !chatIds.includes(accountingConfig.admin_chat_id)) {
        chatIds.push(accountingConfig.admin_chat_id)
      }
    } catch (configErr) {
      console.warn('⚠️ Could not get accounting telegram config:', configErr)
    }

    // Get all active authenticated sessions
    try {
      const { data: authSessions } = await supabase
        .from('accounting_telegram_auth')
        .select('telegram_chat_id, expires_at')
        .eq('is_active', true)

      if (authSessions) {
        const validSessions = authSessions.filter((session: any) => {
          if (!session.expires_at) return true
          return new Date(session.expires_at) > new Date()
        })
        
        validSessions.forEach((session: any) => {
          if (session.telegram_chat_id && !chatIds.includes(session.telegram_chat_id)) {
            chatIds.push(session.telegram_chat_id)
          }
        })
      }
    } catch (authErr) {
      console.warn('⚠️ Could not get authenticated sessions:', authErr)
    }

    if (chatIds.length === 0) {
      console.warn('⚠️ No recipients found for invoice PDF')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No recipients found. Please log in via the bot first.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert HTML to PDF using html2pdf.app service
    console.log('📄 Converting HTML to PDF...')
    const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: invoice_html,
        printBackground: true,
        format: 'A4'
      })
    })

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text()
      console.error('❌ PDF generation failed:', errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate PDF from HTML',
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })

    console.log(`✅ PDF generated successfully (${pdfBlob.size} bytes)`)

    // Send PDF to all recipients via Telegram
    const results = await Promise.allSettled(
      chatIds.map(async (chatId) => {
        try {
          const formData = new FormData()
          formData.append('chat_id', chatId)
          formData.append('document', pdfBlob, `invoice_${invoice_number || 'invoice'}.pdf`)
          formData.append('caption', `📄 <b>فاتورة جديدة</b>\n\nرقم الفاتورة: <b>${invoice_number || 'غير محدد'}</b>`)
          formData.append('parse_mode', 'HTML')

          const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendDocument`,
            {
              method: 'POST',
              body: formData
            }
          )

          const result = await telegramResponse.json()
          
          if (!result.ok) {
            console.error(`❌ Failed to send PDF to chat ${chatId}:`, result.description)
            throw new Error(result.description || 'Failed to send PDF')
          }

          console.log(`✅ PDF sent successfully to chat ${chatId}`)
          return result
        } catch (error) {
          console.error(`❌ Error sending PDF to chat ${chatId}:`, error)
          throw error
        }
      })
    )

      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failureCount = results.filter(r => r.status === 'rejected').length

      console.log(`✅ Sent invoice PDF to ${successCount} chat(s), ${failureCount} failed`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          sent_to: successCount, 
          failed: failureCount 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (pdfError) {
      console.error('❌ Error generating PDF:', pdfError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate PDF',
          details: pdfError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Invoice PDF generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

