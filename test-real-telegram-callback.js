import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRealTelegramCallback() {
  console.log('🧪 اختبار callback query حقيقي من التيليجرام...');
  
  try {
    // محاكاة callback query حقيقي من التيليجرام
    const telegramUpdate = {
      update_id: 123456789,
      callback_query: {
        id: 'real-callback-' + Date.now(),
        from: {
          id: 123456789,
          is_bot: false,
          first_name: 'Admin',
          username: 'admin_user',
          language_code: 'ar'
        },
        message: {
          message_id: 123,
          from: {
            id: 123456789,
            is_bot: true,
            first_name: 'Tevasul Bot',
            username: 'tevasul_bot'
          },
          chat: {
            id: -987654321,
            title: 'Tevasul Support',
            type: 'group'
          },
          date: Math.floor(Date.now() / 1000),
          text: '🏥 طلب تأمين صحي للأجانب\n\n👤 معلومات العميل:\n• الاسم: أحمد محمد علي\n• البريد الإلكتروني: ahmed@example.com\n• رقم الهاتف: +905551234567\n\n📝 الرسالة:\nطلب تأمين صحي للأجانب من العميل أحمد محمد\n\n📊 معلومات إضافية:\n• نوع الطلب: تأمين صحي للأجانب\n• الأولوية: 🟡 عادية\n• الحالة: معلق\n\n🏥 تفاصيل التأمين الصحي:\n• الفئة العمرية: 18-30\n• العمر المحسوب: 25 سنة\n• تاريخ الميلاد: 1998-05-15\n• الشركة المطلوبة: شركة التأمين التركية\n• المدة المطلوبة: 12 شهر\n• السعر المحسوب: 1500 ليرة تركية\n• صورة جواز السفر: مرفقة\n\n💬 معرف الجلسة: test-session-123\n🆔 معرف الطلب: test-request-456',
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'عرض الطلب', callback_data: 'view_request:test-request-456' },
                { text: 'التواصل مع العميل', callback_data: 'contact_user:test-request-456' }
              ],
              [
                { text: 'تم التعامل معه', callback_data: 'mark_resolved:test-request-456' }
              ]
            ]
          }
        },
        chat_instance: 'test-chat-instance',
        data: 'mark_resolved:test-request-456'
      }
    };

    console.log('📋 Telegram Update:', JSON.stringify(telegramUpdate, null, 2));

    // إرسال update إلى webhook handler
    const webhookUrl = 'https://fctvityawavmuethxxix.supabase.co/functions/v1/telegram-webhook-handler';
    
    console.log('🔗 إرسال update إلى:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(telegramUpdate)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ تم معالجة callback query بنجاح:', result);
      console.log('📱 تم إرسال feedback للمدير');
      console.log('🔄 تم تحديث حالة الطلب في قاعدة البيانات');
      console.log('✅ تم تحديث رسالة التيليجرام');
    } else {
      console.error('❌ فشل في معالجة callback query:', result);
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

testRealTelegramCallback();
