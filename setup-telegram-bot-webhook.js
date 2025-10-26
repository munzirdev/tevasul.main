/**
 * سكربت لإعداد webhook لبوت التلغرام
 * يقوم بربط البوت مع edge function لاستقبال التحديثات
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// تكوين Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupWebhook() {
  try {
    console.log('🤖 بدء إعداد webhook لبوت التلغرام...\n');

    // الحصول على إعدادات التلغرام من قاعدة البيانات
    const { data: config, error: configError } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .eq('id', 2)
      .single();

    if (configError || !config?.bot_token) {
      console.error('❌ خطأ: لم يتم العثور على bot_token في قاعدة البيانات');
      console.log('\nيرجى التأكد من:');
      console.log('1. تشغيل migration: 20250105_create_telegram_config.sql');
      console.log('2. إضافة bot_token في جدول telegram_config');
      return;
    }

    const botToken = config.bot_token;
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot-updates`;

    console.log(`📡 Webhook URL: ${webhookUrl}`);
    console.log(`🔑 Bot Token: ${botToken.substring(0, 10)}...`);

    // حذف webhook القديم إن وجد
    console.log('\n🗑️  حذف webhook القديم...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
    const deleteResult = await deleteResponse.json();
    
    if (!deleteResult.ok) {
      console.warn('⚠️  تحذير:', deleteResult.description);
    } else {
      console.log('✅ تم حذف webhook القديم');
    }

    // تعيين webhook الجديد
    console.log('\n📝 تعيين webhook الجديد...');
    const setResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
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
      return;
    }

    console.log('✅ تم تعيين webhook بنجاح!');

    // التحقق من حالة webhook
    console.log('\n🔍 التحقق من حالة webhook...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoResult = await infoResponse.json();

    if (infoResult.ok) {
      const info = infoResult.result;
      console.log('\n✅ معلومات webhook:');
      console.log(`   URL: ${info.url}`);
      console.log(`   عدد التحديثات المعلقة: ${info.pending_update_count}`);
      console.log(`   آخر خطأ: ${info.last_error_message || 'لا يوجد'}`);
      console.log(`   تاريخ آخر خطأ: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString('ar-SA') : 'لا يوجد'}`);
    }

    // الحصول على معلومات البوت
    console.log('\n🤖 معلومات البوت:');
    const meResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meResult = await meResponse.json();

    if (meResult.ok) {
      const bot = meResult.result;
      console.log(`   الاسم: ${bot.first_name}`);
      console.log(`   اسم المستخدم: @${bot.username}`);
      console.log(`   ID: ${bot.id}`);
      console.log(`\n📱 رابط البوت: https://t.me/${bot.username}`);
    }

    console.log('\n✅ تم الإعداد بنجاح!');
    console.log('\n📋 الخطوات التالية:');
    console.log('1. أضف مستخدمين جدد من لوحة التحكم');
    console.log('2. شارك رابط البوت مع المستخدمين');
    console.log('3. اطلب منهم الضغط على Start وإرسال رقم هاتفهم');
    console.log('4. سيبدأون باستقبال الإشعارات تلقائياً');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// تشغيل السكربت
setupWebhook();

