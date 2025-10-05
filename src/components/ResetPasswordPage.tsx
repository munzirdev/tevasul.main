import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    checkResetToken();
  }, []);

  const checkResetToken = async () => {
    try {
      // Check for URL parameters from email link
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      // Check for error parameters in URL
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      console.log('URL Parameters:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
      console.log('Error Parameters:', { error, errorCode, errorDescription });
      
      // Handle error cases first
      if (error || errorCode) {
        console.error('Error in URL:', { error, errorCode, errorDescription });
        
        let errorMessage = '';
        if (errorCode === 'otp_expired') {
          errorMessage = isArabic 
            ? 'رابط إعادة تعيين كلمة المرور منتهي الصلاحية. يرجى طلب رابط جديد.'
            : 'Password reset link has expired. Please request a new link.';
        } else if (error === 'access_denied') {
          errorMessage = isArabic 
            ? 'تم رفض الوصول. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.'
            : 'Access denied. Please request a new password reset link.';
        } else {
          errorMessage = isArabic 
            ? 'حدث خطأ في الرابط. يرجى طلب رابط جديد من صفحة تسجيل الدخول.'
            : 'An error occurred with the link. Please request a new link from the login page.';
        }
        
        setError(errorMessage);
        setIsValidToken(false);
        return;
      }
      
      // Also check for hash fragment parameters (Supabase sometimes uses these)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      const hashType = hashParams.get('type');
      
      // Check for error parameters in hash
      const hashError = hashParams.get('error');
      const hashErrorCode = hashParams.get('error_code');
      const hashErrorDescription = hashParams.get('error_description');
      
      console.log('Hash Parameters:', { hashAccessToken: !!hashAccessToken, hashRefreshToken: !!hashRefreshToken, hashType });
      console.log('Hash Error Parameters:', { hashError, hashErrorCode, hashErrorDescription });
      
      // Handle hash error cases
      if (hashError || hashErrorCode) {
        console.error('Error in Hash:', { hashError, hashErrorCode, hashErrorDescription });
        
        let errorMessage = '';
        if (hashErrorCode === 'otp_expired') {
          errorMessage = isArabic 
            ? 'رابط إعادة تعيين كلمة المرور منتهي الصلاحية. يرجى طلب رابط جديد.'
            : 'Password reset link has expired. Please request a new link.';
        } else if (hashError === 'access_denied') {
          errorMessage = isArabic 
            ? 'تم رفض الوصول. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.'
            : 'Access denied. Please request a new password reset link.';
        } else {
          errorMessage = isArabic 
            ? 'حدث خطأ في الرابط. يرجى طلب رابط جديد من صفحة تسجيل الدخول.'
            : 'An error occurred with the link. Please request a new link from the login page.';
        }
        
        setError(errorMessage);
        setIsValidToken(false);
        return;
      }
      
      // Use either URL params or hash params
      const finalAccessToken = accessToken || hashAccessToken;
      const finalRefreshToken = refreshToken || hashRefreshToken;
      const finalType = type || hashType;
      
      if (finalAccessToken && finalRefreshToken && finalType === 'recovery') {
        // User came from email link, set session
        console.log('Setting session from email link tokens...');
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            
            // Check for specific error types
            if (error.message?.includes('expired') || error.message?.includes('invalid')) {
              setError(isArabic ? 'رابط منتهي الصلاحية. يرجى طلب رابط جديد.' : 'Link expired. Please request a new link.');
            } else if (error.message?.includes('already_used')) {
              setError(isArabic ? 'تم استخدام هذا الرابط مسبقاً. يرجى طلب رابط جديد.' : 'This link has already been used. Please request a new link.');
            } else {
              setError(isArabic ? 'رابط غير صالح. يرجى طلب رابط جديد.' : 'Invalid link. Please request a new link.');
            }
            setIsValidToken(false);
          } else if (data.session) {
            console.log('Session set successfully:', data.session.user.email);
            setIsValidToken(true);
            setEmail(data.session.user.email);
            
            // Clean up URL parameters after successful session setup
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          } else {
            console.error('No session after setting tokens');
            setError(isArabic ? 'رابط غير صالح. يرجى طلب رابط جديد.' : 'Invalid link. Please request a new link.');
            setIsValidToken(false);
          }
        } catch (sessionError) {
          console.error('Session setup failed:', sessionError);
          setError(isArabic ? 'فشل في إعداد الجلسة. يرجى المحاولة مرة أخرى.' : 'Failed to setup session. Please try again.');
          setIsValidToken(false);
        }
      } else {
        // Check if user is already authenticated
        console.log('Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setError(isArabic ? 'رابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link');
          setIsValidToken(false);
        } else if (session) {
          console.log('Existing session found:', session.user.email);
          setIsValidToken(true);
          setEmail(session.user.email);
        } else {
          console.log('No valid session found');
          setError(isArabic ? 'رابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد من صفحة تسجيل الدخول.' : 'Invalid or expired link. Please request a new link from the login page.');
          setIsValidToken(false);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
      setIsValidToken(false);
    } finally {
      setCheckingToken(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        isArabic 
          ? 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، حرف صغير، ورقم'
          : 'Password must be at least 6 characters with uppercase, lowercase, and number'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error);
        setError(
          isArabic 
            ? 'حدث خطأ في تحديث كلمة المرور. يرجى المحاولة مرة أخرى.'
            : 'An error occurred while updating the password. Please try again.'
        );
      } else {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(
        isArabic 
          ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-white to-indigo-50 dark:from-jet-900 dark:via-jet-800 dark:to-jet-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-caribbean-600 dark:text-caribbean-400 mx-auto mb-4" />
          <p className="text-jet-600 dark:text-jet-400">
            {isArabic ? 'جاري التحقق من الرابط...' : 'Checking link...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-white to-indigo-50 dark:from-jet-900 dark:via-jet-800 dark:to-jet-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-jet-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-jet-900 dark:text-white mb-4">
              {isArabic ? 'رابط غير صالح' : 'Invalid Link'}
            </h2>
            
            <p className="text-jet-600 dark:text-jet-400 mb-6">
              {error || (isArabic ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد من صفحة تسجيل الدخول.' : 'The password reset link is invalid or has expired. Please request a new link from the login page.')}
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2 space-x-reverse">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                    {isArabic ? 'نصائح لحل المشكلة:' : 'Tips to resolve this issue:'}
                  </p>
                  <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                    <li>• {isArabic ? 'تأكد من أن الرابط لم يتم نسخه بشكل جزئي' : 'Make sure the link wasn\'t copied partially'}</li>
                    <li>• {isArabic ? 'لا تنتظر طويلاً قبل الضغط على الرابط' : 'Don\'t wait too long before clicking the link'}</li>
                    <li>• {isArabic ? 'تحقق من بريدك الإلكتروني في مجلد الرسائل غير المرغوب فيها' : 'Check your email spam folder'}</li>
                    <li>• {isArabic ? 'اطلب رابطاً جديداً إذا استمرت المشكلة' : 'Request a new link if the problem persists'}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleBackToLogin}
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-caribbean-600 to-indigo-700 hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-white to-indigo-50 dark:from-jet-900 dark:via-jet-800 dark:to-jet-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-jet-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-jet-900 dark:text-white mb-4">
              {isArabic ? 'تم تغيير كلمة المرور بنجاح!' : 'Password Changed Successfully!'}
            </h2>
            
            <p className="text-jet-600 dark:text-jet-400 mb-6">
              {isArabic 
                ? `تم تغيير كلمة المرور الخاصة بك بنجاح${email ? ` لـ ${email}` : ''}. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.`
                : `Your password has been changed successfully${email ? ` for ${email}` : ''}. You can now log in with your new password.`
              }
            </p>
            
            <button
              onClick={handleBackToLogin}
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-caribbean-600 to-indigo-700 hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-200 shadow-sm"
            >
              {isArabic ? 'تسجيل الدخول الآن' : 'Login Now'}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-jet-500 dark:text-jet-400">
                {isArabic ? 'سيتم توجيهك تلقائياً خلال 3 ثوان...' : 'You will be redirected automatically in 3 seconds...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-white to-indigo-50 dark:from-jet-900 dark:via-jet-800 dark:to-jet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-jet-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-caribbean-100 dark:bg-caribbean-900/20 mb-4">
              <Lock className="h-8 w-8 text-caribbean-600 dark:text-caribbean-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-jet-900 dark:text-white mb-2">
              {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </h2>
            
            <p className="text-jet-600 dark:text-jet-400">
              {isArabic 
                ? `أدخل كلمة المرور الجديدة${email ? ` لـ ${email}` : ''}`
                : `Enter your new password${email ? ` for ${email}` : ''}`
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-jet-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white placeholder-jet-400 dark:placeholder-jet-500"
                  placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-jet-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white placeholder-jet-400 dark:placeholder-jet-500"
                  placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-platinum-50 dark:bg-jet-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                {isArabic ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
              </h4>
              <ul className="text-xs text-jet-600 dark:text-jet-400 space-y-1">
                <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  {isArabic ? '6 أحرف على الأقل' : 'At least 6 characters'}
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  {isArabic ? 'حرف كبير واحد على الأقل' : 'At least one uppercase letter'}
                </li>
                <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  {isArabic ? 'حرف صغير واحد على الأقل' : 'At least one lowercase letter'}
                </li>
                <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  {isArabic ? 'رقم واحد على الأقل' : 'At least one number'}
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    {!isValidToken && (
                      <div className="mt-3">
                        <button
                          onClick={() => navigate('/')}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                        >
                          {isArabic ? 'العودة لصفحة تسجيل الدخول لطلب رابط جديد' : 'Go back to login page to request new link'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-caribbean-600 to-indigo-700 hover:from-caribbean-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-caribbean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {isArabic ? 'جاري التحديث...' : 'Updating...'}
                </>
              ) : (
                isArabic ? 'تحديث كلمة المرور' : 'Update Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToLogin}
              className="inline-flex items-center text-sm text-caribbean-600 dark:text-caribbean-400 hover:text-caribbean-700 dark:hover:text-caribbean-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 ml-1" />
              {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
