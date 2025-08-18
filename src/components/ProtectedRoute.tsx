import React, { useState, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';
import { useLanguage } from '../hooks/useLanguage';
import GlassLoadingScreen from './GlassLoadingScreen';
import SkeletonLoading from './SkeletonLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireModerator = false,
  fallback 
}) => {
  const { user, profile, loading } = useAuthContext();
  const { t, language } = useLanguage();
  const [forceTimeout, setForceTimeout] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Add timeout to prevent loading state from getting stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setForceTimeout(true);
      }, 4000); // 4 second timeout

      return () => clearTimeout(timeout);
    } else {
      // Add a small delay before setting forceTimeout to false to prevent flickering
      const delayTimeout = setTimeout(() => {
        setForceTimeout(false);
      }, 500); // Increased delay to prevent flickering

      return () => clearTimeout(delayTimeout);
    }
  }, [loading]);

  // Hide skeleton after a very short delay to show glass loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 100); // Very short delay to prevent white screen

    return () => clearTimeout(timer);
  }, []);

  // Show skeleton loading immediately to prevent white screen
  if (showSkeleton) {
    return (
      <SkeletonLoading
        isDarkMode={false}
      />
    );
  }

  // Add debug logging
  // Show loading state while checking authentication
  // Also show loading when user is not available to prevent flickering
  if ((loading && !forceTimeout) || !user) {
    return (
      <GlassLoadingScreen
        text={language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Yetkiler kontrol ediliyor...'}
        subText={language === 'ar' ? 'يرجى الانتظار، قد يستغرق الأمر بضع ثوانٍ' : 'Please wait, this may take a few seconds'}
        variant="pulse"
        isDarkMode={false}
      />
    );
  }

  // Check if user is authenticated
  if (!user && !loading) {
    return fallback || (
      <div className="min-h-screen bg-white dark:bg-jet-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-jet-800 dark:text-white mb-4">
            {language === 'ar' ? 'غير مصرح' : 'Yetkisiz Erişim'}
          </h2>
          <p className="text-jet-600 dark:text-platinum-400 mb-6">
            {language === 'ar' 
              ? 'يجب تسجيل الدخول للوصول إلى هذه الصفحة' 
              : 'Bu sayfaya erişmek için giriş yapmanız gerekiyor'
            }
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300"
          >
            {language === 'ar' ? 'تسجيل الدخول' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    );
  }

  // Check if admin or moderator privileges are required and user has them
  if ((requireAdmin || requireModerator) && user && profile) {
    const userRole = profile.role;
    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator';
    
    // For admin-only routes
    if (requireAdmin && !isAdmin) {
      return fallback || (
        <div className="min-h-screen bg-white dark:bg-jet-800 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-jet-800 dark:text-white mb-4">
              {language === 'ar' ? 'صلاحيات غير كافية' : 'Yetersiz Yetki'}
            </h2>
            <p className="text-jet-600 dark:text-platinum-400 mb-6">
              {language === 'ar' 
                ? 'تحتاج إلى صلاحيات المدير للوصول إلى هذه الصفحة' 
                : 'Bu sayfaya erişmek için yönetici yetkilerine ihtiyacınız var'
              }
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300"
            >
              {language === 'ar' ? 'العودة للرئيسية' : 'Ana Sayfaya Dön'}
            </button>
          </div>
        </div>
      );
    }
    
    // For moderator routes (moderators and admins can access)
    if (requireModerator && !isModerator && !isAdmin) {
      return fallback || (
        <div className="min-h-screen bg-white dark:bg-jet-800 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-jet-800 dark:text-white mb-4">
              {language === 'ar' ? 'صلاحيات غير كافية' : 'Yetersiz Yetki'}
            </h2>
            <p className="text-jet-600 dark:text-platinum-400 mb-6">
              {language === 'ar' 
                ? 'تحتاج إلى صلاحيات المشرف أو المدير للوصول إلى هذه الصفحة' 
                : 'Bu sayfaya erişmek için moderatör veya yönetici yetkilerine ihtiyacınız var'
              }
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300"
            >
              {language === 'ar' ? 'العودة للرئيسية' : 'Ana Sayfaya Dön'}
            </button>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required privileges
  return <>{children}</>;
};

export default ProtectedRoute;
