import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleFixed() {
  try {
    console.log('🧪 اختبار الوظائف المصححة (بدون تسجيل دخول)...');
    
    // اختبار search-user-fixed
    console.log('🔍 اختبار search-user-fixed...');
    const { data: searchData, error: searchError } = await supabase.functions.invoke('search-user-fixed', {
      body: { email: 'hanoof2@tevasul.group' }
    });
    
    console.log('📊 نتيجة البحث:', { searchData, searchError });
    
    // اختبار create-moderator-fixed (سيحتاج تسجيل دخول)
    console.log('🔍 اختبار create-moderator-fixed...');
    const { data: createData, error: createError } = await supabase.functions.invoke('create-moderator-fixed', {
      body: { 
        email: 'test-moderator@tevasul.group',
        full_name: 'Test Moderator',
        password: 'password123',
        createFullAccount: true
      }
    });
    
    console.log('📊 نتيجة الإنشاء:', { createData, createError });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testSimpleFixed();
