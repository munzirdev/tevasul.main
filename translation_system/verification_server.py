"""
نظام الترجمة المكتبي - خادم التحقق
Translation Office System - Verification Server
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
from flask import Flask, render_template, request, jsonify, send_file, abort
from datetime import datetime
import uuid

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, QR_CODE_BASE_URL
from models import TranslationManager
from google_drive_service import GoogleDriveService


class VerificationServer:
    """خادم التحقق من QR Code"""
    
    def __init__(self):
        self.app = Flask(__name__)
        self.translation_manager = TranslationManager()
        self.google_drive_service = None
        
        self.setup_routes()
        self.load_sample_data()
    
    def setup_routes(self):
        """إعداد مسارات الخادم"""
        
        @self.app.route('/')
        def index():
            """الصفحة الرئيسية"""
            return render_template('index.html')
        
        @self.app.route('/verify/<project_id>')
        def verify_document(project_id):
            """صفحة التحقق من الوثيقة"""
            project = self.translation_manager.get_project(project_id)
            if not project:
                abort(404, description="المشروع غير موجود")
            
            translator = self.translation_manager.get_translator(project.translator_id)
            
            verification_data = {
                'project': project,
                'translator': translator,
                'verification_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'verification_id': str(uuid.uuid4()),
                'is_valid': True
            }
            
            # إنشاء رابط معاينة Google Drive إن توفر معرّف الملف
            drive_view_url = None
            if project.google_drive_id:
                drive_view_url = f"https://drive.google.com/file/d/{project.google_drive_id}/preview"
            return render_template('verify.html', data=verification_data, drive_view_url=drive_view_url)
        
        @self.app.route('/api/verify/<project_id>')
        def api_verify_document(project_id):
            """API للتحقق من الوثيقة"""
            project = self.translation_manager.get_project(project_id)
            if not project:
                return jsonify({'error': 'المشروع غير موجود'}), 404
            
            translator = self.translation_manager.get_translator(project.translator_id)
            
            verification_data = {
                'project_id': project.id,
                'project_title': project.title,
                'client_name': project.client_name,
                'source_language': project.source_language,
                'target_language': project.target_language,
                'translator_name': translator.name if translator else "",
                'translator_license': translator.license_number if translator else "",
                'translation_date': project.created_at.strftime("%Y-%m-%d"),
                'verification_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'verification_id': str(uuid.uuid4()),
                'is_valid': True,
                'google_drive_url': project.google_drive_id,
                'qr_code_url': f"{QR_CODE_BASE_URL}{project.id}"
            }
            
            return jsonify(verification_data)
        
        @self.app.route('/document/<project_id>')
        def view_document(project_id):
            """عرض الوثيقة"""
            project = self.translation_manager.get_project(project_id)
            if not project:
                abort(404, description="المشروع غير موجود")
            
            if not project.final_pdf_path or not Path(project.final_pdf_path).exists():
                abort(404, description="الوثيقة غير موجودة")
            
            return send_file(project.final_pdf_path, mimetype='application/pdf')
        
        @self.app.route('/download/<project_id>')
        def download_document(project_id):
            """تحميل الوثيقة"""
            project = self.translation_manager.get_project(project_id)
            if not project:
                abort(404, description="المشروع غير موجود")
            
            if not project.final_pdf_path or not Path(project.final_pdf_path).exists():
                abort(404, description="الوثيقة غير موجودة")
            
            filename = f"{project.title.replace(' ', '_')}.pdf"
            return send_file(
                project.final_pdf_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
        
        @self.app.route('/api/projects')
        def api_get_projects():
            """API للحصول على قائمة المشاريع"""
            projects = self.translation_manager.get_all_projects()
            projects_data = []
            
            for project in projects:
                translator = self.translation_manager.get_translator(project.translator_id)
                project_data = {
                    'id': project.id,
                    'title': project.title,
                    'client_name': project.client_name,
                    'source_language': project.source_language,
                    'target_language': project.target_language,
                    'translator_name': translator.name if translator else "",
                    'status': project.status,
                    'created_at': project.created_at.strftime("%Y-%m-%d"),
                    'verification_url': f"{QR_CODE_BASE_URL}{project.id}"
                }
                projects_data.append(project_data)
            
            return jsonify(projects_data)
        
        @self.app.route('/api/translators')
        def api_get_translators():
            """API للحصول على قائمة المترجمين"""
            translators = self.translation_manager.get_all_translators()
            translators_data = []
            
            for translator in translators:
                translator_data = {
                    'id': translator.id,
                    'name': translator.name,
                    'license_number': translator.license_number,
                    'source_languages': translator.source_languages,
                    'target_languages': translator.target_languages,
                    'email': translator.email,
                    'phone': translator.phone,
                    'address': translator.address,
                    'is_active': translator.is_active
                }
                translators_data.append(translator_data)
            
            return jsonify(translators_data)
        
        @self.app.route('/health')
        def health_check():
            """فحص صحة الخادم"""
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0'
            })
        
        @self.app.errorhandler(404)
        def not_found(error):
            """معالج الأخطاء 404"""
            return render_template('404.html'), 404
        
        @self.app.errorhandler(500)
        def internal_error(error):
            """معالج الأخطاء 500"""
            return render_template('500.html'), 500
    
    def load_sample_data(self):
        """تحميل بيانات تجريبية"""
        # إضافة مترجم تجريبي
        translator = self.translation_manager.add_translator(
            name="أحمد محمد",
            license_number="TR-001",
            source_langs=["en", "tr"],
            target_langs=["ar"],
            email="ahmed@example.com",
            phone="+90 555 123 4567",
            address="إسطنبول، تركيا"
        )
        
        # إضافة مشروع تجريبي
        project = self.translation_manager.create_project(
            title="ترجمة عقد عمل",
            description="ترجمة عقد عمل من الإنجليزية إلى العربية",
            source_lang="en",
            target_lang="ar",
            translator_id=translator.id,
            client_name="شركة ABC",
            client_email="info@abc.com"
        )
        
        # تحديث المشروع ببيانات إضافية
        project.final_pdf_path = "sample_document.pdf"
        project.google_drive_id = "sample_drive_id"
        project.verification_url = f"{QR_CODE_BASE_URL}{project.id}"
    
    def start(self, host: str = None, port: int = None, debug: bool = None):
        """تشغيل الخادم"""
        host = host or FLASK_HOST
        port = port or FLASK_PORT
        debug = debug if debug is not None else FLASK_DEBUG
        
        print(f"تشغيل خادم التحقق على {host}:{port}")
        self.app.run(host=host, port=port, debug=debug)


def create_templates():
    """إنشاء قوالب HTML"""
    templates_dir = Path("templates")
    templates_dir.mkdir(exist_ok=True)
    
    # قالب الصفحة الرئيسية
    index_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام التحقق من الترجمة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .search-box {
            text-align: center;
            margin: 30px 0;
        }
        .search-input {
            padding: 12px 20px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 25px;
            width: 300px;
            margin-left: 10px;
        }
        .search-button {
            padding: 12px 25px;
            font-size: 16px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
        }
        .search-button:hover {
            background-color: #2980b9;
        }
        .info {
            background-color: #e8f4fd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>نظام التحقق من الترجمة</h1>
        
        <div class="search-box">
            <input type="text" id="projectId" class="search-input" placeholder="أدخل معرف المشروع...">
            <button onclick="verifyDocument()" class="search-button">تحقق من الوثيقة</button>
        </div>
        
        <div class="info">
            <h3>كيفية الاستخدام:</h3>
            <p>1. امسح رمز QR الموجود على الوثيقة</p>
            <p>2. أو أدخل معرف المشروع يدوياً</p>
            <p>3. اضغط على زر التحقق لعرض تفاصيل الوثيقة</p>
        </div>
        
        <div id="result"></div>
        
        <div class="footer">
            <p>© 2024 نظام الترجمة المكتبي - جميع الحقوق محفوظة</p>
        </div>
    </div>
    
    <script>
        function verifyDocument() {
            const projectId = document.getElementById('projectId').value.trim();
            if (!projectId) {
                alert('يرجى إدخال معرف المشروع');
                return;
            }
            
            fetch(`/api/verify/${projectId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        document.getElementById('result').innerHTML = 
                            `<div style="color: red; text-align: center; padding: 20px;">
                                <h3>خطأ</h3>
                                <p>${data.error}</p>
                            </div>`;
                    } else {
                        displayVerificationResult(data);
                    }
                })
                .catch(error => {
                    document.getElementById('result').innerHTML = 
                        `<div style="color: red; text-align: center; padding: 20px;">
                            <h3>خطأ في الاتصال</h3>
                            <p>فشل في الاتصال بالخادم</p>
                        </div>`;
                });
        }
        
        function displayVerificationResult(data) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
                <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #155724; text-align: center;">✅ وثيقة صحيحة</h3>
                    
                    <div style="margin: 20px 0;">
                        <h4>معلومات المشروع:</h4>
                        <p><strong>العنوان:</strong> ${data.project_title}</p>
                        <p><strong>العميل:</strong> ${data.client_name}</p>
                        <p><strong>اللغة المصدر:</strong> ${data.source_language}</p>
                        <p><strong>اللغة الهدف:</strong> ${data.target_language}</p>
                        <p><strong>تاريخ الترجمة:</strong> ${data.translation_date}</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h4>معلومات المترجم:</h4>
                        <p><strong>الاسم:</strong> ${data.translator_name}</p>
                        <p><strong>رقم الترخيص:</strong> ${data.translator_license}</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h4>معلومات التحقق:</h4>
                        <p><strong>تاريخ التحقق:</strong> ${data.verification_date}</p>
                        <p><strong>معرف التحقق:</strong> ${data.verification_id}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="/document/${data.project_id}" target="_blank" 
                           style="background-color: #28a745; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px; margin: 0 10px;">
                            عرض الوثيقة
                        </a>
                        <a href="/download/${data.project_id}" 
                           style="background-color: #17a2b8; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px; margin: 0 10px;">
                            تحميل الوثيقة
                        </a>
                    </div>
                </div>
            `;
        }
        
        // دعم Enter للبحث
        document.getElementById('projectId').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyDocument();
            }
        });
    </script>
</body>
</html>"""
    
    with open(templates_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(index_html)
    
    # قالب صفحة التحقق
    verify_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحقق من الوثيقة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #d4edda;
            border-radius: 10px;
        }
        .verification-badge {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            margin: 10px 0;
        }
        .project-info, .translator-info, .verification-info {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .project-info h3, .translator-info h3, .verification-info h3 {
            color: #2c3e50;
            margin-top: 0;
        }
        .document-viewer {
            margin: 30px 0;
            text-align: center;
        }
        .document-viewer iframe {
            width: 100%;
            height: 600px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .actions {
            text-align: center;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .btn-primary {
            background-color: #007bff;
            color: white;
        }
        .btn-success {
            background-color: #28a745;
            color: white;
        }
        .btn-info {
            background-color: #17a2b8;
            color: white;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تحقق من الوثيقة</h1>
            <div class="verification-badge">✅ وثيقة صحيحة ومصدقة</div>
        </div>
        
        <div class="project-info">
            <h3>معلومات المشروع</h3>
            <p><strong>العنوان:</strong> {{ data.project.title }}</p>
            <p><strong>العميل:</strong> {{ data.project.client_name }}</p>
            <p><strong>البريد الإلكتروني:</strong> {{ data.project.client_email }}</p>
            <p><strong>اللغة المصدر:</strong> {{ data.project.source_language }}</p>
            <p><strong>اللغة الهدف:</strong> {{ data.project.target_language }}</p>
            <p><strong>تاريخ الترجمة:</strong> {{ data.project.created_at.strftime('%Y-%m-%d') }}</p>
            <p><strong>حالة المشروع:</strong> {{ data.project.status }}</p>
        </div>
        
        <div class="translator-info">
            <h3>معلومات المترجم</h3>
            {% if data.translator %}
            <p><strong>الاسم:</strong> {{ data.translator.name }}</p>
            <p><strong>رقم الترخيص:</strong> {{ data.translator.license_number }}</p>
            <p><strong>البريد الإلكتروني:</strong> {{ data.translator.email }}</p>
            <p><strong>رقم الهاتف:</strong> {{ data.translator.phone }}</p>
            <p><strong>العنوان:</strong> {{ data.translator.address }}</p>
            <p><strong>اللغات المصدر:</strong> {{ ', '.join(data.translator.source_languages) }}</p>
            <p><strong>اللغات الهدف:</strong> {{ ', '.join(data.translator.target_languages) }}</p>
            {% else %}
            <p>معلومات المترجم غير متاحة</p>
            {% endif %}
        </div>
        
        <div class="verification-info">
            <h3>معلومات التحقق</h3>
            <p><strong>تاريخ التحقق:</strong> {{ data.verification_date }}</p>
            <p><strong>معرف التحقق:</strong> {{ data.verification_id }}</p>
            <p><strong>حالة التحقق:</strong> {% if data.is_valid %}صحيح{% else %}غير صحيح{% endif %}</p>
        </div>
        
        {% if data.project.final_pdf_path %}
        <div class="document-viewer">
            <h3>عرض الوثيقة</h3>
            <iframe src="/document/{{ data.project.id }}" frameborder="0"></iframe>
        </div>
        {% endif %}
        
        <div class="actions">
            {% if data.project.final_pdf_path %}
            <a href="/document/{{ data.project.id }}" target="_blank" class="btn btn-primary">عرض الوثيقة</a>
            <a href="/download/{{ data.project.id }}" class="btn btn-success">تحميل الوثيقة</a>
            {% endif %}
            <a href="/" class="btn btn-info">العودة للصفحة الرئيسية</a>
        </div>
        
        <div class="footer">
            <p>© 2024 نظام الترجمة المكتبي - جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>"""
    
    with open(templates_dir / "verify.html", "w", encoding="utf-8") as f:
        f.write(verify_html)
    
    # قالب صفحة الخطأ 404
    error_404_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>الصفحة غير موجودة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 100px auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e74c3c;
            font-size: 3em;
            margin-bottom: 20px;
        }
        .error-message {
            color: #7f8c8d;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <h2>الصفحة غير موجودة</h2>
        <div class="error-message">
            <p>عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
            <p>{{ error.description }}</p>
        </div>
        <a href="/" class="btn">العودة للصفحة الرئيسية</a>
    </div>
</body>
</html>"""
    
    with open(templates_dir / "404.html", "w", encoding="utf-8") as f:
        f.write(error_404_html)
    
    # قالب صفحة الخطأ 500
    error_500_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>خطأ في الخادم</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 100px auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e74c3c;
            font-size: 3em;
            margin-bottom: 20px;
        }
        .error-message {
            color: #7f8c8d;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>500</h1>
        <h2>خطأ في الخادم</h2>
        <div class="error-message">
            <p>عذراً، حدث خطأ في الخادم.</p>
            <p>يرجى المحاولة مرة أخرى لاحقاً.</p>
        </div>
        <a href="/" class="btn">العودة للصفحة الرئيسية</a>
    </div>
</body>
</html>"""
    
    with open(templates_dir / "500.html", "w", encoding="utf-8") as f:
        f.write(error_500_html)


def main():
    """الدالة الرئيسية"""
    # إنشاء القوالب
    create_templates()
    
    # إنشاء وتشغيل الخادم
    server = VerificationServer()
    server.start()


if __name__ == "__main__":
    main()
