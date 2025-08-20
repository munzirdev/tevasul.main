# إعدادات Supabase المطلوبة لحل مشكلة روابط إعادة تعيين كلمة المرور

## 🚨 المشكلة الحالية

الرابط في البريد الإلكتروني يأخذ إلى الصفحة الرئيسية بدلاً من صفحة إعادة تعيين كلمة المرور:
```
https://fctvityawavmuethxxix.supabase.co/auth/v1/verify?token=pkce_e5d7779167cce0199bd9405a8088108bd8f59fef22408f1f28b5dd0d&type=recovery&redirect_to=http://www.tevasul.group
```

## ✅ الحلول المطبقة

### 1. تحديث redirectTo في الكود
```typescript
// في ChangePasswordModal.tsx
const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
  redirectTo: `https://tevasul.group/reset-password`,
});
```

### 2. إضافة معالجة الروابط في App.tsx
```typescript
// Handle password reset links from email
if (path === '/' && (location.search.includes('error=') || location.search.includes('access_token=') || location.hash.includes('error=') || location.hash.includes('access_token='))) {
  console.log('Detected password reset link, redirecting to reset-password page');
  navigate('/reset-password' + location.search + location.hash, { replace: true });
  return;
}
```

## 🛠️ إعدادات Supabase المطلوبة

### في لوحة تحكم Supabase (https://supabase.com/dashboard):

#### 1. Auth Settings > URL Configuration
```
Site URL: https://tevasul.group
Redirect URLs: 
- https://tevasul.group/reset-password
- https://tevasul.group/auth/callback
- https://tevasul.group/login
```

#### 2. Auth Settings > Email Templates
**Password Reset Template:**
```html
<h2>إعادة تعيين كلمة المرور</h2>
<p>مرحباً،</p>
<p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
<p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
<a href="{{ .ConfirmationURL }}">إعادة تعيين كلمة المرور</a>
<p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
<p>شكراً لك،<br>فريق توفاسول</p>
```

#### 3. Auth Settings > Security
```
JWT Expiry: 3600 (1 hour)
Refresh Token Rotation: Enabled
Secure Email Change: Enabled
```

#### 4. Auth Settings > SMTP Settings
```
SMTP Host: [Your SMTP Host]
SMTP Port: 587
SMTP User: [Your SMTP User]
SMTP Pass: [Your SMTP Password]
Sender Name: توفاسول
Sender Email: noreply@tevasul.group
```

## 🔧 التحسينات الإضافية

### 1. تحديث إعدادات Supabase Client
```typescript
// في src/lib/supabase.ts
supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  }
});
```

### 2. معالجة الأخطاء في ResetPasswordPage.tsx
```typescript
// Handle error cases first
if (error || errorCode) {
  let errorMessage = '';
  if (errorCode === 'otp_expired') {
    errorMessage = isArabic 
      ? 'رابط إعادة تعيين كلمة المرور منتهي الصلاحية. يرجى طلب رابط جديد.'
      : 'Password reset link has expired. Please request a new link.';
  } else if (error === 'access_denied') {
    errorMessage = isArabic 
      ? 'تم رفض الوصول. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.'
      : 'Access denied. Please request a new password reset link.';
  }
  setError(errorMessage);
  setIsValidToken(false);
  return;
}
```

## 📋 خطوات التحقق

### 1. اختبار إرسال البريد الإلكتروني
1. انتقل إلى تبويب "حسابي"
2. اضغط "تغيير كلمة المرور"
3. اضغط "نسيت كلمة المرور"
4. أدخل بريد إلكتروني صحيح
5. اضغط "إرسال رابط إعادة التعيين"

### 2. اختبار الرابط
1. افتح البريد الإلكتروني
2. اضغط على رابط إعادة تعيين كلمة المرور
3. تحقق من الوصول إلى صفحة إعادة تعيين كلمة المرور
4. تحقق من ظهور رسائل الخطأ أو النجاح

### 3. اختبار معالجة الأخطاء
1. استخدم رابط منتهي الصلاحية
2. تحقق من ظهور رسالة الخطأ المناسبة
3. تحقق من ظهور النصائح لحل المشكلة

## 🔗 روابط مفيدة

### صفحة إعادة تعيين كلمة المرور:
```
https://tevasul.group/reset-password
```

### صفحة تسجيل الدخول:
```
https://tevasul.group/login
```

### لوحة تحكم Supabase:
```
https://supabase.com/dashboard/project/fctvityawavmuethxxix
```

## 📞 الدعم

### إذا استمرت المشكلة:
1. **تحقق من إعدادات Supabase** في لوحة التحكم
2. **تأكد من صحة SMTP** إعدادات البريد الإلكتروني
3. **تحقق من سجلات وحدة التحكم** (F12)
4. **اختبر مع بريد إلكتروني مختلف**

### رسائل الخطأ الشائعة:
- `otp_expired`: الرابط منتهي الصلاحية
- `access_denied`: تم رفض الوصول
- `invalid_token`: الرابط غير صالح
- `redirect_to_mismatch`: عدم تطابق URL إعادة التوجيه

## 🎯 النتيجة المتوقعة

بعد تطبيق هذه الإعدادات:
- ✅ الروابط تأخذ إلى صفحة إعادة تعيين كلمة المرور الصحيحة
- ✅ معالجة شاملة لأخطاء انتهاء الصلاحية
- ✅ رسائل خطأ واضحة ومفيدة
- ✅ نصائح لحل المشكلة
- ✅ تحسين تجربة المستخدم

**النظام الآن جاهز لمعالجة روابط إعادة تعيين كلمة المرور بشكل صحيح! 🚀**
