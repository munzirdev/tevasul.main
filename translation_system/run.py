#!/usr/bin/env python3
"""
نظام الترجمة المكتبي - ملف التشغيل السريع
Translation Office System - Quick Run Script
"""

import sys
import os
from pathlib import Path

# إضافة المجلد الحالي إلى مسار Python
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def check_dependencies():
    """التحقق من وجود المكتبات المطلوبة"""
    required_packages = [
        'PyQt6',
        'reportlab',
        'python-docx',
        'google-auth',
        'qrcode',
        'Flask',
        'PyPDF2'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ المكتبات التالية مفقودة:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nقم بتثبيت المكتبات المطلوبة:")
        print("pip install -r requirements.txt")
        return False
    
    print("✅ جميع المكتبات متوفرة")
    return True

def check_config():
    """التحقق من إعدادات النظام"""
    config_file = current_dir / "config.py"
    if not config_file.exists():
        print("❌ ملف config.py مفقود")
        return False
    
    # التحقق من وجود المجلدات المطلوبة
    required_dirs = ["assets", "temp", "logs", "credentials"]
    for dir_name in required_dirs:
        dir_path = current_dir / dir_name
        if not dir_path.exists():
            dir_path.mkdir(exist_ok=True)
            print(f"📁 تم إنشاء مجلد {dir_name}")
    
    print("✅ إعدادات النظام صحيحة")
    return True

def main():
    """الدالة الرئيسية"""
    print("🚀 بدء تشغيل نظام الترجمة المكتبي")
    print("=" * 50)
    
    # التحقق من المتطلبات
    if not check_dependencies():
        sys.exit(1)
    
    if not check_config():
        sys.exit(1)
    
    print("\n🎯 جاري تشغيل التطبيق...")
    
    try:
        # استيراد وتشغيل التطبيق الرئيسي
        from main import main as run_app
        run_app()
    except KeyboardInterrupt:
        print("\n⏹️ تم إيقاف التطبيق بواسطة المستخدم")
    except Exception as e:
        print(f"\n❌ خطأ في تشغيل التطبيق: {e}")
        sys.exit(1)


def run_standalone():
    """تشغيل الواجهة المستقلة"""
    print("🚀 بدء تشغيل الواجهة المستقلة")
    print("=" * 50)
    
    # التحقق من المتطلبات
    if not check_dependencies():
        sys.exit(1)
    
    if not check_config():
        sys.exit(1)
    
    print("\n🎯 جاري تشغيل الواجهة المستقلة...")
    
    try:
        # استيراد وتشغيل الواجهة المستقلة
        from run_standalone import main as run_standalone_app
        run_standalone_app()
    except KeyboardInterrupt:
        print("\n⏹️ تم إيقاف التطبيق بواسطة المستخدم")
    except Exception as e:
        print(f"\n❌ خطأ في تشغيل الواجهة المستقلة: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
