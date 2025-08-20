# تحسينات صفحة حسابي والخدمات الجديدة

## 🆕 الخدمات الجديدة المضافة

### 1. تجديد الإقامة السياحية
- **الوصف**: خدمة تجديد الإقامة السياحية للمقيمين الحاليين
- **الميزات**:
  - نموذج شامل لجميع البيانات المطلوبة
  - رفع المستندات المطلوبة
  - متابعة حالة الطلب
  - إشعارات التيليجرام

### 2. الإقامة السياحية أول مرة
- **الوصف**: خدمة الحصول على إقامة سياحية للمرة الأولى
- **الميزات**:
  - نموذج مخصص للمبتدئين
  - دليل شامل للمتطلبات
  - رفع جميع المستندات المطلوبة
  - متابعة حالة الطلب

## 🎨 التحسينات في صفحة حسابي

### 1. تصميم محسن
- **خلفية زجاجية**: تأثيرات بصرية متقدمة مع خلفية شفافة
- **ألوان متدرجة**: استخدام ألوان متدرجة جذابة
- **حركات سلسة**: انتقالات وحركات سلسة عند التفاعل
- **تأثيرات الضوء**: تأثيرات ضوئية متقدمة

### 2. قسم الخدمات السريعة
- **أزرار سريعة**: أزرار مباشرة للخدمات الأكثر طلباً
- **أيقونات ملونة**: أيقونات مميزة لكل خدمة
- **تصنيف ذكي**: تجميع الخدمات حسب النوع

### 3. إحصائيات محسنة
- **عرض مرئي**: عرض الإحصائيات بطريقة مرئية جذابة
- **ألوان مميزة**: كل حالة لها لون مميز
- **أرقام ديناميكية**: عرض الأرقام بطريقة تفاعلية

## 🗄️ تحديثات قاعدة البيانات

### 1. جدول `residence_requests`
```sql
CREATE TABLE public.residence_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES public.service_requests(id),
    user_id UUID REFERENCES auth.users(id),
    residence_type TEXT NOT NULL CHECK (residence_type IN ('renewal', 'first-time')),
    passport_number TEXT,
    passport_expiry_date DATE,
    entry_date DATE,
    intended_duration_months INTEGER,
    accommodation_address TEXT,
    accommodation_type TEXT CHECK (accommodation_type IN ('hotel', 'apartment', 'house', 'other')),
    financial_guarantee_amount DECIMAL(10,2),
    financial_guarantee_source TEXT,
    employment_status TEXT CHECK (employment_status IN ('employed', 'unemployed', 'student', 'retired', 'other')),
    employer_name TEXT,
    employer_address TEXT,
    monthly_income DECIMAL(10,2),
    family_members_count INTEGER DEFAULT 0,
    additional_documents TEXT[],
    special_requirements TEXT,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. تحديث قيود `service_requests`
```sql
ALTER TABLE public.service_requests 
ADD CONSTRAINT service_requests_service_type_check 
CHECK (service_type IN (
    'translation',
    'consultation', 
    'legal',
    'health-insurance',
    'travel',
    'government',
    'insurance',
    'tourist-residence-renewal',
    'first-time-tourist-residence',
    'other'
));
```

## 🔧 الملفات المحدثة

### 1. ملفات React
- `src/components/UserAccount.tsx` - صفحة حسابي المحسنة
- `src/components/ResidenceRequestForm.tsx` - نموذج طلبات الإقامة الجديد
- `src/data/services.ts` - إضافة الخدمات الجديدة

### 2. ملفات قاعدة البيانات
- `supabase/migrations/20250121000000_add_new_residence_services.sql`
- `apply-residence-services-update.sql`

### 3. ملفات الخدمات
- `src/services/telegramService.ts` - دعم الإشعارات للخدمات الجديدة

## 🚀 كيفية التطبيق

### 1. تطبيق تحديثات قاعدة البيانات
```bash
# في Supabase Dashboard -> SQL Editor
# قم بتشغيل محتوى ملف apply-residence-services-update.sql
```

### 2. اختبار الخدمات الجديدة
1. انتقل إلى صفحة حسابي
2. اضغط على "تجديد الإقامة السياحية" أو "الإقامة السياحية أول مرة"
3. املأ النموذج وارفع المستندات
4. تأكد من وصول الإشعار في التيليجرام

## 📱 الميزات الجديدة

### 1. نموذج طلبات الإقامة
- **معلومات أساسية**: جواز السفر، التواريخ، المدة
- **معلومات السكن**: العنوان، النوع، عدد أفراد العائلة
- **معلومات مالية**: الضمان المالي، الدخل الشهري
- **معلومات العمل**: حالة التوظيف، صاحب العمل
- **المستندات**: رفع جميع المستندات المطلوبة

### 2. متابعة متقدمة
- **حالات متعددة**: قيد الانتظار، قيد التنفيذ، مكتملة، مرفوضة
- **ملاحظات إدارية**: إمكانية إضافة ملاحظات من الإدارة
- **تاريخ التحديث**: تتبع آخر تحديث للطلب

### 3. إشعارات متقدمة
- **إشعارات التيليجرام**: إرسال تفاصيل كاملة للطلب
- **معلومات المستخدم**: اسم المستخدم، البريد الإلكتروني، الهاتف
- **تفاصيل الطلب**: جميع البيانات المدخلة في النموذج

## 🎯 الخطوات التالية

### 1. اختبار شامل
- [ ] اختبار جميع أنواع الخدمات
- [ ] اختبار رفع الملفات
- [ ] اختبار الإشعارات
- [ ] اختبار الأمان والصلاحيات

### 2. تحسينات إضافية
- [ ] إضافة تقارير وإحصائيات للإدارة
- [ ] إضافة نظام تذكيرات للمستخدمين
- [ ] إضافة نظام تقييم الخدمات
- [ ] إضافة نظام الدفع الإلكتروني

### 3. التوثيق
- [ ] دليل المستخدم النهائي
- [ ] دليل الإدارة
- [ ] دليل المطورين

## 🔒 الأمان والصلاحيات

### 1. Row Level Security (RLS)
- المستخدمون يمكنهم رؤية طلباتهم فقط
- الإدارة يمكنها رؤية جميع الطلبات
- حماية كاملة للبيانات الشخصية

### 2. التحقق من الصحة
- التحقق من صحة البيانات المدخلة
- التحقق من نوع وحجم الملفات
- التحقق من الصلاحيات قبل العمليات

### 3. النسخ الاحتياطي
- نسخ احتياطي تلقائي للبيانات
- حماية من فقدان البيانات
- إمكانية استعادة البيانات

## 📞 الدعم

لأي استفسارات أو مشاكل:
- البريد الإلكتروني: support@tevasul.group
- التيليجرام: @tevasul_support
- الهاتف: +90 XXX XXX XXXX

---

**تاريخ التحديث**: 21 يناير 2025  
**الإصدار**: 2.0.0  
**المطور**: فريق تطوير Tevasul Group
