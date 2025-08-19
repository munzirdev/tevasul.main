@echo off
chcp 65001 >nul
echo ========================================
echo    نظام الترجمة المكتبي
echo    Translation Office System
echo ========================================
echo.

REM التحقق من وجود Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبت أو غير موجود في PATH
    echo يرجى تثبيت Python 3.8 أو أحدث
    pause
    exit /b 1
)

echo ✅ Python متوفر
echo.

REM التحقق من وجود البيئة الافتراضية
if not exist "venv" (
    echo 📦 إنشاء البيئة الافتراضية...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ فشل في إنشاء البيئة الافتراضية
        pause
        exit /b 1
    )
)

REM تفعيل البيئة الافتراضية
echo 🔄 تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تثبيت المكتبات
echo 📚 تثبيت المكتبات المطلوبة...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ فشل في تثبيت المكتبات
    pause
    exit /b 1
)

echo.
echo 🚀 تشغيل التطبيق...
echo.

REM تشغيل التطبيق
python run.py

echo.
echo 👋 تم إغلاق التطبيق
pause



