/**
 * سكربت لإعداد webhook لبوت المحاسبة في تيليجرام
 * يقوم بربط البوت مع edge function لاستقبال التحديثات
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// تكوين Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Accounting bot token
const ACCOUNTING_BOT_TOKEN = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0';
const ACCOUNTING_BOT_CONFIG_ID = 3;

async function setupAccountingWebhook() {
  try {
    console.log('💰 بدء إعداد webhook لبوت المحاسبة...\n');

    // التحقق من وجود إعدادات البوت في قاعدة البيانات
    const { data: config, error: configError } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('id', ACCOUNTING_BOT_CONFIG_ID)
      .single();

    if (configError && configError.code !== 'PGRST116') {
      console.error('❌ خطأ في جلب إعدادات البوت:', configError);
      console.log('\nيرجى التأكد من:');
      console.log('1. تشغيل migration: 20250128_create_accounting_telegram_bot.sql');
      return;
    }

    // تحديث أو إضافة إعدادات البوت
    const { error: upsertError } = await supabase
      .from('telegram_config')
      .upsert({
        id: ACCOUNTING_BOT_CONFIG_ID,
        bot_token: ACCOUNTING_BOT_TOKEN,
        admin_chat_id: config?.admin_chat_id || '',
        is_enabled: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('❌ خطأ في تحديث إعدادات البوت:', upsertError);
      return;
    }

    console.log('✅ تم تحديث إعدادات البوت في قاعدة البيانات');

    // إنشاء webhook URL
    const webhookUrl = `${SUPABASE_URL}/functions/v1/accounting-telegram-bot`;

    console.log(`📡 Webhook URL: ${webhookUrl}`);
    console.log(`🔑 Bot Token: ${ACCOUNTING_BOT_TOKEN.substring(0, 10)}...`);

    // حذف webhook القديم إن وجد
    console.log('\n🗑️  حذف webhook القديم...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${ACCOUNTING_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`);
    const deleteResult = await deleteResponse.json();
    
    if (!deleteResult.ok) {
      console.warn('⚠️  تحذير:', deleteResult.description);
    } else {
      console.log('✅ تم حذف webhook القديم');
    }

    // الانتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 2000));

    // تعيين webhook الجديد
    console.log('\n📝 تعيين webhook الجديد...');
    const setResponse = await fetch(`https://api.telegram.org/bot${ACCOUNTING_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    });

    const setResult = await setResponse.json();

    if (!setResult.ok) {
      console.error('❌ فشل في تعيين webhook:', setResult.description);
      console.error('   تفاصيل:', setResult);
      return;
    }

    console.log('✅ تم تعيين webhook بنجاح!');

    // الانتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 2000));

    // التحقق من حالة webhook
    console.log('\n🔍 التحقق من حالة webhook...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${ACCOUNTING_BOT_TOKEN}/getWebhookInfo`);
    const infoResult = await infoResponse.json();

    if (infoResult.ok) {
      const info = infoResult.result;
      console.log('\n✅ معلومات webhook:');
      console.log(`   URL: ${info.url}`);
      console.log(`   عدد التحديثات المعلقة: ${info.pending_update_count}`);
      console.log(`   آخر خطأ: ${info.last_error_message || 'لا يوجد'}`);
      if (info.last_error_date) {
        console.log(`   تاريخ آخر خطأ: ${new Date(info.last_error_date * 1000).toLocaleString('ar-SA')}`);
      }
    }

    // الحصول على معلومات البوت
    console.log('\n🤖 معلومات البوت:');
    const meResponse = await fetch(`https://api.telegram.org/bot${ACCOUNTING_BOT_TOKEN}/getMe`);
    const meResult = await meResponse.json();

    if (meResult.ok) {
      const bot = meResult.result;
      console.log(`   الاسم: ${bot.first_name}`);
      console.log(`   اسم المستخدم: @${bot.username}`);
      console.log(`   ID: ${bot.id}`);
      console.log(`\n📱 رابط البوت: https://t.me/${bot.username}`);
    }

    console.log('\n✅ تم الإعداد بنجاح!');
    console.log('\n📋 خطوات الاستخدام:');
    console.log('1. ابحث عن البوت في تيليجرام: @' + (meResult?.ok ? meResult.result.username : 'bot_username'));
    console.log('2. اضغط Start أو أرسل /start');
    console.log('3. أرسل /login لتسجيل الدخول');
    console.log('4. أرسل بيانات تسجيل الدخول بالتنسيق:');
    console.log('   email:your@email.com');
    console.log('   password:yourpassword');
    console.log('5. يجب أن تكون أدمن في النظام للوصول');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
  }
}

// تشغيل السكربت
setupAccountingWebhook();

