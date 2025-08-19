# نظام الترجمة المكتبي - Makefile
# Translation Office System - Makefile

.PHONY: help install run test clean build dist

# المتغيرات
PYTHON = python3
PIP = pip3
VENV = venv
PACKAGE_NAME = translation-office-system

# المساعدة
help:
	@echo "نظام الترجمة المكتبي - أوامر متاحة:"
	@echo "  install    - تثبيت التطبيق والتبعيات"
	@echo "  run        - تشغيل التطبيق"
	@echo "  test       - تشغيل الاختبارات"
	@echo "  clean      - تنظيف الملفات المؤقتة"
	@echo "  build      - بناء التطبيق"
	@echo "  dist       - إنشاء حزمة التوزيع"
	@echo "  standalone - تشغيل الواجهة المستقلة"
	@echo "  server     - تشغيل خادم التحقق فقط"
	@echo "  gui        - تشغيل الواجهة الرسومية فقط"

# التثبيت
install:
	@echo "📦 تثبيت التطبيق..."
	$(PYTHON) -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements.txt
	$(VENV)/bin/pip install -e .
	@echo "✅ تم التثبيت بنجاح"

# تشغيل التطبيق
run:
	@echo "🚀 تشغيل التطبيق..."
	$(VENV)/bin/python run.py

# تشغيل الواجهة المستقلة
standalone:
	@echo "🚀 تشغيل الواجهة المستقلة..."
	$(VENV)/bin/python run_standalone_quick.py

# تشغيل الاختبارات
test:
	@echo "🧪 تشغيل الاختبارات..."
	$(VENV)/bin/pytest tests/ -v

# تنظيف الملفات المؤقتة
clean:
	@echo "🧹 تنظيف الملفات المؤقتة..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/
	rm -rf dist/
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	@echo "✅ تم التنظيف"

# بناء التطبيق
build:
	@echo "🔨 بناء التطبيق..."
	$(VENV)/bin/python setup.py build

# إنشاء حزمة التوزيع
dist: clean
	@echo "📦 إنشاء حزمة التوزيع..."
	$(VENV)/bin/python setup.py sdist bdist_wheel

# تشغيل خادم التحقق فقط
server:
	@echo "🌐 تشغيل خادم التحقق..."
	$(VENV)/bin/python verification_server.py

# تشغيل الواجهة الرسومية فقط
gui:
	@echo "🖥️ تشغيل الواجهة الرسومية..."
	$(VENV)/bin/python main_window.py

# تثبيت التطبيق في وضع التطوير
dev-install:
	@echo "🔧 تثبيت التطبيق في وضع التطوير..."
	$(PYTHON) -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements.txt
	$(VENV)/bin/pip install -e .[dev]
	@echo "✅ تم التثبيت في وضع التطوير"

# فحص الكود
lint:
	@echo "🔍 فحص الكود..."
	$(VENV)/bin/flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	$(VENV)/bin/flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

# تنسيق الكود
format:
	@echo "🎨 تنسيق الكود..."
	$(VENV)/bin/black .

# فحص الأنواع
type-check:
	@echo "🔍 فحص الأنواع..."
	$(VENV)/bin/mypy .

# إنشاء قاعدة البيانات
init-db:
	@echo "🗄️ إنشاء قاعدة البيانات..."
	$(VENV)/bin/python -c "from models import TranslationManager; tm = TranslationManager(); print('تم إنشاء قاعدة البيانات')"

# نسخ احتياطي
backup:
	@echo "💾 إنشاء نسخة احتياطية..."
	tar -czf backup-$(shell date +%Y%m%d-%H%M%S).tar.gz --exclude=venv --exclude=__pycache__ --exclude=*.pyc .

# استعادة النسخة الاحتياطية
restore:
	@echo "📥 استعادة النسخة الاحتياطية..."
	@read -p "أدخل اسم ملف النسخة الاحتياطية: " backup_file; \
	tar -xzf $$backup_file

# تحديث التطبيق
update:
	@echo "🔄 تحديث التطبيق..."
	git pull origin main
	$(VENV)/bin/pip install -r requirements.txt --upgrade
	$(VENV)/bin/pip install -e . --upgrade
	@echo "✅ تم التحديث"

# معلومات النظام
info:
	@echo "📊 معلومات النظام:"
	@echo "Python: $(shell $(PYTHON) --version)"
	@echo "Pip: $(shell $(PIP) --version)"
	@echo "OS: $(shell uname -s)"
	@echo "Architecture: $(shell uname -m)"
