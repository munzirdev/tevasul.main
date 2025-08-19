# دليل إعداد Google Drive السريع

## الخطوات المطلوبة:

### 1. تحميل ملف Service Account:
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اذهب إلى "APIs & Services" > "Credentials"
3. اضغط على Service Account: `translation@tevasull.iam.gserviceaccount.com`
4. اذهب إلى "Keys" tab
5. اضغط "Add Key" > "Create new key"
6. اختر "JSON"
7. اضغط "Create"
8. **استبدل** محتوى ملف `tevasul-service-account.json` بالمحتوى الجديد

### 2. إنشاء المجلدات في Google Drive:
1. اذهب إلى [Google Drive](https://drive.google.com/)
2. أنشئ مجلد باسم `TEVASUL_UPLOADS`
3. أنشئ مجلد باسم `TEVASUL_TRANSLATIONS`
4. شارك المجلدين مع: `translation@tevasull.iam.gserviceaccount.com`
   - اضغط "Share" على كل مجلد
   - أضف الإيميل: `translation@tevasull.iam.gserviceaccount.com`
   - اختر "Editor" permissions

### 3. تشغيل المشروع:
```bash
python simple_server.py
```

## ملاحظات مهمة:
- تأكد من تفعيل Google Drive API في Google Cloud Console
- تأكد من أن Service Account لديه صلاحيات "Editor" على المشروع
- المجلدات يجب أن تكون مشتركة مع Service Account email



