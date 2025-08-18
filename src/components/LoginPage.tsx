import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Users,
  Star
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuthContext } from './AuthProvider';
import CustomCursor from './CustomCursor';
import LoadingSpinner from './LoadingSpinner';
import GlassLoadingScreen from './GlassLoadingScreen';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { signIn } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isArabic = language === 'ar';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      }

      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error(isArabic ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
        } else if (signInError.message.includes('Email not confirmed')) {
          throw new Error(isArabic ? 'يرجى تأكيد بريدك الإلكتروني أولاً' : 'Please confirm your email first');
        } else {
          throw new Error(signInError.message);
        }
      }

      if (data.user) {
        setSuccess(isArabic ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(isArabic ? 'حدث خطأ أثناء تسجيل الدخول بـ Google' : 'An error occurred during Google sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  const features = [
    {
      icon: Shield,
      title: isArabic ? 'حماية متقدمة' : 'Advanced Security',
      description: isArabic ? 'حماية قوية لحسابك وبياناتك' : 'Strong protection for your account and data'
    },
    {
      icon: Users,
      title: isArabic ? 'دعم العملاء' : 'Customer Support',
      description: isArabic ? 'فريق دعم متاح على مدار الساعة' : '24/7 customer support team'
    },
    {
      icon: Star,
      title: isArabic ? 'خدمة متميزة' : 'Premium Service',
      description: isArabic ? 'خدمات عالية الجودة لجميع العملاء' : 'High-quality services for all customers'
    }
  ];

  if (isLoading) {
    return (
      <GlassLoadingScreen
        text={isArabic ? "جاري التحميل..." : "Loading..."}
        subText={isArabic ? "يرجى الانتظار" : "Please wait"}
        variant="gradient"
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-platinum-50 via-caribbean-50/30 to-indigo-50/30 dark:from-jet-900 dark:via-caribbean-900/20 dark:to-indigo-900/20 relative overflow-hidden">
      <CustomCursor isDarkMode={isDarkMode} />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-caribbean-200/20 dark:bg-caribbean-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 dark:bg-teal-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 text-jet-600 dark:text-platinum-400 hover:text-caribbean-600 dark:hover:text-caribbean-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {isArabic ? 'العودة' : 'Back'}
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Login Form */}
            <div className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-2xl p-8 border border-caribbean-100 dark:border-jet-700 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-jet-800 dark:text-white mb-2">
                  {isArabic ? 'تسجيل الدخول' : 'Login'}
                </h1>
                <p className="text-jet-600 dark:text-platinum-400">
                  {isArabic 
                    ? 'مرحباً بك مرة أخرى! سجل دخولك للوصول إلى حسابك'
                    : 'Welcome back! Sign in to access your account'
                  }
                </p>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                    {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jet-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                      placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jet-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                      placeholder={isArabic ? "أدخل كلمة المرور" : "Enter your password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-jet-400 hover:text-jet-600 dark:hover:text-jet-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-caribbean-600 border-caribbean-300 rounded focus:ring-caribbean-500"
                    />
                    <span className="text-sm text-jet-600 dark:text-platinum-400">
                      {isArabic ? 'تذكرني' : 'Remember me'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-caribbean-600 dark:text-caribbean-400 hover:text-caribbean-700 dark:hover:text-caribbean-300 font-medium"
                  >
                    {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                  {isSubmitting 
                    ? (isArabic ? 'جاري تسجيل الدخول...' : 'Signing in...')
                    : (isArabic ? 'تسجيل الدخول' : 'Sign In')
                  }
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-caribbean-200 dark:border-jet-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-jet-800 text-jet-500 dark:text-jet-400">
                      {isArabic ? 'أو' : 'Or'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-jet-700 text-jet-800 dark:text-white border border-caribbean-200 dark:border-jet-600 px-8 py-4 rounded-xl font-semibold hover:bg-caribbean-50 dark:hover:bg-jet-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isArabic ? 'تسجيل الدخول بـ Google' : 'Sign in with Google'}
                </button>

                <div className="text-center">
                  <p className="text-jet-600 dark:text-platinum-400">
                    {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}
                    <button
                      type="button"
                      onClick={handleSignUp}
                      className="text-caribbean-600 dark:text-caribbean-400 hover:text-caribbean-700 dark:hover:text-caribbean-300 font-semibold mr-1"
                    >
                      {isArabic ? 'إنشاء حساب' : 'Sign up'}
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Features Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-jet-800 dark:text-white mb-4">
                  {isArabic ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
                </h2>
                <p className="text-lg text-jet-600 dark:text-platinum-400 mb-8">
                  {isArabic 
                    ? 'انضم إلى آلاف العملاء الراضين واحصل على أفضل الخدمات في تركيا'
                    : 'Join thousands of satisfied customers and get the best services in Turkey'
                  }
                </p>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 bg-white/60 dark:bg-jet-700/60 backdrop-blur-sm rounded-xl border border-caribbean-100 dark:border-jet-600 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-jet-800 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-jet-600 dark:text-platinum-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-caribbean-600 to-indigo-700 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">
                  {isArabic ? 'إحصائيات سريعة' : 'Quick Stats'}
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">10K+</div>
                    <div className="text-sm opacity-90">
                      {isArabic ? 'عميل راضي' : 'Happy Clients'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">99%</div>
                    <div className="text-sm opacity-90">
                      {isArabic ? 'معدل نجاح' : 'Success Rate'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-sm opacity-90">
                      {isArabic ? 'دعم متواصل' : 'Support'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

