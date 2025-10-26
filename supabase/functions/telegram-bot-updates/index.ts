import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Note: This function must be publicly accessible for Telegram webhooks
// Telegram doesn't send Authorization headers

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const update = await req.json()
    console.log('Received update:', JSON.stringify(update, null, 2))

    // التحقق من وجود رسالة
    if (!update.message) {
      console.log('No message in update')
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const message = update.message
    const chatId = message.chat.id.toString()
    const username = message.from.username || null
    const firstName = message.from.first_name || ''
    const lastName = message.from.last_name || ''
    const text = message.text || ''

    console.log('Processing message from chat:', chatId, 'username:', username, 'text:', text)

    // إذا كانت الرسالة تحتوي على أمر /start
    if (text.startsWith('/start')) {
      console.log('Start command received from username:', username)
      
      // التحقق من وجود username
      if (!username) {
        console.log('User has no username')
        const { data: config } = await supabase
          .from('telegram_config')
          .select('bot_token')
          .eq('id', 2)
          .single()

        if (config?.bot_token) {
          await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `❌ عذراً، لا يوجد لديك username في التلغرام.\n\nلاستخدام هذا البوت، يجب أن يكون لديك username:\n\n1. افتح إعدادات التلغرام\n2. اذهب إلى "الملف الشخصي"\n3. أضف username\n4. ارجع وأرسل /start مرة أخرى`,
              parse_mode: 'HTML'
            })
          })
        }
        return new Response(
          JSON.stringify({ ok: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // البحث عن المستخدم بواسطة username
      const { data: user, error: userError } = await supabase
        .from('telegram_allowed_users')
        .select('*')
        .eq('telegram_username', username)
        .eq('is_active', true)
        .single()

      const { data: config } = await supabase
        .from('telegram_config')
        .select('bot_token')
        .eq('id', 2)
        .single()

      if (!config?.bot_token) {
        console.log('No bot token found')
        return new Response(
          JSON.stringify({ ok: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (user && !userError) {
        console.log('User found, linking account')
        
        // تحديث chat_id للمستخدم
        const { error: updateError } = await supabase
          .from('telegram_allowed_users')
          .update({
            telegram_chat_id: chatId
          })
          .eq('id', user.id)

        if (!updateError) {
          console.log('Account linked successfully')
          // إرسال رسالة ترحيب وتأكيد
          await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ مرحباً ${firstName}! 🎉\n\n<b>تم ربط حسابك بنجاح</b>\n\nاسم الحساب: ${user.full_name || 'غير محدد'}\nUsername: @${username}\n\nستبدأ الآن باستلام الإشعارات من موقع Tevasul مباشرة هنا.\n\n━━━━━━━━━━━━━━━\n💡 <i>إذا كنت بحاجة للمساعدة، تواصل معنا عبر الموقع:</i>\nhttps://tevasul.group`,
              parse_mode: 'HTML',
              reply_markup: {
                remove_keyboard: true
              }
            })
          })
        } else {
          console.error('Error updating user:', updateError)
        }
      } else {
        console.log('User not found or not authorized')
        // المستخدم غير مصرح له
        await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `❌ عذراً @${username}\n\nحسابك غير مسجل في نظام الإشعارات.\n\n📋 <b>للحصول على الوصول:</b>\n1. تواصل مع فريق الدعم عبر الموقع\n2. سيقومون بإضافة username الخاص بك\n3. بعدها أرسل /start مرة أخرى\n\n🌐 <b>موقعنا:</b>\nhttps://tevasul.group`,
            parse_mode: 'HTML'
          })
        })
      }
    }
    // إذا كانت رسالة عادية من مستخدم مسجل
    else {
      // التحقق من أن المستخدم مسجل
      const { data: user } = await supabase
        .from('telegram_allowed_users')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .single()

      if (user) {
        const { data: config } = await supabase
          .from('telegram_config')
          .select('bot_token')
          .eq('id', 2)
          .single()

        if (config?.bot_token) {
          await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `شكراً على رسالتك. هذا البوت مخصص لإرسال الإشعارات فقط.\n\nإذا كنت بحاجة للمساعدة، يرجى زيارة الموقع: https://tevasul.group`,
              parse_mode: 'HTML'
            })
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing update:', error)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

