import { supabase } from './supabase';
import { VoluntaryReturnForm, CreateVoluntaryReturnFormData } from './types';

export const voluntaryReturnService = {
  // Create a new voluntary return form
  async createForm(formData: CreateVoluntaryReturnFormData): Promise<{ data: VoluntaryReturnForm | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ خطأ في المصادقة:', authError);
        return { data: null, error: { message: 'خطأ في المصادقة', details: authError } };
      }
      
      if (!user) {
        console.error('❌ المستخدم غير مسجل الدخول');
        return { data: null, error: { message: 'يجب تسجيل الدخول لحفظ النموذج' } };
      }

      // التحقق من صلاحيات المستخدم (اختياري)

      // التحقق من صحة البيانات
      if (!formData.full_name_tr || !formData.full_name_ar || !formData.kimlik_no || !formData.sinir_kapisi) {
        console.error('❌ بيانات النموذج غير مكتملة');
        return { data: null, error: { message: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' } };
      }

      const insertData = {
        user_id: user.id,
        full_name_tr: formData.full_name_tr,
        full_name_ar: formData.full_name_ar,
        kimlik_no: formData.kimlik_no,
        sinir_kapisi: formData.sinir_kapisi,
        gsm: formData.gsm || null,
        custom_date: formData.custom_date || null,
        refakat_entries: formData.refakat_entries || []
      };

      const { data, error } = await supabase
        .from('voluntary_return_forms')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ خطأ في حفظ النموذج:', error);
        
        // رسائل خطأ أكثر تفصيلاً
        let errorMessage = 'خطأ في حفظ النموذج';
        
        if (error.code === 'PGRST205') {
          errorMessage = 'الجدول غير موجود في قاعدة البيانات. يرجى إنشاء الجدول أولاً.';
        } else if (error.code === 'PGRST116') {
          errorMessage = 'خطأ في الصلاحيات. تأكد من تسجيل الدخول.';
        } else if (error.message?.includes('not found')) {
          errorMessage = 'الجدول غير موجود. يرجى إنشاء الجدول في Supabase Dashboard.';
        } else if (error.message?.includes('permission')) {
          errorMessage = 'خطأ في الصلاحيات. تأكد من إعدادات RLS.';
        } else {
          errorMessage = error.message || 'خطأ غير معروف في حفظ النموذج';
        }
        
        return { data: null, error: { message: errorMessage, details: error } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('💥 خطأ غير متوقع في حفظ النموذج:', error);
      return { data: null, error: { message: 'خطأ غير متوقع في حفظ النموذج', details: error } };
    }
  },

  // Get all forms (admin only)
  async getAllForms(): Promise<{ data: VoluntaryReturnForm[] | null; error: any }> {
    try {
      // التحقق من المستخدم الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ خطأ في المصادقة:', authError);
        return { data: null, error: { message: 'خطأ في المصادقة', details: authError } };
      }
      
      if (!user) {
        console.error('❌ المستخدم غير مسجل الدخول');
        return { data: null, error: { message: 'يجب تسجيل الدخول' } };
      }
      
      // التحقق من صلاحيات المستخدم (اختياري)
      
      const { data, error } = await supabase
        .from('voluntary_return_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ خطأ في جلب النماذج:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('💥 خطأ غير متوقع في جلب النماذج:', error);
      return { data: null, error: { message: 'خطأ غير متوقع في جلب النماذج', details: error } };
    }
  },

  // Get forms for current user
  async getUserForms(): Promise<{ data: VoluntaryReturnForm[] | null; error: any }> {
    try {
      // التحقق من المستخدم الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ خطأ في المصادقة:', authError);
        return { data: null, error: { message: 'خطأ في المصادقة', details: authError } };
      }
      
      if (!user) {
        console.error('❌ المستخدم غير مسجل الدخول');
        return { data: null, error: { message: 'يجب تسجيل الدخول' } };
      }
      
      // التحقق من صلاحيات المستخدم (اختياري)
      
      const { data, error } = await supabase
        .from('voluntary_return_forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ خطأ في جلب نماذج المستخدم:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('💥 خطأ غير متوقع في جلب نماذج المستخدم:', error);
      return { data: null, error: { message: 'خطأ غير متوقع في جلب نماذج المستخدم', details: error } };
    }
  },

  // Get a single form by ID
  async getFormById(id: string): Promise<{ data: VoluntaryReturnForm | null; error: any }> {
    try {
      // التحقق من المستخدم الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ خطأ في المصادقة:', authError);
        return { data: null, error: { message: 'خطأ في المصادقة', details: authError } };
      }
      
      if (!user) {
        console.error('❌ المستخدم غير مسجل الدخول');
        return { data: null, error: { message: 'يجب تسجيل الدخول' } };
      }
      
      // التحقق من صلاحيات المستخدم
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ خطأ في جلب بيانات المستخدم:', profileError);
        return { data: null, error: { message: 'خطأ في جلب بيانات المستخدم', details: profileError } };
      }
      
      // التحقق من أن المستخدم يمكنه الوصول إلى النموذج
      const userRole = profile?.role || 'user';
      
      if (!userRole) {
        console.error('❌ المستخدم ليس لديه دور محدد');
        return { data: null, error: { message: 'المستخدم ليس لديه دور محدد' } };
      }
      
      const { data, error } = await supabase
        .from('voluntary_return_forms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ خطأ في جلب النموذج:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('💥 خطأ غير متوقع في جلب النموذج:', error);
      return { data: null, error: { message: 'خطأ غير متوقع في جلب النموذج', details: error } };
    }
  },

  // Update a form
  async updateForm(id: string, formData: CreateVoluntaryReturnFormData): Promise<{ data: VoluntaryReturnForm | null; error: any }> {
    try {
      // التحقق من المستخدم الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ خطأ في المصادقة:', authError);
        return { data: null, error: { message: 'خطأ في المصادقة', details: authError } };
      }
      
      if (!user) {
        console.error('❌ المستخدم غير مسجل الدخول');
        return { data: null, error: { message: 'يجب تسجيل الدخول' } };
      }
      
      // التحقق من صلاحيات المستخدم
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ خطأ في جلب بيانات المستخدم:', profileError);
        return { data: null, error: { message: 'خطأ في جلب بيانات المستخدم', details: profileError } };
      }
      
      // التحقق من أن المستخدم يمكنه تحديث النماذج (اختياري)
      const userRole = profile?.role || 'user';
      
      // التحقق من أن النموذج موجود وأن المستخدم يمكنه تحديثه
      const { data: existingForm, error: fetchError } = await supabase
        .from('voluntary_return_forms')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('❌ خطأ في جلب النموذج:', fetchError);
        return { data: null, error: fetchError };
      }
      
      // التحقق من أن المستخدم يمكنه تحديث هذا النموذج
      if (userRole !== 'admin' && userRole !== 'moderator' && existingForm?.user_id !== user.id) {
        console.error('❌ المستخدم لا يمكنه تحديث هذا النموذج');
        return { data: null, error: { message: 'لا يمكنك تحديث هذا النموذج' } };
      }
      
      const { data, error } = await supabase
        .from('voluntary_return_forms')
        .update({
          full_name_tr: formData.full_name_tr,
          full_name_ar: formData.full_name_ar,
          kimlik_no: formData.kimlik_no,
          sinir_kapisi: formData.sinir_kapisi,
          gsm: formData.gsm || null,
          custom_date: formData.custom_date || null,
          refakat_entries: formData.refakat_entries
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ خطأ في تحديث النموذج:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('💥 خطأ غير متوقع في تحديث النموذج:', error);
      return { data: null, error: { message: 'خطأ غير متوقع في تحديث النموذج', details: error } };
    }
  },

  // Delete a form
  async deleteForm(id: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ خطأ في المصادقة:', authError);
        return { error: { message: 'خطأ في المصادقة', details: authError } };
      }
      
      if (!user) {
        console.error('❌ المستخدم غير مسجل الدخول');
        return { error: { message: 'يجب تسجيل الدخول' } };
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ خطأ في جلب بيانات المستخدم:', profileError);
        return { error: { message: 'خطأ في جلب بيانات المستخدم', details: profileError } };
      }
      
      // إذا لم يكن هناك دور محدد، نعتبر المستخدم عادي
      const userRole = profile?.role || 'user';
      
      // Admin أو Moderator يمكنه حذف أي نموذج
      if (userRole === 'admin' || userRole === 'moderator') {
        const { error: deleteError } = await supabase
          .from('voluntary_return_forms')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('❌ فشل حذف النموذج:', deleteError);
          return { error: { message: 'فشل حذف النموذج', details: deleteError } };
        }
        
        return { error: null };
      }
      
      // المستخدم العادي يمكنه حذف نماذجه فقط
      const { data: formData, error: fetchError } = await supabase
        .from('voluntary_return_forms')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('❌ خطأ في جلب بيانات النموذج:', fetchError);
        return { error: { message: 'النموذج غير موجود', details: fetchError } };
      }
      
      if (!formData?.user_id || formData?.user_id !== user.id) {
        console.error('❌ المستخدم لا يمكنه حذف هذا النموذج');
        return { error: { message: 'لا يمكنك حذف هذا النموذج' } };
      }
      
      const { error: deleteError } = await supabase
        .from('voluntary_return_forms')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ فشل حذف النموذج:', deleteError);
        return { error: { message: 'فشل حذف النموذج', details: deleteError } };
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'خطأ غير متوقع في حذف النموذج', details: error } };
    }
  }
};
