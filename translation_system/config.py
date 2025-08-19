"""
نظام الترجمة المكتبي - ملف التكوين
Translation Office System - Configuration File
"""

import os
from pathlib import Path

# مسارات المجلدات
BASE_DIR = Path(__file__).parent
ASSETS_DIR = BASE_DIR / "assets"
TEMP_DIR = BASE_DIR / "temp"
LOGS_DIR = BASE_DIR / "logs"

# إنشاء المجلدات إذا لم تكن موجودة
for directory in [ASSETS_DIR, TEMP_DIR, LOGS_DIR]:
    directory.mkdir(exist_ok=True)

# إعدادات Google Drive
GOOGLE_DRIVE_CREDENTIALS_FILE = BASE_DIR / "credentials" / "credentials.json"
GOOGLE_DRIVE_TOKEN_FILE = BASE_DIR / "credentials" / "token.json"
GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")

# إعدادات التطبيق
APP_NAME = "نظام الترجمة المكتبي"
APP_VERSION = "1.0.0"
COMPANY_NAME = "مكتب الترجمة"
COMPANY_LOGO = ASSETS_DIR / "logo.png"

# إعدادات PDF
PDF_MARGIN_TOP = 3.0  # سم
PDF_MARGIN_BOTTOM = 2.0  # سم
PDF_MARGIN_LEFT = 2.0  # سم
PDF_MARGIN_RIGHT = 2.0  # سم

# إعدادات QR Code
QR_CODE_SIZE = 100
QR_CODE_BASE_URL = "https://your-domain.com/verify/"

# إعدادات Flask Server
FLASK_HOST = "localhost"
FLASK_PORT = 5000
FLASK_DEBUG = True

# اللغات المدعومة
SUPPORTED_LANGUAGES = {
    "ar": "العربية",
    "en": "English",
    "tr": "Türkçe",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "it": "Italiano",
    "ru": "Русский",
    "zh": "中文",
    "ja": "日本語"
}

# أنواع الملفات المدعومة
SUPPORTED_FILE_TYPES = {
    "docx": "Microsoft Word Document",
    "pdf": "PDF Document"
}
