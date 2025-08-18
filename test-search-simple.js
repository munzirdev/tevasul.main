import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSearchSimple() {
  try {
    console.log('🧪 اختبار search-user-simple...');
    
    const { data, error } = await supabase.functions.invoke('search-user-simple', {
      body: { email: 'test@example.com' }
    });
    
    console.log('📊 النتيجة:', { data, error });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testSearchSimple();
