import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase المحلية
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLocalSupabase() {
  try {
    console.log('🧪 اختبار Supabase المحلي...');

    // اختبار الاتصال المباشر
    console.log('\n1️⃣ اختبار الاتصال المباشر:');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    console.log('📥 استجابة قاعدة البيانات:');
    console.log('Data:', testData);
    console.log('Error:', testError);

    // اختبار search-user محلي
    console.log('\n2️⃣ اختبار search-user محلي:');
    const searchData = { email: 'test@example.com' };
    console.log('📤 إرسال:', searchData);
    
    const { data: searchResult, error: searchError } = await supabase.functions.invoke('search-user', {
      body: searchData
    });

    console.log('📥 استجابة search-user:');
    console.log('Data:', searchResult);
    console.log('Error:', searchError);

  } catch (error) {
    console.error('❌ خطأ غير متوقع:', error);
  }
}

// تشغيل الاختبار
testLocalSupabase();
