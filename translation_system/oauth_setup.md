# إعداد Google Drive API مع OAuth 2.0

## للاستخدام الشخصي:

### 1. إنشاء OAuth 2.0 Credentials:
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك
3. اذهب إلى "APIs & Services" > "Credentials"
4. اضغط "Create Credentials" > "OAuth 2.0 Client IDs"
5. اختر "Desktop application"
6. املأ المعلومات:
   - Name: `Tevasul Translation System`
7. اضغط "Create"

### 2. تحميل ملف Credentials:
1. سيتم تحميل ملف JSON
2. احفظه باسم `credentials.json`

### 3. تفعيل Google Drive API:
1. اذهب إلى "APIs & Services" > "Library"
2. ابحث عن "Google Drive API"
3. اضغط عليه ثم "Enable"

### 4. تحديث الكود:
```python
# في simple_server.py
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.pickle'

def get_google_drive_service():
    """إنشاء خدمة Google Drive مع OAuth 2.0"""
    try:
        creds = None
        if os.path.exists(TOKEN_FILE):
            with open(TOKEN_FILE, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS_FILE, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(TOKEN_FILE, 'wb') as token:
                pickle.dump(creds, token)
        
        service = build('drive', 'v3', credentials=creds)
        return service
    except Exception as e:
        print(f"خطأ في إنشاء خدمة Google Drive: {e}")
        return None
```

## الملفات المطلوبة:
- `credentials.json` - ملف OAuth credentials
- `token.pickle` - سيتم إنشاؤه تلقائياً



