# نشر بوت المحاسبة في تيليجرام - دليل خطوة بخطوة

## المشكلة: Edge Function غير موجودة

إذا كانت Edge Function غير موجودة في Supabase Dashboard، يجب إنشاؤها يدوياً.

## الحل: نشر Edge Function يدوياً

### الخطوة 1: فتح Supabase Dashboard

1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **Edge Functions** من القائمة الجانبية

### الخطوة 2: إنشاء Edge Function جديدة

1. اضغط على **"Create a new function"** أو **"New Function"**
2. أدخل الاسم: `accounting-telegram-bot`
3. اضغط **"Create"**

### الخطوة 3: نسخ الكود

1. افتح ملف: `supabase/functions/accounting-telegram-bot/index.ts`
2. انسخ **كل** محتوى الملف (Ctrl+A ثم Ctrl+C)
3. الصق الكود في محرر Edge Function في Supabase Dashboard

### الخطوة 4: نشر Edge Function

1. اضغط على **"Deploy"** أو **"Save"**
2. انتظر حتى يتم النشر بنجاح

### الخطوة 5: تفعيل Public Access (مهم جداً!)

1. بعد النشر، اذهب إلى **Settings** في Edge Function
2. ابحث عن **"Public Access"** أو **"Verify JWT"**
3. فعّل **"Public Access"** أو عطّل **"Verify JWT"**
4. احفظ الإعدادات

### الخطوة 6: تشغيل Migration

1. اذهب إلى **SQL Editor** في Supabase Dashboard
2. انسخ محتوى ملف: `supabase/migrations/20250128_create_accounting_telegram_bot.sql`
3. الصقه في SQL Editor
4. اضغط **"Run"** أو **"Execute"**

### الخطوة 7: إعداد Webhook

شغّل الأمر التالي:
```powershell
powershell -ExecutionPolicy Bypass -File fix-accounting-bot-webhook.ps1
```

أو يدوياً:
1. افتح PowerShell
2. شغّل:
```powershell
$botToken = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'
$webhookUrl = 'https://fctvityawavmuethxxix.supabase.co/functions/v1/accounting-telegram-bot'
$body = @{url=$webhookUrl; allowed_updates=@('message','callback_query')} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Body $body -ContentType 'application/json'
```

### الخطوة 8: اختبار البوت

1. افتح تيليجرام وابحث عن: **@TevasulFinanceBot**
2. أرسل `/start`
3. أرسل `/login`
4. أرسل بيانات تسجيل الدخول:
   ```
   email:your@email.com
   password:yourpassword
   ```

## ملاحظات مهمة

- ✅ تأكد من تفعيل **Public Access** للـ Edge Function
- ✅ تأكد من تشغيل **Migration** في SQL Editor
- ✅ تأكد من أنك **أدمن** في النظام للوصول
- ✅ يجب أن يكون Webhook URL صحيح

## في حالة وجود مشاكل

1. تحقق من **Logs** في Supabase Dashboard → Edge Functions → accounting-telegram-bot → Logs
2. تحقق من **Webhook Info**:
   ```powershell
   $botToken = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0'
   Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
   ```
3. تأكد من أن Edge Function موجودة ومفعلة في Supabase Dashboard

