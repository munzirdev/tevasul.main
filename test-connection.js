import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase Cloud
const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔍 اختبار الاتصال بـ Supabase Cloud...');
    
    // اختبار الاتصال المباشر
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('📊 نتيجة الاتصال المباشر:', { data, error });
    
    // اختبار Edge Function
    console.log('🔍 اختبار Edge Function...');
    const { data: funcData, error: funcError } = await supabase.functions.invoke('search-user', {
      body: { email: 'test@example.com' }
    });
    
    console.log('📊 نتيجة Edge Function:', { funcData, funcError });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testConnection();
