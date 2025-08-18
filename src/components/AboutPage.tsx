import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  Award, 
  Target, 
  Heart, 
  Shield, 
  Globe, 
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  UserCheck,
  FileText,
  Zap
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import CustomCursor from './CustomCursor';
import LoadingSpinner from './LoadingSpinner';

interface AboutPageProps {
  isDarkMode: boolean;
}

const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(false);

  const isArabic = language === 'ar';

  const handleNavigateToServices = () => {
    navigate('/services');
  };

  const handleNavigateToContact = () => {
    navigate('/contact');
  };

  const stats = [
    { icon: Users, number: '10,000+', label: isArabic ? 'عميل راضي' : 'Happy Clients' },
    { icon: Award, number: '10+', label: isArabic ? 'سنوات خبرة' : 'Years Experience' },
    { icon: Target, number: '99%', label: isArabic ? 'معدل نجاح' : 'Success Rate' },
    { icon: Heart, number: '24/7', label: isArabic ? 'دعم متواصل' : 'Support Available' }
  ];

  const values = [
    {
      icon: Shield,
      title: isArabic ? 'الموثوقية' : 'Reliability',
      description: isArabic 
        ? 'نحن نلتزم بتقديم خدمات موثوقة وآمنة لجميع عملائنا'
        : 'We are committed to providing reliable and secure services to all our clients'
    },
    {
      icon: Heart,
      title: isArabic ? 'الاهتمام بالعميل' : 'Customer Care',
      description: isArabic 
        ? 'نضع احتياجات عملائنا في المقام الأول ونقدم لهم أفضل تجربة ممكنة'
        : 'We put our customers\' needs first and provide them with the best possible experience'
    },
    {
      icon: Target,
      title: isArabic ? 'التميز' : 'Excellence',
      description: isArabic 
        ? 'نسعى للتميز في كل ما نقدمه من خدمات وحلول'
        : 'We strive for excellence in everything we offer'
    },
    {
      icon: Globe,
      title: isArabic ? 'الابتكار' : 'Innovation',
      description: isArabic 
        ? 'نواكب أحدث التقنيات والابتكارات لتقديم حلول متطورة'
        : 'We keep up with the latest technologies and innovations to provide advanced solutions'
    }
  ];

  const team = [
    {
      name: isArabic ? 'أحمد محمد' : 'Ahmed Mohamed',
      position: isArabic ? 'المدير التنفيذي' : 'CEO & Founder',
      description: isArabic 
        ? 'خبرة 15+ سنة في مجال الخدمات القانونية والتأمين'
        : '15+ years experience in legal services and insurance'
    },
    {
      name: isArabic ? 'فاطمة علي' : 'Fatima Ali',
      position: isArabic ? 'مديرة العمليات' : 'Operations Manager',
      description: isArabic 
        ? 'متخصصة في إدارة العمليات وتحسين الخدمات'
        : 'Specialized in operations management and service improvement'
    },
    {
      name: isArabic ? 'محمد حسن' : 'Mohammed Hassan',
      position: isArabic ? 'مدير الخدمات القانونية' : 'Legal Services Director',
      description: isArabic 
        ? 'محامي معتمد مع خبرة واسعة في القانون التركي'
        : 'Certified lawyer with extensive experience in Turkish law'
    }
  ];

  const achievements = [
    {
      year: '2015',
      title: isArabic ? 'تأسيس الشركة' : 'Company Founded',
      description: isArabic 
        ? 'بداية رحلة مجموعة تواصل في تركيا'
        : 'Beginning of Tevasul Group journey in Turkey'
    },
    {
      year: '2018',
      title: isArabic ? 'توسع الخدمات' : 'Service Expansion',
      description: isArabic 
        ? 'إطلاق خدمات التأمين الصحي والترجمة المحلفة'
        : 'Launch of health insurance and certified translation services'
    },
    {
      year: '2020',
      title: isArabic ? 'التحول الرقمي' : 'Digital Transformation',
      description: isArabic 
        ? 'إطلاق المنصة الرقمية والخدمات الإلكترونية'
        : 'Launch of digital platform and e-services'
    },
    {
      year: '2023',
      title: isArabic ? 'الريادة في السوق' : 'Market Leadership',
      description: isArabic 
        ? 'تصبح الشركة الرائدة في خدمات الأجانب في تركيا'
        : 'Become the leading company in foreigner services in Turkey'
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
                {isArabic ? 'من نحن' : 'About Us'}
              </h1>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-3xl mx-auto leading-relaxed">
                {isArabic 
                  ? 'مجموعة تواصل هي شركة رائدة في تقديم الخدمات المتكاملة للأجانب في تركيا. نحن نؤمن بأن كل شخص يستحق الحصول على أفضل الخدمات والدعم في رحلته في تركيا.'
                  : 'Tevasul Group is a leading company in providing integrated services for foreigners in Turkey. We believe that everyone deserves to receive the best services and support in their journey in Turkey.'
                }
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-6 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-caribbean-100 dark:bg-caribbean-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-caribbean-600 dark:text-caribbean-400" />
                  </div>
                  <div className="text-2xl font-bold text-jet-800 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-jet-600 dark:text-platinum-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 bg-white/50 dark:bg-jet-800/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="text-center md:text-right">
                <div className="w-16 h-16 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-jet-800 dark:text-white mb-4">
                  {isArabic ? 'مهمتنا' : 'Our Mission'}
                </h2>
                <p className="text-lg text-jet-600 dark:text-platinum-400 leading-relaxed">
                  {isArabic 
                    ? 'تقديم خدمات متكاملة وعالية الجودة للأجانب في تركيا، ومساعدتهم على تحقيق أحلامهم وأهدافهم في هذا البلد الجميل.'
                    : 'To provide integrated and high-quality services for foreigners in Turkey, helping them achieve their dreams and goals in this beautiful country.'
                  }
                </p>
              </div>

              {/* Vision */}
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-jet-800 dark:text-white mb-4">
                  {isArabic ? 'رؤيتنا' : 'Our Vision'}
                </h2>
                <p className="text-lg text-jet-600 dark:text-platinum-400 leading-relaxed">
                  {isArabic 
                    ? 'أن نكون الشركة الأولى والأكثر ثقة في تقديم الخدمات للأجانب في تركيا، وأن نكون شريكهم الموثوق في رحلتهم.'
                    : 'To be the first and most trusted company in providing services for foreigners in Turkey, and to be their reliable partner in their journey.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-jet-800 dark:text-white mb-4">
                {isArabic ? 'قيمنا' : 'Our Values'}
              </h2>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-2xl mx-auto">
                {isArabic 
                  ? 'القيم التي تقودنا في كل ما نقوم به'
                  : 'The values that guide us in everything we do'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-8 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-jet-800 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-jet-600 dark:text-platinum-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 px-4 bg-white/50 dark:bg-jet-800/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-jet-800 dark:text-white mb-4">
                {isArabic ? 'فريقنا' : 'Our Team'}
              </h2>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-2xl mx-auto">
                {isArabic 
                  ? 'فريق من المحترفين المتميزين الذين يكرسون أنفسهم لخدمتكم'
                  : 'A team of distinguished professionals who dedicate themselves to serving you'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-8 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-jet-800 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-caribbean-600 dark:text-caribbean-400 font-semibold mb-4">
                    {member.position}
                  </p>
                  <p className="text-jet-600 dark:text-platinum-400">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-jet-800 dark:text-white mb-4">
                {isArabic ? 'رحلتنا' : 'Our Journey'}
              </h2>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-2xl mx-auto">
                {isArabic 
                  ? 'مراحل تطورنا عبر السنوات'
                  : 'Our development stages over the years'
                }
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-caribbean-500 to-indigo-600"></div>
              
              <div className="space-y-12">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-1/2 px-8">
                      <div className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-xl p-6 border border-caribbean-100 dark:border-jet-700 hover:shadow-lg transition-all duration-300">
                        <div className="text-2xl font-bold text-caribbean-600 dark:text-caribbean-400 mb-2">
                          {achievement.year}
                        </div>
                        <h3 className="text-xl font-bold text-jet-800 dark:text-white mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-jet-600 dark:text-platinum-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Timeline Dot */}
                    <div className="w-4 h-4 bg-caribbean-500 rounded-full border-4 border-white dark:border-jet-800 shadow-lg"></div>
                    
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-caribbean-600 to-indigo-700 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {isArabic ? 'ابدأ رحلتك معنا اليوم' : 'Start Your Journey With Us Today'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {isArabic 
                  ? 'انضم إلى آلاف العملاء الراضين واحصل على أفضل الخدمات في تركيا'
                  : 'Join thousands of satisfied customers and get the best services in Turkey'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleNavigateToServices}
                  className="group flex items-center justify-center gap-3 bg-white text-caribbean-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  {isArabic ? 'استكشف خدماتنا' : 'Explore Our Services'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleNavigateToContact}
                  className="group flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-caribbean-600 transition-all duration-300 transform hover:scale-105"
                >
                  {isArabic ? 'تواصل معنا' : 'Contact Us'}
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

