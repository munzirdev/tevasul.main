# إعداد Google Drive API مع Service Account

## الخطوات المطلوبة:

### 1. إنشاء Service Account:
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك أو أنشئ مشروع جديد
3. اذهب إلى "APIs & Services" > "Credentials"
4. اضغط "Create Credentials" > "Service Account"
5. املأ المعلومات:
   - Name: `tevasul-drive-service`
   - Description: `Service account for Tevasul translation system`
6. اضغط "Create and Continue"
7. في "Grant this service account access to project":
   - Role: `Editor` أو `Owner`
8. اضغط "Done"

### 2. إنشاء Key للـ Service Account:
1. اضغط على Service Account الذي أنشأته
2. اذهب إلى "Keys" tab
3. اضغط "Add Key" > "Create new key"
4. اختر "JSON"
5. اضغط "Create"
6. سيتم تحميل ملف JSON - احفظه باسم `tevasul-service-account.json`

### 3. تفعيل Google Drive API:
1. اذهب إلى "APIs & Services" > "Library"
2. ابحث عن "Google Drive API"
3. اضغط عليه ثم "Enable"

### 4. إنشاء المجلدات في Google Drive:
1. اذهب إلى [Google Drive](https://drive.google.com/)
2. أنشئ مجلد باسم `TEVASUL_UPLOADS`
3. أنشئ مجلد باسم `TEVASUL_TRANSLATIONS`
4. شارك المجلدين مع Service Account email (سيظهر في ملف JSON)

### 5. تحديث الكود:
```python
# في simple_server.py
SERVICE_ACCOUNT_FILE = 'tevasul-service-account.json'

def get_google_drive_service():
    """إنشاء خدمة Google Drive مع Service Account"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build('drive', 'v3', credentials=credentials)
        return service
    except Exception as e:
        print(f"خطأ في إنشاء خدمة Google Drive: {e}")
        return None
```

## الملفات المطلوبة:
- `tevasul-service-account.json` - ملف Service Account
- تحديث `simple_server.py` لاستخدام Service Account

## الصلاحيات المطلوبة:
- `https://www.googleapis.com/auth/drive.file` - للوصول للملفات
- `https://www.googleapis.com/auth/drive` - لإدارة الملفات والمجلدات



