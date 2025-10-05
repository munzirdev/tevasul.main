import React, { useState } from 'react';
import { X, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { emailService } from '../services/emailService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  isDarkMode: boolean;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  isDarkMode
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState(600); // 10 minutes in seconds
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(isArabic ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      setError(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // إرسال رمز OTP بدلاً من رابط مباشر
      // console.log('Sending OTP to:', email);
      // console.log('Redirect URL:', `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`);
      
      // Store the time when OTP is sent
      (window as any).otpSendTime = Date.now();
      
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`,
        // إضافة خيارات إضافية للمساعدة في حل مشكلة 504
        captchaToken: undefined,
        emailRedirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000) // تقليل timeout إلى 10 ثوانٍ
      );

      const { error } = await Promise.race([resetPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error sending reset email:', error);
        
        // معالجة أنواع مختلفة من الأخطاء
        if (error.message?.includes('timeout') || error.message?.includes('504') || error.status === 504) {
          setError(
            isArabic 
              ? 'مشكلة في الخادم. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.'
              : 'Server issue. Please try again or contact support.'
          );
        } else if (error.message?.includes('rate limit')) {
          setError(
            isArabic 
              ? 'تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار قليلاً والمحاولة مرة أخرى.'
              : 'Rate limit exceeded. Please wait a moment and try again.'
          );
        } else if (error.message?.includes('Invalid email')) {
          setError(
            isArabic 
              ? 'البريد الإلكتروني غير صحيح أو غير مسجل.'
              : 'Invalid email address or not registered.'
          );
        } else {
          // محاولة استخدام خدمة البريد الإلكتروني البديلة
          // console.log('Trying alternative email service...');
          const alternativeResult = await emailService.sendPasswordResetEmail(email);
          
          if (alternativeResult.success) {
            setSuccess(true);
            setEmailSent(true);
            setEmail('');
          } else {
            setError(
              isArabic 
                ? 'حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.'
                : 'An error occurred while sending the password reset link. Please try again or contact support.'
            );
          }
        }
      } else {
        setSuccess(true);
        setEmailSent(true);
        setShowOtpInput(true);
        setCountdown(60);
        setOtpExpiryCountdown(600); // Reset OTP expiry countdown
        setRetryCount(0); // Reset retry count
        
        // Start countdown timer for resend
        const resendTimer = setInterval(() => {
          setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        
        // Start OTP expiry countdown
        const expiryTimer = setInterval(() => {
          setOtpExpiryCountdown((prev) => {
            if (prev <= 0) {
              clearInterval(expiryTimer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Clear timers
        setTimeout(() => {
          clearInterval(resendTimer);
          clearInterval(expiryTimer);
        }, 600000); // 10 minutes
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      
      if (err.message?.includes('timeout')) {
        setError(
          isArabic 
            ? 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.'
            : 'Request timeout. Please try again.'
        );
      } else {
        setError(
          isArabic 
            ? 'حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
            : 'Connection error. Please check your internet connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setOtpError(isArabic ? 'يرجى إدخال الرمز المكون من 6 أرقام' : 'Please enter the 6-digit code');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      // console.log('Attempting OTP verification:', {
      //   email: email,
      //   code: code,
      //   codeLength: code.length,
      //   timestamp: new Date().toISOString(),
      //   timeSinceSend: Date.now() - ((window as any).otpSendTime || 0),
      //   otpSendTime: (window as any).otpSendTime
      // });

      // Try to verify OTP with better error handling
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'recovery'
      });

      // console.log('OTP verification response:', { data, error });

      if (error) {
        console.error('OTP verification error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: error.code
        });
        
        if (error.message?.includes('expired') || error.code === 'otp_expired') {
          // Check if this is a server configuration issue
          const timeSinceSend = Date.now() - ((window as any).otpSendTime || 0);
          if (timeSinceSend < 30000) { // Less than 30 seconds
            setOtpError(isArabic ? 
              'مشكلة في إعدادات الخادم - الرمز منتهي الصلاحية فوراً. يرجى التواصل مع الدعم الفني فوراً.' : 
              'Server configuration issue - code expires immediately. Please contact support immediately.'
            );
            // Show critical error notice
            // console.error('CRITICAL: OTP expires in less than 30 seconds - server misconfiguration');
          } else {
            setOtpError(isArabic ? 
              'الرمز منتهي الصلاحية. يرجى استخدام زر "إعادة إرسال الرمز" لطلب رمز جديد.' : 
              'Code expired. Please use "Resend Code" button to request a new code.'
            );
          }
          // Enable resend immediately for expired codes
          setCountdown(0);
          // Reset OTP expiry countdown
          setOtpExpiryCountdown(0);
        } else if (error.message?.includes('invalid') || error.code === 'invalid_token') {
          setOtpError(isArabic ? 'الرمز غير صحيح. يرجى التحقق من الرمز والمحاولة مرة أخرى.' : 'Invalid code. Please verify the code and try again.');
        } else if (error.status === 403) {
          setOtpError(isArabic ? 'تم رفض الوصول. يرجى طلب رمز جديد أو التواصل مع الدعم الفني.' : 'Access denied. Please request a new code or contact support.');
          setCountdown(0);
          setOtpExpiryCountdown(0);
        } else {
          setOtpError(isArabic ? 'رمز غير صحيح. يرجى التحقق من الرمز والمحاولة مرة أخرى.' : 'Invalid code. Please verify the code and try again.');
        }
        
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
      } else {
        setShowPasswordForm(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setOtpError(isArabic ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
    } finally {
      setOtpLoading(false);
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

    setOtpLoading(true);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        setPasswordError(isArabic ? 'فشل في تحديث كلمة المرور. يرجى المحاولة مرة أخرى.' : 'Failed to update password. Please try again.');
      } else {
        // Success - close modal and show success message
        setSuccess(true);
        setEmailSent(false);
        setShowOtpInput(false);
        setShowPasswordForm(false);
        
        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setPasswordError(isArabic ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return;

    setResendLoading(true);
    setOtpError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`
      });

      if (error) {
        console.error('Resend OTP error:', error);
        setOtpError(isArabic ? 'فشل في إعادة إرسال الرمز. يرجى المحاولة مرة أخرى.' : 'Failed to resend code. Please try again.');
      } else {
        setOtpError(null);
        setCountdown(60);
        setOtpExpiryCountdown(600); // Reset OTP expiry countdown
        setOtp(['', '', '', '', '', '']);
        setRetryCount(0); // Reset retry count
        
        // Store the time when OTP is resent
        (window as any).otpSendTime = Date.now();
    
    // Restart expiry countdown
    const expiryTimer = setInterval(() => {
      setOtpExpiryCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(expiryTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clear timer after 10 minutes
    setTimeout(() => clearInterval(expiryTimer), 600000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setOtpError(isArabic ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    setEmailSent(false);
    setShowOtpInput(false);
    setShowPasswordForm(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setPasswordError(null);
    setRetryCount(0);
    setCountdown(0);
    setOtpExpiryCountdown(600);
    onSwitchToLogin();
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    setEmailSent(false);
    setShowOtpInput(false);
    setShowPasswordForm(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setPasswordError(null);
    setRetryCount(0);
    setCountdown(0);
    setOtpExpiryCountdown(600);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-jet-800 p-8 text-left align-middle shadow-xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-caribbean-100 dark:bg-caribbean-900/20">
                  <Mail className="h-6 w-6 text-caribbean-600 dark:text-caribbean-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-jet-900 dark:text-white">
                  {isArabic ? 'استعادة كلمة المرور' : 'Reset Password'}
                </h3>
                <p className="text-sm text-jet-600 dark:text-jet-400 mt-1">
                  {isArabic ? 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور' : 'Enter your email to reset your password'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!success && !showOtpInput && !showPasswordForm ? (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                    {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-jet-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white placeholder-jet-400 dark:placeholder-jet-500"
                      placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                         <div className="mt-2 flex gap-2">
                           <button
                             onClick={() => {
                               setError(null);
                               setLoading(true);
                               handleSubmit(new Event('submit') as any);
                             }}
                             disabled={loading}
                             className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline disabled:opacity-50"
                           >
                             {isArabic ? 'إعادة المحاولة' : 'Retry'}
                           </button>
                           <span className="text-xs text-red-500">|</span>
                           <button
                             onClick={() => {
                               window.open('https://wa.me/905551234567', '_blank');
                             }}
                             className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                           >
                             {isArabic ? 'تواصل مع الدعم' : 'Contact Support'}
                           </button>
                         </div>
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
                      {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    isArabic ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'
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
            </>
          ) : showOtpInput && !showPasswordForm ? (
            <>
              {/* OTP Input Form */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-jet-900 dark:text-white mb-2">
                    {isArabic ? 'أدخل رمز التحقق' : 'Enter Verification Code'}
                  </h3>
                  <p className="text-sm text-jet-600 dark:text-jet-400 mb-2">
                    {isArabic 
                      ? `تم إرسال رمز التحقق إلى ${email}`
                      : `Verification code sent to ${email}`
                    }
                  </p>
                  {otpExpiryCountdown > 0 && (
                    <div className="text-xs text-jet-500 dark:text-jet-400 bg-jet-50 dark:bg-jet-700 rounded-lg p-2 inline-block">
                      {isArabic 
                        ? `الرمز صالح لمدة ${Math.floor(otpExpiryCountdown / 60)}:${(otpExpiryCountdown % 60).toString().padStart(2, '0')}`
                        : `Code expires in ${Math.floor(otpExpiryCountdown / 60)}:${(otpExpiryCountdown % 60).toString().padStart(2, '0')}`
                      }
                    </div>
                  )}
                  {otpExpiryCountdown === 0 && (
                    <div className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 inline-block">
                      {isArabic 
                        ? 'الرمز منتهي الصلاحية - يرجى طلب رمز جديد'
                        : 'Code expired - please request a new code'
                      }
                    </div>
                  )}
                  
                  {/* Server Issue Notice */}
                  <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 mt-2">
                    {isArabic 
                      ? 'تحذير: إذا انتهت صلاحية الرمز خلال ثوانٍ قليلة، فهذه مشكلة في إعدادات الخادم وتتطلب إصلاحاً فورياً'
                      : 'Warning: If the code expires within seconds, this is a server configuration issue requiring immediate fix'
                    }
                  </div>
                  
                  {/* Quick Fix Notice */}
                  <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mt-2">
                    {isArabic 
                      ? 'نصيحة: إذا كان الرمز منتهي الصلاحية فوراً، جرب إعادة إرسال الرمز ثم أدخله بسرعة'
                      : 'Tip: If the code expires immediately, try resending the code and enter it quickly'
                    }
                  </div>
                  
                  {/* Debug Info */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mt-2">
                    {isArabic 
                      ? `معلومات التشخيص: الوقت منذ الإرسال: ${Math.round((Date.now() - ((window as any).otpSendTime || 0)) / 1000)} ثانية`
                      : `Debug Info: Time since send: ${Math.round((Date.now() - ((window as any).otpSendTime || 0)) / 1000)} seconds`
                    }
                  </div>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center space-x-2 space-x-reverse">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-platinum-300 dark:border-jet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent bg-white dark:bg-jet-700 text-jet-900 dark:text-white"
                      disabled={otpLoading || retryCount >= maxRetries}
                    />
                  ))}
                </div>

                {/* OTP Error Message */}
                {otpError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 dark:text-red-300">{otpError}</p>
                        {retryCount > 0 && retryCount < maxRetries && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {isArabic 
                              ? `محاولة ${retryCount} من ${maxRetries} - يمكنك المحاولة مرة أخرى`
                              : `Attempt ${retryCount} of ${maxRetries} - you can try again`
                            }
                          </p>
                        )}
                        {retryCount >= maxRetries && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {isArabic 
                              ? 'تم الوصول للحد الأقصى من المحاولات. يرجى طلب رمز جديد.'
                              : 'Maximum attempts reached. Please request a new code.'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Resend Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resendLoading || retryCount >= maxRetries}
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


                {/* Support Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => window.open('https://wa.me/905551234567?text=مشكلة في استعادة كلمة المرور - OTP منتهي الصلاحية', '_blank')}
                    className="text-xs text-jet-500 dark:text-jet-400 hover:text-jet-600 dark:hover:text-jet-300 underline"
                  >
                    {isArabic ? 'تواصل مع الدعم الفني' : 'Contact Technical Support'}
                  </button>
                  <p className="text-xs text-jet-400 dark:text-jet-500 mt-1">
                    {isArabic 
                      ? 'الدعم الفني سيساعدك في إعادة تعيين كلمة المرور بأمان'
                      : 'Technical support will help you reset your password securely'
                    }
                  </p>
                </div>

                {/* Back Button */}
                <div className="text-center">
                  <button
                    onClick={handleBackToLogin}
                    className="inline-flex items-center text-sm text-jet-600 dark:text-jet-400 hover:text-jet-700 dark:hover:text-jet-300 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 ml-1" />
                    {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                  </button>
                </div>
              </div>
            </>
          ) : showPasswordForm ? (
            <>
              {/* Password Reset Form */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-jet-900 dark:text-white mb-2">
                    {isArabic ? 'إدخال كلمة المرور الجديدة' : 'Enter New Password'}
                  </h3>
                  <p className="text-sm text-jet-600 dark:text-jet-400">
                    {isArabic 
                      ? 'تم التحقق من الرمز بنجاح. يرجى إدخال كلمة المرور الجديدة.'
                      : 'Code verified successfully. Please enter your new password.'
                    }
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                      disabled={otpLoading}
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
                      disabled={otpLoading}
                      required
                    />
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
                    disabled={otpLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-caribbean-600 to-indigo-700 hover:from-caribbean-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-caribbean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        {isArabic ? 'جاري التحديث...' : 'Updating...'}
                      </>
                    ) : (
                      isArabic ? 'تحديث كلمة المرور' : 'Update Password'
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-jet-900 dark:text-white mb-2">
                    {isArabic ? 'تم إرسال الرمز بنجاح!' : 'Code Sent Successfully!'}
                  </h3>
                  <p className="text-sm text-jet-600 dark:text-jet-400">
                    {isArabic 
                      ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك وإدخال الرمز المكون من 6 أرقام.'
                      : 'A verification code has been sent to your email. Please check your inbox and enter the 6-digit code.'
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4">
                  <button
                    onClick={handleBackToLogin}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-caribbean-600 to-indigo-700 hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-200 shadow-sm"
                  >
                    {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                  </button>
                  
                  <button
                    onClick={handleClose}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-platinum-300 dark:border-jet-600 text-sm font-medium rounded-lg text-jet-700 dark:text-jet-300 bg-white dark:bg-jet-700 hover:bg-platinum-50 dark:hover:bg-jet-600 transition-all duration-200"
                  >
                    {isArabic ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
