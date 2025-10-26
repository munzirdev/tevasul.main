# إصلاح سريع - تحديد الـ Bot Token الصحيح

## الخطوة 1: الحصول على Bot Token من قاعدة البيانات

### طريقة 1: من Supabase Dashboard
1. اذهب إلى Supabase Dashboard
2. افتح **Table Editor** → `telegram_config`
3. انقر على السطر الذي يحتوي على `id = 2`
4. انسخ قيمة `bot_token`

### طريقة 2: من SQL Editor
1. اذهب إلى Supabase Dashboard → **SQL Editor**
2. شغّل هذا الاستعلام:
```sql
SELECT bot_token FROM telegram_config WHERE id = 2;
```
3. انسخ قيمة `bot_token` من النتيجة

## الخطوة 2: تحديث السكريبت

افتح `fix-webhook.ps1` واستبدل السطر:
```powershell
$botToken = 'YOUR_BOT_TOKEN_HERE'
```

بالـ Token الذي نسخته، مثل:
```powershell
$botToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'
```

## الخطوة 3: تشغيل السكريبت

```powershell
.\fix-webhook.ps1
```

## مثال للـ Token الصحيح

يجب أن يكون الشكل مثل:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz01234567
```
- يبدأ برقم (Bot ID)
- يتبعها `:` (نقطتين)
- ثم حروف وأرقام (Bot Secret)

## ملاحظة مهمة

⚠️ **لا تشارك الـ Bot Token مع أي شخص!**

إذا لم تجد الـ Token في قاعدة البيانات، قد تحتاج إلى:
1. إنشاء بوت جديد من BotFather
2. الحصول على الـ Token الجديد
3. تحديث قاعدة البيانات

## المساعدة

إذا كان الـ Token غير موجود أو غير صحيح، أرسل لي:
1. ما يظهر في جدول `telegram_config`
2. أو قُل إذا كنت تحتاج لإنشاء بوت جديد
