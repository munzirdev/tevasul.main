import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCorsFix() {
  try {
    console.log('🧪 اختبار إصلاح CORS...');
    
    // اختبار search-user
    console.log('🔍 اختبار search-user...');
    const { data: searchData, error: searchError } = await supabase.functions.invoke('search-user', {
      body: { email: 'test@example.com' }
    });
    
    console.log('📊 نتيجة search-user:', { searchData, searchError });
    
    // اختبار create-moderator (بدون مصادقة)
    console.log('🔍 اختبار create-moderator...');
    const { data: createData, error: createError } = await supabase.functions.invoke('create-moderator', {
      body: { 
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'password123',
        createFullAccount: true
      }
    });
    
    console.log('📊 نتيجة create-moderator:', { createData, createError });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testCorsFix();
