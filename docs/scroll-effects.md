# تأثيرات التمرير (Scroll Effects)

## نظرة عامة

تم تطوير نظام متقدم لتأثيرات التمرير لتحسين تجربة المستخدم وجعل الموقع أكثر تفاعلية وجاذبية. النظام يتضمن ثلاثة أنواع من التأثيرات:

### 1. تأثيرات التمرير الأساسية (ScrollEffects)
- تأثيرات بسيطة ومحسنة للأداء
- مناسبة لجميع الأجهزة
- تأثيرات parallax خفيفة
- جزيئات عائمة
- مؤشر تقدم التمرير

### 2. تأثيرات التمرير المتقدمة (AdvancedScrollEffects)
- تأثيرات متقدمة مع حساب سرعة التمرير
- تفاعل مع حركة الماوس
- تأثيرات متعددة المستويات
- مؤشرات اتجاه وسرعة التمرير
- تأثيرات بصرية متقدمة

### 3. تأثيرات التمرير المحسنة للموبايل (MobileOptimizedScrollEffects)
- محسنة خصيصاً للأجهزة المحمولة
- تقليل عدد الجزيئات والتأثيرات
- تحسين الأداء على الأجهزة الضعيفة
- دعم اللمس بدلاً من الماوس

## المكونات

### ScrollEffects.tsx
```typescript
interface ScrollEffectsProps {
  isDarkMode: boolean;
  isVisible?: boolean;
}
```

**الميزات:**
- تأثيرات parallax خلفية
- جزيئات عائمة (15 جزيء)
- أيقونات متحركة
- مؤشر تقدم التمرير
- زر العودة للأعلى
- خطوط الطاقة
- تأثيرات النبض

### AdvancedScrollEffects.tsx
```typescript
interface AdvancedScrollEffectsProps {
  isDarkMode: boolean;
  isVisible?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}
```

**الميزات:**
- حساب سرعة التمرير
- تأثيرات تفاعلية مع الماوس
- مؤشرات اتجاه وسرعة التمرير
- تأثيرات متقدمة للخلفية
- جزيئات متقدمة مع أنواع مختلفة
- تأثيرات velocity-based

### MobileOptimizedScrollEffects.tsx
```typescript
interface MobileOptimizedScrollEffectsProps {
  isDarkMode: boolean;
  isVisible?: boolean;
}
```

**الميزات:**
- جزيئات مخفضة (8 جزيء)
- تأثيرات parallax خفيفة
- دعم اللمس
- تحسينات الأداء
- تأثيرات مبسطة

## التحكم في التأثيرات

### ScrollEffectsController.tsx
```typescript
interface ScrollEffectsControllerProps {
  isDarkMode: boolean;
  onToggleEffects: (enabled: boolean) => void;
  onToggleIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  onToggleAdvanced: (enabled: boolean) => void;
  effectsEnabled: boolean;
  effectsIntensity: 'low' | 'medium' | 'high';
  advancedEffects: boolean;
}
```

**الميزات:**
- تفعيل/إلغاء التأثيرات
- التحكم في شدة التأثيرات
- تفعيل التأثيرات المتقدمة
- حفظ الإعدادات في localStorage
- واجهة تحكم سهلة الاستخدام

## الاستخدام

### في App.tsx
```typescript
// حالات التأثيرات
const [scrollEffectsEnabled, setScrollEffectsEnabled] = useState(true);
const [scrollEffectsIntensity, setScrollEffectsIntensity] = useState<'low' | 'medium' | 'high'>('medium');
const [advancedScrollEffects, setAdvancedScrollEffects] = useState(false);
const [isMobile, setIsMobile] = useState(false);

// استخدام المكونات
{scrollEffectsEnabled && (
  isMobile ? (
    <MobileOptimizedScrollEffects 
      isDarkMode={isDarkMode} 
      isVisible={true} 
    />
  ) : advancedScrollEffects ? (
    <AdvancedScrollEffects 
      isDarkMode={isDarkMode} 
      isVisible={true} 
      intensity={scrollEffectsIntensity}
    />
  ) : (
    <ScrollEffects 
      isDarkMode={isDarkMode} 
      isVisible={true} 
    />
  )
)}
```

## الأنماط CSS

### scroll-effects.css
يحتوي على:
- أنماط شريط التمرير المخصص
- keyframes للرسوم المتحركة
- فئات مساعدة للرسوم المتحركة
- تحسينات الأداء
- دعم الأجهزة المحمولة
- دعم إمكانية الوصول

### الرسوم المتحركة المتاحة
- `animate-float`: تعويم أساسي
- `animate-float-slow`: تعويم بطيء
- `animate-float-reverse`: تعويم عكسي
- `animate-spin-slow`: دوران بطيء
- `animate-spin-fast`: دوران سريع
- `animate-pulse-slow`: نبض بطيء
- `animate-pulse-fast`: نبض سريع
- `animate-bounce-slow`: ارتداد بطيء
- `animate-bounce-fast`: ارتداد سريع
- `animate-sparkle`: توهج
- `animate-wave`: موجة
- `animate-glow`: توهج
- `animate-shimmer`: لمعان

## تحسينات الأداء

### تحسينات عامة
- استخدام `requestAnimationFrame` للتمرير
- `useCallback` و `useMemo` للتحسين
- `will-change` للعناصر المتحركة
- GPU acceleration

### تحسينات الموبايل
- تقليل عدد الجزيئات
- إلغاء الرسوم المتحركة المعقدة
- تقليل شدة parallax
- دعم `prefers-reduced-motion`

### تحسينات إمكانية الوصول
- دعم `prefers-reduced-motion`
- دعم `prefers-contrast: high`
- أنماط الطباعة
- تحسين التباين

## الإعدادات المحفوظة

يتم حفظ الإعدادات التالية في localStorage:
- `scrollEffectsEnabled`: تفعيل/إلغاء التأثيرات
- `scrollEffectsIntensity`: شدة التأثيرات
- `advancedScrollEffects`: تفعيل التأثيرات المتقدمة

## الكشف التلقائي

### كشف الأجهزة المحمولة
```typescript
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
```

### كشف تفضيلات المستخدم
- `prefers-reduced-motion`: تقليل الحركة
- `prefers-contrast: high`: تباين عالي
- `max-width: 768px`: الأجهزة المحمولة

## استكشاف الأخطاء

### مشاكل الأداء
1. تأكد من تفعيل GPU acceleration
2. تحقق من عدد الجزيئات
3. اختبر على الأجهزة المحمولة
4. تحقق من إعدادات الشدة

### مشاكل التوافق
1. تأكد من دعم المتصفح للـ CSS transforms
2. اختبر على متصفحات مختلفة
3. تحقق من إعدادات إمكانية الوصول

## التطوير المستقبلي

### ميزات مقترحة
- تأثيرات صوتية
- تأثيرات ثلاثية الأبعاد
- تفاعل مع الأجهزة المحمولة المتقدمة
- تأثيرات مخصصة حسب المحتوى
- دعم WebGL للتأثيرات المتقدمة

### تحسينات مقترحة
- تحسين الأداء أكثر
- إضافة المزيد من خيارات التخصيص
- دعم المزيد من الأجهزة
- تحسين إمكانية الوصول
