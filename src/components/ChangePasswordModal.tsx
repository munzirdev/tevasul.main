import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Mail,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isDarkMode
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Password validation
  const passwordValidation = {
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasMinLength: newPassword.length >= 6,
    matches: newPassword === confirmPassword && confirmPassword.length > 0
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    if (!isPasswordValid) {
      setError(isArabic ? 'كلمة المرور الجديدة لا تستوفي المتطلبات' : 'New password does not meet requirements');
      return;
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      setError(isArabic ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية' : 'New password must be different from current password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current user email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.email) {
        setError(isArabic ? 'لم يتم العثور على معلومات المستخدم' : 'User information not found');
        return;
      }

      // First, verify current password by attempting to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });

      if (signInError) {
        setError(isArabic ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        setError(
          isArabic 
            ? 'حدث خطأ في تحديث كلمة المرور. يرجى المحاولة مرة أخرى.'
            : 'An error occurred while updating the password. Please try again.'
        );
      } else {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Hide success message and close modal after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          onClose();
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      setError(isArabic ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }

    if (!forgotEmail.includes('@')) {
      setError(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }

    setForgotLoading(true);
    setError(null);

    try {
      console.log('Sending password reset email to:', forgotEmail);
      console.log('Redirect URL:', `${window.location.origin}/reset-password`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Error sending reset email:', error);
        setError(
          isArabic 
            ? 'حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'
            : 'An error occurred while sending the password reset link. Please try again.'
        );
      } else {
        setForgotSuccess(true);
        setForgotEmail('');
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setForgotSuccess(false);
          setShowForgotPassword(false);
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
      setForgotLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-jet-800 rounded-3xl shadow-2xl border border-white/20 dark:border-jet-700/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-caribbean-600/80 via-indigo-700/80 to-caribbean-700/80 p-6 text-white relative overflow-hidden">
          {/* Glass Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">
                {showForgotPassword 
                  ? (isArabic ? 'نسيت كلمة المرور' : 'Forgot Password')
                  : (isArabic ? 'تغيير كلمة المرور' : 'Change Password')
                }
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showForgotPassword ? (
            // Change Password Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                  {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jet-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-jet-700 border border-jet-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                    placeholder={isArabic ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                  {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jet-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-jet-700 border border-jet-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                    placeholder={isArabic ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                  {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jet-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-jet-700 border border-jet-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                    placeholder={isArabic ? "أعد إدخال كلمة المرور الجديدة" : "Re-enter new password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-platinum-50 dark:bg-jet-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                  {isArabic ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
                </h4>
                <div className="space-y-2">
                  <div className={`flex items-center text-xs ${passwordValidation.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-jet-600 dark:text-jet-400'}`}>
                    <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-jet-400 dark:text-jet-500'}`} />
                    {isArabic ? '6 أحرف على الأقل' : 'At least 6 characters'}
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-jet-600 dark:text-jet-400'}`}>
                    <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-jet-400 dark:text-jet-500'}`} />
                    {isArabic ? 'حرف كبير واحد على الأقل' : 'At least one uppercase letter'}
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-jet-600 dark:text-jet-400'}`}>
                    <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-jet-400 dark:text-jet-500'}`} />
                    {isArabic ? 'حرف صغير واحد على الأقل' : 'At least one lowercase letter'}
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-jet-600 dark:text-jet-400'}`}>
                    <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-jet-400 dark:text-jet-500'}`} />
                    {isArabic ? 'رقم واحد على الأقل' : 'At least one number'}
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.matches ? 'text-green-600 dark:text-green-400' : 'text-jet-600 dark:text-jet-400'}`}>
                    <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.matches ? 'text-green-600 dark:text-green-400' : 'text-jet-400 dark:text-jet-500'}`} />
                    {isArabic ? 'تطابق كلمات المرور' : 'Passwords match'}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {isArabic ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!'}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full bg-gradient-to-r from-caribbean-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-caribbean-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isArabic ? 'جاري التحديث...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                  </>
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError(null);
                    setSuccess(false);
                  }}
                  className="text-sm text-caribbean-600 dark:text-caribbean-400 hover:text-caribbean-700 dark:hover:text-caribbean-300 transition-colors duration-200"
                >
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}
                </button>
              </div>
            </form>
          ) : (
            // Forgot Password Form
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center">
                <Mail className="w-12 h-12 text-caribbean-600 dark:text-caribbean-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-jet-800 dark:text-white mb-2">
                  {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                </h3>
                <p className="text-sm text-jet-600 dark:text-jet-400">
                  {isArabic 
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور'
                    : 'Enter your email and we\'ll send you a link to reset your password'
                  }
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-jet-300 mb-2">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jet-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-12 py-3 bg-white dark:bg-jet-700 border border-jet-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                    placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {forgotSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {isArabic 
                        ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
                        : 'Password reset link has been sent to your email'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-caribbean-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-caribbean-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {isArabic ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
                  </>
                )}
              </button>

              {/* Back to Change Password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError(null);
                    setForgotSuccess(false);
                  }}
                  className="text-sm text-jet-600 dark:text-jet-400 hover:text-jet-800 dark:hover:text-jet-200 transition-colors duration-200"
                >
                  {isArabic ? 'العودة إلى تغيير كلمة المرور' : 'Back to Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
