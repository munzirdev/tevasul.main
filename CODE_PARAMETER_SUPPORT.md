# دعم معامل Code في روابط إعادة تعيين كلمة المرور

## 🚨 المشكلة التي تم حلها

كانت الروابط من Supabase تحتوي على معامل `code` بدلاً من `access_token`، مما كان يجعل الكود لا يتعرف عليها كروابط صحيحة.

**مثال على الرابط الذي كان لا يعمل:**
```
https://tevasul.group/reset-password?code=9d2e962f-1c39-4a93-b0b3-c38081a34f13
```

## ✅ الحل المطبق

تم إضافة دعم لمعامل `code` في كل من:

### 1. `src/App.tsx` - اكتشاف الروابط:

```typescript
// Handle password reset links from email
console.log('Checking password reset link:', {
  path,
  search: location.search,
  hash: location.hash,
  hasError: location.search.includes('error=') || location.hash.includes('error='),
  hasAccessToken: location.search.includes('access_token=') || location.hash.includes('access_token='),
  hasCode: location.search.includes('code=') || location.hash.includes('code=')
});

if ((path === '/' || path === '/reset-password') && 
    (location.search.includes('error=') || location.search.includes('access_token=') || location.search.includes('code=') ||
     location.hash.includes('error=') || location.hash.includes('access_token=') || location.hash.includes('code='))) {
  console.log('Detected password reset link, opening reset password modal');
  setShowResetPasswordModal(true);
  return;
}

// Handle direct access to reset-password page - ONLY if user has valid reset parameters
if (path === '/reset-password') {
  const hasValidResetParams = location.search.includes('access_token=') || 
                             location.search.includes('type=recovery') ||
                             location.search.includes('code=') ||
                             location.hash.includes('access_token=') ||
                             location.hash.includes('type=recovery') ||
                             location.hash.includes('code=');
  
  if (hasValidResetParams) {
    console.log('Valid reset password link detected, opening modal');
    setShowResetPasswordModal(true);
    return;
  } else {
    console.log('Direct access to reset-password page without valid parameters - redirecting to home');
    navigate('/', { replace: true });
    return;
  }
}
```

### 2. `src/components/ResetPasswordModal.tsx` - معالجة Code:

```typescript
// Check for URL parameters from email link
const accessToken = searchParams.get('access_token');
const refreshToken = searchParams.get('refresh_token');
const type = searchParams.get('type');
const code = searchParams.get('code');

// Also check for hash fragment parameters
const hash = window.location.hash;
const hashParams = new URLSearchParams(hash.substring(1));
const hashAccessToken = hashParams.get('access_token');
const hashRefreshToken = hashParams.get('refresh_token');
const hashType = hashParams.get('type');
const hashCode = hashParams.get('code');

// Use either URL params or hash params
const finalCode = code || hashCode;

// If we have a code, exchange it for tokens
if (finalCode) {
  console.log('Code found, attempting to exchange for session...');
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(finalCode);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      setError(isArabic ? 'رابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link');
      setIsValidToken(false);
      return;
    }
    
    if (data.session) {
      console.log('Session established from code:', data.session.user.email);
      setIsValidToken(true);
      setEmail(data.session.user.email);
      return;
    }
  } catch (err) {
    console.error('Error with code exchange:', err);
    setError(isArabic ? 'رابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link');
    setIsValidToken(false);
    return;
  }
}
```

## 🎯 كيفية العمل

### السيناريو 1 - رابط مع `code`:
1. المستخدم يضغط على رابط من البريد الإلكتروني مثل: `?code=abc123`
2. الكود يكتشف معامل `code`
3. يفتح المودال ويستدعي `supabase.auth.exchangeCodeForSession()`
4. يحول الـ `code` إلى session كاملة
5. المستخدم يمكنه إدخال كلمة المرور الجديدة

### السيناريو 2 - رابط مع `access_token` (النظام القديم):
1. المستخدم يضغط على رابط مع `access_token` و `refresh_token`
2. الكود يكتشف هذه المعاملات
3. يفتح المودال ويستدعي `supabase.auth.setSession()`
4. يعين الجلسة مباشرة
5. المستخدم يمكنه إدخال كلمة المرور الجديدة

### السيناريو 3 - وصول مباشر بدون معاملات:
1. المستخدم يذهب مباشرة إلى الصفحة
2. الكود يكتشف عدم وجود معاملات صحيحة
3. يعيد التوجيه إلى الصفحة الرئيسية

## 🔧 التفاصيل التقنية

### المعاملات المدعومة:
- ✅ `code` - كود التحقق من Supabase (الجديد)
- ✅ `access_token` + `refresh_token` - رموز الوصول المباشرة (القديم)
- ✅ `type=recovery` - نوع العملية
- ✅ `error` + `error_code` - معاملات الأخطاء

### API المستخدمة:
- `supabase.auth.exchangeCodeForSession(code)` - لتحويل الـ code إلى session
- `supabase.auth.setSession(tokens)` - لتعيين الجلسة مباشرة
- `supabase.auth.updateUser(password)` - لتحديث كلمة المرور

## 📋 اختبار الحل

### 1. اختبار رابط مع Code:
```
https://tevasul.group/reset-password?code=9d2e962f-1c39-4a93-b0b3-c38081a34f13
```
- يجب أن يفتح المودال
- يجب أن يعرض نموذج إدخال كلمة المرور الجديدة

### 2. اختبار رابط مع Access Token:
```
https://tevasul.group/reset-password?access_token=xxx&refresh_token=yyy&type=recovery
```
- يجب أن يعمل كما هو (النظام القديم)

### 3. اختبار الوصول المباشر:
```
https://tevasul.group/reset-password
```
- يجب أن يعيد التوجيه للصفحة الرئيسية

## 🎯 النتيجة المتوقعة

الآن الكود يدعم كلا النوعين من الروابط:
- ✅ الروابط الجديدة مع `code` parameter
- ✅ الروابط القديمة مع `access_token` + `refresh_token`
- ✅ رسائل خطأ واضحة
- ✅ حماية من الوصول غير المصرح به

**تم حل المشكلة بنجاح! الآن جميع أنواع روابط إعادة تعيين كلمة المرور تعمل بشكل صحيح. 🚀**
