import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzA5ODAsImV4cCI6MjA3MDY0Njk4MH0.d6T4MrGgV3vKZjcQ02vjf8_oDeRu9SJQXNgA0LJHlq0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectInsert() {
  try {
    console.log('🧪 اختبار الإدراج المباشر...');
    
    const userId = crypto.randomUUID();
    const email = 'test-direct-insert@tevasul.group';
    const fullName = 'Test Direct Insert';
    
    console.log('🔍 إنشاء مشرف جديد:', { userId, email, fullName });
    
    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: 'moderator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ خطأ في إنشاء الملف الشخصي:', profileError);
      return;
    }

    console.log('✅ تم إنشاء الملف الشخصي بنجاح');

    // Insert into moderators table
    const { error: moderatorError } = await supabase
      .from('moderators')
      .insert({
        user_id: userId,
        email: email,
        full_name: fullName,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (moderatorError) {
      console.error('❌ خطأ في إنشاء سجل المشرف:', moderatorError);
      return;
    }

    console.log('✅ تم إنشاء سجل المشرف بنجاح');
    
    // التحقق من وجود المشرف في القائمة
    console.log('🔍 التحقق من قائمة المشرفين...');
    const { data: moderators, error: fetchError } = await supabase
      .from('moderators')
      .select('*')
      .eq('email', email);
    
    console.log('📊 قائمة المشرفين:', { moderators, fetchError });
    
    // التحقق من وجود المستخدم في profiles
    console.log('🔍 التحقق من جدول profiles...');
    const { data: profiles, error: profileError2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    console.log('📊 جدول profiles:', { profiles, profileError2 });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testDirectInsert();
