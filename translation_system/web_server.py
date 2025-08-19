#!/usr/bin/env python3
"""
خادم ويب مبسط لنظام الترجمة
Simple Web Server for Translation System
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

# بيانات تجريبية للمشاريع
sample_projects = [
    {
        'id': 'proj-001',
        'title': 'ترجمة عقد عمل',
        'client_name': 'أحمد محمد',
        'client_email': 'ahmed@example.com',
        'source_language': 'العربية',
        'target_language': 'English',
        'translator_id': 'translator-001',
        'created_at': '2024-01-15',
        'status': 'completed',
        'original_content': 'هذا عقد عمل بين الطرفين...',
        'translated_content': 'This is a work contract between the parties...',
        'pdf_path': None,
        'qr_code': None
    }
]

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

def initialize_google_drive_folders():
    """تهيئة مجلدات Google Drive"""
    global uploads_folder_id, translations_folder_id
    
    service = get_google_drive_service()
    if not service:
        return False
    
    try:
        uploads_folder_id = find_or_create_folder(service, TEVASUL_UPLOADS_FOLDER)
        translations_folder_id = find_or_create_folder(service, TEVASUL_TRANSLATIONS_FOLDER)
        
        return uploads_folder_id and translations_folder_id
    except Exception as e:
        print(f"خطأ في تهيئة مجلدات Google Drive: {e}")
        return False

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نظام الترجمة المكتبي</title>
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
                margin-bottom: 5px;
            }
            .stat-label {
                font-size: 0.9em;
                opacity: 0.9;
            }
            .actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .action-card {
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            }
            .action-card:hover {
                border-color: #3498db;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .action-icon {
                font-size: 2em;
                margin-bottom: 10px;
            }
            .action-title {
                font-size: 1.2em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .action-description {
                color: #6c757d;
                margin-bottom: 15px;
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }
            .btn:hover {
                background-color: #2980b9;
            }
            .recent-projects {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
            }
            .project-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 4px solid #3498db;
            }
            .project-title {
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            .project-meta {
                color: #6c757d;
                font-size: 0.9em;
            }
            .status-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: bold;
            }
            .status-completed {
                background-color: #d4edda;
                color: #155724;
            }
            .status-pending {
                background-color: #fff3cd;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 نظام الترجمة المكتبي</h1>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">""" + str(len(sample_projects)) + """</div>
                    <div class="stat-label">إجمالي المشاريع</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">""" + str(len([p for p in sample_projects if p['status'] == 'completed'])) + """</div>
                    <div class="stat-label">المشاريع المكتملة</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">""" + str(len([p for p in sample_projects if p['status'] == 'pending'])) + """</div>
                    <div class="stat-label">المشاريع المعلقة</div>
                </div>
            </div>
            
            <div class="actions">
                <div class="action-card">
                    <div class="action-icon">📝</div>
                    <div class="action-title">مشروع جديد</div>
                    <div class="action-description">إنشاء مشروع ترجمة جديد</div>
                    <a href="/new-project" class="btn">إنشاء مشروع</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">📋</div>
                    <div class="action-title">قائمة المشاريع</div>
                    <div class="action-description">عرض وإدارة جميع المشاريع</div>
                    <a href="/projects" class="btn">عرض المشاريع</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">📊</div>
                    <div class="action-title">التقارير</div>
                    <div class="action-description">تقارير وإحصائيات المشاريع</div>
                    <a href="/reports" class="btn">عرض التقارير</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">⚙️</div>
                    <div class="action-title">الإعدادات</div>
                    <div class="action-description">إعدادات النظام والمترجمين</div>
                    <a href="/settings" class="btn">الإعدادات</a>
                </div>
            </div>
            
            <div class="recent-projects">
                <h3>📋 المشاريع الحديثة</h3>
                """ + ''.join([f"""
                <div class="project-item">
                    <div class="project-title">{project['title']}</div>
                    <div class="project-meta">
                        العميل: {project['client_name']} | 
                        اللغة: {project['source_language']} → {project['target_language']} | 
                        التاريخ: {project['created_at']} | 
                        <span class="status-badge status-{project['status']}">{project['status']}</span>
                    </div>
                </div>
                """ for project in sample_projects[:5]]) + """
            </div>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/projects')
def projects():
    """صفحة قائمة المشاريع"""
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>قائمة المشاريع - نظام الترجمة</title>
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
            .projects-grid {
                display: grid;
                gap: 20px;
            }
            .project-card {
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 10px;
                padding: 20px;
                transition: all 0.3s ease;
            }
            .project-card:hover {
                border-color: #3498db;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .project-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .project-title {
                font-size: 1.2em;
                font-weight: bold;
                color: #2c3e50;
            }
            .status-badge {
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8em;
                font-weight: bold;
            }
            .status-completed {
                background-color: #d4edda;
                color: #155724;
            }
            .status-pending {
                background-color: #fff3cd;
                color: #856404;
            }
            .project-meta {
                color: #6c757d;
                font-size: 0.9em;
                margin-bottom: 10px;
            }
            .project-actions {
                display: flex;
                gap: 10px;
            }
            .btn {
                padding: 8px 15px;
                border-radius: 5px;
                text-decoration: none;
                font-size: 0.9em;
                transition: background-color 0.3s ease;
            }
            .btn-primary {
                background-color: #3498db;
                color: white;
            }
            .btn-secondary {
                background-color: #6c757d;
                color: white;
            }
            .btn:hover {
                opacity: 0.8;
            }
            .back-btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/" class="back-btn">← العودة للرئيسية</a>
            <h1>📋 قائمة المشاريع</h1>
            
            <div class="projects-grid">
                """ + ''.join([f"""
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-title">{project['title']}</div>
                        <span class="status-badge status-{project['status']}">{project['status']}</span>
                    </div>
                    <div class="project-meta">
                        <strong>العميل:</strong> {project['client_name']} ({project['client_email']})<br>
                        <strong>اللغة:</strong> {project['source_language']} → {project['target_language']}<br>
                        <strong>التاريخ:</strong> {project['created_at']}
                    </div>
                    <div class="project-actions">
                        <a href="/project/{project['id']}" class="btn btn-primary">عرض التفاصيل</a>
                        <a href="/edit-project/{project['id']}" class="btn btn-secondary">تعديل</a>
                    </div>
                </div>
                """ for project in sample_projects]) + """
            </div>
        </div>
    </body>
    </html>
    """
    return html

@app.route('/new-project')
def new_project():
    """صفحة إنشاء مشروع جديد"""
    html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مشروع جديد - نظام الترجمة</title>
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
                height: 150px;
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
            .back-btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/" class="back-btn">← العودة للرئيسية</a>
            <h1>📝 مشروع جديد</h1>
            
            <form method="POST" action="/create-project">
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
                        <option value="">اختر اللغة</option>
                        <option value="العربية">العربية</option>
                        <option value="English">English</option>
                        <option value="Türkçe">Türkçe</option>
                        <option value="Français">Français</option>
                        <option value="Deutsch">Deutsch</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="target_language">اللغة الهدف:</label>
                    <select id="target_language" name="target_language" required>
                        <option value="">اختر اللغة</option>
                        <option value="العربية">العربية</option>
                        <option value="English">English</option>
                        <option value="Türkçe">Türkçe</option>
                        <option value="Français">Français</option>
                        <option value="Deutsch">Deutsch</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="original_content">المحتوى الأصلي:</label>
                    <textarea id="original_content" name="original_content" required></textarea>
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

@app.route('/create-project', methods=['POST'])
def create_project():
    """إنشاء مشروع جديد"""
    project_data = {
        'id': f'proj-{str(uuid.uuid4())[:8]}',
        'title': request.form.get('title'),
        'client_name': request.form.get('client_name'),
        'client_email': request.form.get('client_email'),
        'source_language': request.form.get('source_language'),
        'target_language': request.form.get('target_language'),
        'translator_id': 'translator-001',
        'created_at': datetime.now().strftime('%Y-%m-%d'),
        'status': 'pending',
        'original_content': request.form.get('original_content'),
        'translated_content': '',
        'pdf_path': None,
        'qr_code': None
    }
    
    sample_projects.append(project_data)
    return redirect('/projects')

@app.route('/project/<project_id>')
def project_details(project_id):
    """تفاصيل المشروع"""
    project = next((p for p in sample_projects if p['id'] == project_id), None)
    
    if not project:
        return "المشروع غير موجود", 404
    
    html = f"""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{project['title']} - تفاصيل المشروع</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                direction: rtl;
            }}
            .container {{
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                margin-bottom: 30px;
            }}
            .project-info {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 10px 0;
                border-bottom: 1px solid #e9ecef;
            }}
            .info-label {{
                font-weight: bold;
                color: #2c3e50;
            }}
            .info-value {{
                color: #6c757d;
            }}
            .status-badge {{
                padding: 5px 15px;
                border-radius: 15px;
                font-size: 0.9em;
                font-weight: bold;
            }}
            .status-completed {{
                background-color: #d4edda;
                color: #155724;
            }}
            .status-pending {{
                background-color: #fff3cd;
                color: #856404;
            }}
            .content-section {{
                margin-bottom: 30px;
            }}
            .content-title {{
                font-size: 1.2em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 15px;
            }}
            .content-box {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3498db;
                white-space: pre-wrap;
                line-height: 1.6;
            }}
            .btn {{
                display: inline-block;
                padding: 10px 20px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-right: 10px;
                margin-bottom: 10px;
            }}
            .btn:hover {{
                background-color: #2980b9;
            }}
            .btn-secondary {{
                background-color: #6c757d;
            }}
            .back-btn {{
                display: inline-block;
                padding: 10px 20px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/projects" class="back-btn">← العودة للمشاريع</a>
            <h1>📋 {project['title']}</h1>
            
            <div class="project-info">
                <div class="info-row">
                    <span class="info-label">معرف المشروع:</span>
                    <span class="info-value">{project['id']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">العميل:</span>
                    <span class="info-value">{project['client_name']} ({project['client_email']})</span>
                </div>
                <div class="info-row">
                    <span class="info-label">اللغة:</span>
                    <span class="info-value">{project['source_language']} → {project['target_language']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">تاريخ الإنشاء:</span>
                    <span class="info-value">{project['created_at']}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">الحالة:</span>
                    <span class="info-value">
                        <span class="status-badge status-{project['status']}">{project['status']}</span>
                    </span>
                </div>
            </div>
            
            <div class="content-section">
                <div class="content-title">📄 المحتوى الأصلي ({project['source_language']})</div>
                <div class="content-box">{project['original_content']}</div>
            </div>
            
            <div class="content-section">
                <div class="content-title">🔄 المحتوى المترجم ({project['target_language']})</div>
                <div class="content-box">{project['translated_content'] if project['translated_content'] else 'لم يتم الترجمة بعد'}</div>
            </div>
            
            <div class="actions">
                <a href="/edit-project/{project['id']}" class="btn">✏️ تعديل المشروع</a>
                <a href="/projects" class="btn btn-secondary">📋 العودة للمشاريع</a>
            </div>
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
        'version': '1.0.0',
        'projects_count': len(sample_projects)
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
    print("🔍 صفحة الحالة: http://localhost:5000/health")
    print("📊 المشاريع: http://localhost:5000/projects")
    app.run(host='0.0.0.0', port=5000, debug=True)

