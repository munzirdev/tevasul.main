#!/usr/bin/env python3
"""
خادم مبسط لنظام الترجمة
Simple Translation System Server
"""

from flask import Flask, render_template_string, jsonify, request, redirect, url_for, send_file
from datetime import datetime
import uuid
import os
import qrcode
from PIL import Image
import io
import base64
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import pickle

app = Flask(__name__)

# إنشاء مجلد للملفات المؤقتة
UPLOAD_FOLDER = 'temp'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# إعدادات Google Drive
SERVICE_ACCOUNT_FILE = 'tevasul-service-account.json'
SCOPES = ['https://www.googleapis.com/auth/drive']
TEVASUL_UPLOADS_FOLDER = 'TEVASUL_UPLOADS'
TEVASUL_TRANSLATIONS_FOLDER = 'TEVASUL_TRANSLATIONS'

# متغيرات عامة لتخزين معرفات المجلدات
uploads_folder_id = None
translations_folder_id = None

def get_google_drive_service():
    """إنشاء خدمة Google Drive مع Service Account"""
    try:
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
            print(f"ملف Service Account غير موجود: {SERVICE_ACCOUNT_FILE}")
            return None
        
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build('drive', 'v3', credentials=credentials)
        return service
    except Exception as e:
        print(f"خطأ في إنشاء خدمة Google Drive: {e}")
        return None

def find_or_create_folder(service, folder_name):
    """البحث عن مجلد أو إنشاؤه إذا لم يكن موجوداً"""
    try:
        # البحث عن المجلد
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
        files = results.get('files', [])
        
        if files:
            return files[0]['id']
        else:
            # إنشاء المجلد الجديد
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            folder = service.files().create(body=folder_metadata, fields='id').execute()
            return folder.get('id')
    except Exception as e:
        print(f"خطأ في البحث/إنشاء المجلد {folder_name}: {e}")
        return None

def upload_file_to_drive(service, file_path, file_name, folder_id):
    """رفع ملف إلى Google Drive"""
    try:
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(file_path, resumable=True)
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,webViewLink'
        ).execute()
        
        return {
            'file_id': file.get('id'),
            'web_link': file.get('webViewLink'),
            'success': True
        }
    except Exception as e:
        print(f"خطأ في رفع الملف {file_name}: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def initialize_google_drive_folders():
    """تهيئة مجلدات Google Drive"""
    global uploads_folder_id, translations_folder_id
    
    service = get_google_drive_service()
    if not service:
        print("فشل في إنشاء خدمة Google Drive")
        return False
    
    # إنشاء أو العثور على مجلد TEVASUL_UPLOADS
    uploads_folder_id = find_or_create_folder(service, TEVASUL_UPLOADS_FOLDER)
    if not uploads_folder_id:
        print("فشل في إنشاء/العثور على مجلد TEVASUL_UPLOADS")
        return False
    
    # إنشاء أو العثور على مجلد TEVASUL_TRANSLATIONS
    translations_folder_id = find_or_create_folder(service, TEVASUL_TRANSLATIONS_FOLDER)
    if not translations_folder_id:
        print("فشل في إنشاء/العثور على مجلد TEVASUL_TRANSLATIONS")
        return False
    
    print(f"تم تهيئة مجلدات Google Drive بنجاح:")
    print(f"- TEVASUL_UPLOADS: {uploads_folder_id}")
    print(f"- TEVASUL_TRANSLATIONS: {translations_folder_id}")
    return True

# بيانات تجريبية
sample_projects = [
    {
        'id': 'proj-001',
        'title': 'ترجمة عقد عمل',
        'client_name': 'أحمد محمد',
        'client_email': 'ahmed@example.com',
        'source_language': 'العربية',
        'target_language': 'الإنجليزية',
        'translator_name': 'سارة أحمد',
        'translator_license': 'TR-2024-001',
        'created_at': '2024-01-15',
        'status': 'completed',
        'translated_content': 'This is a sample translation of the employment contract...',
        'original_content': 'هذا عقد عمل بين الطرفين...',
        'pdf_path': None,
        'qr_code': None
    },
    {
        'id': 'proj-002',
        'title': 'ترجمة شهادة جامعية',
        'client_name': 'فاطمة علي',
        'client_email': 'fatima@example.com',
        'source_language': 'العربية',
        'target_language': 'التركية',
        'translator_name': 'محمد حسن',
        'translator_license': 'TR-2024-002',
        'created_at': '2024-01-16',
        'status': 'in_progress',
        'translated_content': '',
        'original_content': '',
        'pdf_path': None,
        'qr_code': None
    }
]

# النماذج الجاهزة
templates = [
    {
        'id': 'template-001',
        'name': 'نموذج ترجمة تجريبي',
        'category': 'أخرى',
        'description': 'نموذج تجريبي لاختبار النظام',
        'source_language': 'العربية',
        'target_language': 'الإنجليزية',
        'type': 'custom',
        'variables': {
            'client_name': {'label': 'اسم العميل', 'translation': 'Client Name'},
            'client_email': {'label': 'بريد العميل', 'translation': 'Client Email'},
            'project_title': {'label': 'عنوان المشروع', 'translation': 'Project Title'},
            'project_date': {'label': 'تاريخ المشروع', 'translation': 'Project Date'},
            'translator_name': {'label': 'اسم المترجم', 'translation': 'Translator Name'}
        },
        'content': '''
        <h2>مشروع ترجمة</h2>
        <p><strong>عنوان المشروع:</strong> {project_title}</p>
        <p><strong>اسم العميل:</strong> {client_name}</p>
        <p><strong>بريد العميل:</strong> {client_email}</p>
        <p><strong>اسم المترجم:</strong> {translator_name}</p>
        <p><strong>تاريخ المشروع:</strong> {project_date}</p>
        
        <p>هذا نموذج تجريبي لاختبار نظام الترجمة.</p>
        '''
    },
    {
        'id': 'template-002',
        'name': 'نموذج شهادة بسيط',
        'category': 'أخرى',
        'description': 'نموذج شهادة بسيط للتجربة',
        'source_language': 'العربية',
        'target_language': 'الإنجليزية',
        'type': 'custom',
        'variables': {
            'person_name': {'label': 'اسم الشخص', 'translation': 'Person Name'},
            'certificate_type': {'label': 'نوع الشهادة', 'translation': 'Certificate Type'},
            'issue_date': {'label': 'تاريخ الإصدار', 'translation': 'Issue Date'},
            'issuer_name': {'label': 'اسم المصدر', 'translation': 'Issuer Name'}
        },
        'content': '''
        <h2>شهادة</h2>
        <p>تؤكد هذه الشهادة أن:</p>
        <p><strong>اسم الشخص:</strong> {person_name}</p>
        <p><strong>نوع الشهادة:</strong> {certificate_type}</p>
        <p><strong>تاريخ الإصدار:</strong> {issue_date}</p>
        <p><strong>اسم المصدر:</strong> {issuer_name}</p>
        
        <p>وتصدر هذه الشهادة للاستخدام الرسمي.</p>
        '''
    }
]

sample_translators = [
    {
        'id': 'translator-001',
        'name': 'سارة أحمد',
        'license_number': 'TR-2024-001',
        'email': 'sara@example.com',
        'phone': '+90 555 123 4567',
        'languages': ['العربية', 'الإنجليزية', 'التركية']
    },
    {
        'id': 'translator-002',
        'name': 'محمد حسن',
        'license_number': 'TR-2024-002',
        'email': 'mohammed@example.com',
        'phone': '+90 555 987 6543',
        'languages': ['العربية', 'التركية', 'الألمانية']
    }
]

def generate_qr_code(project_id):
    """إنشاء QR code للمشروع"""
    verification_url = f"http://localhost:5000/verify/{project_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # حفظ QR code كصورة
    qr_path = os.path.join(UPLOAD_FOLDER, f'qr_{project_id}.png')
    img.save(qr_path)
    
    return qr_path

def create_simple_pdf(project):
    """إنشاء PDF بسيط للمشروع"""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.lib.units import cm
        
        # إنشاء ملف PDF
        pdf_path = os.path.join(UPLOAD_FOLDER, f'project_{project["id"]}.pdf')
        doc = SimpleDocTemplate(pdf_path, pagesize=A4, 
                              leftMargin=2*cm, rightMargin=2*cm,
                              topMargin=3*cm, bottomMargin=2*cm)
        
        # إعداد الأنماط
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'ArabicTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # وسط
        )
        
        normal_style = ParagraphStyle(
            'ArabicNormal',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12
        )
        
        # محتوى PDF
        story = []
        
        # العنوان
        story.append(Paragraph("وثيقة الترجمة الرسمية", title_style))
        story.append(Spacer(1, 20))
        
        # معلومات المشروع
        story.append(Paragraph(f"<b>عنوان المشروع:</b> {project['title']}", normal_style))
        story.append(Paragraph(f"<b>اسم العميل:</b> {project['client_name']}", normal_style))
        story.append(Paragraph(f"<b>اللغة المصدر:</b> {project['source_language']}", normal_style))
        story.append(Paragraph(f"<b>اللغة الهدف:</b> {project['target_language']}", normal_style))
        story.append(Paragraph(f"<b>المترجم:</b> {project['translator_name']}", normal_style))
        story.append(Paragraph(f"<b>رقم الترخيص:</b> {project['translator_license']}", normal_style))
        story.append(Paragraph(f"<b>تاريخ الترجمة:</b> {project['created_at']}", normal_style))
        
        story.append(Spacer(1, 20))
        
        # الترجمة
        if project.get('translated_content'):
            story.append(Paragraph("<b>محتوى الترجمة:</b>", normal_style))
            story.append(Paragraph(project['translated_content'], normal_style))
            story.append(PageBreak())
        
        # المحتوى الأصلي (من الملف المرفوع)
        if project.get('original_content'):
            story.append(Paragraph("<b>المستند الأصلي:</b>", normal_style))
            story.append(Paragraph(project['original_content'], normal_style))
        
        # بناء PDF
        doc.build(story)
        
        return pdf_path
        
    except Exception as e:
        print(f"خطأ في إنشاء PDF: {e}")
        return None

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نظام الترجمة - الصفحة الرئيسية</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }
            .container {
                max-width: 1200px;
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
            .nav-buttons {
                text-align: center;
                margin-bottom: 30px;
            }
            .nav-btn {
                display: inline-block;
                padding: 12px 25px;
                margin: 0 10px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .nav-btn:hover {
                background-color: #2980b9;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-number {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .projects {
                margin-top: 30px;
            }
            .project-card {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
            }
            .project-title {
                color: #2c3e50;
                font-size: 1.2em;
                margin-bottom: 10px;
            }
            .project-details {
                color: #6c757d;
                font-size: 0.9em;
            }
            .verify-btn {
                display: inline-block;
                padding: 8px 16px;
                background-color: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
                margin-left: 10px;
            }
            .verify-btn:hover {
                background-color: #218838;
            }
            .edit-btn {
                display: inline-block;
                padding: 8px 16px;
                background-color: #ffc107;
                color: #212529;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
            }
            .edit-btn:hover {
                background-color: #e0a800;
            }
            .pdf-btn {
                display: inline-block;
                padding: 8px 16px;
                background-color: #dc3545;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
            }
            .pdf-btn:hover {
                background-color: #c82333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>نظام الترجمة المكتبي</h1>
            
                         <div class="nav-buttons">
                 <a href="/new-project" class="nav-btn">مشروع جديد</a>
                 <a href="/templates" class="nav-btn">النماذج الجاهزة</a>
                 <a href="/create-template" class="nav-btn" style="background-color: #28a745;">➕ إنشاء نموذج</a>
                 <a href="/manage-templates" class="nav-btn" style="background-color: #17a2b8;">⚙️ إدارة النماذج</a>
                 <a href="/translators" class="nav-btn">المترجمين</a>
                 <a href="/api/projects" class="nav-btn">API المشاريع</a>
             </div>
            
                         <div class="stats">
                 <div class="stat-card">
                     <div class="stat-number">2</div>
                     <div>إجمالي المشاريع</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">1</div>
                     <div>مشاريع مكتملة</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">1</div>
                     <div>مشاريع قيد التنفيذ</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">2</div>
                     <div>المترجمين</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">2</div>
                     <div>النماذج الجاهزة</div>
                 </div>
                 <div class="stat-card">
                     <div class="stat-number">9</div>
                     <div>متغيرات قابلة للتخصيص</div>
                 </div>
             </div>
            
            <div class="projects">
                <h2>المشاريع الأخيرة</h2>
                <div class="project-card">
                    <div class="project-title">ترجمة عقد عمل</div>
                    <div class="project-details">
                        العميل: أحمد محمد | المترجم: سارة أحمد<br>
                        من العربية إلى الإنجليزية | التاريخ: 2024-01-15
                    </div>
                    <a href="/verify/proj-001" class="verify-btn">تحقق من الوثيقة</a>
                    <a href="/edit-project/proj-001" class="edit-btn">تعديل المشروع</a>
                    <a href="/generate-pdf/proj-001" class="pdf-btn">إنشاء PDF</a>
                </div>
                <div class="project-card">
                    <div class="project-title">ترجمة شهادة جامعية</div>
                    <div class="project-details">
                        العميل: فاطمة علي | المترجم: محمد حسن<br>
                        من العربية إلى التركية | التاريخ: 2024-01-16
                    </div>
                    <a href="/verify/proj-002" class="verify-btn">تحقق من الوثيقة</a>
                    <a href="/edit-project/proj-002" class="edit-btn">تعديل المشروع</a>
                    <a href="/generate-pdf/proj-002" class="pdf-btn">إنشاء PDF</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/new-project', methods=['GET', 'POST'])
def new_project():
    """صفحة إنشاء مشروع جديد"""
    if request.method == 'POST':
        # معالجة البيانات المرسلة
        project_data = {
            'id': f'proj-{str(uuid.uuid4())[:8]}',
            'title': request.form.get('title'),
            'client_name': request.form.get('client_name'),
            'client_email': request.form.get('client_email'),
            'source_language': request.form.get('source_language'),
            'target_language': request.form.get('target_language'),
            'translator_id': request.form.get('translator_id'),
            'created_at': datetime.now().strftime('%Y-%m-%d'),
            'status': 'new',
            'translated_content': '',
            'original_content': '',
            'pdf_path': None,
            'qr_code': None
        }
        
        # إضافة المشروع للقائمة
        sample_projects.append(project_data)
        
        return redirect('/')
    
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مشروع ترجمة جديد</title>
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
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #2c3e50;
            }
            input, select, textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            }
            textarea {
                height: 100px;
                resize: vertical;
            }
            .btn {
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
            }
            .btn:hover {
                background-color: #2980b9;
            }
            .btn-secondary {
                background-color: #6c757d;
            }
            .btn-secondary:hover {
                background-color: #5a6268;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>مشروع ترجمة جديد</h1>
            
            <form method="POST" onsubmit="tinymce.triggerSave()">
                <div class="form-group">
                    <label for="title">عنوان المشروع:</label>
                    <input type="text" id="title" name="title" required>
                </div>
                
                <div class="form-group">
                    <label for="client_name">اسم العميل:</label>
                    <input type="text" id="client_name" name="client_name" required>
                </div>
                
                <div class="form-group">
                    <label for="client_email">بريد العميل:</label>
                    <input type="email" id="client_email" name="client_email" required>
                </div>
                
                <div class="form-group">
                    <label for="source_language">اللغة المصدر:</label>
                    <select id="source_language" name="source_language" required>
                        <option value="">اختر اللغة المصدر</option>
                        <option value="العربية">العربية</option>
                        <option value="الإنجليزية">الإنجليزية</option>
                        <option value="التركية">التركية</option>
                        <option value="الألمانية">الألمانية</option>
                        <option value="الفرنسية">الفرنسية</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="target_language">اللغة الهدف:</label>
                    <select id="target_language" name="target_language" required>
                        <option value="">اختر اللغة الهدف</option>
                        <option value="العربية">العربية</option>
                        <option value="الإنجليزية">الإنجليزية</option>
                        <option value="التركية">التركية</option>
                        <option value="الألمانية">الألمانية</option>
                        <option value="الفرنسية">الفرنسية</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="translator_id">المترجم:</label>
                    <select id="translator_id" name="translator_id" required>
                        <option value="">اختر المترجم</option>
                        <option value="translator-001">سارة أحمد (TR-2024-001)</option>
                        <option value="translator-002">محمد حسن (TR-2024-002)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="notes">ملاحظات:</label>
                    <textarea id="notes" name="notes" placeholder="أي ملاحظات إضافية..."></textarea>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn">إنشاء المشروع</button>
                    <a href="/" class="btn btn-secondary">إلغاء</a>
                </div>
            </form>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/generate-pdf/<project_id>')
def generate_pdf(project_id):
    """إنشاء PDF للمشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    # إنشاء QR code
    qr_path = generate_qr_code(project_id)
    project['qr_code'] = qr_path
    
    # إنشاء PDF
    pdf_path = create_simple_pdf(project)
    if pdf_path:
        project['pdf_path'] = pdf_path
        
        # رفع PDF إلى Google Drive
        service = get_google_drive_service()
        if service and translations_folder_id:
            pdf_filename = f"translation_{project_id}.pdf"
            upload_result = upload_file_to_drive(service, pdf_path, pdf_filename, translations_folder_id)
            if upload_result['success']:
                project['translation_pdf_drive_id'] = upload_result['file_id']
                project['translation_pdf_drive_link'] = upload_result['web_link']
                print(f"تم رفع PDF الترجمة إلى Google Drive: {upload_result['web_link']}")
            else:
                print(f"فشل في رفع PDF الترجمة إلى Google Drive: {upload_result.get('error', 'خطأ غير معروف')}")
        
        return send_file(pdf_path, as_attachment=True, download_name=f"translation_{project_id}.pdf")
    else:
        return "خطأ في إنشاء PDF", 500

@app.route('/download-pdf/<project_id>')
def download_pdf(project_id):
    """تحميل PDF المشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project or not project.get('pdf_path'):
        return "PDF غير موجود", 404
    
    return send_file(project['pdf_path'], as_attachment=True, download_name=f"translation_{project_id}.pdf")

@app.route('/qr-code/<project_id>')
def get_qr_code(project_id):
    """عرض QR code للمشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    # إنشاء QR code إذا لم يكن موجوداً
    if not project.get('qr_code'):
        qr_path = generate_qr_code(project_id)
        project['qr_code'] = qr_path
    
    return send_file(project['qr_code'], mimetype='image/png')

@app.route('/translators')
def translators():
    """صفحة المترجمين"""
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>المترجمين</title>
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
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }
            .translator-card {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .translator-name {
                color: #2c3e50;
                font-size: 1.3em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .translator-details {
                color: #6c757d;
                margin-bottom: 10px;
            }
            .languages {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 10px;
            }
            .language-tag {
                background: #3498db;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8em;
            }
            .back-btn {
                display: inline-block;
                padding: 12px 25px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
            .back-btn:hover {
                background-color: #5a6268;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>المترجمين</h1>
            
            <div class="translator-card">
                <div class="translator-name">سارة أحمد</div>
                <div class="translator-details">
                    رقم الترخيص: TR-2024-001<br>
                    البريد الإلكتروني: sara@example.com<br>
                    الهاتف: +90 555 123 4567
                </div>
                <div class="languages">
                    <span class="language-tag">العربية</span>
                    <span class="language-tag">الإنجليزية</span>
                    <span class="language-tag">التركية</span>
                </div>
            </div>
            
            <div class="translator-card">
                <div class="translator-name">محمد حسن</div>
                <div class="translator-details">
                    رقم الترخيص: TR-2024-002<br>
                    البريد الإلكتروني: mohammed@example.com<br>
                    الهاتف: +90 555 987 6543
                </div>
                <div class="languages">
                    <span class="language-tag">العربية</span>
                    <span class="language-tag">التركية</span>
                    <span class="language-tag">الألمانية</span>
                </div>
            </div>
            
            <a href="/" class="back-btn">العودة للصفحة الرئيسية</a>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/templates')
def templates_page():
    """صفحة النماذج الجاهزة"""
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>النماذج الجاهزة</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .header-actions {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 15px;
            }}
            .create-template-btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
            }}
            .create-template-btn:hover {{
                background-color: #218838;
            }}
            .manage-templates-btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #17a2b8;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
            }}
            .manage-templates-btn:hover {{
                background-color: #138496;
            }}
            .filters {{
                display: flex;
                gap: 15px;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }}
            .filter-btn {{
                padding: 8px 16px;
                background-color: #e9ecef;
                color: #495057;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
            }}
            .filter-btn.active {{
                background-color: #3498db;
                color: white;
            }}
            .templates-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }}
            .template-card {{
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                transition: transform 0.2s;
                position: relative;
            }}
            .template-card:hover {{
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }}
            .template-card.custom {{
                border-left: 4px solid #28a745;
            }}
            .template-card.default {{
                border-left: 4px solid #6c757d;
            }}
            .template-name {{
                color: #2c3e50;
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .template-category {{
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                margin-bottom: 10px;
            }}
            .template-description {{
                color: #6c757d;
                margin-bottom: 15px;
                line-height: 1.5;
            }}
            .template-languages {{
                color: #495057;
                font-size: 0.9em;
                margin-bottom: 15px;
            }}
            .template-actions {{
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }}
            .use-template-btn {{
                display: inline-block;
                padding: 8px 16px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
            }}
            .use-template-btn:hover {{
                background-color: #2980b9;
            }}
            .preview-template-btn {{
                display: inline-block;
                padding: 8px 16px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
            }}
            .preview-template-btn:hover {{
                background-color: #5a6268;
            }}
            .edit-template-btn {{
                display: inline-block;
                padding: 8px 16px;
                background-color: #ffc107;
                color: #212529;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
            }}
            .edit-template-btn:hover {{
                background-color: #e0a800;
            }}
            .delete-template-btn {{
                display: inline-block;
                padding: 8px 16px;
                background-color: #dc3545;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
            }}
            .delete-template-btn:hover {{
                background-color: #c82333;
            }}
            .back-btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .back-btn:hover {{
                background-color: #5a6268;
            }}
            .template-type-badge {{
                position: absolute;
                top: 10px;
                left: 10px;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.7em;
                font-weight: bold;
            }}
            .badge-custom {{
                background-color: #28a745;
                color: white;
            }}
            .badge-default {{
                background-color: #6c757d;
                color: white;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>النماذج الجاهزة</h1>
            
            <div class="header-actions">
                <div>
                    <a href="/create-template" class="create-template-btn">➕ إنشاء نموذج جديد</a>
                    <a href="/manage-templates" class="manage-templates-btn">⚙️ إدارة النماذج</a>
                </div>
            </div>
            
            <div class="templates-grid">
                {''.join([f'''
                <div class="template-card {template.get('type', 'default')}" data-category="{template['category']}" data-type="{template.get('type', 'default')}">
                    <div class="template-type-badge badge-{template.get('type', 'default')}">
                        {template.get('type', 'افتراضي')}
                    </div>
                    <div class="template-name">{template['name']}</div>
                    <div class="template-category">{template['category']}</div>
                    <div class="template-description">{template['description']}</div>
                    <div class="template-languages">{template['source_language']} → {template['target_language']}</div>
                    <div class="template-vars" style="font-size: 0.8em; color: #6c757d; margin-bottom: 10px;">
                        📝 {len(template.get('variables', {}))} متغير قابل للتخصيص
                    </div>
                    <div class="template-actions">
                        <a href="/preview-template/{template['id']}" class="preview-template-btn">معاينة</a>
                        <a href="/use-template/{template['id']}" class="use-template-btn">استخدام النموذج</a>
                        {f'<a href="/edit-template/{template["id"]}" class="edit-template-btn">تعديل</a>' if template.get('type') == 'custom' else ''}
                        {f'<a href="/delete-template/{template["id"]}" class="delete-template-btn" onclick="return confirm(\'هل أنت متأكد من حذف هذا النموذج؟\')">حذف</a>' if template.get('type') == 'custom' else ''}
                    </div>
                </div>
                ''' for template in templates])}
            </div>
            
            <a href="/" class="back-btn">العودة للصفحة الرئيسية</a>
        </div>
        
        <script>
            function filterTemplates(category) {{
                const cards = document.querySelectorAll('.template-card');
                const buttons = document.querySelectorAll('.filter-btn');
                
                // إزالة الفئة النشطة من جميع الأزرار
                buttons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر المحدد
                event.target.classList.add('active');
                
                cards.forEach(card => {{
                    if (category === 'all' || 
                        (category === 'custom' && card.dataset.type === 'custom') ||
                        (category !== 'custom' && card.dataset.category === category)) {{
                        card.style.display = 'block';
                    }} else {{
                        card.style.display = 'none';
                    }}
                }});
            }}
        </script>
    </body>
    </html>
    """
    return html

@app.route('/preview-template/<template_id>')
def preview_template(template_id):
    """معاينة النموذج"""
    template = next((t for t in templates if t['id'] == template_id), None)
    
    if not template:
        return "النموذج غير موجود", 404
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>معاينة النموذج - {template['name']}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .template-info {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }}
            .template-content {{
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 30px;
                line-height: 1.6;
            }}
            .template-content h2, .template-content h3 {{
                color: #2c3e50;
                margin-top: 20px;
                margin-bottom: 15px;
            }}
            .template-content p {{
                margin-bottom: 10px;
            }}
            .template-content ol, .template-content ul {{
                margin-bottom: 15px;
                padding-right: 20px;
            }}
            .template-content li {{
                margin-bottom: 5px;
            }}
            .btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-right: 10px;
                margin-top: 20px;
            }}
            .btn:hover {{
                background-color: #2980b9;
            }}
            .btn-secondary {{
                background-color: #6c757d;
            }}
            .btn-secondary:hover {{
                background-color: #5a6268;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>معاينة النموذج</h1>
            
                         <div class="template-info">
                 <h3>{template['name']}</h3>
                 <p><strong>الفئة:</strong> {template['category']}</p>
                 <p><strong>الوصف:</strong> {template['description']}</p>
                 <p><strong>اللغة:</strong> {template['source_language']} → {template['target_language']}</p>
                 
                 {f'''
                 <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                     <p><strong>متغيرات النموذج:</strong></p>
                     <ul style="margin: 10px 0; padding-right: 20px;">
                         {''.join([f'<li>{var_label}</li>' for var_label in template.get('variables', {}).values()])}
                     </ul>
                 </div>
                 ''' if template.get('variables') else ''}
             </div>
            
            <div class="template-content">
                {template['content']}
            </div>
            
            <a href="/use-template/{template_id}" class="btn">استخدام هذا النموذج</a>
            <a href="/templates" class="btn btn-secondary">العودة للنماذج</a>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/use-template/<template_id>')
def use_template(template_id):
    """استخدام النموذج في مشروع جديد"""
    template = next((t for t in templates if t['id'] == template_id), None)
    
    if not template:
        return "النموذج غير موجود", 404
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>استخدام النموذج - {template['name']}</title>
        <script src="https://cdn.tiny.cloud/1/q4ilba4ym3huvfbnobhdtydwjafrgu6wh1efdz6qvteiwkvb/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .form-group {{
                margin-bottom: 20px;
            }}
            label {{
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #2c3e50;
            }}
            input, select {{
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            }}
            .btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
            }}
            .btn:hover {{
                background-color: #2980b9;
            }}
            .btn-secondary {{
                background-color: #6c757d;
            }}
            .btn-secondary:hover {{
                background-color: #5a6268;
            }}
            .template-info {{
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>إنشاء مشروع من النموذج</h1>
            
            <div class="template-info">
                <strong>النموذج المستخدم:</strong> {template['name']}<br>
                <strong>الفئة:</strong> {template['category']}<br>
                <strong>اللغة:</strong> {template['source_language']} → {template['target_language']}
            </div>
            
                         <form method="POST" action="/create-from-template/{template_id}">
                 <div class="form-group">
                     <label for="title">عنوان المشروع:</label>
                     <input type="text" id="title" name="title" value="ترجمة {template['name']}" required>
                 </div>
                 
                 <div class="form-group">
                     <label for="client_name">اسم العميل:</label>
                     <input type="text" id="client_name" name="client_name" required>
                 </div>
                 
                 <div class="form-group">
                     <label for="client_email">بريد العميل:</label>
                     <input type="email" id="client_email" name="client_email" required>
                 </div>
                 
                 <div class="form-group">
                     <label for="translator_id">المترجم:</label>
                     <select id="translator_id" name="translator_id" required>
                         <option value="">اختر المترجم</option>
                         <option value="translator-001">سارة أحمد (TR-2024-001)</option>
                         <option value="translator-002">محمد حسن (TR-2024-002)</option>
                     </select>
                 </div>
                 
                 <div class="form-group">
                     <label style="font-size: 1.1em; color: #2c3e50; margin-bottom: 15px;">متغيرات النموذج:</label>
                     <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                         <p style="margin-bottom: 15px; color: #6c757d; font-size: 0.9em;">
                             💡 <strong>ملاحظة:</strong> املأ هذه الحقول لتخصيص النموذج حسب احتياجاتك
                         </p>
                         {''.join([f'''
                         <div class="form-group" style="margin-bottom: 15px;">
                             <label for="{var_key}" style="font-size: 0.9em; color: #495057;">{var_data['label'] if isinstance(var_data, dict) else var_data}:</label>
                             <input type="text" id="{var_key}" name="template_vars[{var_key}]" placeholder="أدخل {var_data['label'].lower() if isinstance(var_data, dict) else var_data.lower()}" style="font-size: 0.9em;">
                         </div>
                         ''' for var_key, var_data in template.get('variables', {}).items()])}
                     </div>
                 </div>
                 
                 <div class="form-group">
                     <label style="font-size: 1.0em; color: #2c3e50; margin-bottom:8px; display:block;">إدراج سريع للمتغيرات في محرر الترجمة:</label>
                     <div style="background:#f8f9fa; padding:10px; border-radius:6px; display:flex; flex-wrap:wrap; gap:8px;">
                         {''.join([f'<button type="button" onclick="insertVarToTranslated(\\\'{var_key}\\\')" style="background-color:#17a2b8;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">' + '{' + var_key + '}' + '</button>' for var_key in template.get('variables', {}).keys()])}
                     </div>
                 </div>

                 <div class="form-group">
                     <label for="translated_content">محتوى الترجمة ({template['target_language']}):</label>
                     <div style="background: #e8f4fd; padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; color: #2c3e50;">
                         💡 <strong>ملاحظة:</strong> المحتوى الأصلي سيتم تخصيصه تلقائياً حسب المتغيرات المدخلة. استخدم هذا المحرر لكتابة الترجمة.
                     </div>
                     <textarea id="translated_content" name="translated_content"></textarea>
                 </div>
             
             <div class="form-group">
                 <button type="submit" class="btn">إنشاء المشروع</button>
                 <a href="/templates" class="btn btn-secondary">إلغاء</a>
             </div>
         </form>
     </div>
     
     <script>
         // إعداد محرر الترجمة (اللغة الهدف)
         tinymce.init({
             selector: '#translated_content',
             directionality: '{'rtl' if template['target_language'] in ['العربية', 'التركية'] else 'ltr'}',
             language: '{'ar' if template['target_language'] == 'العربية' else 'en'}',
             height: 500,
             plugins: [
                 'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                 'insertdatetime', 'media', 'table', 'help', 'wordcount'
             ],
             toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | preview fullscreen',
             content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }',
             menubar: 'file edit view insert format tools table help',
             branding: false,
             elementpath: false,
             resize: true,
             setup: function(editor) {{
                 editor.on('init', function() {{
                     // إزالة required من textarea عند تهيئة المحرر
                     document.getElementById('translated_content').removeAttribute('required');
                 }});
             }}
         });

         function insertVarToTranslated(k) {{
             var t = '{{' + k + '}}';
             var editor = tinymce.get('translated_content');
             if (editor) {{
                 editor.insertContent(t);
             }} else {{
                 var ta = document.getElementById('translated_content');
                 if (ta) {{
                     var p = ta.selectionStart || 0;
                     ta.value = ta.value.slice(0, p) + t + ta.value.slice(p);
                 }}
             }}
         }}
     </script>
 </body>
 </html>
 """
 return html

@app.route('/create-from-template/<template_id>', methods=['POST'])
def create_from_template(template_id):
    """إنشاء مشروع من النموذج"""
    template = next((t for t in templates if t['id'] == template_id), None)
    
    if not template:
        return "النموذج غير موجود", 404
    
    # معالجة متغيرات النموذج
    template_vars = {}
    for key, value in request.form.items():
        if key.startswith('template_vars[') and key.endswith(']'):
            var_name = key[14:-1]  # استخراج اسم المتغير
            template_vars[var_name] = value
    
    # تخصيص المحتوى الأصلي باستخدام المتغيرات
    original_content = template['content']
    for var_name, var_value in template_vars.items():
        if var_value:  # إذا كان المتغير له قيمة
            original_content = original_content.replace(f'{{{var_name}}}', var_value)
        else:  # إذا كان المتغير فارغ، استبدله بـ "_________________"
            original_content = original_content.replace(f'{{{var_name}}}', '_________________')
    
    # المحتوى المترجم كما أدخله المستخدم
    translated_content = request.form.get('translated_content', '')
    
    # إنشاء مشروع جديد
    project_data = {
        'id': f'proj-{str(uuid.uuid4())[:8]}',
        'title': request.form.get('title'),
        'client_name': request.form.get('client_name'),
        'client_email': request.form.get('client_email'),
        'source_language': template['source_language'],
        'target_language': template['target_language'],
        'translator_id': request.form.get('translator_id'),
        'created_at': datetime.now().strftime('%Y-%m-%d'),
        'status': 'new',
        'translated_content': request.form.get('translated_content'),
        'original_content': original_content,  # المحتوى الأصلي المخصص
        'pdf_path': None,
        'qr_code': None
    }
    
    # إضافة المشروع للقائمة
    sample_projects.append(project_data)
    
    return redirect('/')

@app.route('/edit-project/<project_id>')
def edit_project(project_id):
    """صفحة تعديل المشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تعديل المشروع - {project['title']}</title>
        <script src="https://cdn.tiny.cloud/1/q4ilba4ym3huvfbnobhdtydwjafrgu6wh1efdz6qvteiwkvb/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .form-group {{
                margin-bottom: 20px;
            }}
            label {{
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #2c3e50;
            }}
            input, select {{
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            }}
            .btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
            }}
            .btn:hover {{
                background-color: #2980b9;
            }}
            .btn-secondary {{
                background-color: #6c757d;
            }}
            .btn-secondary:hover {{
                background-color: #5a6268;
            }}
            .status-badge {{
                display: inline-block;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8em;
                font-weight: bold;
                margin-bottom: 20px;
            }}
            .status-completed {{
                background-color: #28a745;
                color: white;
            }}
            .status-in-progress {{
                background-color: #ffc107;
                color: #212529;
            }}
            .status-new {{
                background-color: #6c757d;
                color: white;
            }}
            .editor-section {{
                margin-bottom: 30px;
            }}
            .editor-title {{
                font-size: 1.2em;
                color: #2c3e50;
                margin-bottom: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>تعديل المشروع</h1>
            
            <div class="status-badge status-{project['status']}">
                {project['status'].replace('_', ' ').title()}
            </div>
            
            {f'''
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">🔗 روابط Google Drive</h4>
                {f'<p style="margin: 5px 0;"><strong>المستند الأصلي:</strong> <a href="{project.get("google_drive_link", "#")}" target="_blank" style="color: #3498db;">عرض في Google Drive</a></p>' if project.get('google_drive_link') else '<p style="margin: 5px 0; color: #6c757d;">المستند الأصلي: لم يتم رفعه إلى Google Drive</p>'}
                {f'<p style="margin: 5px 0;"><strong>PDF الترجمة:</strong> <a href="{project.get("translation_pdf_drive_link", "#")}" target="_blank" style="color: #3498db;">عرض في Google Drive</a></p>' if project.get('translation_pdf_drive_link') else '<p style="margin: 5px 0; color: #6c757d;">PDF الترجمة: لم يتم رفعه إلى Google Drive</p>'}
            </div>
            ''' if project.get('google_drive_link') or project.get('translation_pdf_drive_link') else ''}
            
            <form method="POST" action="/update-project/{project_id}">
                <div class="form-group">
                    <label for="title">عنوان المشروع:</label>
                    <input type="text" id="title" name="title" value="{project['title']}" required>
                </div>
                
                <div class="form-group">
                    <label for="client_name">اسم العميل:</label>
                    <input type="text" id="client_name" name="client_name" value="{project['client_name']}" required>
                </div>
                
                <div class="form-group">
                    <label for="client_email">بريد العميل:</label>
                    <input type="email" id="client_email" name="client_email" value="{project['client_email']}" required>
                </div>
                
                <div class="editor-section">
                    <div class="editor-title">محرر الترجمة (اللغة الهدف: {project['target_language']})</div>
                    <div style="background: #e8f4fd; padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; color: #2c3e50;">
                        💡 <strong>ملاحظة:</strong> المحتوى الأصلي يأتي من الملف المرفوع (PDF/صورة). استخدم هذا المحرر لكتابة الترجمة.
                    </div>
                    <div style="margin-bottom: 10px;">
                        <button type="button" id="insert-var-btn" class="btn" style="background-color: #17a2b8;">إدراج متغير</button>
                    </div>
                    <textarea id="translated_content" name="translated_content">{project.get('translated_content', '')}</textarea>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn">حفظ التغييرات</button>
                    <a href="/upload-file/{project_id}" class="btn" style="background-color: #17a2b8;">رفع ملف</a>
                    <a href="/" class="btn btn-secondary">إلغاء</a>
                </div>
            </form>
        </div>
        
        <script>
            // إعداد محرر الترجمة (اللغة الهدف)
            tinymce.init({{
                selector: '#translated_content',
                directionality: '{'rtl' if project['target_language'] in ['العربية', 'التركية'] else 'ltr'}',
                language: '{'ar' if project['target_language'] == 'العربية' else 'en'}',
                height: 500,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'spellchecker'
                ],
                toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | preview fullscreen',
                content_style: 'body {{ font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }}',
                menubar: 'file edit view insert format tools table help',
                branding: false,
                elementpath: false,
                resize: true,
                spellchecker_language: '{'ar' if project['target_language'] == 'العربية' else 'en'}',
                spellchecker_rpc_url: 'https://spellchecker.tiny.cloud/',
                spellchecker_whitelist: ['{project['target_language'][:2].lower()}', 'en', 'ar']
            }});

            // إدراج متغير إلى محرر الترجمة أو مربع النص الاحتياطي
            document.addEventListener('click', function(e) {{
                if (e.target && e.target.id === 'insert-var-btn') {{
                    var key = prompt('أدخل اسم المتغير (مثل: client_name)');
                    if (!key) return;
                    var token = '{' + key + '}';
                    var editor = tinymce.get('translated_content');
                    if (editor) {{
                        editor.insertContent(token);
                    }} else {{
                        var ta = document.getElementById('translated_content');
                        if (ta) {{
                            var p = ta.selectionStart || 0;
                            ta.value = ta.value.slice(0, p) + token + ta.value.slice(p);
                        }}
                    }}
                }}
            }});
        </script>
    </body>
    </html>
    """
    return html

@app.route('/update-project/<project_id>', methods=['POST'])
def update_project(project_id):
    """تحديث المشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    # تحديث بيانات المشروع
    project['title'] = request.form.get('title')
    project['client_name'] = request.form.get('client_name')
    project['client_email'] = request.form.get('client_email')
    project['translated_content'] = request.form.get('translated_content')
    # المحتوى الأصلي لا يتغير - يأتي من الملف المرفوع
    
    return redirect('/')

@app.route('/verify/<project_id>')
def verify_document(project_id):
    """صفحة التحقق من الوثيقة"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    # إنشاء QR code إذا لم يكن موجوداً
    if not project.get('qr_code'):
        qr_path = generate_qr_code(project_id)
        project['qr_code'] = qr_path
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تحقق من الوثيقة - {project['title']}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
            }}
            .verification-badge {{
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .info-section {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 5px 0;
                border-bottom: 1px solid #dee2e6;
            }}
            .info-label {{
                font-weight: bold;
                color: #495057;
            }}
            .info-value {{
                color: #6c757d;
            }}
            .qr-section {{
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }}
            .qr-code {{
                max-width: 200px;
                margin: 0 auto;
            }}
            .back-btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .back-btn:hover {{
                background-color: #5a6268;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>تحقق من الوثيقة</h1>
                <div class="verification-badge">✓ وثيقة صحيحة ومصدقة</div>
            </div>
            
            <div class="info-section">
                <h3>معلومات المشروع</h3>
                <div class="info-row">
                    <span class="info-label">عنوان المشروع:</span>
                    <span class="info-value">{project['title']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">اسم العميل:</span>
                    <span class="info-value">{project['client_name']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">اللغة المصدر:</span>
                    <span class="info-value">{project['source_language']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">اللغة الهدف:</span>
                    <span class="info-value">{project['target_language']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">تاريخ الترجمة:</span>
                    <span class="info-value">{project['created_at']}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>معلومات المترجم</h3>
                <div class="info-row">
                    <span class="info-label">اسم المترجم:</span>
                    <span class="info-value">{project['translator_name']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">رقم الترخيص:</span>
                    <span class="info-value">{project['translator_license']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">تاريخ التحقق:</span>
                    <span class="info-value">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">معرف التحقق:</span>
                    <span class="info-value">{str(uuid.uuid4())[:8]}</span>
                </div>
            </div>
            
            <div class="qr-section">
                <h3>QR Code للتحقق</h3>
                <img src="/qr-code/{project_id}" alt="QR Code" class="qr-code">
                <p>امسح هذا الرمز للتحقق من صحة الوثيقة</p>
            </div>
            
            <a href="/" class="back-btn">العودة للصفحة الرئيسية</a>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/api/verify/<project_id>')
def api_verify_document(project_id):
    """API للتحقق من الوثيقة"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return jsonify({'error': 'المشروع غير موجود'}), 404
    
    verification_data = {
        'project_id': project['id'],
        'project_title': project['title'],
        'client_name': project['client_name'],
        'source_language': project['source_language'],
        'target_language': project['target_language'],
        'translator_name': project['translator_name'],
        'translator_license': project['translator_license'],
        'translation_date': project['created_at'],
        'verification_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'verification_id': str(uuid.uuid4()),
        'is_valid': True,
        'qr_code_url': f"http://localhost:5000/qr-code/{project_id}"
    }
    
    return jsonify(verification_data)

@app.route('/api/projects')
def api_projects():
    """API لقائمة المشاريع"""
    return jsonify(sample_projects)

@app.route('/api/translators')
def api_translators():
    """API لقائمة المترجمين"""
    return jsonify(sample_translators)

@app.route('/api/templates')
def api_templates():
    """API لقائمة النماذج الجاهزة"""
    return jsonify(templates)

@app.route('/api/templates/<template_id>')
def api_template_detail(template_id):
    """API لتفاصيل نموذج معين"""
    template = next((t for t in templates if t['id'] == template_id), None)
    
    if not template:
        return jsonify({'error': 'النموذج غير موجود'}), 404
    
    return jsonify(template)

@app.route('/upload-file/<project_id>', methods=['GET', 'POST'])
def upload_file(project_id):
    """صفحة رفع الملفات للمشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    if request.method == 'POST':
        # معالجة الملف المرفوع
        if 'file' not in request.files:
            return "لم يتم اختيار ملف", 400
        
        file = request.files['file']
        if file.filename == '':
            return "لم يتم اختيار ملف", 400
        
        if file:
            # حفظ الملف محلياً أولاً
            filename = f"{project_id}_{file.filename}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # رفع الملف إلى Google Drive
            service = get_google_drive_service()
            if service and uploads_folder_id:
                upload_result = upload_file_to_drive(service, file_path, filename, uploads_folder_id)
                if upload_result['success']:
                    # تحديث المشروع - حفظ معلومات Google Drive
                    project['original_file'] = file_path
                    project['original_content'] = f"تم رفع الملف: {file.filename}"
                    project['google_drive_id'] = upload_result['file_id']
                    project['google_drive_link'] = upload_result['web_link']
                    print(f"تم رفع الملف إلى Google Drive: {upload_result['web_link']}")
                else:
                    print(f"فشل في رفع الملف إلى Google Drive: {upload_result.get('error', 'خطأ غير معروف')}")
            else:
                # إذا فشل Google Drive، احفظ محلياً فقط
                project['original_file'] = file_path
                project['original_content'] = f"تم رفع الملف: {file.filename}"
                print("فشل في الاتصال بـ Google Drive، تم الحفظ محلياً فقط")
            
            return redirect(f'/edit-project/{project_id}')
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رفع ملف - {project['title']}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .form-group {{
                margin-bottom: 20px;
            }}
            label {{
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #2c3e50;
            }}
            input, select {{
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            }}
            .btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
            }}
            .btn:hover {{
                background-color: #2980b9;
            }}
            .btn-secondary {{
                background-color: #6c757d;
            }}
            .btn-secondary:hover {{
                background-color: #5a6268;
            }}
            .file-info {{
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>رفع ملف للمشروع</h1>
            
            <div class="file-info">
                <strong>المشروع:</strong> {project['title']}<br>
                <strong>العميل:</strong> {project['client_name']}<br>
                <strong>اللغة:</strong> {project['source_language']} → {project['target_language']}
            </div>
            
            <form method="POST" enctype="multipart/form-data">
                                 <div class="form-group">
                     <label for="file_type">نوع الملف:</label>
                     <select id="file_type" name="file_type" required>
                         <option value="original">المستند الأصلي (PDF/صورة)</option>
                     </select>
                 </div>
                
                                 <div class="form-group">
                     <label for="file">اختر الملف:</label>
                     <input type="file" id="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required>
                     <small>الملفات المدعومة: PDF, JPG, JPEG, PNG</small>
                 </div>
                
                <div class="form-group">
                    <button type="submit" class="btn">رفع الملف</button>
                    <a href="/edit-project/{project_id}" class="btn btn-secondary">إلغاء</a>
                </div>
            </form>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/create-template', methods=['GET', 'POST'])
def create_template():
    """صفحة إنشاء نموذج جديد"""
    if request.method == 'POST':
        # معالجة البيانات المرسلة
        template_data = {
            'id': f'template-{str(uuid.uuid4())[:8]}',
            'name': request.form.get('name'),
            'category': request.form.get('category'),
            'description': request.form.get('description'),
            'source_language': request.form.get('source_language'),
            'target_language': request.form.get('target_language'),
            'type': 'custom',
            'variables': {},
            'content': request.form.get('content')
        }
        
        # معالجة المتغيرات
        variables = {}
        for key, value in request.form.items():
            if key.startswith('var_name_') and value:
                var_index = key.replace('var_name_', '')
                var_label = value
                var_key = request.form.get(f'var_key_{var_index}', '').strip()
                if var_key:
                    variables[var_key] = var_label
        
        template_data['variables'] = variables
        
        # إضافة النموذج للقائمة
        templates.append(template_data)
        
        return redirect('/templates')
    
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إنشاء نموذج جديد</title>
        <script src="https://cdn.tiny.cloud/1/q4ilba4ym3huvfbnobhdtydwjafrgu6wh1efdz6qvteiwkvb/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }
            .container {
                max-width: 1200px;
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
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #2c3e50;
            }
            input, select, textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            }
            textarea {
                height: 100px;
                resize: vertical;
            }
            .btn {
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
            }
            .btn:hover {
                background-color: #2980b9;
            }
            .btn-secondary {
                background-color: #6c757d;
            }
            .btn-secondary:hover {
                background-color: #5a6268;
            }
            .variables-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .variable-row {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: center;
            }
            .variable-row input {
                flex: 1;
            }
            .add-variable-btn {
                background-color: #28a745;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }
            .add-variable-btn:hover {
                background-color: #218838;
            }
            .remove-variable-btn {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
            }
            .remove-variable-btn:hover {
                background-color: #c82333;
            }
            .insert-variable-btn {
                background-color: #17a2b8;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            .insert-variable-btn:hover {
                background-color: #138496;
            }
            .help-text {
                background: #e8f4fd;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                font-size: 0.9em;
                color: #2c3e50;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>إنشاء نموذج جديد</h1>
            
            <div class="help-text">
                <strong>💡 دليل إنشاء النموذج:</strong><br>
                1. املأ المعلومات الأساسية للنموذج<br>
                2. أضف المتغيرات - اكتب اسم المتغير وسيتم إنشاء المفتاح تلقائياً<br>
                3. اكتب محتوى النموذج باستخدام المتغيرات بين قوسين (مثل: {اسم_العميل})<br>
                4. احفظ النموذج واستخدمه في مشاريعك
            </div>
            
            <form method="POST" onsubmit="tinymce.triggerSave()">
                <div class="form-group">
                    <label for="name">اسم النموذج:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="category">الفئة:</label>
                    <select id="category" name="category" required>
                        <option value="">اختر الفئة</option>
                        <option value="عقود">عقود</option>
                        <option value="شهادات">شهادات</option>
                        <option value="أخرى">أخرى</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="description">وصف النموذج:</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="source_language">اللغة المصدر:</label>
                    <select id="source_language" name="source_language" required>
                        <option value="">اختر اللغة المصدر</option>
                        <option value="العربية">العربية</option>
                        <option value="الإنجليزية">الإنجليزية</option>
                        <option value="التركية">التركية</option>
                        <option value="الألمانية">الألمانية</option>
                        <option value="الفرنسية">الفرنسية</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="target_language">اللغة الهدف:</label>
                    <select id="target_language" name="target_language" required>
                        <option value="">اختر اللغة الهدف</option>
                        <option value="العربية">العربية</option>
                        <option value="الإنجليزية">الإنجليزية</option>
                        <option value="التركية">التركية</option>
                        <option value="الألمانية">الألمانية</option>
                        <option value="الفرنسية">الفرنسية</option>
                    </select>
                </div>
                
                <div class="variables-section">
                    <h3>متغيرات النموذج</h3>
                    <p style="color: #6c757d; font-size: 0.9em;">أضف المتغيرات - اكتب اسم المتغير وسيتم إنشاء المفتاح تلقائياً</p>
                    
                    <div id="variables-container">
                        <div class="variable-row">
                            <input type="text" name="var_name_0" placeholder="اسم المتغير (مثل: اسم العميل)" onchange="generateKey(this, 0)" required>
                            <input type="text" name="var_key_0" placeholder="مفتاح المتغير (سيتم إنشاؤه تلقائياً)" readonly>
                            <button type="button" class="insert-variable-btn" onclick="insertVariable(0)" title="إدراج المتغير في المحرر">📝</button>
                            <button type="button" class="remove-variable-btn" onclick="removeVariable(this)">حذف</button>
                        </div>
                    </div>
                    
                    <button type="button" class="add-variable-btn" onclick="addVariable()">➕ إضافة متغير جديد</button>
                </div>
                
                <div class="form-group">
                    <label for="content">محتوى النموذج:</label>
                    <div style="background: #e8f4fd; padding: 10px; border-radius: 5px; margin-bottom: 10px; font-size: 0.9em; color: #2c3e50;">
                        💡 <strong>ملاحظة:</strong> استخدم المتغيرات بين قوسين مثل {اسم_العميل} أو {client_name}
                    </div>
                    <textarea id="content" name="content" required></textarea>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn">إنشاء النموذج</button>
                    <a href="/templates" class="btn btn-secondary">إلغاء</a>
                </div>
            </form>
        </div>
        
        <script>
            let variableIndex = 1;
            
            function addVariable() {
                const container = document.getElementById('variables-container');
                const newRow = document.createElement('div');
                newRow.className = 'variable-row';
                newRow.innerHTML = `
                    <input type="text" name="var_name_${variableIndex}" placeholder="اسم المتغير (مثل: اسم العميل)" onchange="generateKey(this, ${variableIndex})" required>
                    <input type="text" name="var_key_${variableIndex}" placeholder="مفتاح المتغير (سيتم إنشاؤه تلقائياً)" readonly>
                    <button type="button" class="insert-variable-btn" onclick="insertVariable(${variableIndex})" title="إدراج المتغير في المحرر">📝</button>
                    <button type="button" class="remove-variable-btn" onclick="removeVariable(this)">حذف</button>
                `;
                container.appendChild(newRow);
                variableIndex++;
            }
            
            function generateKey(nameInput, index) {
                const name = nameInput.value.trim();
                if (name) {
                    // Convert Arabic text to English key
                    let key = name
                        .replace(/[أإآ]/g, 'a')
                        .replace(/[ب]/g, 'b')
                        .replace(/[ت]/g, 't')
                        .replace(/[ث]/g, 'th')
                        .replace(/[ج]/g, 'j')
                        .replace(/[ح]/g, 'h')
                        .replace(/[خ]/g, 'kh')
                        .replace(/[د]/g, 'd')
                        .replace(/[ذ]/g, 'dh')
                        .replace(/[ر]/g, 'r')
                        .replace(/[ز]/g, 'z')
                        .replace(/[س]/g, 's')
                        .replace(/[ش]/g, 'sh')
                        .replace(/[ص]/g, 's')
                        .replace(/[ض]/g, 'd')
                        .replace(/[ط]/g, 't')
                        .replace(/[ظ]/g, 'z')
                        .replace(/[ع]/g, 'a')
                        .replace(/[غ]/g, 'gh')
                        .replace(/[ف]/g, 'f')
                        .replace(/[ق]/g, 'q')
                        .replace(/[ك]/g, 'k')
                        .replace(/[ل]/g, 'l')
                        .replace(/[م]/g, 'm')
                        .replace(/[ن]/g, 'n')
                        .replace(/[ه]/g, 'h')
                        .replace(/[و]/g, 'w')
                        .replace(/[يى]/g, 'y')
                        .replace(/[ة]/g, 'a')
                        .replace(/[ء]/g, '')
                        .replace(/[^\w\s]/g, '') // Remove special characters
                        .replace(/\s+/g, '_') // Replace spaces with underscores
                        .toLowerCase();
                    
                    // Ensure key is not empty and add prefix if needed
                    if (key) {
                        document.querySelector(`input[name="var_key_${index}"]`).value = key;
                    }
                }
            }
            
            function removeVariable(button) {
                button.parentElement.remove();
            }
            
            function insertVariable(index) {
                const keyInput = document.querySelector(`input[name="var_key_${index}"]`);
                const nameInput = document.querySelector(`input[name="var_name_${index}"]`);
                
                if (keyInput && keyInput.value.trim()) {
                    const variableText = `{${keyInput.value.trim()}}`;
                    
                    // إدراج المتغير في محرر TinyMCE
                    if (tinymce.get('content')) {
                        tinymce.get('content').insertContent(variableText);
                    } else {
                        // إذا لم يكن TinyMCE جاهز، استخدم textarea العادي
                        const textarea = document.getElementById('content');
                        const cursorPos = textarea.selectionStart;
                        const textBefore = textarea.value.substring(0, cursorPos);
                        const textAfter = textarea.value.substring(cursorPos);
                        textarea.value = textBefore + variableText + textAfter;
                        
                        // تحديث موضع المؤشر
                        textarea.selectionStart = cursorPos + variableText.length;
                        textarea.selectionEnd = cursorPos + variableText.length;
                        textarea.focus();
                    }
                    
                    // إظهار رسالة تأكيد
                    showInsertMessage(nameInput.value.trim());
                } else {
                    alert('يرجى إدخال اسم المتغير أولاً');
                }
            }
            
            function showInsertMessage(variableName) {
                // إنشاء رسالة تأكيد مؤقتة
                const message = document.createElement('div');
                message.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 10000;
                    font-weight: bold;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                `;
                message.textContent = `تم إدراج المتغير: {${variableName}}`;
                document.body.appendChild(message);
                
                // إزالة الرسالة بعد ثانيتين
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 2000);
            }
            
            // إعداد محرر المحتوى
            tinymce.init({
                selector: '#content',
                directionality: 'rtl',
                language: 'ar',
                height: 400,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | preview fullscreen',
                content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }',
                menubar: 'file edit view insert format tools table help',
                branding: false,
                elementpath: false,
                resize: true,
                setup: function(editor) {
                    editor.on('init', function() {
                        // إزالة required من textarea عند تهيئة المحرر
                        document.getElementById('content').removeAttribute('required');
                    });
                }
            });
        </script>
    </body>
    </html>
    """
    return html

@app.route('/edit-template/<template_id>', methods=['GET', 'POST'])
def edit_template(template_id):
    """صفحة تعديل النموذج"""
    template = next((t for t in templates if t['id'] == template_id and t.get('type') == 'custom'), None)
    
    if not template:
        return "النموذج غير موجود أو لا يمكن تعديله", 404
    
    if request.method == 'POST':
        # تحديث بيانات النموذج
        template['name'] = request.form.get('name')
        template['category'] = request.form.get('category')
        template['description'] = request.form.get('description')
        template['source_language'] = request.form.get('source_language')
        template['target_language'] = request.form.get('target_language')
        template['content'] = request.form.get('content')
        
        # تحديث المتغيرات
        variables = {}
        for key, value in request.form.items():
            if key.startswith('var_name_') and value:
                var_index = key.replace('var_name_', '')
                var_label = value
                var_key = request.form.get(f'var_key_{var_index}', '').strip()
                if var_key:
                    variables[var_key] = var_label
        
        template['variables'] = variables
        
        return redirect('/templates')
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تعديل النموذج - {template['name']}</title>
        <script src="https://cdn.tiny.cloud/1/q4ilba4ym3huvfbnobhdtydwjafrgu6wh1efdz6qvteiwkvb/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .form-group {{
                margin-bottom: 20px;
            }}
            label {{
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #2c3e50;
            }}
            input, select, textarea {{
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            }}
            textarea {{
                height: 100px;
                resize: vertical;
            }}
            .btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
            }}
            .btn:hover {{
                background-color: #2980b9;
            }}
            .btn-secondary {{
                background-color: #6c757d;
            }}
            .btn-secondary:hover {{
                background-color: #5a6268;
            }}
            .variables-section {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .variable-row {{
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: center;
            }}
            .variable-row input {{
                flex: 1;
            }}
            .add-variable-btn {{
                background-color: #28a745;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }}
            .add-variable-btn:hover {{
                background-color: #218838;
            }}
            .remove-variable-btn {{
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
            }}
            .remove-variable-btn:hover {{
                background-color: #c82333;
            }}
            .insert-variable-btn {{
                background-color: #17a2b8;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }}
            .insert-variable-btn:hover {{
                background-color: #138496;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>تعديل النموذج</h1>
            
            <form method="POST">
                <div class="form-group">
                    <label for="name">اسم النموذج:</label>
                    <input type="text" id="name" name="name" value="{template['name']}" required>
                </div>
                
                <div class="form-group">
                    <label for="category">الفئة:</label>
                    <select id="category" name="category" required>
                        <option value="">اختر الفئة</option>
                        <option value="عقود" {'selected' if template['category'] == 'عقود' else ''}>عقود</option>
                        <option value="شهادات" {'selected' if template['category'] == 'شهادات' else ''}>شهادات</option>
                        <option value="أخرى" {'selected' if template['category'] == 'أخرى' else ''}>أخرى</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="description">وصف النموذج:</label>
                    <textarea id="description" name="description" required>{template['description']}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="source_language">اللغة المصدر:</label>
                    <select id="source_language" name="source_language" required>
                        <option value="">اختر اللغة المصدر</option>
                        <option value="العربية" {'selected' if template['source_language'] == 'العربية' else ''}>العربية</option>
                        <option value="الإنجليزية" {'selected' if template['source_language'] == 'الإنجليزية' else ''}>الإنجليزية</option>
                        <option value="التركية" {'selected' if template['source_language'] == 'التركية' else ''}>التركية</option>
                        <option value="الألمانية" {'selected' if template['source_language'] == 'الألمانية' else ''}>الألمانية</option>
                        <option value="الفرنسية" {'selected' if template['source_language'] == 'الفرنسية' else ''}>الفرنسية</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="target_language">اللغة الهدف:</label>
                    <select id="target_language" name="target_language" required>
                        <option value="">اختر اللغة الهدف</option>
                        <option value="العربية" {'selected' if template['target_language'] == 'العربية' else ''}>العربية</option>
                        <option value="الإنجليزية" {'selected' if template['target_language'] == 'الإنجليزية' else ''}>الإنجليزية</option>
                        <option value="التركية" {'selected' if template['target_language'] == 'التركية' else ''}>التركية</option>
                        <option value="الألمانية" {'selected' if template['target_language'] == 'الألمانية' else ''}>الألمانية</option>
                        <option value="الفرنسية" {'selected' if template['target_language'] == 'الفرنسية' else ''}>الفرنسية</option>
                    </select>
                </div>
                
                <div class="variables-section">
                    <h3>متغيرات النموذج</h3>
                    <p style="color: #6c757d; font-size: 0.9em;">أضف المتغيرات - اكتب اسم المتغير وسيتم إنشاء المفتاح تلقائياً</p>
                    
                    <div id="variables-container">
                        {''.join([f'''
                        <div class="variable-row">
                            <input type="text" name="var_name_{i}" value="{var_data['label'] if isinstance(var_data, dict) else var_data}" placeholder="اسم المتغير (مثل: اسم العميل)" onchange="generateKey(this, {i})" required>
                            <input type="text" name="var_key_{i}" value="{var_key}" placeholder="مفتاح المتغير (سيتم إنشاؤه تلقائياً)" readonly>
                            <button type="button" class="insert-variable-btn" onclick="insertVariable({i})" title="إدراج المتغير في المحرر">📝</button>
                            <button type="button" class="remove-variable-btn" onclick="removeVariable(this)">حذف</button>
                        </div>
                        ''' for i, (var_key, var_data) in enumerate(template.get('variables', {}).items())])}
                    </div>
                    
                    <button type="button" class="add-variable-btn" onclick="addVariable()">➕ إضافة متغير جديد</button>
                </div>
                
                <div class="form-group">
                    <label for="content">محتوى النموذج:</label>
                    <textarea id="content" name="content" required>{template['content']}</textarea>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn">حفظ التغييرات</button>
                    <a href="/templates" class="btn btn-secondary">إلغاء</a>
                </div>
            </form>
        </div>
        
        <script>
            let variableIndex = {len(template.get('variables', {}))};
            
            function addVariable() {{
                const container = document.getElementById('variables-container');
                const newRow = document.createElement('div');
                newRow.className = 'variable-row';
                newRow.innerHTML = `
                    <input type="text" name="var_name_${{variableIndex}}" placeholder="اسم المتغير (مثل: اسم العميل)" onchange="generateKey(this, ${{variableIndex}})" required>
                    <input type="text" name="var_key_${{variableIndex}}" placeholder="مفتاح المتغير (سيتم إنشاؤه تلقائياً)" readonly>
                    <input type="text" name="var_translation_${{variableIndex}}" placeholder="ترجمة المتغير (مثل: Client Name)" style="flex: 0.8;">
                    <button type="button" class="insert-variable-btn" onclick="insertVariable(${{variableIndex}})" title="إدراج المتغير في المحرر">📝</button>
                    <button type="button" class="remove-variable-btn" onclick="removeVariable(this)">حذف</button>
                `;
                container.appendChild(newRow);
                variableIndex++;
            }}
            
            function generateKey(nameInput, index) {{
                const name = nameInput.value.trim();
                if (name) {{
                    // Convert Arabic text to English key
                    let key = name
                        .replace(/[أإآ]/g, 'a')
                        .replace(/[ب]/g, 'b')
                        .replace(/[ت]/g, 't')
                        .replace(/[ث]/g, 'th')
                        .replace(/[ج]/g, 'j')
                        .replace(/[ح]/g, 'h')
                        .replace(/[خ]/g, 'kh')
                        .replace(/[د]/g, 'd')
                        .replace(/[ذ]/g, 'dh')
                        .replace(/[ر]/g, 'r')
                        .replace(/[ز]/g, 'z')
                        .replace(/[س]/g, 's')
                        .replace(/[ش]/g, 'sh')
                        .replace(/[ص]/g, 's')
                        .replace(/[ض]/g, 'd')
                        .replace(/[ط]/g, 't')
                        .replace(/[ظ]/g, 'z')
                        .replace(/[ع]/g, 'a')
                        .replace(/[غ]/g, 'gh')
                        .replace(/[ف]/g, 'f')
                        .replace(/[ق]/g, 'q')
                        .replace(/[ك]/g, 'k')
                        .replace(/[ل]/g, 'l')
                        .replace(/[م]/g, 'm')
                        .replace(/[ن]/g, 'n')
                        .replace(/[ه]/g, 'h')
                        .replace(/[و]/g, 'w')
                        .replace(/[يى]/g, 'y')
                        .replace(/[ة]/g, 'a')
                        .replace(/[ء]/g, '')
                        .replace(/[^\w\s]/g, '') // Remove special characters
                        .replace(/\s+/g, '_') // Replace spaces with underscores
                        .toLowerCase();
                    
                    // Ensure key is not empty and add prefix if needed
                    if (key) {{
                        document.querySelector(`input[name="var_key_${{index}}"]`).value = key;
                    }}
                }}
            }}
            
            function removeVariable(button) {{
                button.parentElement.remove();
            }}
            
            function insertVariable(index) {{
                const keyInput = document.querySelector(`input[name="var_key_${{index}}"]`);
                const nameInput = document.querySelector(`input[name="var_name_${{index}}"]`);
                
                if (keyInput && keyInput.value.trim()) {{
                    const variableText = `{{${{keyInput.value.trim()}}}}`;
                    
                    // إدراج المتغير في محرر TinyMCE
                    if (tinymce.get('content')) {{
                        tinymce.get('content').insertContent(variableText);
                    }} else {{
                        // إذا لم يكن TinyMCE جاهز، استخدم textarea العادي
                        const textarea = document.getElementById('content');
                        const cursorPos = textarea.selectionStart;
                        const textBefore = textarea.value.substring(0, cursorPos);
                        const textAfter = textarea.value.substring(cursorPos);
                        textarea.value = textBefore + variableText + textAfter;
                        
                        // تحديث موضع المؤشر
                        textarea.selectionStart = cursorPos + variableText.length;
                        textarea.selectionEnd = cursorPos + variableText.length;
                        textarea.focus();
                    }}
                    
                    // إظهار رسالة تأكيد
                    showInsertMessage(nameInput.value.trim());
                }} else {{
                    alert('يرجى إدخال اسم المتغير أولاً');
                }}
            }}
            
            function showInsertMessage(variableName) {{
                // إنشاء رسالة تأكيد مؤقتة
                const message = document.createElement('div');
                message.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 10000;
                    font-weight: bold;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                `;
                message.textContent = `تم إدراج المتغير: {{${{variableName}}}}`;
                document.body.appendChild(message);
                
                // إزالة الرسالة بعد ثانيتين
                setTimeout(() => {{
                    if (message.parentNode) {{
                        message.parentNode.removeChild(message);
                    }}
                }}, 2000);
            }}
            
            // إعداد محرر المحتوى
            tinymce.init({{
                selector: '#content',
                directionality: 'rtl',
                language: 'ar',
                height: 400,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | preview fullscreen',
                content_style: 'body {{ font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }}',
                menubar: 'file edit view insert format tools table help',
                branding: false,
                elementpath: false,
                resize: true,
                setup: function(editor) {{
                    editor.on('init', function() {{
                        // إزالة required من textarea عند تهيئة المحرر
                        document.getElementById('content').removeAttribute('required');
                    }});
                }}
            }});
        </script>
    </body>
    </html>
    """
    return html

@app.route('/delete-template/<template_id>')
def delete_template(template_id):
    """حذف النموذج"""
    template = next((t for t in templates if t['id'] == template_id and t.get('type') == 'custom'), None)
    
    if not template:
        return "النموذج غير موجود أو لا يمكن حذفه", 404
    
    templates.remove(template)
    return redirect('/templates')

@app.route('/manage-templates')
def manage_templates():
    """صفحة إدارة النماذج"""
    custom_templates = [t for t in templates if t.get('type') == 'custom']
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إدارة النماذج</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }}
            .header-actions {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }}
            .create-template-btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
            }}
            .create-template-btn:hover {{
                background-color: #218838;
            }}
            .templates-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }}
            .templates-table th,
            .templates-table td {{
                padding: 12px;
                text-align: right;
                border-bottom: 1px solid #dee2e6;
            }}
            .templates-table th {{
                background-color: #f8f9fa;
                font-weight: bold;
                color: #2c3e50;
            }}
            .templates-table tr:hover {{
                background-color: #f8f9fa;
            }}
            .action-btn {{
                display: inline-block;
                padding: 6px 12px;
                margin: 0 2px;
                text-decoration: none;
                border-radius: 3px;
                font-size: 12px;
            }}
            .edit-btn {{
                background-color: #ffc107;
                color: #212529;
            }}
            .edit-btn:hover {{
                background-color: #e0a800;
            }}
            .delete-btn {{
                background-color: #dc3545;
                color: white;
            }}
            .delete-btn:hover {{
                background-color: #c82333;
            }}
            .preview-btn {{
                background-color: #6c757d;
                color: white;
            }}
            .preview-btn:hover {{
                background-color: #5a6268;
            }}
            .back-btn {{
                display: inline-block;
                padding: 12px 25px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .back-btn:hover {{
                background-color: #5a6268;
            }}
            .empty-state {{
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>إدارة النماذج</h1>
            
            <div class="header-actions">
                <h3>النماذج الخاصة ({len(custom_templates)})</h3>
                <a href="/create-template" class="create-template-btn">➕ إنشاء نموذج جديد</a>
            </div>
            
            {f'''
            <table class="templates-table">
                <thead>
                    <tr>
                        <th>اسم النموذج</th>
                        <th>الفئة</th>
                        <th>اللغة</th>
                        <th>المتغيرات</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join([f'''
                    <tr>
                        <td>{template['name']}</td>
                        <td>{template['category']}</td>
                        <td>{template['source_language']} → {template['target_language']}</td>
                        <td>{len(template.get('variables', {}))} متغير</td>
                        <td>
                            <a href="/preview-template/{template['id']}" class="action-btn preview-btn">معاينة</a>
                            <a href="/edit-template/{template['id']}" class="action-btn edit-btn">تعديل</a>
                            <a href="/delete-template/{template['id']}" class="action-btn delete-btn" onclick="return confirm('هل أنت متأكد من حذف هذا النموذج؟')">حذف</a>
                        </td>
                    </tr>
                    ''' for template in custom_templates])}
                </tbody>
            </table>
            ''' if custom_templates else '''
            <div class="empty-state">
                <h3>لا توجد نماذج خاصة</h3>
                <p>لم تقم بإنشاء أي نماذج خاصة بعد. ابدأ بإنشاء نموذجك الأول!</p>
            </div>
            '''}
            
            <a href="/templates" class="back-btn">العودة للنماذج</a>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/health')
def health():
    """صفحة الحالة"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    print("🚀 بدء تشغيل خادم نظام الترجمة...")
    
    # تهيئة مجلدات Google Drive
    print("📁 جاري تهيئة مجلدات Google Drive...")
    if initialize_google_drive_folders():
        print("✅ تم تهيئة Google Drive بنجاح")
        print(f"   📂 TEVASUL_UPLOADS: {uploads_folder_id}")
        print(f"   📂 TEVASUL_TRANSLATIONS: {translations_folder_id}")
    else:
        print("❌ فشل في تهيئة Google Drive - سيتم العمل محلياً فقط")
    
    print("📱 الرابط: http://localhost:5000")
    print("🔍 صفحة التحقق: http://localhost:5000/verify/proj-001")
    print("📊 API: http://localhost:5000/api/projects")
    app.run(host='0.0.0.0', port=5000, debug=True)
