import { createClient } from '@supabase/supabase-js';

// التحقق من متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات المطلوبة
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ متغيرات البيئة مفقودة!');
  console.error('❌ يرجى إنشاء ملف .env في مجلد المشروع الرئيسي');
  console.error('❌ محتوى الملف المطلوب:');
  console.error('VITE_SUPABASE_URL=https://your-project-ref.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
}

// إنشاء عميل Supabase
let supabaseClient: any;

if (!supabaseUrl || !supabaseAnonKey) {
  // إنشاء عميل وهمي لتجنب أخطاء التطبيق
  supabaseClient = createClient('https://dummy.supabase.co', 'dummy-key');
  
  // إضافة خاصية للتحقق من حالة الاتصال
  supabaseClient.isConnected = false;
  supabaseClient.connectionError = 'Supabase environment variables are missing. Please create a .env file with your Supabase credentials.';
} else {
  // التحقق من صحة URL
  if (!supabaseUrl.includes('supabase.co')) {
    supabaseClient = createClient('https://dummy.supabase.co', 'dummy-key');
    supabaseClient.isConnected = false;
    supabaseClient.connectionError = 'Invalid Supabase URL. URL must contain supabase.co';
  } else {
    // إنشاء عميل Supabase مع إعدادات محسنة
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false // تعطيل رسائل اللوغ
      }
    });
    
    // اختبار الاتصال مع timeout أطول
    const testConnection = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 30000); // 30 seconds
        });
        
        const connectionPromise = supabaseClient.auth.getSession();
        const { error } = await Promise.race([connectionPromise, timeoutPromise]) as any;
        
        if (error) {
          supabaseClient.isConnected = false;
          supabaseClient.connectionError = error.message;
        } else {
          supabaseClient.isConnected = true;
        }
      } catch (error) {
        supabaseClient.isConnected = false;
        supabaseClient.connectionError = error instanceof Error ? error.message : 'Connection failed';
        
        // إعادة المحاولة بعد 5 ثوانٍ
        setTimeout(() => {
          testConnection();
        }, 5000);
      }
    };
    
    // تأخير اختبار الاتصال قليلاً
    setTimeout(() => {
      testConnection();
    }, 1000);
  }
}

export const supabase = supabaseClient;

// Make supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabaseClient;
  }

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  country_code?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const countryCodes: CountryCode[] = [
  { code: 'TR', name: 'تركيا', flag: '🇹🇷', dialCode: '+90' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦', dialCode: '+966' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪', dialCode: '+971' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬', dialCode: '+20' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴', dialCode: '+962' },
  { code: 'LB', name: 'لبنان', flag: '🇱🇧', dialCode: '+961' },
  { code: 'SY', name: 'سوريا', flag: '🇸🇾', dialCode: '+963' },
  { code: 'IQ', name: 'العراق', flag: '🇮🇶', dialCode: '+964' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼', dialCode: '+965' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦', dialCode: '+974' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭', dialCode: '+973' },
  { code: 'OM', name: 'عمان', flag: '🇴🇲', dialCode: '+968' },
  { code: 'YE', name: 'اليمن', flag: '🇾🇪', dialCode: '+967' },
  { code: 'PS', name: 'فلسطين', flag: '🇵🇸', dialCode: '+970' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦', dialCode: '+212' },
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿', dialCode: '+213' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳', dialCode: '+216' },
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾', dialCode: '+218' },
  { code: 'SD', name: 'السودان', flag: '🇸🇩', dialCode: '+249' },
];
