import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib@1.17.1'

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

    // معالجة callback queries (الأزرار)
    if (update.callback_query) {
      console.log('Callback query detected:', JSON.stringify(update.callback_query, null, 2))
      await handleCallbackQuery(supabase, update.callback_query)
      console.log('Callback query handled successfully')
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // التحقق من وجود جلسة محادثة نشطة
    const { data: activeSession } = await supabase
      .from('telegram_conversation_sessions')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // إذا كان هناك جلسة نشطة، معالجة الرد
    if (activeSession && text !== '/cancel' && !text.startsWith('/start')) {
      await handleConversationStep(supabase, chatId, activeSession, text)
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // إلغاء الجلسة
    if (text === '/cancel') {
      await supabase
        .from('telegram_conversation_sessions')
        .update({ status: 'cancelled' })
        .eq('telegram_chat_id', chatId)
        .eq('status', 'active')

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
            text: '❌ تم إلغاء العملية.\n\nيمكنك البدء من جديد بإرسال /start',
            parse_mode: 'HTML'
          })
        })
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
          // إرسال رسالة ترحيب مع القائمة الرئيسية
          await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ مرحباً ${firstName}! 🎉\n\n<b>تم ربط حسابك بنجاح</b>\n\nاسم الحساب: ${user.full_name || 'غير محدد'}\nUsername: @${username}\n\nستبدأ الآن باستلام الإشعارات من موقع Tevasul مباشرة هنا.\n\n━━━━━━━━━━━━━━━\n📋 <b>الخدمات المتاحة:</b>\n\nاختر الخدمة التي تريدها من القائمة أدناه:`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🔄 نموذج العودة الطوعية', callback_data: 'start_voluntary_return' }
                  ],
                  [
                    { text: '🌐 زيارة الموقع', url: 'https://tevasul.group' }
                  ]
                ]
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
        // التحقق من وجود جلسة محادثة نشطة لمتابعة المحادثة مع عميل
        const { data: activeChatSession } = await supabase
          .from('telegram_chat_sessions')
          .select('*')
          .eq('admin_telegram_chat_id', chatId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (activeChatSession) {
          // هذا رد من المشرف على رسالة عميل، يجب إرساله إلى العميل
          await handleAdminReplyToCustomer(supabase, chatId, activeChatSession, text, firstName)
          return new Response(
            JSON.stringify({ ok: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

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

// دالة لمعالجة callback queries (الأزرار)
async function handleCallbackQuery(supabase: any, callbackQuery: any) {
  console.log('handleCallbackQuery called with:', JSON.stringify(callbackQuery, null, 2))
  try {
    const chatId = callbackQuery.message.chat.id.toString()
    const callbackData = callbackQuery.data
    const messageId = callbackQuery.message.message_id

    console.log('Handling callback:', callbackData, 'chatId:', chatId)

    const { data: config } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .eq('id', 2)
      .single()

    if (!config?.bot_token) {
      console.error('No bot token found')
      return
    }

    const botToken = config.bot_token

    // الرد على callback query بدون رسالة (clean mode)
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id
      })
    })

    // معالجة الأزرار
    if (callbackData.startsWith('start_chat:')) {
    // معالجة بدء محادثة مع عميل
    const sessionId = callbackData.replace('start_chat:', '')
    
    console.log('Checking admin user for chatId:', chatId, 'Type:', typeof chatId)
    
    // التحقق من أن المستخدم مسجل - استخدام string matching
    const { data: allUsers } = await supabase
      .from('telegram_allowed_users')
      .select('*')
      .eq('is_active', true)

    console.log('All active users:', allUsers)
    
    const adminUser = allUsers?.find((user: any) => user.telegram_chat_id === chatId || user.telegram_chat_id === chatId.toString())

    console.log('Matched admin user:', adminUser)

    if (!adminUser) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `❌ غير مصرح لك باستخدام هذه الميزة.\n\nChat ID: ${chatId}\n\nيرجى التحقق من إعدادات المستخدم.`,
          parse_mode: 'HTML'
        })
      })
      return
    }

    // الحصول على معلومات الجلسة من chat_messages
    const { data: sessionInfo } = await supabase
      .from('chat_messages')
      .select('session_id')
      .eq('session_id', sessionId)
      .limit(1)
      .maybeSingle()

    if (!sessionInfo) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '❌ لم يتم العثور على الجلسة.',
          parse_mode: 'HTML'
        })
      })
      return
    }

    // التحقق من وجود محادثة نشطة أخرى
    const { data: existingSessions } = await supabase
      .from('telegram_chat_sessions')
      .select('session_id')
      .eq('admin_telegram_chat_id', chatId)
      .eq('status', 'active')

    // إغلاق أي محادثات نشطة أخرى للمشرف نفسه
    if (existingSessions && existingSessions.length > 0) {
      // إرسال تنبيه للمشرف عن المحادثات المغلقة
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `ℹ️ <b>تنبيه:</b> تم إغلاق ${existingSessions.length} محادثة نشطة أخرى وبدء محادثة جديدة`,
          parse_mode: 'HTML'
        })
      })

      await supabase
        .from('telegram_chat_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('admin_telegram_chat_id', chatId)
        .eq('status', 'active')
    }

    // إنشاء جلسة محادثة جديدة في telegram_chat_sessions
    const { data: newChatSession, error: sessionError } = await supabase
      .from('telegram_chat_sessions')
      .insert({
        session_id: sessionId,
        admin_telegram_chat_id: chatId,
        status: 'active'
      })
      .select()
      .single()

    if (sessionError && !sessionError.message?.includes('duplicate')) {
      console.error('Error creating chat session:', sessionError)
    }

    // إرسال رسالة نجاح للمشرف مع زر إنهاء المحادثة
    console.log('Sending success message to chatId:', chatId)
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ <b>تم بدء المحادثة مع العميل بنجاح</b>\n\n💬 <b>رقم الجلسة:</b> <code>${sessionId.substring(0, 8)}...</code>\n\nيمكنك الآن الرد مباشرة على العميل بكتابة رسالتك هنا 👇`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { 
                  text: '🔚 إنهاء المحادثة', 
                  callback_data: `end_chat:${sessionId}` 
                }
              ]
            ]
          }
        })
      })
      
      const result = await response.json()
      console.log('Telegram response:', JSON.stringify(result, null, 2))
      
      if (!result.ok) {
        console.error('Failed to send message:', result)
      }
    } catch (error) {
      console.error('Error sending success message:', error)
    }

    // جلب المحادثة كاملة وإرسالها للمشرف
    try {
      const { data: conversationMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (!messagesError && conversationMessages && conversationMessages.length > 0) {
        // تكوين نص المحادثة
        let conversationText = `<b>📜 سجل المحادثة الكامل:</b>\n\n`
        
        conversationMessages.forEach((msg: any, index: number) => {
          const sender = msg.sender === 'user' ? '👤 العميل' : msg.sender === 'admin' ? '👨‍💼 المشرف' : '🤖 المساعد'
          const time = new Date(msg.created_at).toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          
          // قص الرسائل الطويلة
          let content = msg.content
          if (content.length > 300) {
            content = content.substring(0, 300) + '...'
          }
          
          conversationText += `${index + 1}. ${sender} (${time}):\n${content}\n\n`
        })

        // إرسال المحادثة (Telegram limit: 4096 characters)
        if (conversationText.length > 4000) {
          conversationText = conversationText.substring(0, 3900) + '\n\n... (تم قص الرسالة)'
        }

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: conversationText,
            parse_mode: 'HTML'
          })
        })
      }
    } catch (error) {
      console.error('Error sending conversation history:', error)
    }
  }
  else if (callbackData.startsWith('end_chat:')) {
    // معالجة إنهاء المحادثة
    const sessionId = callbackData.replace('end_chat:', '')
    
    console.log('Ending chat session:', sessionId)
    
    // تحديث حالة الجلسة إلى "closed"
    const { error: updateError } = await supabase
      .from('telegram_chat_sessions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('admin_telegram_chat_id', chatId)
      .eq('status', 'active')
    
    if (updateError) {
      console.error('Error closing chat session:', updateError)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '❌ حدث خطأ في إنهاء المحادثة. يرجى المحاولة مرة أخرى.',
          parse_mode: 'HTML'
        })
      })
    } else {
      // إرسال رسالة تأكيد
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ <b>تم إنهاء المحادثة بنجاح</b>\n\nشكراً لك!',
          parse_mode: 'HTML'
        })
      })
      
      // حفظ رسالة إغلاق في قاعدة البيانات
      await supabase
        .from('chat_messages')
        .insert({
          content: 'تم إغلاق المحادثة من قبل ممثل خدمة العملاء',
          sender: 'admin',
          session_id: sessionId,
          created_at: new Date().toISOString()
        })
    }
  }
  else if (callbackData === 'start_voluntary_return') {
    // إنشاء جلسة جديدة
    await supabase
      .from('telegram_conversation_sessions')
      .insert({
        telegram_chat_id: chatId,
        telegram_username: callbackQuery.from.username,
        conversation_type: 'voluntary_return',
        current_step: 'awaiting_name',
        collected_data: {}
      })

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔄 <b>نموذج العودة الطوعية</b>\n\nمرحباً! سأساعدك في تعبئة نموذج العودة الطوعية.\n\n📝 <b>البيانات المطلوبة:</b>\n✅ الاسم بالتركية\n✅ الاسم بالعربية\n✅ رقم الكملك (11 رقم)\n✅ رقم الجوال\n✅ نقطة الحدود\n✅ المرافقين (رقم كملك + اسم)\n✅ تاريخ السفر (اختياري)\n\n━━━━━━━━━━━━━━━\n\n👤 <b>الخطوة 1/7:</b> يرجى إدخال <b>الاسم الكامل بالتركية</b>\n\n💡 <i>يمكنك إلغاء العملية بكتابة /cancel</i>`,
        parse_mode: 'HTML'
      })
    })
  }
  else if (callbackData.startsWith('border_')) {
    const borderNames: any = {
      'yayladagi': 'yayladağı',
      'cilvegoz': 'cilvegözü',
      'oncupinar': 'öncüpınar',
      'istanbul': 'istanbul havalimanı',
      'cobanbey': 'çobanbey',
      'zeytindali': 'zeytindalı',
      'karakamis': 'karakamış'
    }
    
    const borderName = callbackData.replace('border_', '')
    const { data: session } = await supabase
      .from('telegram_conversation_sessions')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (session) {
      const collectedData = session.collected_data || {}
      collectedData.borderPoint = borderNames[borderName]
      
      await supabase
        .from('telegram_conversation_sessions')
        .update({
          current_step: 'awaiting_date',
          collected_data: collectedData
        })
        .eq('id', session.id)

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ نقطة الحدود: <b>${collectedData.borderPoint}</b>\n\n━━━━━━━━━━━━━━━\n\n📅 <b>الخطوة 7/7:</b> هل تريد تحديد تاريخ سفر؟`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📅 نعم، تحديد تاريخ', callback_data: 'date_yes' }],
              [{ text: '⏩ لا، متابعة بدون تاريخ', callback_data: 'date_no' }]
            ]
          }
        })
      })
    }
  }
  else if (callbackData === 'date_no') {
    const { data: session } = await supabase
      .from('telegram_conversation_sessions')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (session) {
      // استخدام تاريخ اليوم بصيغة dd.mm.yyyy
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      const todayFormatted = `${dd}.${mm}.${yyyy}`
      
      const collectedData = session.collected_data || {}
      collectedData.travelDate = todayFormatted
      
      await supabase
        .from('telegram_conversation_sessions')
        .update({ collected_data: collectedData })
        .eq('id', session.id)
      
      await completeVoluntaryReturnForm(supabase, botToken, chatId, session)
    }
  }
  else if (callbackData === 'date_yes') {
    await supabase
      .from('telegram_conversation_sessions')
      .update({ current_step: 'awaiting_date_input' })
      .eq('telegram_chat_id', chatId)
      .eq('status', 'active')

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '📅 يرجى إدخال تاريخ السفر بالصيغة:\n\n<b>DD.MM.YYYY</b>\n\n💡 مثال: 15.01.2025',
        parse_mode: 'HTML'
      })
    })
  }
  else if (callbackData === 'main_menu') {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🏠 <b>القائمة الرئيسية</b>\n\nاختر الخدمة:',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 نموذج العودة الطوعية', callback_data: 'start_voluntary_return' }],
            [{ text: '🌐 زيارة الموقع', url: 'https://tevasul.group' }]
          ]
        }
      })
    })
  }
  } catch (error) {
    console.error('Error in handleCallbackQuery:', error)
  }
}

// دالة لمعالجة خطوات المحادثة
async function handleConversationStep(supabase: any, chatId: string, session: any, text: string) {
  const { data: config } = await supabase
    .from('telegram_config')
    .select('bot_token')
    .eq('id', 2)
    .single()

  if (!config?.bot_token) return

  const botToken = config.bot_token
  const collectedData = session.collected_data || {}
  let nextStep = ''
  let responseMessage = ''

  switch (session.current_step) {
    case 'awaiting_name':
      if (text.length < 3) {
        responseMessage = '❌ الاسم قصير جداً. يرجى إدخال الاسم الكامل (3 أحرف على الأقل).'
        nextStep = 'awaiting_name'
      } else {
        collectedData.fullNameTR = text
        nextStep = 'awaiting_name_ar'
        responseMessage = `✅ الاسم بالتركية: <b>${text}</b>\n\n━━━━━━━━━━━━━━━\n\n👤 <b>الخطوة 2/7:</b> يرجى إدخال <b>الاسم الكامل بالعربية</b>\n\n💡 مثال: أحمد محمد علي`
      }
      break

    case 'awaiting_name_ar':
      if (text.length < 3) {
        responseMessage = '❌ الاسم قصير جداً. يرجى إدخال الاسم الكامل بالعربية.'
        nextStep = 'awaiting_name_ar'
      } else {
        collectedData.fullNameAR = text
        nextStep = 'awaiting_kimlik'
        responseMessage = `✅ الاسم بالعربية: <b>${text}</b>\n\n━━━━━━━━━━━━━━━\n\n📋 <b>الخطوة 3/7:</b> يرجى إدخال <b>رقم الكملك</b> (11 رقم)\n\n💡 مثال: 12345678901`
      }
      break

    case 'awaiting_kimlik':
      const kimlikNo = text.replace(/\D/g, '')
      if (kimlikNo.length !== 11) {
        responseMessage = '❌ رقم الكملك يجب أن يكون 11 رقم. حاول مرة أخرى.'
        nextStep = 'awaiting_kimlik'
      } else {
        collectedData.kimlikNo = kimlikNo
        nextStep = 'awaiting_gsm'
        responseMessage = `✅ رقم الكملك: <code>${kimlikNo}</code>\n\n━━━━━━━━━━━━━━━\n\n📱 <b>الخطوة 4/7:</b> يرجى إدخال <b>رقم الجوال</b>\n\n💡 مثال: 05555555555\n\n<i>أو اكتب "تخطي" للمتابعة بدون رقم</i>`
      }
      break

    case 'awaiting_gsm':
      if (text.toLowerCase() === 'تخطي' || text.toLowerCase() === 'skip') {
        collectedData.gsm = null
        nextStep = 'awaiting_companions'
        responseMessage = `━━━━━━━━━━━━━━━\n\n👥 <b>الخطوة 5/7:</b> كم عدد <b>المرافقين</b>؟\n\n💡 أدخل رقم (0 إذا لم يكن هناك مرافقين)`
      } else {
        const gsmNo = text.replace(/\D/g, '')
        if (gsmNo.length < 10) {
          responseMessage = '❌ رقم الجوال غير صحيح. يرجى إدخال رقم صحيح أو كتابة "تخطي".'
          nextStep = 'awaiting_gsm'
        } else {
          collectedData.gsm = gsmNo
          nextStep = 'awaiting_companions'
          responseMessage = `✅ رقم الجوال: <code>${gsmNo}</code>\n\n━━━━━━━━━━━━━━━\n\n👥 <b>الخطوة 5/7:</b> كم عدد <b>المرافقين</b>؟\n\n💡 أدخل رقم (0 إذا لم يكن هناك مرافقين)`
        }
      }
      break

    case 'awaiting_companions':
      const companionsCount = parseInt(text)
      if (isNaN(companionsCount) || companionsCount < 0 || companionsCount > 20) {
        responseMessage = '❌ يرجى إدخال رقم صحيح من 0 إلى 20.'
        nextStep = 'awaiting_companions'
      } else {
        collectedData.companionsCount = companionsCount
        collectedData.refakatEntries = []
        
        if (companionsCount === 0) {
          // لا يوجد مرافقين - عرض قائمة نقاط الحدود مباشرة
          nextStep = 'awaiting_border'
          
          // تحديث الجلسة
          await supabase
            .from('telegram_conversation_sessions')
            .update({
              current_step: nextStep,
              collected_data: collectedData
            })
            .eq('id', session.id)

          // إرسال رسالة مع أزرار نقاط الحدود
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ لا يوجد مرافقين\n\n━━━━━━━━━━━━━━━\n\n🚧 <b>الخطوة 6/7:</b> اختر <b>نقطة الحدود</b> المطلوبة:`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🇹🇷 Yayladağı - كسب', callback_data: 'border_yayladagi' }],
                  [{ text: '🇹🇷 Cilvegözü - باب الهوى', callback_data: 'border_cilvegoz' }],
                  [{ text: '🇹🇷 Öncüpınar - باب السلامة', callback_data: 'border_oncupinar' }],
                  [{ text: '🇹🇷 İstanbul Havalimanı - مطار اسطنبول', callback_data: 'border_istanbul' }],
                  [{ text: '🇹🇷 Çobanbey - الراعي', callback_data: 'border_cobanbey' }],
                  [{ text: '🇹🇷 Zeytindalı - غصن الزيتون', callback_data: 'border_zeytindali' }],
                  [{ text: '🇹🇷 Karakamış - جرابلس', callback_data: 'border_karakamis' }]
                ]
              }
            })
          })
          return
        } else {
          collectedData.currentCompanionIndex = 0
          nextStep = 'awaiting_companion_kimlik'
          responseMessage = `✅ عدد المرافقين: <b>${companionsCount}</b>\n\n━━━━━━━━━━━━━━━\n\n👥 <b>مرافق 1 من ${companionsCount}:</b>\n\nيرجى إدخال <b>رقم كملك المرافق الأول</b> (11 رقم)\n\n💡 مثال: 12345678901`
        }
      }
      break

    case 'awaiting_companion_kimlik':
      const companionKimlik = text.replace(/\D/g, '')
      if (companionKimlik.length !== 11) {
        responseMessage = '❌ رقم الكملك يجب أن يكون 11 رقم.'
        nextStep = 'awaiting_companion_kimlik'
      } else {
        const currentIndex = collectedData.currentCompanionIndex || 0
        if (!collectedData.refakatEntries) collectedData.refakatEntries = []
        collectedData.refakatEntries[currentIndex] = { id: companionKimlik, name: '' }
        nextStep = 'awaiting_companion_name'
        responseMessage = `✅ رقم كملك المرافق: <code>${companionKimlik}</code>\n\n━━━━━━━━━━━━━━━\n\nيرجى إدخال <b>اسم المرافق</b>\n\n💡 مثال: Ali Yılmaz`
      }
      break

    case 'awaiting_companion_name':
      if (text.length < 3) {
        responseMessage = '❌ الاسم قصير جداً.'
        nextStep = 'awaiting_companion_name'
      } else {
        const currentIndex = collectedData.currentCompanionIndex || 0
        collectedData.refakatEntries[currentIndex].name = text
        
        const totalCompanions = collectedData.companionsCount || 0
        const nextIndex = currentIndex + 1
        
        if (nextIndex < totalCompanions) {
          collectedData.currentCompanionIndex = nextIndex
          nextStep = 'awaiting_companion_kimlik'
          responseMessage = `✅ تم حفظ المرافق ${currentIndex + 1}\n\n━━━━━━━━━━━━━━━\n\n👥 <b>مرافق ${nextIndex + 1} من ${totalCompanions}:</b>\n\nيرجى إدخال <b>رقم كملك المرافق ${nextIndex + 1}</b> (11 رقم)`
        } else {
          // تم حفظ جميع المرافقين - عرض قائمة نقاط الحدود
          nextStep = 'awaiting_border'
          
          // تحديث الجلسة
          await supabase
            .from('telegram_conversation_sessions')
            .update({
              current_step: nextStep,
              collected_data: collectedData
            })
            .eq('id', session.id)

          // إرسال رسالة مع أزرار نقاط الحدود
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ تم حفظ جميع المرافقين (${totalCompanions})\n\n━━━━━━━━━━━━━━━\n\n🚧 <b>الخطوة 6/7:</b> اختر <b>نقطة الحدود</b> المطلوبة:`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🇹🇷 Yayladağı - كسب', callback_data: 'border_yayladagi' }],
                  [{ text: '🇹🇷 Cilvegözü - باب الهوى', callback_data: 'border_cilvegoz' }],
                  [{ text: '🇹🇷 Öncüpınar - باب السلامة', callback_data: 'border_oncupinar' }],
                  [{ text: '🇹🇷 İstanbul Havalimanı - مطار اسطنبول', callback_data: 'border_istanbul' }],
                  [{ text: '🇹🇷 Çobanbey - الراعي', callback_data: 'border_cobanbey' }],
                  [{ text: '🇹🇷 Zeytindalı - غصن الزيتون', callback_data: 'border_zeytindali' }],
                  [{ text: '🇹🇷 Karakamış - جرابلس', callback_data: 'border_karakamis' }]
                ]
              }
            })
          })
          return
        }
      }
      break

    case 'awaiting_date_input':
      // صيغة dd.mm.yyyy
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/
      if (!dateRegex.test(text)) {
        responseMessage = '❌ صيغة خاطئة. استخدم: <b>DD.MM.YYYY</b>\n\n💡 مثال: 15.01.2025'
        nextStep = 'awaiting_date_input'
      } else {
        // التحقق من صحة التاريخ
        const parts = text.split('.')
        const day = parseInt(parts[0])
        const month = parseInt(parts[1])
        const year = parseInt(parts[2])
        
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2025 || year > 2030) {
          responseMessage = '❌ التاريخ غير صحيح. يرجى إدخال تاريخ صحيح.\n\n💡 مثال: 15.01.2025'
          nextStep = 'awaiting_date_input'
        } else {
          collectedData.travelDate = text
          await completeVoluntaryReturnForm(supabase, botToken, chatId, session)
          return
        }
      }
      break

    default:
      return
  }

  // تحديث الجلسة
  if (nextStep) {
    await supabase
      .from('telegram_conversation_sessions')
      .update({
        current_step: nextStep,
        collected_data: collectedData
      })
      .eq('id', session.id)
  }

  // إرسال الرد
  if (responseMessage) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseMessage,
        parse_mode: 'HTML'
      })
    })
  }
}

// دالة لإنهاء نموذج العودة الطوعية
async function completeVoluntaryReturnForm(supabase: any, botToken: string, chatId: string, session: any) {
  try {
    const collectedData = session.collected_data || {}

    console.log('Completing form with data:', collectedData)

    // التحقق من البيانات المطلوبة
    if (!collectedData.fullNameTR || !collectedData.fullNameAR || !collectedData.kimlikNo || !collectedData.borderPoint) {
      console.error('Missing required data:', collectedData)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '❌ بيانات ناقصة. يرجى البدء من جديد بإرسال /start',
          parse_mode: 'HTML'
        })
      })
      return
    }

    // تحويل التاريخ من dd.mm.yyyy إلى yyyy-mm-dd للحفظ في قاعدة البيانات
    let customDateISO = null
    if (collectedData.travelDate) {
      const parts = collectedData.travelDate.split('.')
      if (parts.length === 3) {
        customDateISO = `${parts[2]}-${parts[1]}-${parts[0]}` // yyyy-mm-dd
      }
    }

    // حفظ البيانات بنفس تنسيق الموقع
    const formData = {
      telegram_chat_id: chatId,
      full_name_tr: collectedData.fullNameTR,
      full_name_ar: collectedData.fullNameAR,
      kimlik_no: collectedData.kimlikNo,
      gsm: collectedData.gsm || null,
      sinir_kapisi: collectedData.borderPoint,
      custom_date: customDateISO,
      refakat_entries: collectedData.refakatEntries || []
    }
    
    console.log('Saving form data:', formData)

    const { data: savedForm, error: saveError } = await supabase
      .from('voluntary_return_forms')
      .insert(formData)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving form:', saveError)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '❌ حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.',
          parse_mode: 'HTML'
        })
      })
      return
    }

    // تحديث حالة الجلسة
    await supabase
      .from('telegram_conversation_sessions')
      .update({ status: 'completed' })
      .eq('id', session.id)

    // إرسال ملخص النموذج
    const companionsList = collectedData.refakatEntries && collectedData.refakatEntries.length > 0
      ? collectedData.refakatEntries.map((r: any, i: number) => `   ${i + 1}. ${r.name} - <code>${r.id}</code>`).join('\n')
      : '   لا يوجد مرافقين'

    const summaryText = `
✅ <b>تم تقديم نموذج العودة الطوعية!</b>

━━━━━━━━━━━━━━━

📋 <b>ملخص البيانات:</b>

👤 <b>الاسم (TR):</b> ${collectedData.fullNameTR}
👤 <b>الاسم (AR):</b> ${collectedData.fullNameAR}
🆔 <b>رقم الكملك:</b> <code>${collectedData.kimlikNo}</code>
📱 <b>الجوال:</b> ${collectedData.gsm ? `<code>${collectedData.gsm}</code>` : 'لا يوجد'}
👥 <b>المرافقين:</b> ${collectedData.refakatEntries?.length || 0}
${collectedData.refakatEntries?.length > 0 ? `\n<b>قائمة المرافقين:</b>\n${companionsList}\n` : ''}
🚧 <b>نقطة الحدود:</b> ${collectedData.borderPoint}
${collectedData.travelDate ? `📅 <b>تاريخ السفر:</b> ${collectedData.travelDate}` : ''}

━━━━━━━━━━━━━━━

📄 <b>رقم الطلب:</b> <code>${savedForm.id}</code>

🔔 سيتم مراجعة طلبك وإعلامك بالنتيجة.

📄 جاري إرسال النموذج كملف HTML للطباعة...
`

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: summaryText,
        parse_mode: 'HTML'
      })
    })

    // توليد ملف PDF
    console.log('Starting PDF generation...')
    const pdfBytes = await generateVoluntaryReturnPDF(collectedData, savedForm.id)
    
    console.log('PDF generation result:', pdfBytes ? `Success (${pdfBytes.length} bytes)` : 'Failed')
    
    if (pdfBytes && pdfBytes.length > 0) {
      // إرسال النموذج كملف PDF
      console.log('Sending PDF document...')
      
      try {
        const formDataFile = new FormData()
        formDataFile.append('chat_id', chatId)
        formDataFile.append('document', new Blob([pdfBytes], { type: 'application/pdf' }), `voluntary_return_${collectedData.kimlikNo}.pdf`)
        formDataFile.append('caption', '📄 نموذج العودة الطوعية (TR + AR) - PDF\n\nجاهز للطباعة مباشرة! 🖨️')

        const docResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formDataFile
        })

        const docResult = await docResponse.json()
        console.log('Send document result:', JSON.stringify(docResult))
        
        if (!docResult.ok) {
          console.error('Failed to send PDF to Telegram:', docResult.description || docResult.error_code)
          // في حالة فشل الإرسال، جرّب HTML
          throw new Error('Telegram rejected PDF')
        }
        
        console.log('✅ PDF sent successfully to Telegram!')
        
      } catch (sendError) {
        console.error('Error sending PDF:', sendError)
        // إرسال HTML كبديل
        console.log('Falling back to HTML...')
        const htmlContent = generateVoluntaryReturnHTML(collectedData, savedForm.id)
        const encoder = new TextEncoder()
        const htmlBytes = encoder.encode(htmlContent)
        
        const formDataFile = new FormData()
        formDataFile.append('chat_id', chatId)
        formDataFile.append('document', new Blob([htmlBytes], { type: 'text/html' }), `voluntary_return_${collectedData.kimlikNo}.html`)
        formDataFile.append('caption', '📄 نموذج العودة الطوعية - افتح في المتصفح')

        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formDataFile
        })
      }
    } else {
      console.log('⚠️ PDF generation returned null or empty')
      // إرسال HTML
      const htmlContent = generateVoluntaryReturnHTML(collectedData, savedForm.id)
      const encoder = new TextEncoder()
      const htmlBytes = encoder.encode(htmlContent)
      
      const formDataFile = new FormData()
      formDataFile.append('chat_id', chatId)
      formDataFile.append('document', new Blob([htmlBytes], { type: 'text/html' }), `voluntary_return_${collectedData.kimlikNo}.html`)
      formDataFile.append('caption', '📄 نموذج العودة الطوعية - افتح في المتصفح')

      await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: 'POST',
        body: formDataFile
      })
    }
    
    // إرسال زر القائمة الرئيسية
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ تم إرسال النموذج بنجاح!\n\n📥 يمكنك الآن طباعته أو حفظه.',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 القائمة الرئيسية', callback_data: 'main_menu' }],
            [{ text: '🔄 نموذج جديد', callback_data: 'start_voluntary_return' }]
          ]
        }
      })
    })

    // إرسال إشعار للإدارة
    const { data: adminUsers } = await supabase
      .from('telegram_allowed_users')
      .select('telegram_chat_id')
      .eq('is_active', true)
      .not('telegram_chat_id', 'is', null)

    const adminNotification = `
🔔 <b>طلب عودة طوعية جديد من التلغرام</b>

👤 <b>الاسم (TR):</b> ${collectedData.fullNameTR}
👤 <b>الاسم (AR):</b> ${collectedData.fullNameAR}
🆔 <b>رقم الكملك:</b> <code>${collectedData.kimlikNo}</code>
📱 <b>الجوال:</b> ${collectedData.gsm || 'لا يوجد'}
👥 <b>المرافقين:</b> ${collectedData.refakatEntries?.length || 0}
🚧 <b>نقطة الحدود:</b> ${collectedData.borderPoint}
${collectedData.travelDate ? `📅 <b>التاريخ:</b> ${collectedData.travelDate}` : ''}

📄 <b>رقم الطلب:</b> <code>${savedForm.id}</code>
`

    if (adminUsers) {
      for (const admin of adminUsers) {
        if (admin.telegram_chat_id && admin.telegram_chat_id !== chatId) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: admin.telegram_chat_id,
              text: adminNotification,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '👁️ عرض في لوحة التحكم', url: 'https://tevasul.group/admin' }]
                ]
              }
            })
          })
        }
      }
    }

  } catch (error) {
    console.error('Error completing form:', error)
  }
}

// دالة لتوليد HTML للنموذج
function generateVoluntaryReturnHTML(collectedData: any, formId: string): string {
  const gateTranslations: any = {
    "yayladağı": "كسب",
    "cilvegözü": "باب الهوى",
    "öncüpınar": "باب السلامة",
    "istanbul havalimanı": "مطار اسطنبول",
    "çobanbey": "الراعي",
    "zeytindalı": "غصن الزيتون",
    "karakamış": "جرابلس",
    "akçakale": "تل أبيض الحدودي"
  }

  const arabicGate = gateTranslations[collectedData.borderPoint] || collectedData.borderPoint
  
  // جدول المرافقين بالتركية
  let refakatPartTR = ""
  const validRefakat = collectedData.refakatEntries || []
  if (validRefakat.length > 0) {
    const rows = validRefakat
      .map((entry: any) => `<tr><td style="white-space: nowrap;">${entry.id}</td><td>${entry.name}</td></tr>`)
      .join("")
    
    refakatPartTR = `
      <br><br>REFAKATİMDEKİLER
      <table class="refakat-table">
        <thead>
          <tr>
            <th>Kimlik No</th>
            <th>İsim</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `
  }

  const gsmPartTR = collectedData.gsm ? `<br><br>GSM : ${collectedData.gsm}` : ""

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نموذج العودة الطوعية - Gönüllü Dönüş Formu</title>
    <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Alexandria', Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: black;
        background: white;
        margin: 20px;
      }
      [dir=rtl] {
        direction: rtl;
        font-family: 'Alexandria', Arial, sans-serif;
        font-size: 14px;
      }
      #turkishPage, #arabicPage {
        page-break-after: always;
        margin-bottom: 40px;
        text-align: center;
        min-height: 297mm;
        padding: 40px;
      }
      table.refakat-table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 10px;
        border: 1px solid #000;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
      }
      th {
        background-color: #f0f0f0;
        font-weight: bold;
      }
      @media print {
        body { margin: 0; }
        #turkishPage, #arabicPage {
          page-break-after: always;
          min-height: auto;
        }
      }
      .header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 40px;
      }
      .content {
        text-align: left;
        margin-top: 40px;
      }
      .signature {
        text-align: right;
        margin-top: 60px;
        font-weight: bold;
      }
    </style>
</head>
<body>
    <!-- النسخة التركية -->
    <div id="turkishPage">
        <div class="header">İL GÖÇ İDARESİ MÜDÜRLÜĞÜ'NE<br>MERSİN</div>
        <div class="content">
            <div style="text-align: right; font-family: Arial, sans-serif;" dir="ltr">${collectedData.travelDate}</div><br>
            Ben Suriye uyrukluyum. Adım ${collectedData.fullNameTR}. ${collectedData.kimlikNo} no'lu yabancı kimlik sahibiyim. ${collectedData.borderPoint.toUpperCase()} Sınır Kapısından Geçici koruma haklarımdan feraget ederek Suriye'ye gerekli gönüllü dönüş işlemin yapılması ve geçici koruma kimlik kaydımın iptal edilmesi için gereğinin yapılmasını saygımla arz ederim.
            ${refakatPartTR}
            ${gsmPartTR}
            <div class="signature">
                <strong>AD SOYAD</strong><br>${collectedData.fullNameTR}
            </div>
        </div>
    </div>

    <!-- النسخة العربية -->
    <div id="arabicPage" dir="rtl">
        <div class="header">إلى مديرية إدارة الهجرة<br>مرسين</div>
        <div class="content" style="text-align: right;">
            التاريخ: ${collectedData.travelDate}<br><br>
            أنا الموقّع أدناه ${collectedData.fullNameAR}، أحمل بطاقة الحماية المؤقتة رقم ${collectedData.kimlikNo}. أطلب منكم التفضل بتسليمي الأوراق اللازمة لتنفيذ إجراءات العودة الطوعية إلى سوريا عبر معبر ${arabicGate} الحدودي.<br>
            وتفضلوا بقبول فائق الاحترام والتقدير.<br><br>
            المقدّم/ة:<br>${collectedData.fullNameAR}
        </div>
    </div>

    <script>
        // طباعة تلقائية عند الفتح (اختياري)
        // window.onload = function() { window.print(); }
    </script>
</body>
</html>
`

  return html
}

// دالة لتوليد PDF باستخدام pdf-lib
async function generateVoluntaryReturnPDF(collectedData: any, formId: string): Promise<Uint8Array | null> {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const gateTranslations: any = {
      "yayladağı": "كسب",
      "cilvegözü": "باب الهوى",
      "öncüpınar": "باب السلامة",
      "istanbul havalimanı": "مطار اسطنبول",
      "çobanbey": "الراعي",
      "zeytindalı": "غصن الزيتون",
      "karakamış": "جرابلس"
    }

    const arabicGate = gateTranslations[collectedData.borderPoint] || collectedData.borderPoint
    
    // صفحة 1 - التركية
    const page1 = pdfDoc.addPage([595, 842]) // A4
    const { width, height } = page1.getSize()
    
    let yPosition = height - 100
    
    // العنوان
    page1.drawText("IL GOC IDARESI MUDURLUGU'NE", {
      x: width / 2 - 120,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    yPosition -= 20
    page1.drawText("MERSIN", {
      x: width / 2 - 30,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 50
    
    // التاريخ
    page1.drawText(collectedData.travelDate || '', {
      x: width - 120,
      y: yPosition,
      size: 12,
      font: font
    })
    
    yPosition -= 40
    
    // المحتوى الرئيسي
    const turkishText = `Ben Suriye uyrukluyum. Adim ${collectedData.fullNameTR}. ${collectedData.kimlikNo} no'lu yabanci kimlik sahibiyim. ${collectedData.borderPoint.toUpperCase()} Sinir Kapisindan Gecici koruma haklarimdan feraget ederek Suriye'ye gerekli gonullu donus islemin yapilmasi ve gecici koruma kimlik kaydimin iptal edilmesi icin gereginin yapilmasini saygimla arz ederim.`
    
    const lines = splitTextIntoLines(turkishText, 70)
    for (const line of lines) {
      page1.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font
      })
      yPosition -= 18
    }
    
    // المرافقين
    if (collectedData.refakatEntries && collectedData.refakatEntries.length > 0) {
      yPosition -= 20
      page1.drawText("REFAKATIMDEKILER:", {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont
      })
      yPosition -= 20
      
      collectedData.refakatEntries.forEach((entry: any) => {
        page1.drawText(`${entry.id} - ${entry.name}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: font
        })
        yPosition -= 15
      })
    }
    
    // الجوال
    if (collectedData.gsm) {
      yPosition -= 20
      page1.drawText(`GSM : ${collectedData.gsm}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font
      })
    }
    
    // التوقيع
    yPosition = 120
    page1.drawText("AD SOYAD", {
      x: width - 150,
      y: yPosition,
      size: 11,
      font: boldFont
    })
    yPosition -= 20
    page1.drawText(collectedData.fullNameTR, {
      x: width - 150,
      y: yPosition,
      size: 11,
      font: font
    })
    
    // صفحة 2 - العربية
    const page2 = pdfDoc.addPage([595, 842])
    yPosition = height - 100
    
    // ملاحظة: الخطوط العربية معقدة في PDF، لذا سنستخدم نص مبسط
    page2.drawText("ila mudiriat idarat alhijra", {
      x: width / 2 - 100,
      y: yPosition,
      size: 14,
      font: boldFont
    })
    yPosition -= 20
    page2.drawText("MERSIN", {
      x: width / 2 - 30,
      y: yPosition,
      size: 14,
      font: boldFont
    })
    
    yPosition -= 50
    page2.drawText(`altaarikh: ${collectedData.travelDate}`, {
      x: width - 150,
      y: yPosition,
      size: 12,
      font: font
    })
    
    yPosition -= 40
    
    const arabicTextLatin = `Ana almuwaqqi' adnah ${collectedData.fullNameAR}, ahmil bitaqat alhimayah almuaqatat raqm ${collectedData.kimlikNo}. Atlub minkum altafadul bitaslimi al'awraq allazima litanfidh iijra'at al'awdat altaw'iat ila surya 'abr ma'bar ${arabicGate} alhuduudi.`
    
    const arabicLines = splitTextIntoLines(arabicTextLatin, 70)
    for (const line of arabicLines) {
      page2.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font
      })
      yPosition -= 18
    }
    
    yPosition -= 40
    page2.drawText("Watafadalou biqabul fa'iq al'iihtiram waltaqdir.", {
      x: 50,
      y: yPosition,
      size: 11,
      font: font
    })
    
    // التوقيع
    yPosition = 120
    page2.drawText("almuqadim/at:", {
      x: width - 150,
      y: yPosition,
      size: 11,
      font: boldFont
    })
    yPosition -= 20
    page2.drawText(collectedData.fullNameAR, {
      x: width - 150,
      y: yPosition,
      size: 11,
      font: font
    })
    
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return null
  }
}

function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  
  if (currentLine) lines.push(currentLine)
  return lines
}

// دالة جديدة لمتابعة رد المشرف على عميل
async function handleAdminReplyToCustomer(
  supabase: any,
  adminChatId: string,
  chatSession: any,
  replyText: string,
  adminFirstName: string
) {
  try {
    console.log('Handling admin reply to customer:', {
      sessionId: chatSession.session_id,
      adminChatId,
      replyText
    })

    const { data: config } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .eq('id', 2)
      .single()

    if (!config?.bot_token) {
      console.error('No bot token found')
      return
    }

    const botToken = config.bot_token

    // حفظ الرد في قاعدة البيانات
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        content: replyText,
        sender: 'admin',
        session_id: chatSession.session_id,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error saving admin reply to database:', insertError)
    }

    // ارسال الرسالة إلى العميل عبر ملف ChatBot
    // يتم إضافة رسالة admin في قاعدة البيانات وسيرى العميل الرد في المرة القادمة
    console.log('Admin reply saved to database. Customer will see it on next refresh.')

  } catch (error) {
    console.error('Error handling admin reply:', error)
  }
}

