# التحقق من Edge Function - خطوات سريعة

## المشكلة: Logs فارغة

إذا كانت Logs فارغة في Supabase Dashboard، هذا يعني أن Edge Function **لا تستقبل الطلبات على الإطلاق**.

## الخطوات المطلوبة:

### 1. التحقق من وجود Edge Function

**في Supabase Dashboard:**
1. اذهب إلى **Edge Functions**
2. ابحث عن `accounting-telegram-bot`
3. إذا **لم تكن موجودة**:
   - اضغط **"Create a new function"**
   - الاسم: `accounting-telegram-bot`
   - انسخ الكود من: `supabase/functions/accounting-telegram-bot/index.ts`
   - الصقه في المحرر
   - اضغط **"Deploy"**

### 2. تفعيل Public Access (مهم جداً!)

**في Supabase Dashboard:**
1. اذهب إلى **Edge Functions** → `accounting-telegram-bot`
2. اضغط على **Settings** (الإعدادات)
3. ابحث عن **"Public Access"** أو **"Verify JWT"**
4. فعّل **"Public Access"** أو عطّل **"Verify JWT"**
5. احفظ الإعدادات

**ملاحظة:** إذا لم تكن **Public Access** مفعلة، Edge Function لن تستقبل الطلبات من Telegram!

### 3. التحقق من Webhook

شغّل:
```powershell
powershell -ExecutionPolicy Bypass -File fix-accounting-bot-webhook.ps1
```

### 4. اختبار Edge Function يدوياً

**في Supabase Dashboard:**
1. اذهب إلى **Edge Functions** → `accounting-telegram-bot`
2. اضغط على **"Invoke"** أو **"Test"**
3. أرسل JSON:
```json
{
  "update_id": 1,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456,
      "is_bot": false,
      "first_name": "Test"
    },
    "chat": {
      "id": 123456,
      "type": "private"
    },
    "date": 1234567890,
    "text": "/start"
  }
}
```
4. تحقق من الاستجابة والـ Logs

### 5. تحقق من Logs مرة أخرى

**في Supabase Dashboard:**
1. اذهب إلى **Edge Functions** → `accounting-telegram-bot` → **Logs**
2. أرسل `/start` للبوت في تيليجرام
3. انتظر بضع ثوانٍ
4. تحقق من Logs:
   - يجب أن ترى: `💰 Accounting Telegram bot webhook received`
   - إذا لم ترى أي شيء، Edge Function لا تستقبل الطلبات

## الأخطاء الشائعة:

### ❌ Edge Function غير موجودة
**الحل:** أنشئها في Supabase Dashboard

### ❌ Public Access غير مفعل
**الحل:** فعّل Public Access في Settings

### ❌ Webhook URL خاطئ
**الحل:** شغّل `fix-accounting-bot-webhook.ps1`

### ❌ Edge Function تحتاج إلى إعادة نشر
**الحل:** أعد نشر Edge Function بعد تحديث الكود

## إذا استمرت المشكلة:

1. تحقق من أن Edge Function موجودة في Supabase Dashboard
2. تحقق من أن Public Access مفعل
3. تحقق من Webhook URL
4. اختبر Edge Function يدوياً من Supabase Dashboard
5. تحقق من Logs بعد الاختبار اليدوي

