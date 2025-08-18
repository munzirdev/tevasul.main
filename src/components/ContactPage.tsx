import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Building,
  Users,
  Globe,
  Star
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuthContext } from './AuthProvider';
import CustomCursor from './CustomCursor';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../lib/supabase';

interface ContactPageProps {
  isDarkMode: boolean;
}

const ContactPage: React.FC<ContactPageProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, profile } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isArabic = language === 'ar';

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    serviceType: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      }

      // Submit to database
      const { error } = await supabase
        .from('support_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            service_type: formData.serviceType || null,
            message: formData.message,
            user_id: user?.id || null,
            is_guest: !user?.id
          }
        ]);

      if (error) {
        console.error('Error submitting form:', error);
        throw new Error(isArabic ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'An error occurred while sending the message. Please try again.');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: isArabic ? 'الهاتف' : 'Phone',
      value: '+90 212 XXX XX XX',
      description: isArabic ? 'متاح على مدار الساعة' : 'Available 24/7'
    },
    {
      icon: Mail,
      title: isArabic ? 'البريد الإلكتروني' : 'Email',
      value: 'info@tevasul.group',
      description: isArabic ? 'رد سريع خلال 24 ساعة' : 'Quick response within 24 hours'
    },
    {
      icon: MapPin,
      title: isArabic ? 'العنوان' : 'Address',
      value: isArabic ? 'إسطنبول، تركيا' : 'Istanbul, Turkey',
      description: isArabic ? 'المقر الرئيسي' : 'Headquarters'
    },
    {
      icon: Clock,
      title: isArabic ? 'ساعات العمل' : 'Working Hours',
      value: isArabic ? 'الأحد - الجمعة' : 'Sunday - Friday',
      description: isArabic ? '9:00 ص - 6:00 م' : '9:00 AM - 6:00 PM'
    }
  ];

  const serviceTypes = [
    { value: '', label: isArabic ? 'اختر نوع الخدمة' : 'Select Service Type' },
    { value: 'health-insurance', label: isArabic ? 'التأمين الصحي' : 'Health Insurance' },
    { value: 'translation', label: isArabic ? 'الترجمة المحلفة' : 'Certified Translation' },
    { value: 'travel', label: isArabic ? 'خدمات السفر' : 'Travel Services' },
    { value: 'legal', label: isArabic ? 'الخدمات القانونية' : 'Legal Services' },
    { value: 'government', label: isArabic ? 'الخدمات الحكومية' : 'Government Services' },
    { value: 'insurance', label: isArabic ? 'التأمين العام' : 'General Insurance' },
    { value: 'other', label: isArabic ? 'خدمات أخرى' : 'Other Services' }
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
        {/* Header */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-2 text-jet-600 dark:text-platinum-400 hover:text-caribbean-600 dark:hover:text-caribbean-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                {isArabic ? 'العودة' : 'Back'}
              </button>
            </div>

            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-jet-800 dark:text-white mb-6">
                {isArabic ? 'تواصل معنا' : 'Contact Us'}
              </h1>
              <p className="text-xl text-jet-600 dark:text-platinum-400 max-w-3xl mx-auto leading-relaxed">
                {isArabic 
                  ? 'نحن هنا لمساعدتك! تواصل معنا للحصول على الدعم والاستشارة المجانية'
                  : 'We are here to help you! Contact us for free support and consultation'
                }
              </p>
            </div>

            {/* Success/Error Messages */}
            {submitSuccess && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        {isArabic ? 'تم الإرسال بنجاح!' : 'Message Sent Successfully!'}
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        {isArabic 
                          ? 'شكراً لك! سنتواصل معك في أقرب وقت ممكن.'
                          : 'Thank you! We will get back to you as soon as possible.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        {isArabic ? 'خطأ في الإرسال' : 'Submission Error'}
                      </h3>
                      <p className="text-red-700 dark:text-red-300">
                        {submitError}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white/80 dark:bg-jet-800/80 backdrop-blur-sm rounded-2xl p-8 border border-caribbean-100 dark:border-jet-700 shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-jet-800 dark:text-white">
                      {isArabic ? 'أرسل رسالة' : 'Send Message'}
                    </h2>
                    <p className="text-jet-600 dark:text-platinum-400">
                      {isArabic ? 'املأ النموذج أدناه' : 'Fill out the form below'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                        {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                        placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                        {isArabic ? 'البريد الإلكتروني *' : 'Email *'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                        placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                        {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                        placeholder={isArabic ? "+90 XXX XXX XX XX" : "+90 XXX XXX XX XX"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                        {isArabic ? 'نوع الخدمة' : 'Service Type'}
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent"
                      >
                        {serviceTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-jet-800 dark:text-white mb-2">
                      {isArabic ? 'الرسالة *' : 'Message *'}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-jet-700 border border-caribbean-200 dark:border-jet-600 rounded-xl text-jet-800 dark:text-white placeholder-jet-400 focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:border-transparent resize-none"
                      placeholder={isArabic ? "اكتب رسالتك هنا..." : "Write your message here..."}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" variant="dots" />
                    ) : (
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )}
                    {isSubmitting 
                      ? (isArabic ? 'جاري الإرسال...' : 'Sending...')
                      : (isArabic ? 'إرسال الرسالة' : 'Send Message')
                    }
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-jet-800 dark:text-white mb-6">
                    {isArabic ? 'معلومات التواصل' : 'Contact Information'}
                  </h2>
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="flex items-start gap-4 p-6 bg-white/60 dark:bg-jet-700/60 backdrop-blur-sm rounded-xl border border-caribbean-100 dark:border-jet-600 hover:shadow-lg transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-caribbean-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-jet-800 dark:text-white mb-1">
                            {info.title}
                          </h3>
                          <p className="text-lg text-caribbean-600 dark:text-caribbean-400 font-medium mb-1">
                            {info.value}
                          </p>
                          <p className="text-sm text-jet-600 dark:text-platinum-400">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-caribbean-600 to-indigo-700 rounded-2xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-6">
                    {isArabic ? 'إحصائيات سريعة' : 'Quick Stats'}
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">24/7</div>
                      <div className="text-sm opacity-90">
                        {isArabic ? 'دعم متواصل' : 'Support Available'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">2h</div>
                      <div className="text-sm opacity-90">
                        {isArabic ? 'متوسط وقت الرد' : 'Avg Response Time'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;

