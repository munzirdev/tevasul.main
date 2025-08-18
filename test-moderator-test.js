import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testModeratorTest() {
  try {
    console.log('🧪 اختبار create-moderator-test...');
    
    const { data: createData, error: createError } = await supabase.functions.invoke('create-moderator-test', {
      body: { 
        email: 'test-moderator-final@tevasul.group',
        full_name: 'Test Moderator Final',
        password: 'password123',
        createFullAccount: true
      }
    });
    
    console.log('📊 نتيجة الإنشاء:', { createData, createError });
    
    if (createData?.success) {
      console.log('✅ تم إنشاء المشرف بنجاح!');
      
      // التحقق من وجود المشرف في القائمة
      console.log('🔍 التحقق من قائمة المشرفين...');
      const { data: moderators, error: fetchError } = await supabase
        .from('moderators')
        .select('*')
        .eq('email', 'test-moderator-final@tevasul.group');
      
      console.log('📊 قائمة المشرفين:', { moderators, fetchError });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testModeratorTest();
