# اختبار نظام المحادثة في تليجرام

## الخطوات المطلوبة

### 1. التحقق من Webhook
```powershell
$botToken = '8498029918:AAGPbTv2z3HEE82gQxWZpXddwCGRsbf0r0c'
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
```

يجب أن يظهر:
```
url: "https://fctvityawavmuethxxix.supabase.co/functions/v1/telegram-bot-updates"
```

### 2. إذا كان Webhook خاطئ، شغّل:
```powershell
$botToken = '8498029918:AAGPbTv2z3HEE82gQxWZpXddwCGRsbf0r0c'
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/deleteWebhook?drop_pending_updates=true"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=https://fctvityawavmuethxxix.supabase.co/functions/v1/telegram-bot-updates"
```

### 3. التحقق من Supabase Dashboard
- اذهب إلى Edge Functions → telegram-bot-updates → Settings
- **تأكد من تفعيل "Verify JWT" = OFF**
- أو **تفعيل "Public Access"**

### 4. اختبار النظام
1. افتح الموقع في متصفح
2. افتح المحادثة الذكية
3. املأ النموذج (الاسم، البريد الإلكتروني/الهاتف)
4. اضغط "إرسال الطلب"
5. **انتظر رسالة الإشعار في تليجرام**
6. **اضغط على زر "💬 الرد على العميل"**

### 5. التحقق من السجلات
في Supabase Dashboard → Logs → Edge Functions → telegram-bot-updates:
ابحث عن:
- `"Callback query detected"`
- `"Sending success message to chatId"`
- `"Telegram response"`

## ما يجب أن تراه في تليجرام

### عند الضغط على "💬 الرد على العميل":
1. ✅ رسالة "تم بدء المحادثة مع العميل بنجاح"
2. 🔚 زر "إنهاء المحادثة"
3. 💬 يمكنك الكتابة مباشرة

## إذا لم يحدث شيء

### المشاكل المحتملة:
1. ❌ Webhook URL خطأ
2. ❌ Edge Function معطّل (Verify JWT = ON)
3. ❌ هناك أخطاء في الكود

### الحلول:
1. شغّل أوامر PowerShell المذكورة أعلاه
2. تحقق من Settings في Supabase Dashboard
3. أرسل السجلات من Supabase Logs



