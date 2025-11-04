# إعداد بوت المحاسبة في تيليجرام

## المشاكل المحتملة وحلولها

### 1. البوت لا يرد على الرسائل

#### الخطوات المطلوبة:

**أ. تشغيل Migration**
1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ محتوى ملف `supabase/migrations/20250128_create_accounting_telegram_bot.sql`
4. شغّل السكريبت في SQL Editor

**ب. تفعيل Public Access للـ Edge Function**
1. اذهب إلى Supabase Dashboard → Edge Functions
2. افتح `accounting-telegram-bot`
3. اذهب إلى Settings
4. فعّل **"Public Access"** أو عطّل **"Verify JWT"**
5. احفظ الإعدادات

**ج. التحقق من Webhook**
شغّل:
```powershell
powershell -ExecutionPolicy Bypass -File fix-accounting-bot-webhook.ps1
```

**د. إضافة متغيرات البيئة**
1. اذهب إلى Supabase Dashboard → Edge Functions → accounting-telegram-bot → Settings
2. اذهب إلى Secrets
3. أضف Secret باسم `SUPABASE_ANON_KEY` مع قيمة الـ anon key من Supabase Dashboard

### 2. البوت يرد لكن لا يستطيع تسجيل الدخول

**التحقق من:**
- تأكد من أنك تستخدم نفس email/password المستخدمة في الموقع
- تأكد من أنك أدمن في النظام (role = 'admin' في جدول profiles)
- تأكد من أن جدول `accounting_telegram_auth` موجود (شغّل migration)

### 3. أخطاء في السجلات

**للتحقق من الأخطاء:**
1. اذهب إلى Supabase Dashboard → Logs
2. اختر Edge Functions → accounting-telegram-bot
3. تحقق من الأخطاء الأخيرة

## اختبار البوت

1. افتح تيليجرام وابحث عن: **@TevasulFinanceBot**
2. اضغط Start أو أرسل `/start`
3. أرسل `/login`
4. أرسل بيانات تسجيل الدخول:
   ```
   email:your@email.com
   password:yourpassword
   ```
5. يجب أن تظهر رسالة "✅ تم تسجيل الدخول بنجاح!"

## الأوامر المتاحة

- `/start` - بدء البوت
- `/login` - تسجيل الدخول
- `/help` - عرض الأوامر المتاحة
- `/status` - حالة النظام
- `/logout` - تسجيل الخروج

## ملاحظات مهمة

- يجب أن تكون أدمن في النظام للوصول
- الجلسة تنتهي بعد 30 يوم
- تأكد من تشغيل migration قبل استخدام البوت
- تأكد من تفعيل Public Access للـ Edge Function

