# حل مشاكل بوت المحاسبة في تيليجرام

## المشكلة: البوت لا يعمل / أمر /start لا يعمل

### الخطوات المطلوبة للتحقق:

#### 1. التحقق من Edge Function
- اذهب إلى Supabase Dashboard → Edge Functions
- تأكد من وجود `accounting-telegram-bot`
- إذا لم تكن موجودة:
  1. اضغط "Create a new function"
  2. اسم: `accounting-telegram-bot`
  3. انسخ الكود من `supabase/functions/accounting-telegram-bot/index.ts`
  4. الصقه في المحرر
  5. اضغط "Deploy"

#### 2. تفعيل Public Access (مهم جداً!)
- اذهب إلى Edge Function → Settings
- ابحث عن "Public Access" أو "Verify JWT"
- فعّل **"Public Access"** أو عطّل **"Verify JWT"**
- احفظ الإعدادات

#### 3. التحقق من Webhook
شغّل:
```powershell
powershell -ExecutionPolicy Bypass -File fix-accounting-bot-webhook.ps1
```

#### 4. التحقق من Logs
- اذهب إلى Supabase Dashboard → Edge Functions → accounting-telegram-bot → Logs
- أرسل `/start` للبوت
- تحقق من السجلات:
  - يجب أن ترى: `💰 Accounting Telegram bot webhook received`
  - يجب أن ترى: `💰 Update received: {...}`
  - إذا كان هناك خطأ، سترى تفاصيله

#### 5. التحقق من Migration
- اذهب إلى Supabase Dashboard → SQL Editor
- شغّل:
```sql
SELECT * FROM telegram_config WHERE id = 3;
```
- إذا لم يكن هناك سجل، شغّل migration:
  - افتح `supabase/migrations/20250128_create_accounting_telegram_bot.sql`
  - انسخ المحتوى
  - الصقه في SQL Editor
  - شغّله

#### 6. التحقق من الأخطاء الشائعة

**خطأ: "Accounting bot not configured"**
- حل: شغّل migration في SQL Editor

**خطأ: "Internal server error"**
- تحقق من Logs في Supabase Dashboard
- تحقق من أن متغيرات البيئة موجودة (SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY)

**البوت لا يرد أبداً**
- تحقق من Webhook URL
- تحقق من Public Access مفعل
- تحقق من Logs في Supabase Dashboard

**رسالة: "Webhook URL is empty"**
- شغّل: `powershell -ExecutionPolicy Bypass -File fix-accounting-bot-webhook.ps1`

### اختبار البوت

1. افتح تيليجرام: **@TevasulFinanceBot**
2. أرسل `/start`
3. يجب أن تحصل على رسالة ترحيب
4. إذا لم تحصل على رسالة، تحقق من Logs في Supabase Dashboard

### إذا استمرت المشكلة

1. تحقق من Logs في Supabase Dashboard → Edge Functions → accounting-telegram-bot → Logs
2. انسخ الأخطاء من Logs
3. تحقق من:
   - Edge Function موجودة ومنشورة
   - Public Access مفعل
   - Webhook معرّف بشكل صحيح
   - Migration مشغّل

