import React, { useState } from 'react';
import { FileText, Download, Printer, Plus, X, Users, Globe, Shield, Heart, Building, MapPin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { voluntaryReturnService } from '../lib/voluntaryReturnService';
import { useAuthContext } from './AuthProvider';
import { webhookService } from '../services/webhookService';
import { formatDisplayDate } from '../lib/utils';
import { escapeHtml } from '../utils/security';


interface RefakatEntry {
  id: string;
  name: string;
}

const gateTranslations: { [key: string]: string } = {
  "yayladağı": "كسب",
  "cilvegözü": "باب الهوى",
  "öncüpınar": "باب السلامة",
  "istanbul havalimanı": "مطار اسطنبول",
  "çobanbey": "الراعي",
  "zeytindalı": "غصن الزيتون",
  "karakamış": "جرابلس",
  "akçakale": "تل أبيض الحدودي"
};

const VoluntaryReturnForm: React.FC<{ isDarkMode: boolean }> = () => {
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState({
    fullNameTR: '',
    fullNameAR: '',
    kimlikNo: '',
    sinirKapisi: '',
    gsm: '',
    changeDate: 'no',
    customDate: ''
  });
  const [refakatEntries, setRefakatEntries] = useState<RefakatEntry[]>([{ id: '', name: '' }]);
  const [output, setOutput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const addRefakat = () => {
    setRefakatEntries([...refakatEntries, { id: '', name: '' }]);
  };

  const removeRefakat = (index: number) => {
    if (refakatEntries.length > 1) {
      setRefakatEntries(refakatEntries.filter((_, i) => i !== index));
    }
  };

  const updateRefakat = (index: number, field: 'id' | 'name', value: string) => {
    const updated = [...refakatEntries];
    updated[index][field] = value;
    setRefakatEntries(updated);
  };


  /* const saveFormToDatabase = async () => {
    if (!user) {
      const message = language === 'ar' ? 'يجب تسجيل الدخول لحفظ النموذج' : 'Lütfen formu kaydetmek için giriş yapın';
      console.error('❌', message);
      alert(message);
      return;
    }

    const { fullNameTR, fullNameAR, kimlikNo, sinirKapisi, gsm, changeDate, customDate } = formData;

    if (!fullNameTR || !fullNameAR || !kimlikNo || !sinirKapisi) {
      const message = language === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Lütfen tüm zorunlu alanları doldurunuz';
      console.error('❌', message);
      alert(message);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const validRefakat = refakatEntries.filter(entry => entry.id && entry.name);
      const formDataToSave = {
        full_name_tr: fullNameTR,
        full_name_ar: fullNameAR,
        kimlik_no: kimlikNo,
        sinir_kapisi: sinirKapisi,
        gsm: gsm || undefined,
        custom_date: changeDate === 'yes' && customDate ? customDate : undefined,
        refakat_entries: validRefakat
      };

      const { data, error } = await voluntaryReturnService.createForm(formDataToSave);

      if (error) {
        console.error('❌ خطأ من الخدمة:', error);
        throw error;
      }

      const successMessage = language === 'ar' ? 'تم حفظ النموذج بنجاح!' : 'Form başarıyla kaydedildi!';
      setSaveMessage(successMessage);
      setTimeout(() => setSaveMessage(''), 5000);
      
      // إرسال إشعار التيليجرام
      try {
        if (data) {
          await webhookService.sendVoluntaryReturnWebhook(data);
        }
      } catch (webhookError) {
        console.error('Error sending webhook notification:', webhookError);
      }
      
      // إعادة تعيين النموذج بعد الحفظ الناجح
      setFormData({
        fullNameTR: '',
        fullNameAR: '',
        kimlikNo: '',
        sinirKapisi: '',
        gsm: '',
        changeDate: 'no',
        customDate: ''
      });
      setRefakatEntries([{ id: '', name: '' }]);
      
    } catch (error: any) {
      console.error('💥 خطأ في حفظ النموذج:', error);
      
      let errorMessage = language === 'ar' ? 'خطأ في حفظ النموذج' : 'Form kaydedilirken hata oluştu';
      
      // رسائل خطأ أكثر تفصيلاً
      if (error?.message) {
        if (error.message.includes('المصادقة')) {
          errorMessage = language === 'ar' ? 'خطأ في المصادقة - يرجى إعادة تسجيل الدخول' : 'Authentication error - please login again';
        } else if (error.message.includes('مكتملة')) {
          errorMessage = language === 'ar' ? 'جميع الحقول المطلوبة يجب أن تكون مملوءة' : 'All required fields must be filled';
        } else if (error.message.includes('غير متوقع')) {
          errorMessage = language === 'ar' ? 'خطأ غير متوقع - يرجى المحاولة مرة أخرى' : 'Unexpected error - please try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  }; */

  const handleCreateAndSaveForms = async () => {
    const { fullNameTR, fullNameAR, kimlikNo, sinirKapisi, gsm, changeDate, customDate } = formData;

    if (!fullNameTR || !fullNameAR || !kimlikNo || !sinirKapisi) {
      alert(language === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Lütfen tüm zorunlu alanları doldurunuz');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // حفظ النموذج في قاعدة البيانات أولاً (إذا كان المستخدم مسجل دخول)
      if (user) {
        const validRefakat = refakatEntries.filter(entry => entry.id && entry.name);
        const formDataToSave = {
          full_name_tr: fullNameTR,
          full_name_ar: fullNameAR,
          kimlik_no: kimlikNo,
          sinir_kapisi: sinirKapisi,
          gsm: gsm || undefined,
          custom_date: changeDate === 'yes' && customDate ? customDate : undefined,
          refakat_entries: validRefakat
        };

        const { data, error } = await voluntaryReturnService.createForm(formDataToSave);

        if (error) {
          console.error('❌ خطأ من الخدمة:', error);
          throw error;
        }

        // إرسال إشعار التيليجرام
        try {
          if (data) {
            await webhookService.sendVoluntaryReturnWebhook(data);
          }
        } catch (webhookError) {
          console.error('Error sending webhook notification:', webhookError);
        }

        // إعادة تعيين النموذج بعد الحفظ الناجح
        setFormData({
          fullNameTR: '',
          fullNameAR: '',
          kimlikNo: '',
          sinirKapisi: '',
          gsm: '',
          changeDate: 'no',
          customDate: ''
        });
        setRefakatEntries([{ id: '', name: '' }]);
      }

      // إنشاء النماذج للعرض
      generateForms();

      const successMessage = user 
        ? (language === 'ar' ? 'تم إنشاء وحفظ النموذج بنجاح!' : 'Form created and saved successfully!')
        : (language === 'ar' ? 'تم إنشاء النموذج بنجاح!' : 'Form created successfully!');
      setSaveMessage(successMessage);
      setTimeout(() => setSaveMessage(''), 5000);

    } catch (error: any) {
      console.error('💥 خطأ في إنشاء وحفظ النموذج:', error);
      
      let errorMessage = language === 'ar' ? 'خطأ في إنشاء وحفظ النموذج' : 'Error creating and saving form';
      
      if (error?.message) {
        if (error.message.includes('المصادقة')) {
          errorMessage = language === 'ar' ? 'خطأ في المصادقة - يرجى إعادة تسجيل الدخول' : 'Authentication error - please login again';
        } else if (error.message.includes('مكتملة')) {
          errorMessage = language === 'ar' ? 'جميع الحقول المطلوبة يجب أن تكون مملوءة' : 'All required fields must be filled';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const generateForms = () => {
    const { fullNameTR, fullNameAR, kimlikNo, sinirKapisi, gsm, changeDate, customDate } = formData;

    if (!fullNameTR || !fullNameAR || !kimlikNo || !sinirKapisi) {
      alert(language === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Lütfen tüm zorunlu alanları doldurunuz');
      return;
    }

    // حفظ موضع السكرول الحالي
    const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;

    let requestDateTR, requestDateAR;
    if (changeDate === "yes" && customDate) {
      const dateObj = new Date(customDate);
      requestDateTR = formatDisplayDate(dateObj);
      requestDateAR = formatDisplayDate(dateObj);
    } else {
      const today = new Date();
      requestDateTR = formatDisplayDate(today);
      requestDateAR = formatDisplayDate(today);
    }

    let refakatPartTR = "";
    const validRefakat = refakatEntries.filter(entry => entry.id && entry.name);
    if (validRefakat.length > 0) {
      const rows = validRefakat
        .map(entry => `<tr><td style="white-space: nowrap;">${entry.id}</td><td>${entry.name}</td></tr>`)
        .join("");
      
      refakatPartTR = `
        <br><br>REFAKATİMDEKİLER
        <table class="refakat-table">
          <thead>
            <tr>
              <th>Kimlik No</th>
              <th>İsim</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    const safeFullNameTR = escapeHtml(fullNameTR);
    const safeFullNameAR = escapeHtml(fullNameAR);
    const safeKimlikNo = escapeHtml(kimlikNo);
    const safeSinirKapisi = escapeHtml(sinirKapisi);

    const gsmPartTR = gsm ? `<br><br>GSM : ${escapeHtml(gsm)}` : "";

    const turkishForm = `
      <div id="turkishPage" style="text-align: center; margin-top: 60px;">
        <strong>İL GÖÇ İDARESİ MÜDÜRLÜĞÜ'NE</strong><br />MERSİN
        <div style="margin-top: 40px; text-align: left;">
          <div style="text-align: right; font-family: Arial, sans-serif;" dir="ltr">${requestDateTR}</div><br />
          Ben Suriye uyrukluyum. Adım ${safeFullNameTR} . ${safeKimlikNo} no'lu yabancı kimlik sahibiyim . ${safeSinirKapisi.toUpperCase()} Sınır Kapısından Geçici koruma haklarımdan feraget ederek Suriye'ye gerekli gönüllü dönüş işlemin yapılması ve geçici koruma kimlik kaydımın iptal edilmesi için gereğinin yapılmasını saygımla arz ederim.
          ${refakatPartTR}
          ${gsmPartTR}
          <div style="text-align: right; margin-top: 60px;">
            <strong>AD SOYAD</strong><br />${safeFullNameTR}
          </div>
        </div>
      </div>
    `;

    const arabicGate = gateTranslations[sinirKapisi] || sinirKapisi;
    const arabicForm = `
      <div id="arabicPage" dir="rtl" style="text-align: center; margin-top: 60px;">
        <strong>إلى مديرية إدارة الهجرة</strong><br />مرسين
        <div style="margin-top: 40px; text-align: right;">
          التاريخ: ${requestDateAR}<br /><br />
          أنا الموقّع أدناه ${safeFullNameAR}، أحمل بطاقة الحماية المؤقتة رقم ${safeKimlikNo}. أطلب منكم التفضل بتسليمي الأوراق اللازمة لتنفيذ إجراءات العودة الطوعية إلى سوريا عبر معبر ${arabicGate} الحدودي.<br />
          وتفضلوا بقبول فائق الاحترام والتقدير.<br /><br />
          المقدّم/ة:<br />${safeFullNameAR}
        </div>
      </div>
    `;

    setOutput(turkishForm + arabicForm);
    
    // استعادة موضع السكرول بعد تحديث المحتوى
    setTimeout(() => {
      window.scrollTo(0, currentScrollPos);
    }, 0);
  };

  const printForms = async () => {
    if (!output) {
      alert(language === 'ar' ? 'الرجاء إنشاء الطلب أولاً' : 'Lütfen önce formu oluşturun');
      return;
    }
    
    openPrintWindow(output);
  };

  const printTurkish = async () => {
    const turkishContent = document.getElementById("output")?.querySelector("#turkishPage");
    if (!turkishContent) {
      alert(language === 'ar' ? 'الرجاء إنشاء الطلب أولاً' : 'Lütfen önce formu oluşturun');
      return;
    }
    
    openPrintWindow(turkishContent.outerHTML);
  };

  const printArabic = async () => {
    const arabicContent = document.getElementById("output")?.querySelector("#arabicPage");
    if (!arabicContent) {
      alert(language === 'ar' ? 'الرجاء إنشاء الطلب أولاً' : 'Lütfen önce formu oluşturun');
      return;
    }
    
    openPrintWindow(arabicContent.outerHTML);
  };

  const openPrintWindow = (content: string) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Yazdır / طباعة</title>
            <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Alexandria', Arial, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: black;
                background: white;
                margin: 20px;
              }
              [dir=rtl] {
                direction: rtl;
                font-family: 'Alexandria', Arial, sans-serif;
                font-size: 14px;
              }
              #turkishPage, #arabicPage {
                page-break-after: always;
                margin-bottom: 40px;
                text-align: center;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid #555;
                padding: 6px 8px;
                text-align: left;
                background-color: white;
              }
              tr:nth-child(even) td {
                background-color: #f0f0f0;
              }
              th {
                background-color: #999999;
              }
            </style>
          </head>
          <body>
            <div id="printArea">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-jet-900 dark:via-indigo-900 dark:to-jet-800 text-jet-800 dark:text-white overflow-x-hidden font-alexandria relative`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-jet-900 dark:via-indigo-900 dark:to-jet-800">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}></div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {/* Floating Documents */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full shadow-lg animate-float-slow transform rotate-12 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white/60" />
          </div>
          
          {/* Speed Lines */}
          <div className="absolute top-1/4 right-20 w-32 h-1 bg-gradient-to-r from-transparent via-caribbean-400/50 to-transparent animate-speed-line"></div>
          <div className="absolute top-1/3 right-16 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent animate-speed-line-delayed"></div>
          <div className="absolute top-2/5 right-24 w-20 h-1 bg-gradient-to-r from-transparent via-caribbean-300/30 to-transparent animate-speed-line-delayed-2"></div>
          
          {/* Floating Service Icons */}
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-caribbean-500/40 rounded-full flex items-center justify-center animate-float-wide-slower shadow-lg">
            <FileText className="w-8 h-8 text-caribbean-300" />
          </div>
          <div className="absolute top-20 right-10 w-16 h-16 bg-indigo-500/40 rounded-full flex items-center justify-center animate-pulse-wide-slower shadow-lg">
            <Users className="w-8 h-8 text-indigo-300" />
          </div>
          <div className="absolute bottom-1/3 left-1/6 w-16 h-16 bg-caribbean-600/40 rounded-full flex items-center justify-center animate-bounce-wide-slower shadow-lg">
            <FileText className="w-8 h-8 text-caribbean-300" />
          </div>
          
          {/* Translation Service */}
          <div className="absolute top-1/3 left-1/6 w-16 h-16 bg-purple-500/40 rounded-full flex items-center justify-center animate-float-wide-slower delay-1000 shadow-lg">
            <Globe className="w-8 h-8 text-purple-300" />
          </div>
          
          {/* Travel Service */}
          <div className="absolute bottom-1/3 right-1/6 w-16 h-16 bg-blue-500/40 rounded-full flex items-center justify-center animate-pulse-wide-slow delay-2000 shadow-lg">
            <MapPin className="w-8 h-8 text-blue-300" />
          </div>
          
          {/* Legal Service */}
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-500/40 rounded-full flex items-center justify-center animate-bounce-wide-slower delay-1500 shadow-lg">
            <Shield className="w-8 h-8 text-green-300" />
          </div>
          
          {/* Government Service */}
          <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-orange-500/40 rounded-full flex items-center justify-center animate-float-wide-slower delay-3000 shadow-lg">
            <Building className="w-8 h-8 text-orange-300" />
          </div>
          
          {/* Insurance Service */}
          <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-red-500/40 rounded-full flex items-center justify-center animate-pulse-wide-slower delay-2500 shadow-lg">
            <Heart className="w-8 h-8 text-red-300" />
          </div>
          
          {/* Additional Animated Elements */}
          <div className="absolute top-1/6 right-1/6 w-24 h-24 bg-gradient-to-r from-caribbean-400/20 to-indigo-400/20 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-1/6 left-1/6 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-spin-slow-reverse"></div>
          <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-bounce-slow"></div>
          <div className="absolute top-1/2 right-1/6 w-18 h-18 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full animate-pulse-slow delay-500"></div>
          
          {/* Animated Lines */}
          <div className="absolute top-1/4 left-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-caribbean-400/30 to-transparent animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse-slow delay-2000"></div>
          
          {/* Orbiting Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-96 h-96">
              <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow"></div>
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-caribbean-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-orbit"></div>
              <div className="absolute bottom-0 right-1/2 w-2 h-2 bg-indigo-400 rounded-full transform translate-x-1/2 translate-y-1/2 animate-orbit-reverse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-caribbean-400/40 via-indigo-400/40 to-caribbean-400/40 blur-3xl animate-pulse-slow" style={{ transform: 'scale(1.8)' }}></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/30 via-caribbean-200/30 to-white/30 blur-2xl animate-pulse-slow delay-1000" style={{ transform: 'scale(1.4)' }}></div>
            <img 
              src="/logo-fınal.png" 
              alt="مجموعة تواصل" 
              className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain animate-float brightness-0 invert"
              style={{ 
                filter: 'drop-shadow(0 0 20px rgba(60, 110, 113, 0.5)) drop-shadow(0 0 40px rgba(60, 110, 113, 0.3))'
              }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-caribbean-200 to-white bg-clip-text text-transparent bg-[length:200%_100%] animate-text-shimmer mb-4 drop-shadow-lg leading-relaxed min-h-[1.5em]">
            نموذج العودة الطوعية
          </h1>
          <p className="text-xl md:text-2xl text-white/85 drop-shadow-md">
            Gönüllü Dönüş Formu
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent rounded-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                الاسم الكامل (بالتركية)
              </label>
              <input
                type="text"
                value={formData.fullNameTR}
                onChange={(e) => setFormData({...formData, fullNameTR: e.target.value})}
                placeholder="Örn: Muhammed Muhammed"
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder-white/60 shadow-inner"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                الاسم الكامل (بالعربية)
              </label>
              <input
                type="text"
                value={formData.fullNameAR}
                onChange={(e) => setFormData({...formData, fullNameAR: e.target.value})}
                placeholder="مثال: محمد المحمد"
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder-white/60 shadow-inner"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                رقم الحماية المؤقتة
              </label>
              <input
                type="text"
                value={formData.kimlikNo}
                onChange={(e) => setFormData({...formData, kimlikNo: e.target.value})}
                placeholder="Örn: 99605285486"
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder-white/60 shadow-inner"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                اسم المعبر
              </label>
              <select
                value={formData.sinirKapisi}
                onChange={(e) => setFormData({...formData, sinirKapisi: e.target.value})}
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white shadow-inner [&>option]:bg-slate-800 [&>option]:text-white [&>option]:dark:bg-jet-900 [&>option]:dark:text-white"
                required
              >
                <option value="" className="bg-slate-800 text-white dark:bg-jet-900">اختر المعبر</option>
                <option value="yayladağı" className="bg-slate-800 text-white dark:bg-jet-900">YAYLADAĞI / كسب</option>
                <option value="cilvegözü" className="bg-slate-800 text-white dark:bg-jet-900">CİLVEGÖZÜ / باب الهوى</option>
                <option value="öncüpınar" className="bg-slate-800 text-white dark:bg-jet-900">ÖNCÜPINAR / باب السلامة</option>
                <option value="istanbul havalimanı" className="bg-slate-800 text-white dark:bg-jet-900">İSTANBUL HAVALİMANI / مطار اسطنبول</option>
                <option value="çobanbey" className="bg-slate-800 text-white dark:bg-jet-900">ÇOBANBEY / الراعي</option>
                <option value="zeytindalı" className="bg-slate-800 text-white dark:bg-jet-900">ZEYTİNDALI / غصن الزيتون</option>
                <option value="karakamış" className="bg-slate-800 text-white dark:bg-jet-900">KARAKAMIŞ / جرابلس</option>
                <option value="akçakale" className="bg-slate-800 text-white dark:bg-jet-900">AKÇAKALE / تل أبيض الحدودي</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                value={formData.gsm}
                onChange={(e) => setFormData({...formData, gsm: e.target.value})}
                placeholder="Örn: 0541 717 57 49"
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder-white/60 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                هل تريد تغيير تاريخ الطلب؟
              </label>
              <select
                value={formData.changeDate}
                onChange={(e) => {
                  setFormData({...formData, changeDate: e.target.value});
                  setShowDatePicker(e.target.value === 'yes');
                }}
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white shadow-inner [&>option]:bg-slate-800 [&>option]:text-white [&>option]:dark:bg-jet-900 [&>option]:dark:text-white"
              >
                <option value="no" className="bg-slate-800 text-white dark:bg-jet-900">لا</option>
                <option value="yes" className="bg-slate-800 text-white dark:bg-jet-900">نعم</option>
              </select>
            </div>
          </div>

          {showDatePicker && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/90 dark:text-white mb-2">
                اختر التاريخ الجديد
              </label>
              <input
                type="date"
                value={formData.customDate}
                onChange={(e) => setFormData({...formData, customDate: e.target.value})}
                className="w-full px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white shadow-inner"
              />
            </div>
          )}

          {/* Refakat Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 dark:text-white mb-4">
              المرافقين
            </label>
            {refakatEntries.map((entry, index) => (
              <div key={index} className="flex items-center gap-4 mb-3">
                <span className="text-sm font-medium text-white/80 dark:text-white/80 min-w-[80px]">
                  مرافق {index + 1}
                </span>
                <input
                  type="text"
                  value={entry.id}
                  onChange={(e) => updateRefakat(index, 'id', e.target.value)}
                  placeholder="رقم الهوية"
                  className="flex-1 px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder-white/60 shadow-inner"
                />
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateRefakat(index, 'name', e.target.value)}
                  placeholder="الاسم الكامل"
                  className="flex-1 px-4 py-3 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-caribbean-400/50 focus:border-caribbean-400/50 transition-all duration-300 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-white placeholder-white/60 shadow-inner"
                />
                {refakatEntries.length > 1 && (
                  <button
                    onClick={() => removeRefakat(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRefakat}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-caribbean-500/80 to-indigo-500/80 backdrop-blur-sm text-white rounded-xl hover:from-caribbean-400/90 hover:to-indigo-400/90 transition-all duration-300 shadow-lg border border-white/20"
            >
              <Plus className="w-4 h-4" />
              إضافة مرافق جديد
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleCreateAndSaveForms}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-caribbean-500/80 to-indigo-600/80 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-caribbean-400/90 hover:to-indigo-500/90 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              {isSaving ? (language === 'ar' ? 'جاري الإنشاء والحفظ...' : 'Creating and Saving...') : (language === 'ar' ? 'إنشاء وحفظ النموذج' : 'Create & Save Form')}
            </button>
            <button
              onClick={printTurkish}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-orange-400/90 hover:to-red-400/90 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20"
            >
              <Printer className="w-5 h-5" />
              طباعة التركية
            </button>
            <button
              onClick={printArabic}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/80 to-teal-500/80 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-green-400/90 hover:to-teal-400/90 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20"
            >
              <Printer className="w-5 h-5" />
              طباعة العربية
            </button>
            <button
              onClick={printForms}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-purple-400/90 hover:to-pink-400/90 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20"
            >
              <Download className="w-5 h-5" />
              طباعة الكل
            </button>
          </div>
          
          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-xl text-center font-medium backdrop-blur-sm border ${
              saveMessage.includes('نجاح') || saveMessage.includes('başarıyla') 
                ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                : 'bg-red-500/20 text-red-100 border-red-400/30'
            }`}>
              {saveMessage}
            </div>
          )}
          </div>
        </div>

        {/* Output */}
        {output && (
          <div className="mt-8 bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-3xl pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent rounded-3xl pointer-events-none"></div>
            <div className="relative z-10">
            <h3 className="text-xl font-bold text-white/90 dark:text-white mb-4">
              النماذج المُنشأة
            </h3>
            <div 
              id="output"
              className="prose dark:prose-invert max-w-none text-white/90"
              dangerouslySetInnerHTML={{ __html: output }}
            />
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Cursor */}
      
    </div>
  );
};

export default VoluntaryReturnForm;
