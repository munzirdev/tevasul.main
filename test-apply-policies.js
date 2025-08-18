const { createClient } = require('@supabase/supabase-js');

// إعدادات Supabase
const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// إنشاء عميل مع service role key للحصول على صلاحيات كاملة
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDeletePolicies() {
  try {
    console.log('🔧 تطبيق سياسات الحذف...');

    // إضافة سياسات الحذف لجدول service_requests
    const serviceRequestsPolicies = [
      {
        name: 'Users can delete their own service requests',
        table: 'service_requests',
        operation: 'DELETE',
        definition: 'USING (auth.uid() = user_id)'
      },
      {
        name: 'Admins can delete all service requests',
        table: 'service_requests',
        operation: 'DELETE',
        definition: `USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
          )
        )`
      }
    ];

    // إضافة سياسات الحذف لجدول file_attachments
    const fileAttachmentsPolicies = [
      {
        name: 'Users can delete their own file attachments',
        table: 'file_attachments',
        operation: 'DELETE',
        definition: 'USING (auth.uid() = user_id)'
      },
      {
        name: 'Admins can delete all file attachments',
        table: 'file_attachments',
        operation: 'DELETE',
        definition: `USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
          )
        )`
      }
    ];

    const allPolicies = [...serviceRequestsPolicies, ...fileAttachmentsPolicies];

    for (const policy of allPolicies) {
      try {
        // التحقق من وجود السياسة
        const { data: existingPolicy } = await supabase
          .rpc('check_policy_exists', {
            table_name: policy.table,
            policy_name: policy.name
          });

        if (!existingPolicy) {
          // إنشاء السياسة
          const { error } = await supabase
            .rpc('create_policy', {
              table_name: policy.table,
              policy_name: policy.name,
              operation: policy.operation,
              definition: policy.definition
            });

          if (error) {
            console.error(`❌ خطأ في إنشاء سياسة ${policy.name}:`, error);
          } else {
            console.log(`✅ تم إنشاء سياسة ${policy.name}`);
          }
        } else {
          console.log(`ℹ️ السياسة ${policy.name} موجودة بالفعل`);
        }
      } catch (error) {
        console.error(`❌ خطأ في معالجة السياسة ${policy.name}:`, error);
      }
    }

    console.log('✅ تم تطبيق جميع السياسات');

    // التحقق من السياسات المطبقة
    console.log('\n📋 السياسات المطبقة:');
    const { data: policies, error } = await supabase
      .from('information_schema.policies')
      .select('*')
      .in('table_name', ['service_requests', 'file_attachments']);

    if (error) {
      console.error('❌ خطأ في جلب السياسات:', error);
    } else {
      policies.forEach(policy => {
        console.log(`- ${policy.policy_name} (${policy.table_name})`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تشغيل الدالة
applyDeletePolicies();
