# إصلاح إشعارات بوت المحاسبة

## المشكلة
حالياً يتم إرسال إشعارات المعاملات المحاسبية إلى البوت العام (id=2) بدلاً من بوت المحاسبة الخاص (id=3).

## الحل
تم إنشاء migration جديد `20250128_fix_accounting_telegram_notifications_bot.sql` الذي:
1. يحذف الـ trigger القديم الذي يستخدم البوت العام (id=2)
2. يضمن أن الـ trigger الجديد يستخدم بوت المحاسبة (id=3)
3. يرسل الإشعارات إلى جميع المستخدمين المسجلين في بوت المحاسبة

## الخطوات

### 1. تشغيل Migration الجديد
في Supabase SQL Editor، قم بتشغيل الملف:
```
supabase/migrations/20250128_fix_accounting_telegram_notifications_bot.sql
```

### 2. التحقق من الـ Trigger
تأكد من أن الـ trigger الصحيح نشط:
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'accounting_transactions'
  AND trigger_name LIKE '%telegram%';
```

يجب أن ترى:
- `accounting_transaction_telegram_notification` (يستخدم بوت المحاسبة id=3)
- **لا يجب** أن ترى `trigger_notify_telegram_accounting_transaction` (القديم الذي يستخدم id=2)

### 3. التحقق من الـ Function
```sql
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'notify_accounting_telegram_transaction';
```

تأكد من أن الـ function يستخدم `id = 3` وليس `id = 2`.

### 4. اختبار الإشعارات
1. أضف معاملة محاسبية جديدة من الداشبورد
2. تأكد من أن الإشعار يصل إلى بوت المحاسبة (id=3) وليس البوت العام

## ملاحظات
- الـ trigger الجديد يرسل الإشعارات إلى جميع المستخدمين المسجلين في `accounting_telegram_auth`
- الإشعارات تُرسل عبر Edge Function `accounting-telegram-notification`
- يجب أن يكون المستخدم مسجلاً في بوت المحاسبة لاستقبال الإشعارات

