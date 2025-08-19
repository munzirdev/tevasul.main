import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle, Mail } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';


interface NotFoundPageProps {
  isDarkMode: boolean;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const isArabic = language === 'ar';

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  const handleHelpCenter = () => {
    navigate('/help');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-platinum-50 via-caribbean-50/30 to-indigo-50/30 dark:from-jet-900 dark:via-caribbean-900/20 dark:to-indigo-900/20 relative overflow-hidden">
      
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-caribbean-200/20 dark:bg-caribbean-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 dark:bg-teal-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-caribbean-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-jet-800 dark:text-white mb-4">
              {isArabic ? 'عذراً، الصفحة غير موجودة' : 'Oops! Page Not Found'}
            </h2>
            <p className="text-lg text-jet-600 dark:text-platinum-400 max-w-2xl mx-auto leading-relaxed">
              {isArabic 
                ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك العودة للصفحة الرئيسية أو استخدام الروابط أدناه للتنقل.'
                : 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. You can return to the homepage or use the links below to navigate.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGoHome}
              className="group flex items-center gap-3 bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 group-hover:animate-bounce" />
              {isArabic ? 'العودة للرئيسية' : 'Go Home'}
            </button>

            <button
              onClick={handleGoBack}
              className="group flex items-center gap-3 bg-white dark:bg-jet-800 text-jet-800 dark:text-white border-2 border-caribbean-200 dark:border-jet-700 px-8 py-4 rounded-xl font-semibold hover:bg-caribbean-50 dark:hover:bg-jet-700 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
              {isArabic ? 'العودة للخلف' : 'Go Back'}
            </button>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="group bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-6 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={handleContactSupport}>
              <div className="w-12 h-12 bg-caribbean-100 dark:bg-caribbean-900/50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-caribbean-200 dark:group-hover:bg-caribbean-800 transition-colors">
                <Mail className="w-6 h-6 text-caribbean-600 dark:text-caribbean-400" />
              </div>
              <h3 className="font-semibold text-jet-800 dark:text-white mb-2">
                {isArabic ? 'تواصل معنا' : 'Contact Support'}
              </h3>
              <p className="text-sm text-jet-600 dark:text-platinum-400">
                {isArabic ? 'احصل على مساعدة فورية' : 'Get immediate assistance'}
              </p>
            </div>

            <div className="group bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-6 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={handleHelpCenter}>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-jet-800 dark:text-white mb-2">
                {isArabic ? 'مركز المساعدة' : 'Help Center'}
              </h3>
              <p className="text-sm text-jet-600 dark:text-platinum-400">
                {isArabic ? 'ابحث عن إجابات' : 'Find answers'}
              </p>
            </div>

            <div className="group bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-6 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/services')}>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors">
                <Search className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold text-jet-800 dark:text-white mb-2">
                {isArabic ? 'استكشف الخدمات' : 'Explore Services'}
              </h3>
              <p className="text-sm text-jet-600 dark:text-platinum-400">
                {isArabic ? 'اكتشف ما نقدمه' : 'Discover what we offer'}
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-16 flex justify-center space-x-4">
            <div className="w-3 h-3 bg-caribbean-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

