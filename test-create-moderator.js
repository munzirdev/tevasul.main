import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase
const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateModerator() {
  try {
    console.log('🧪 اختبار إنشاء مشرف...');

    // بيانات الاختبار
    const testData = {
      email: 'test.moderator@example.com',
      full_name: 'مشرف تجريبي',
      password: 'TestPassword123!',
      createFullAccount: true
    };

    console.log('📋 بيانات الاختبار:', testData);

    // استدعاء Edge Function
    const { data, error } = await supabase.functions.invoke('create-moderator', {
      body: testData
    });

    console.log('📤 استجابة Edge Function:');
    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('❌ فشل في إنشاء المشرف:', error);
    } else {
      console.log('✅ تم إنشاء المشرف بنجاح:', data);
    }

  } catch (error) {
    console.error('❌ خطأ غير متوقع:', error);
  }
}

// تشغيل الاختبار
testCreateModerator();
