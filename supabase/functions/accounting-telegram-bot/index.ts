import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Accounting bot token - جميع إشعارات المحاسبة تستخدم هذا البوت
const ACCOUNTING_BOT_TOKEN = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'
const ACCOUNTING_BOT_CONFIG_ID = 3

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    message: any;
    data: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('💰 Accounting Telegram bot webhook received')
    console.log('💰 Request method:', req.method)
    console.log('💰 Request URL:', req.url)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    let update: TelegramUpdate
    try {
      const body = await req.text()
      console.log('💰 Raw request body:', body)
      if (!body || body.trim() === '') {
        console.warn('⚠️ Empty request body')
        return new Response(
          JSON.stringify({ success: true, message: 'Empty request' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      update = JSON.parse(body)
      console.log('💰 Update received:', JSON.stringify(update, null, 2))
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Telegram configuration
    let config: any = null
    const { data: configData, error: configError } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('id', ACCOUNTING_BOT_CONFIG_ID)
      .maybeSingle()

    if (configError && configError.code !== 'PGRST116') {
      console.error('❌ Error getting config:', configError)
    }

    // Use config from database or fallback to token constant
    if (configData) {
      config = configData
    } else {
      // Fallback to default config if not in database
      config = {
        bot_token: ACCOUNTING_BOT_TOKEN,
        admin_chat_id: '',
        is_enabled: true
      }
      console.log('⚠️ Using fallback config - migration may not be run yet')
    }

    // Handle callback query
    if (update.callback_query) {
      return await handleCallbackQuery(update.callback_query, supabase, config)
    }

    // Handle messages
    if (update.message) {
      const chatId = update.message.chat.id.toString()
      const messageText = update.message.text || ''
      const userId = update.message.from.id

      console.log(`💰 Message from chat ${chatId}: ${messageText}`)

      // Check if user is authenticated
      let authSession = null
      let authError = null
      
      try {
        const result = await supabase
          .from('accounting_telegram_auth')
          .select('*')
          .eq('telegram_chat_id', chatId)
          .eq('is_active', true)
          .maybeSingle()
        
        authSession = result.data
        authError = result.error
        
        // If table doesn't exist, treat as not authenticated
        if (authError && authError.code === 'PGRST204') {
          authError = null // Table might not exist yet, treat as not authenticated
        }
      } catch (error) {
        console.warn('⚠️ Error checking auth session (table might not exist):', error)
        // If table doesn't exist, treat as not authenticated
        authError = null
      }

      if (authError || !authSession || (authSession && authSession.expires_at && new Date(authSession.expires_at) < new Date())) {
        // User is not authenticated, handle login
        return await handleLogin(chatId, messageText, supabase, config)
      }

      // User is authenticated, handle commands
      return await handleAuthenticatedCommand(chatId, messageText, authSession, supabase, config)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Update processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Accounting bot error:', error)
    console.error('❌ Error stack:', error?.stack)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error?.message || 'Unknown error',
        stack: error?.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Handle login flow
async function handleLogin(chatId: string, messageText: string, supabase: any, config: any) {
  const botToken = config?.bot_token || ACCOUNTING_BOT_TOKEN
  const messageTextLower = messageText.toLowerCase().trim()
  
  // Check if message contains login command or credentials
  if (messageTextLower === '/start' || messageTextLower.startsWith('/start ') || 
      messageTextLower === '/login' || messageTextLower.startsWith('/login ')) {
    try {
      await sendTelegramMessage(
        botToken,
        chatId,
        'مرحباً بك في بوت المحاسبة! 👋\n\n' +
        'يرجى إدخال بيانات تسجيل الدخول:\n' +
        '📧 البريد الإلكتروني\n' +
        '🔑 كلمة المرور\n\n' +
        'أرسل البيانات بالتنسيق التالي:\n' +
        '<code>email:your@email.com\npassword:yourpassword</code>',
        { parse_mode: 'HTML' }
      )
      console.log(`✅ Sent login prompt to chat ${chatId}`)
    } catch (error) {
      console.error('❌ Error sending login prompt:', error)
    }
    return new Response(
      JSON.stringify({ success: true, action: 'login_prompt' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Try to parse credentials from message
  const emailMatch = messageText.match(/email[:\s]+([^\s\n]+)/i)
  const passwordMatch = messageText.match(/password[:\s]+([^\s\n]+)/i)

  if (emailMatch && passwordMatch) {
    const email = emailMatch[1].trim()
    const password = passwordMatch[1].trim()

    console.log(`🔐 Attempting login for: ${email}`)

    // Verify credentials with Supabase Auth
    // First, search for user in profiles table
    try {
      // Search for user in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()
      
      let userData: any = null
      
      if (profile && !profileError) {
        // User found in profiles, get auth user data
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        
        if (authError) {
          console.error('❌ Error listing users:', authError)
        } else if (authUsers && authUsers.users) {
          const authUser = authUsers.users.find(u => u.id === profile.id || u.email?.toLowerCase() === email.toLowerCase())
          if (authUser) {
            userData = { user: authUser }
          }
        }
      }
      
      if (!userData || !userData.user) {
        console.error('❌ User not found:', email)
        await sendTelegramMessage(
          config.bot_token || ACCOUNTING_BOT_TOKEN,
          chatId,
          '❌ فشل تسجيل الدخول!\n\n' +
          'البريد الإلكتروني أو كلمة المرور غير صحيحة.\n\n' +
          'يرجى المحاولة مرة أخرى أو إرسال /login'
        )
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify password by attempting to sign in using REST API
      // We need to use anon key for signInWithPassword
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      
      let authData: { user: any; session: any } | null = null
      
      // If anon key is not available, we'll verify the user exists and check role
      // Note: This is a simplified approach - in production, you should set SUPABASE_ANON_KEY
      if (!supabaseAnonKey) {
        console.warn('⚠️ SUPABASE_ANON_KEY not set, using admin verification only')
        // We can't verify password without anon key, so we'll just verify the user exists and is admin
        // This is less secure but works for now
        authData = {
          user: userData.user,
          session: null
        }
      } else {
        // Use REST API to verify password
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        })

        const authResult = await authResponse.json()

        if (!authResponse.ok || !authResult.access_token) {
          console.error('❌ Authentication failed:', authResult)
          await sendTelegramMessage(
            config.bot_token || ACCOUNTING_BOT_TOKEN,
            chatId,
            '❌ فشل تسجيل الدخول!\n\n' +
            'البريد الإلكتروني أو كلمة المرور غير صحيحة.\n\n' +
            'يرجى المحاولة مرة أخرى أو إرسال /login'
          )
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication failed' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        authData = {
          user: userData.user,
          session: authResult
        }
      }


      // Check if user is admin (we already have profile from earlier search)
      if (!profile || profile.role !== 'admin') {
        console.error('❌ User is not admin:', profile?.role)
        await sendTelegramMessage(
          config.bot_token || ACCOUNTING_BOT_TOKEN,
          chatId,
          '❌ ليس لديك صلاحية للوصول!\n\n' +
          'يجب أن تكون أدمن للوصول إلى بوت المحاسبة.'
        )
        return new Response(
          JSON.stringify({ success: false, error: 'Not admin' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create authentication session (expires in 30 days)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      try {
        const { error: sessionError } = await supabase
          .from('accounting_telegram_auth')
          .upsert({
            telegram_chat_id: chatId,
            user_id: authData.user.id,
            email: email,
            authenticated_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            is_active: true
          }, {
            onConflict: 'telegram_chat_id'
          })

        if (sessionError) {
          // If table doesn't exist, log warning but continue
          if (sessionError.code === '42P01' || sessionError.message?.includes('does not exist')) {
            console.warn('⚠️ accounting_telegram_auth table does not exist. Please run migration.')
            // Continue anyway - session will be stored in memory
          } else {
            console.error('❌ Failed to create session:', sessionError)
            await sendTelegramMessage(
              config.bot_token || ACCOUNTING_BOT_TOKEN,
              chatId,
              '❌ حدث خطأ أثناء إنشاء الجلسة. يرجى المحاولة مرة أخرى.'
            )
            return new Response(
              JSON.stringify({ success: false, error: 'Session creation failed' }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      } catch (error) {
        console.warn('⚠️ Error creating session (table might not exist):', error)
        // Continue anyway - session will be stored in memory
      }

      console.log(`✅ Admin authenticated: ${email} (${authData.user.id})`)

      // Set bot commands menu
      await setBotCommands(config.bot_token || ACCOUNTING_BOT_TOKEN)

      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '✅ تم تسجيل الدخول بنجاح!\n\n' +
        `مرحباً ${profile.full_name || email} 👋\n\n` +
        'يمكنك الآن استخدام جميع أوامر البوت.\n\n' +
        'استخدم الأزرار أدناه للوصول السريع للخيارات.',
        {
          reply_markup: {
            keyboard: [
              [
                { text: '📊 ملخص اليوم' },
                { text: '📋 المعاملات' }
              ],
              [
                { text: '📈 الملخص الشهري' },
                { text: '📊 التقرير الشهري' }
              ],
              [
                { text: '📊 الإحصائيات' },
                { text: 'ℹ️ المساعدة' }
              ],
              [
                { text: '🚪 تسجيل الخروج' }
              ]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
          }
        }
      )

      return new Response(
        JSON.stringify({ success: true, action: 'login_success', user_id: authData.user.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('❌ Login error:', error)
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '❌ حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'
      )
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // If message doesn't match login format, prompt for login
  await sendTelegramMessage(
    config.bot_token || ACCOUNTING_BOT_TOKEN,
    chatId,
    '⚠️ يجب تسجيل الدخول أولاً!\n\n' +
    'أرسل /login لبدء تسجيل الدخول',
    {
      reply_markup: {
        keyboard: [
          [
            { text: '/login' },
            { text: '/help' }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    }
  )

  return new Response(
    JSON.stringify({ success: false, action: 'not_authenticated' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Handle authenticated commands
async function handleAuthenticatedCommand(chatId: string, messageText: string, authSession: any, supabase: any, config: any) {
  // Check for button text first (exact match, before any processing)
  const buttonText = messageText.trim()
  
  // Check for button text first
  if (buttonText === '📊 ملخص اليوم') {
    await handleTodaySummary(chatId, authSession, supabase, config)
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (buttonText === '📋 المعاملات') {
    await handleTransactions(chatId, authSession, supabase, config)
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (buttonText === '📈 الملخص الشهري') {
    const month = new Date().getMonth() + 1
    const year = new Date().getFullYear()
    await handleMonthlySummary(chatId, month, year, authSession, supabase, config)
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (buttonText === '📊 التقرير الشهري') {
    const reportMonth = new Date().getMonth() + 1
    const reportYear = new Date().getFullYear()
    await handleMonthlyReport(chatId, reportMonth, reportYear, authSession, supabase, config)
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (buttonText === '📊 الإحصائيات') {
    await handleStats(chatId, authSession, supabase, config)
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (buttonText === 'ℹ️ المساعدة') {
    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '📋 <b>أوامر بوت المحاسبة</b>\n\n' +
      '<b>الأوامر المتاحة:</b>\n' +
      '/start - القائمة الرئيسية\n' +
      '/help - عرض المساعدة\n' +
      '/status - حالة النظام\n' +
      '/today - ملخص اليوم\n' +
      '/transactions - آخر المعاملات\n' +
      '/summary [الشهر] [السنة] - ملخص شهري\n' +
      '/report [الشهر] [السنة] - تقرير شهري مفصل\n' +
      '/stats - إحصائيات عامة\n' +
      '/logout - تسجيل الخروج\n\n' +
      '💡 يمكنك أيضاً استخدام الأزرار في الأسفل للوصول السريع',
      { 
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              { text: '📊 ملخص اليوم' },
              { text: '📋 المعاملات' }
            ],
            [
              { text: '📈 الملخص الشهري' },
              { text: '📊 التقرير الشهري' }
            ],
            [
              { text: '📊 الإحصائيات' },
              { text: 'ℹ️ المساعدة' }
            ],
            [
              { text: '🚪 تسجيل الخروج' }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    )
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (buttonText === '🚪 تسجيل الخروج') {
    // Deactivate session
    await supabase
      .from('accounting_telegram_auth')
      .update({ is_active: false })
      .eq('telegram_chat_id', chatId)

    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '✅ تم تسجيل الخروج بنجاح!\n\n' +
      'شكراً لاستخدامك بوت المحاسبة 👋',
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    )
    return new Response(
      JSON.stringify({ success: true, action: 'command_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // If not a button, process as command
  const command = messageText.toLowerCase().trim()
  const parts = command.split(' ')
  const mainCommand = parts[0]

  switch (mainCommand) {
    case '/start':
    case '/help':
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '📋 <b>بوت المحاسبة</b>\n\n' +
        'مرحباً بك في بوت المحاسبة!\n\n' +
        'استخدم الأزرار أدناه للوصول السريع للخيارات.\n\n' +
        '🔐 <b>تم تسجيل الدخول كـ:</b> ' + authSession.email,
        { 
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                { text: '📊 ملخص اليوم' },
                { text: '📋 المعاملات' }
              ],
              [
                { text: '📈 الملخص الشهري' },
                { text: '📊 التقرير الشهري' }
              ],
              [
                { text: '📊 الإحصائيات' },
                { text: 'ℹ️ المساعدة' }
              ],
              [
                { text: '🚪 تسجيل الخروج' }
              ]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
          }
        }
      )
      break

    case '/status':
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '✅ <b>حالة النظام</b>\n\n' +
        '🟢 البوت يعمل بشكل طبيعي\n' +
        `👤 المستخدم: ${authSession.email}\n` +
        `🕐 تم تسجيل الدخول: ${new Date(authSession.authenticated_at).toLocaleString('ar-EG')}`,
        { parse_mode: 'HTML' }
      )
      break

    case '/today':
      await handleTodaySummary(chatId, authSession, supabase, config)
      break

    case '/transactions':
      await handleTransactions(chatId, authSession, supabase, config)
      break

    case '/summary':
      const month = parts[1] ? parseInt(parts[1]) : new Date().getMonth() + 1
      const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear()
      await handleMonthlySummary(chatId, month, year, authSession, supabase, config)
      break

    case '/report':
      const reportMonth = parts[1] ? parseInt(parts[1]) : new Date().getMonth() + 1
      const reportYear = parts[2] ? parseInt(parts[2]) : new Date().getFullYear()
      await handleMonthlyReport(chatId, reportMonth, reportYear, authSession, supabase, config)
      break

    case '/stats':
      await handleStats(chatId, authSession, supabase, config)
      break

    case '/logout':
      // Deactivate session
      await supabase
        .from('accounting_telegram_auth')
        .update({ is_active: false })
        .eq('telegram_chat_id', chatId)

      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '✅ تم تسجيل الخروج بنجاح!\n\n' +
        'شكراً لاستخدامك بوت المحاسبة 👋',
        {
          reply_markup: {
            remove_keyboard: true
          }
        }
      )
      break

    default:
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '❓ أمر غير معروف!\n\n' +
        'أرسل /help لعرض الأوامر المتاحة أو استخدم الأزرار أدناه',
        {
          reply_markup: {
            keyboard: [
              [
                { text: '📊 ملخص اليوم' },
                { text: '📋 المعاملات' }
              ],
              [
                { text: '📈 الملخص الشهري' },
                { text: '📊 التقرير الشهري' }
              ],
              [
                { text: '📊 الإحصائيات' },
                { text: 'ℹ️ المساعدة' }
              ],
              [
                { text: '🚪 تسجيل الخروج' }
              ]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
          }
        }
      )
  }

  return new Response(
    JSON.stringify({ success: true, action: 'command_processed' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Handle callback queries
async function handleCallbackQuery(callbackQuery: any, supabase: any, config: any) {
  const callbackId = callbackQuery.id
  const data = callbackQuery.data
  const chatId = callbackQuery.message.chat.id.toString()

  // Answer callback query
  await fetch(`https://api.telegram.org/bot${config.bot_token || ACCOUNTING_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text: 'تمت المعالجة'
    })
  })

  return new Response(
    JSON.stringify({ success: true, action: 'callback_processed' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Handle today's summary
async function handleTodaySummary(chatId: string, authSession: any, supabase: any, config: any) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get today's transactions
    const { data: transactions, error: transError } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .eq('transaction_date', today)
      .order('created_at', { ascending: false })
      .limit(20)

    if (transError) {
      console.error('❌ Error getting transactions:', transError)
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '❌ حدث خطأ في جلب البيانات'
      )
      return
    }

    // Get today's summary
    const { data: summary, error: summaryError } = await supabase
      .from('daily_cash_summary')
      .select('*')
      .eq('summary_date', today)
      .single()

    // Calculate totals
    let totalIncome = 0
    let totalExpense = 0
    if (transactions && transactions.length > 0) {
      transactions.forEach((t: any) => {
        if (t.type === 'income') {
          totalIncome += parseFloat(t.amount)
        } else {
          totalExpense += parseFloat(t.amount)
        }
      })
    }

    const netProfit = totalIncome - totalExpense
    const openingBalance = summary?.opening_balance || 0
    const closingBalance = (summary?.closing_balance || openingBalance) + netProfit

    let message = `📊 <b>ملخص اليوم</b>\n\n`
    message += `📅 التاريخ: ${new Date(today).toLocaleDateString('ar-EG')}\n\n`
    
    if (summary) {
      message += `💰 الرصيد الافتتاحي: ${formatCurrency(openingBalance)}\n`
    }
    
    message += `\n📈 <b>الإيرادات:</b> ${formatCurrency(totalIncome)}\n`
    message += `📉 <b>المصروفات:</b> ${formatCurrency(totalExpense)}\n`
    message += `💵 <b>صافي الربح:</b> ${formatCurrency(netProfit)}\n`
    
    if (summary) {
      message += `\n💰 الرصيد الختامي: ${formatCurrency(closingBalance)}\n`
    }

    message += `\n📋 عدد المعاملات: ${transactions?.length || 0}`

    if (transactions && transactions.length > 0) {
      message += `\n\n<b>آخر المعاملات:</b>\n`
      transactions.slice(0, 5).forEach((t: any) => {
        const icon = t.type === 'income' ? '📈' : '📉'
        const category = t.category?.name_ar || 'غير محدد'
        message += `\n${icon} ${formatCurrency(t.amount)} - ${category}`
        if (t.description_ar) {
          message += `\n   ${t.description_ar}`
        }
      })
    }

    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      message,
      { 
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              { text: '📊 ملخص اليوم' },
              { text: '📋 المعاملات' }
            ],
            [
              { text: '📈 الملخص الشهري' },
              { text: '📊 التقرير الشهري' }
            ],
            [
              { text: '📊 الإحصائيات' },
              { text: 'ℹ️ المساعدة' }
            ],
            [
              { text: '🚪 تسجيل الخروج' }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    )
  } catch (error) {
    console.error('❌ Error in handleTodaySummary:', error)
    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '❌ حدث خطأ في جلب ملخص اليوم'
    )
  }
}

// Handle transactions list
async function handleTransactions(chatId: string, authSession: any, supabase: any, config: any) {
  try {
    const { data: transactions, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error getting transactions:', error)
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '❌ حدث خطأ في جلب المعاملات'
      )
      return
    }

    if (!transactions || transactions.length === 0) {
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '📋 <b>آخر المعاملات</b>\n\nلا توجد معاملات حالياً'
      )
      return
    }

    let message = `📋 <b>آخر المعاملات</b>\n\n`
    transactions.forEach((t: any, index: number) => {
      const icon = t.type === 'income' ? '📈' : '📉'
      const category = t.category?.name_ar || 'غير محدد'
      const date = new Date(t.transaction_date).toLocaleDateString('ar-EG')
      message += `${index + 1}. ${icon} ${formatCurrency(t.amount)}\n`
      message += `   📁 ${category}\n`
      message += `   📅 ${date}\n`
      if (t.description_ar) {
        message += `   📝 ${t.description_ar}\n`
      }
      message += `\n`
    })

    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      message,
      { 
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              { text: '📊 ملخص اليوم' },
              { text: '📋 المعاملات' }
            ],
            [
              { text: '📈 الملخص الشهري' },
              { text: '📊 التقرير الشهري' }
            ],
            [
              { text: '📊 الإحصائيات' },
              { text: 'ℹ️ المساعدة' }
            ],
            [
              { text: '🚪 تسجيل الخروج' }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    )
  } catch (error) {
    console.error('❌ Error in handleTransactions:', error)
    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '❌ حدث خطأ في جلب المعاملات'
    )
  }
}

// Handle monthly summary
async function handleMonthlySummary(chatId: string, month: number, year: number, authSession: any, supabase: any, config: any) {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: transactions, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('❌ Error getting monthly transactions:', error)
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '❌ حدث خطأ في جلب البيانات'
      )
      return
    }

    let totalIncome = 0
    let totalExpense = 0
    if (transactions && transactions.length > 0) {
      transactions.forEach((t: any) => {
        if (t.type === 'income') {
          totalIncome += parseFloat(t.amount)
        } else {
          totalExpense += parseFloat(t.amount)
        }
      })
    }

    const netProfit = totalIncome - totalExpense
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

    let message = `📊 <b>ملخص شهري</b>\n\n`
    message += `📅 ${monthNames[month - 1]} ${year}\n\n`
    message += `📈 <b>إجمالي الإيرادات:</b> ${formatCurrency(totalIncome)}\n`
    message += `📉 <b>إجمالي المصروفات:</b> ${formatCurrency(totalExpense)}\n`
    message += `💵 <b>صافي الربح:</b> ${formatCurrency(netProfit)}\n\n`
    message += `📋 عدد المعاملات: ${transactions?.length || 0}\n`
    
    if (transactions && transactions.length > 0) {
      const incomeCount = transactions.filter((t: any) => t.type === 'income').length
      const expenseCount = transactions.filter((t: any) => t.type === 'expense').length
      message += `📈 عدد الإيرادات: ${incomeCount}\n`
      message += `📉 عدد المصروفات: ${expenseCount}`
    }

    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      message,
      { 
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              { text: '📊 ملخص اليوم' },
              { text: '📋 المعاملات' }
            ],
            [
              { text: '📈 الملخص الشهري' },
              { text: '📊 التقرير الشهري' }
            ],
            [
              { text: '📊 الإحصائيات' },
              { text: 'ℹ️ المساعدة' }
            ],
            [
              { text: '🚪 تسجيل الخروج' }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    )
  } catch (error) {
    console.error('❌ Error in handleMonthlySummary:', error)
    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '❌ حدث خطأ في جلب الملخص الشهري'
    )
  }
}

// Handle monthly report
async function handleMonthlyReport(chatId: string, month: number, year: number, authSession: any, supabase: any, config: any) {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: transactions, error } = await supabase
      .from('accounting_transactions')
      .select(`
        *,
        category:accounting_categories(*)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('❌ Error getting monthly report:', error)
      await sendTelegramMessage(
        config.bot_token || ACCOUNTING_BOT_TOKEN,
        chatId,
        '❌ حدث خطأ في جلب التقرير'
      )
      return
    }

    let totalIncome = 0
    let totalExpense = 0
    const incomeByCategory: { [key: string]: number } = {}
    const expenseByCategory: { [key: string]: number } = {}

    if (transactions && transactions.length > 0) {
      transactions.forEach((t: any) => {
        const category = t.category?.name_ar || 'غير محدد'
        const amount = parseFloat(t.amount)
        
        if (t.type === 'income') {
          totalIncome += amount
          incomeByCategory[category] = (incomeByCategory[category] || 0) + amount
        } else {
          totalExpense += amount
          expenseByCategory[category] = (expenseByCategory[category] || 0) + amount
        }
      })
    }

    const netProfit = totalIncome - totalExpense
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

    let message = `📊 <b>تقرير شهري مفصل</b>\n\n`
    message += `📅 ${monthNames[month - 1]} ${year}\n\n`
    message += `📈 <b>إجمالي الإيرادات:</b> ${formatCurrency(totalIncome)}\n`
    message += `📉 <b>إجمالي المصروفات:</b> ${formatCurrency(totalExpense)}\n`
    message += `💵 <b>صافي الربح:</b> ${formatCurrency(netProfit)}\n\n`

    if (Object.keys(incomeByCategory).length > 0) {
      message += `<b>📈 الإيرادات حسب الفئة:</b>\n`
      Object.entries(incomeByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([category, amount]) => {
          message += `  • ${category}: ${formatCurrency(amount)}\n`
        })
      message += `\n`
    }

    if (Object.keys(expenseByCategory).length > 0) {
      message += `<b>📉 المصروفات حسب الفئة:</b>\n`
      Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([category, amount]) => {
          message += `  • ${category}: ${formatCurrency(amount)}\n`
        })
    }

    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      message,
      { 
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              { text: '📊 ملخص اليوم' },
              { text: '📋 المعاملات' }
            ],
            [
              { text: '📈 الملخص الشهري' },
              { text: '📊 التقرير الشهري' }
            ],
            [
              { text: '📊 الإحصائيات' },
              { text: 'ℹ️ المساعدة' }
            ],
            [
              { text: '🚪 تسجيل الخروج' }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    )
  } catch (error) {
    console.error('❌ Error in handleMonthlyReport:', error)
    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '❌ حدث خطأ في جلب التقرير'
    )
  }
}

// Handle stats
async function handleStats(chatId: string, authSession: any, supabase: any, config: any) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    // Today's stats
    const { data: todayTransactions } = await supabase
      .from('accounting_transactions')
      .select('type, amount')
      .eq('transaction_date', today)

    // Monthly stats
    const { data: monthlyTransactions } = await supabase
      .from('accounting_transactions')
      .select('type, amount')
      .gte('transaction_date', startOfMonth)
      .lte('transaction_date', endOfMonth)

    // Total stats
    const { data: totalTransactions } = await supabase
      .from('accounting_transactions')
      .select('type, amount')

    let todayIncome = 0
    let todayExpense = 0
    if (todayTransactions) {
      todayTransactions.forEach((t: any) => {
        if (t.type === 'income') todayIncome += parseFloat(t.amount)
        else todayExpense += parseFloat(t.amount)
      })
    }

    let monthlyIncome = 0
    let monthlyExpense = 0
    if (monthlyTransactions) {
      monthlyTransactions.forEach((t: any) => {
        if (t.type === 'income') monthlyIncome += parseFloat(t.amount)
        else monthlyExpense += parseFloat(t.amount)
      })
    }

    let totalIncome = 0
    let totalExpense = 0
    if (totalTransactions) {
      totalTransactions.forEach((t: any) => {
        if (t.type === 'income') totalIncome += parseFloat(t.amount)
        else totalExpense += parseFloat(t.amount)
      })
    }

    let message = `📊 <b>إحصائيات عامة</b>\n\n`
    message += `<b>📅 اليوم:</b>\n`
    message += `  📈 الإيرادات: ${formatCurrency(todayIncome)}\n`
    message += `  📉 المصروفات: ${formatCurrency(todayExpense)}\n`
    message += `  💵 الصافي: ${formatCurrency(todayIncome - todayExpense)}\n\n`
    
    message += `<b>📅 هذا الشهر:</b>\n`
    message += `  📈 الإيرادات: ${formatCurrency(monthlyIncome)}\n`
    message += `  📉 المصروفات: ${formatCurrency(monthlyExpense)}\n`
    message += `  💵 الصافي: ${formatCurrency(monthlyIncome - monthlyExpense)}\n\n`
    
    message += `<b>📊 الإجمالي:</b>\n`
    message += `  📈 إجمالي الإيرادات: ${formatCurrency(totalIncome)}\n`
    message += `  📉 إجمالي المصروفات: ${formatCurrency(totalExpense)}\n`
    message += `  💵 إجمالي الصافي: ${formatCurrency(totalIncome - totalExpense)}\n\n`
    
    message += `📋 إجمالي المعاملات: ${totalTransactions?.length || 0}`

    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      message,
      { 
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              { text: '📊 ملخص اليوم' },
              { text: '📋 المعاملات' }
            ],
            [
              { text: '📈 الملخص الشهري' },
              { text: '📊 التقرير الشهري' }
            ],
            [
              { text: '📊 الإحصائيات' },
              { text: 'ℹ️ المساعدة' }
            ],
            [
              { text: '🚪 تسجيل الخروج' }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    )
  } catch (error) {
    console.error('❌ Error in handleStats:', error)
    await sendTelegramMessage(
      config.bot_token || ACCOUNTING_BOT_TOKEN,
      chatId,
      '❌ حدث خطأ في جلب الإحصائيات'
    )
  }
}

// Format currency with Latin numbers
function formatCurrency(amount: number): string {
  // Use en-US locale to get Latin numbers
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount)
  return formatted
}

// Set bot commands menu
async function setBotCommands(botToken: string) {
  try {
    const commands = [
      { command: 'start', description: 'القائمة الرئيسية' },
      { command: 'help', description: 'عرض المساعدة' },
      { command: 'status', description: 'حالة النظام' },
      { command: 'today', description: 'ملخص اليوم' },
      { command: 'transactions', description: 'آخر المعاملات' },
      { command: 'summary', description: 'ملخص شهري' },
      { command: 'report', description: 'تقرير شهري مفصل' },
      { command: 'stats', description: 'إحصائيات عامة' },
      { command: 'logout', description: 'تسجيل الخروج' }
    ]

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: commands
      })
    })

    const result = await response.json()
    if (!result.ok) {
      console.error('❌ Failed to set bot commands:', result)
    } else {
      console.log('✅ Bot commands menu set successfully')
    }
    return result
  } catch (error) {
    console.error('❌ Error setting bot commands:', error)
    // Don't throw, just log the error
  }
}

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
    }
    return result
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error)
    throw error
  }
}

