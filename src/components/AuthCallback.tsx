import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GlassLoadingScreen from './GlassLoadingScreen';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('خطأ في معالجة تسجيل الدخول:', error);
          setError('حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
          setLoading(false);
          return;
        }

        if (data.session) {
          // التحقق من وجود ملف شخصي
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('خطأ في جلب الملف الشخصي:', profileError);
          }

          // إنشاء ملف شخصي إذا لم يكن موجوداً
          if (!profile) {
            // استخراج بيانات Google بشكل أفضل
            const googleData = data.session.user.user_metadata;
            
            // طباعة جميع البيانات المتوفرة للتشخيص
            // محاولة استخراج الاسم بطرق مختلفة
            let fullName = '';
            
            // 1. محاولة من user_metadata
            if (googleData?.full_name) {
              fullName = googleData.full_name;
              } else if (googleData?.name) {
              fullName = googleData.name;
              } else if (googleData?.display_name) {
              fullName = googleData.display_name;
              } else if (googleData?.given_name && googleData?.family_name) {
              fullName = `${googleData.given_name} ${googleData.family_name}`;
              } else if (googleData?.given_name) {
              fullName = googleData.given_name;
              } else {
              // إذا لم نجد أي اسم، استخدم "مستخدم جديد" بدلاً من البريد الإلكتروني
              fullName = 'مستخدم جديد';
              }
            
            const avatarUrl = googleData?.avatar_url || 
                            googleData?.picture || 
                            googleData?.photoURL || 
                            '';

            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.session.user.id,
                  full_name: fullName,
                  email: data.session.user.email,
                  avatar_url: avatarUrl,
                  updated_at: new Date().toISOString(),
                }
              ]);

            if (insertError) {
              console.error('خطأ في إنشاء الملف الشخصي:', insertError);
            }
          } else {
            // تحديث الملف الشخصي الموجود إذا كان من Google
            const googleData = data.session.user.user_metadata;
            if (googleData?.provider === 'google') {
              // تحديث الاسم إذا كان متوفراً
              let updatedName = profile.full_name;
              if (googleData?.full_name && profile.full_name !== googleData.full_name) {
                updatedName = googleData.full_name;
                } else if (googleData?.name && profile.full_name !== googleData.name) {
                updatedName = googleData.name;
                } else if (googleData?.given_name && googleData?.family_name) {
                const newName = `${googleData.given_name} ${googleData.family_name}`;
                if (profile.full_name !== newName) {
                  updatedName = newName;
                  }
              }

              // تحديث الصورة إذا كانت متوفرة
              const updatedAvatarUrl = googleData?.avatar_url || profile.avatar_url;

              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  full_name: updatedName,
                  avatar_url: updatedAvatarUrl,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', data.session.user.id);

              if (updateError) {
                console.error('خطأ في تحديث الملف الشخصي من Google:', updateError);
              }
            }
          }

          // التوجيه إلى الصفحة الرئيسية
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
          setLoading(false);
          // التوجيه الفوري إلى الصفحة الرئيسية
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('خطأ غير متوقع:', error);
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <GlassLoadingScreen
        text="جاري معالجة تسجيل الدخول..."
        subText="يرجى الانتظار"
        variant="sparkles"
        isDarkMode={false}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">خطأ في تسجيل الدخول</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return null;
};
