import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OTPResetPage: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('resetPasswordEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }
    
    // Start countdown for resend
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError(isArabic ? 'يرجى إدخال الرمز المكون من 6 أرقام' : 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'recovery'
      });

      if (error) {
        console.error('OTP verification error:', error);
        
        if (error.message?.includes('expired')) {
          setError(isArabic ? 'الرمز منتهي الصلاحية. يرجى طلب رمز جديد.' : 'Code expired. Please request a new code.');
        } else if (error.message?.includes('invalid')) {
          setError(isArabic ? 'الرمز غير صحيح. يرجى المحاولة مرة أخرى.' : 'Invalid code. Please try again.');
        } else {
          setError(isArabic ? 'رمز غير صحيح. يرجى المحاولة مرة أخرى.' : 'Invalid code. Please try again.');
        }
        
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setSuccess(true);
        setShowPasswordForm(true);
        // Clear OTP from localStorage
        localStorage.removeItem('resetPasswordEmail');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(isArabic ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError(isArabic ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(isArabic ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        setPasswordError(isArabic ? 'فشل في تحديث كلمة المرور. يرجى المحاولة مرة أخرى.' : 'Failed to update password. Please try again.');
      } else {
        // Success - redirect to login
        navigate('/?message=password_updated');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setPasswordError(isArabic ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return;

    setResendLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`
      });

      if (error) {
        console.error('Resend OTP error:', error);
        setError(isArabic ? 'فشل في إعادة إرسال الرمز. يرجى المحاولة مرة أخرى.' : 'Failed to resend code. Please try again.');
      } else {
        setError(null);
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(isArabic ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-indigo-50 to-platinum-100 dark:from-jet-900 dark:via-jet-800 dark:to-jet-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-jet-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-jet-900 dark:text-white mb-2">
                {isArabic ? 'البريد الإلكتروني مطلوب' : 'Email Required'}
              </h2>
              <p className="text-jet-600 dark:text-jet-400 mb-6">
                {isArabic ? 'يرجى طلب إعادة تعيين كلمة المرور من صفحة تسجيل الدخول' : 'Please request password reset from the login page'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300"
              >
                {isArabic ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-indigo-50 to-platinum-100 dark:from-jet-900 dark:via-jet-800 dark:to-jet-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-jet-800 rounded-2xl p-8 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-caribbean-100 dark:bg-caribbean-900/20 mb-4">
              <Mail className="h-8 w-8 text-caribbean-600 dark:text-caribbean-400" />
            </div>
            <h1 className="text-2xl font-bold text-jet-900 dark:text-white mb-2">
              {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </h1>
            <p className="text-jet-600 dark:text-jet-400">
              {isArabic 
                ? `أدخل الرمز المرسل إلى ${email}`
                : `Enter the code sent to ${email}`
              }
            </p>
          </div>

          {!showPasswordForm ? (
            <>
              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-4 text-center">
                  {isArabic ? 'رمز التحقق (6 أرقام)' : 'Verification Code (6 digits)'}
                </label>
                <div className="flex justify-center space-x-2 space-x-reverse">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Resend Button */}
              <div className="text-center mb-6">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resendLoading}
                  className="text-sm text-caribbean-600 dark:text-caribbean-400 hover:text-caribbean-700 dark:hover:text-caribbean-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                      {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : countdown > 0 ? (
                    isArabic ? `إعادة الإرسال خلال ${countdown} ثانية` : `Resend in ${countdown}s`
                  ) : (
                    isArabic ? 'إعادة إرسال الرمز' : 'Resend Code'
                  )}
                </button>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-sm text-jet-600 dark:text-jet-400 hover:text-jet-700 dark:hover:text-jet-300 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 ml-1" />
                  {isArabic ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {isArabic ? 'تم التحقق من الرمز بنجاح. يرجى إدخال كلمة المرور الجديدة.' : 'Code verified successfully. Please enter your new password.'}
                  </p>
                </div>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                    {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white placeholder-jet-400 dark:placeholder-jet-500"
                    placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                    {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white placeholder-jet-400 dark:placeholder-jet-500"
                    placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Password Requirements */}
                <div className="bg-platinum-50 dark:bg-jet-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                    {isArabic ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
                  </h4>
                  <ul className="text-xs text-jet-600 dark:text-jet-400 space-y-1">
                    <li className={`flex items-center ${newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                      <span className="mr-2">•</span>
                      {isArabic ? '6 أحرف على الأقل' : 'At least 6 characters'}
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <span className="mr-2">•</span>
                      {isArabic ? 'حرف كبير واحد على الأقل' : 'At least one uppercase letter'}
                    </li>
                    <li className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <span className="mr-2">•</span>
                      {isArabic ? 'حرف صغير واحد على الأقل' : 'At least one lowercase letter'}
                    </li>
                    <li className={`flex items-center ${/\d/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <span className="mr-2">•</span>
                      {isArabic ? 'رقم واحد على الأقل' : 'At least one number'}
                    </li>
                  </ul>
                </div>

                {/* Password Error */}
                {passwordError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !validatePassword(newPassword) || newPassword !== confirmPassword}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPResetPage;


