import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Globe, 
  Star, 
  FileText, 
  Heart,
  ArrowRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Phone,
  Mail
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { servicesData } from '../data/services';
import CustomCursor from './CustomCursor';
import LoadingSpinner from './LoadingSpinner';

interface ServicesPageProps {
  isDarkMode: boolean;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = React.useState(false);

  const isArabic = language === 'ar';

  const categories = [
    { id: 'all', name: isArabic ? 'جميع الخدمات' : 'All Services' },
    { id: 'health-insurance', name: isArabic ? 'التأمين الصحي' : 'Health Insurance' },
    { id: 'translation', name: isArabic ? 'الترجمة' : 'Translation' },
    { id: 'travel', name: isArabic ? 'السفر' : 'Travel' },
    { id: 'legal', name: isArabic ? 'القانونية' : 'Legal' },
    { id: 'government', name: isArabic ? 'الحكومية' : 'Government' },
    { id: 'insurance', name: isArabic ? 'التأمين' : 'Insurance' }
  ];

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const handleContactUs = () => {
    navigate('/contact');
  };

  const filteredServices = servicesData.filter(service => {
    const matchesSearch = 
      t(service.titleKey).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(service.descriptionKey).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const serviceFeatures = [
    {
      icon: CheckCircle,
      title: isArabic ? 'خدمة مضمونة' : 'Guaranteed Service',
      description: isArabic 
        ? 'نضمن لك الحصول على أفضل النتائج'
        : 'We guarantee you the best results'
    },
    {
      icon: Clock,
      title: isArabic ? 'سرعة في التنفيذ' : 'Fast Execution',
      description: isArabic 
        ? 'ننهي طلباتك في أسرع وقت ممكن'
        : 'We complete your requests as quickly as possible'
    },
    {
      icon: Award,
      title: isArabic ? 'جودة عالية' : 'High Quality',
      description: isArabic 
        ? 'نقدم خدمات بأعلى معايير الجودة'
        : 'We provide services with the highest quality standards'
    },
    {
      icon: Zap,
      title: isArabic ? 'سهولة الاستخدام' : 'Easy to Use',
      description: isArabic 
        ? 'عملية بسيطة وسهلة للجميع'
        : 'Simple and easy process for everyone'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-platinum-50 via-caribbean-50/30 to-indigo-50/30 dark:from-jet-900 dark:via-caribbean-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text={isArabic ? "جاري التحميل..." : "Loading..."}
          variant="gradient"
        />
      </div>
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
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-jet-800 dark:text-white mb-6">
                {isArabic ? 'خدماتنا' : 'Our Services'}
              </h1>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-3xl mx-auto leading-relaxed">
                {isArabic 
                  ? 'اكتشف مجموعة شاملة من الخدمات المصممة خصيصاً لتلبية احتياجاتك في تركيا'
                  : 'Discover a comprehensive range of services designed specifically to meet your needs in Turkey'
                }
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-2xl p-6 border border-caribbean-100 dark:border-jet-700 shadow-lg">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jet-400" />
                  <input
                    type="text"
                    placeholder={isArabic ? "ابحث في الخدمات..." : "Search services..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white shadow-lg'
                          : 'bg-white dark:bg-jet-700 text-jet-800 dark:text-white border border-caribbean-200 dark:border-jet-600 hover:bg-caribbean-50 dark:hover:bg-jet-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {filteredServices.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-caribbean-100 dark:bg-caribbean-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-caribbean-600 dark:text-caribbean-400" />
                </div>
                <h3 className="text-2xl font-bold text-jet-800 dark:text-white mb-4">
                  {isArabic ? 'لا توجد نتائج' : 'No Results Found'}
                </h3>
                <p className="text-jet-600 dark:text-platinum-400 mb-8">
                  {isArabic 
                    ? 'جرب البحث بكلمات مختلفة أو اختر فئة أخرى'
                    : 'Try searching with different words or select another category'
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300"
                >
                  {isArabic ? 'إعادة تعيين البحث' : 'Reset Search'}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service.id)}
                    className="group bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-2xl p-8 border border-caribbean-100 dark:border-jet-700 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    {/* Service Icon */}
                    <div className="w-16 h-16 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Service Title */}
                    <h3 className="text-2xl font-bold text-jet-800 dark:text-white mb-4 group-hover:text-caribbean-600 dark:group-hover:text-caribbean-400 transition-colors">
                      {t(service.titleKey)}
                    </h3>

                    {/* Service Description */}
                    <p className="text-jet-600 dark:text-platinum-400 mb-6 leading-relaxed">
                      {t(service.descriptionKey)}
                    </p>

                    {/* Service Features */}
                    <div className="space-y-3 mb-6">
                      {t(service.featuresKey).slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-caribbean-500 flex-shrink-0" />
                          <span className="text-sm text-jet-600 dark:text-platinum-400">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between">
                      <button className="group/btn flex items-center gap-2 text-caribbean-600 dark:text-caribbean-400 font-semibold hover:text-caribbean-700 dark:hover:text-caribbean-300 transition-colors">
                        {isArabic ? 'تعرف على المزيد' : 'Learn More'}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white/50 dark:bg-jet-800/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-jet-800 dark:text-white mb-4">
                {isArabic ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
              </h2>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-2xl mx-auto">
                {isArabic 
                  ? 'نتميز بالعديد من المزايا التي تجعلنا الخيار الأفضل لك'
                  : 'We stand out with many advantages that make us the best choice for you'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {serviceFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-jet-800 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-jet-600 dark:text-platinum-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-caribbean-600 to-indigo-700 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {isArabic ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {isArabic 
                  ? 'فريقنا متاح على مدار الساعة لمساعدتك في اختيار الخدمة المناسبة'
                  : 'Our team is available 24/7 to help you choose the right service'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleContactUs}
                  className="group flex items-center justify-center gap-3 bg-white text-caribbean-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  {isArabic ? 'تواصل معنا' : 'Contact Us'}
                </button>
                <button
                  onClick={() => navigate('/help')}
                  className="group flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-caribbean-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-5 h-5" />
                  {isArabic ? 'مركز المساعدة' : 'Help Center'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;

