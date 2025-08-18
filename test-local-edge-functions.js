import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase
const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunctions() {
  try {
    console.log('🧪 اختبار Edge Functions من localhost:5173...');

    // اختبار search-user
    console.log('\n1️⃣ اختبار search-user:');
    const searchData = { email: 'test@example.com' };
    console.log('📤 إرسال:', searchData);
    
    const { data: searchResult, error: searchError } = await supabase.functions.invoke('search-user', {
      body: searchData
    });

    console.log('📥 استجابة search-user:');
    console.log('Data:', searchResult);
    console.log('Error:', searchError);

    // اختبار create-moderator (بدون مصادقة)
    console.log('\n2️⃣ اختبار create-moderator (بدون مصادقة):');
    const createData = {
      email: 'test.moderator@example.com',
      full_name: 'مشرف تجريبي',
      password: 'TestPassword123!',
      createFullAccount: true
    };
    console.log('📤 إرسال:', createData);
    
    const { data: createResult, error: createError } = await supabase.functions.invoke('create-moderator', {
      body: createData
    });

    console.log('📥 استجابة create-moderator:');
    console.log('Data:', createResult);
    console.log('Error:', createError);

    // اختبار الاتصال المباشر
    console.log('\n3️⃣ اختبار الاتصال المباشر:');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    console.log('📥 استجابة قاعدة البيانات:');
    console.log('Data:', testData);
    console.log('Error:', testError);

  } catch (error) {
    console.error('❌ خطأ غير متوقع:', error);
  }
}

// تشغيل الاختبار
testEdgeFunctions();
