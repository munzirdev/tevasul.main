#!/bin/bash

echo "========================================"
echo "   نظام الترجمة المكتبي"
echo "   Translation Office System"
echo "========================================"
echo

# التحقق من وجود Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 غير مثبت"
    echo "يرجى تثبيت Python 3.8 أو أحدث"
    exit 1
fi

echo "✅ Python متوفر"
echo

# التحقق من وجود البيئة الافتراضية
if [ ! -d "venv" ]; then
    echo "📦 إنشاء البيئة الافتراضية..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ فشل في إنشاء البيئة الافتراضية"
        exit 1
    fi
fi

# تفعيل البيئة الافتراضية
echo "🔄 تفعيل البيئة الافتراضية..."
source venv/bin/activate

# تثبيت المكتبات
echo "📚 تثبيت المكتبات المطلوبة..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ فشل في تثبيت المكتبات"
    exit 1
fi

echo
echo "🚀 تشغيل التطبيق..."
echo

# تشغيل التطبيق
python run.py

echo
echo "�� تم إغلاق التطبيق"



