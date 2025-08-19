"""
نظام الترجمة المكتبي - النافذة الرئيسية
Translation Office System - Main Window
"""

import sys
import os
from pathlib import Path
from typing import Optional, Dict, Any
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QLineEdit, QTextEdit, QComboBox, QFileDialog,
    QMessageBox, QTabWidget, QTableWidget, QTableWidgetItem, QGroupBox,
    QFormLayout, QSpinBox, QDateEdit, QProgressBar, QStatusBar, QMenuBar,
    QMenu, QAction, QDialog, QDialogButtonBox, QListWidget, QSplitter
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QDate, QTimer
from PyQt6.QtGui import QFont, QIcon, QPixmap

from models import TranslationManager, Translator, TranslationProject
from document_processor import DocumentProcessor
from pdf_generator import PDFGenerator
from google_drive_service import GoogleDriveService
from config import SUPPORTED_LANGUAGES, COMPANY_NAME, APP_NAME


class MainWindow(QMainWindow):
    """النافذة الرئيسية للتطبيق"""
    
    def __init__(self):
        super().__init__()
        self.translation_manager = TranslationManager()
        self.document_processor = DocumentProcessor()
        self.pdf_generator = PDFGenerator()
        self.google_drive_service = None
        
        self.current_project = None
        self.current_translator = None
        
        self.init_ui()
        self.setup_connections()
        self.load_sample_data()
    
    def init_ui(self):
        """تهيئة واجهة المستخدم"""
        self.setWindowTitle(f"{APP_NAME} - {COMPANY_NAME}")
        self.setGeometry(100, 100, 1200, 800)
        
        # إنشاء القائمة الرئيسية
        self.create_menu_bar()
        
        # إنشاء الشريط الجانبي
        self.create_status_bar()
        
        # إنشاء المحتوى الرئيسي
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # التخطيط الرئيسي
        main_layout = QHBoxLayout(central_widget)
        
        # إنشاء شريط جانبي
        sidebar = self.create_sidebar()
        main_layout.addWidget(sidebar, 1)
        
        # إنشاء المحتوى الرئيسي
        main_content = self.create_main_content()
        main_layout.addWidget(main_content, 4)
        
        # تطبيق التخطيط
        central_widget.setLayout(main_layout)
    
    def create_menu_bar(self):
        """إنشاء شريط القوائم"""
        menubar = self.menuBar()
        
        # قائمة الملف
        file_menu = menubar.addMenu('الملف')
        
        new_project_action = QAction('مشروع جديد', self)
        new_project_action.setShortcut('Ctrl+N')
        new_project_action.triggered.connect(self.new_project)
        file_menu.addAction(new_project_action)
        
        open_project_action = QAction('فتح مشروع', self)
        open_project_action.setShortcut('Ctrl+O')
        open_project_action.triggered.connect(self.open_project)
        file_menu.addAction(open_project_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction('خروج', self)
        exit_action.setShortcut('Ctrl+Q')
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # قائمة الترجمة
        translation_menu = menubar.addMenu('الترجمة')
        
        import_document_action = QAction('استيراد مستند', self)
        import_document_action.triggered.connect(self.import_document)
        translation_menu.addAction(import_document_action)
        
        create_template_action = QAction('إنشاء نموذج ترجمة', self)
        create_template_action.triggered.connect(self.create_translation_template)
        translation_menu.addAction(create_template_action)
        
        export_pdf_action = QAction('تصدير PDF', self)
        export_pdf_action.triggered.connect(self.export_pdf)
        translation_menu.addAction(export_pdf_action)
        
        # قائمة المترجمين
        translators_menu = menubar.addMenu('المترجمين')
        
        add_translator_action = QAction('إضافة مترجم', self)
        add_translator_action.triggered.connect(self.add_translator)
        translators_menu.addAction(add_translator_action)
        
        manage_translators_action = QAction('إدارة المترجمين', self)
        manage_translators_action.triggered.connect(self.manage_translators)
        translators_menu.addAction(manage_translators_action)
        
        # قائمة المساعدة
        help_menu = menubar.addMenu('المساعدة')
        
        about_action = QAction('حول', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
    
    def create_sidebar(self):
        """إنشاء الشريط الجانبي"""
        sidebar = QWidget()
        sidebar.setMaximumWidth(300)
        sidebar.setStyleSheet("""
            QWidget {
                background-color: #f0f0f0;
                border-right: 1px solid #ccc;
            }
        """)
        
        layout = QVBoxLayout(sidebar)
        
        # معلومات المشروع الحالي
        project_group = QGroupBox("المشروع الحالي")
        project_layout = QVBoxLayout(project_group)
        
        self.project_title_label = QLabel("لا يوجد مشروع محدد")
        self.project_title_label.setWordWrap(True)
        project_layout.addWidget(self.project_title_label)
        
        self.project_status_label = QLabel("")
        project_layout.addWidget(self.project_status_label)
        
        layout.addWidget(project_group)
        
        # معلومات المترجم
        translator_group = QGroupBox("المترجم")
        translator_layout = QVBoxLayout(translator_group)
        
        self.translator_name_label = QLabel("لم يتم تحديد مترجم")
        translator_layout.addWidget(self.translator_name_label)
        
        self.translator_license_label = QLabel("")
        translator_layout.addWidget(self.translator_license_label)
        
        layout.addWidget(translator_group)
        
        # إحصائيات سريعة
        stats_group = QGroupBox("إحصائيات")
        stats_layout = QVBoxLayout(stats_group)
        
        self.total_projects_label = QLabel("إجمالي المشاريع: 0")
        stats_layout.addWidget(self.total_projects_label)
        
        self.completed_projects_label = QLabel("المشاريع المكتملة: 0")
        stats_layout.addWidget(self.completed_projects_label)
        
        self.total_translators_label = QLabel("إجمالي المترجمين: 0")
        stats_layout.addWidget(self.total_translators_label)
        
        self.active_translators_label = QLabel("المترجمين النشطين: 0")
        stats_layout.addWidget(self.active_translators_label)
        
        layout.addWidget(stats_group)
        
        # أزرار سريعة
        quick_actions_group = QGroupBox("إجراءات سريعة")
        quick_layout = QVBoxLayout(quick_actions_group)
        
        new_project_btn = QPushButton("مشروع جديد")
        new_project_btn.clicked.connect(self.new_project)
        quick_layout.addWidget(new_project_btn)
        
        import_doc_btn = QPushButton("استيراد مستند")
        import_doc_btn.clicked.connect(self.import_document)
        quick_layout.addWidget(import_doc_btn)
        
        export_pdf_btn = QPushButton("تصدير PDF")
        export_pdf_btn.clicked.connect(self.export_pdf)
        quick_layout.addWidget(export_pdf_btn)
        
        layout.addWidget(quick_actions_group)
        
        layout.addStretch()
        
        return sidebar
    
    def create_main_content(self):
        """إنشاء المحتوى الرئيسي"""
        content_widget = QWidget()
        layout = QVBoxLayout(content_widget)
        
        # إنشاء علامات التبويب
        self.tab_widget = QTabWidget()
        
        # تبويب المشاريع
        projects_tab = self.create_projects_tab()
        self.tab_widget.addTab(projects_tab, "المشاريع")
        
        # تبويب الترجمة
        translation_tab = self.create_translation_tab()
        self.tab_widget.addTab(translation_tab, "الترجمة")
        
        # تبويب المترجمين
        translators_tab = self.create_translators_tab()
        self.tab_widget.addTab(translators_tab, "المترجمين")
        
        # تبويب الإعدادات
        settings_tab = self.create_settings_tab()
        self.tab_widget.addTab(settings_tab, "الإعدادات")
        
        layout.addWidget(self.tab_widget)
        
        return content_widget
    
    def create_projects_tab(self):
        """إنشاء تبويب المشاريع"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # أزرار التحكم
        buttons_layout = QHBoxLayout()
        
        new_project_btn = QPushButton("مشروع جديد")
        new_project_btn.clicked.connect(self.new_project)
        buttons_layout.addWidget(new_project_btn)
        
        refresh_btn = QPushButton("تحديث")
        refresh_btn.clicked.connect(self.refresh_projects)
        buttons_layout.addWidget(refresh_btn)
        
        buttons_layout.addStretch()
        
        layout.addLayout(buttons_layout)
        
        # جدول المشاريع
        self.projects_table = QTableWidget()
        self.projects_table.setColumnCount(7)
        self.projects_table.setHorizontalHeaderLabels([
            "العنوان", "العميل", "اللغة المصدر", "اللغة الهدف", 
            "المترجم", "الحالة", "التاريخ"
        ])
        
        layout.addWidget(self.projects_table)
        
        return tab
    
    def create_translation_tab(self):
        """إنشاء تبويب الترجمة"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # معلومات المشروع
        project_info_group = QGroupBox("معلومات المشروع")
        project_info_layout = QFormLayout(project_info_group)
        
        self.project_title_edit = QLineEdit()
        project_info_layout.addRow("عنوان المشروع:", self.project_title_edit)
        
        self.client_name_edit = QLineEdit()
        project_info_layout.addRow("اسم العميل:", self.client_name_edit)
        
        self.client_email_edit = QLineEdit()
        project_info_layout.addRow("البريد الإلكتروني:", self.client_email_edit)
        
        layout.addWidget(project_info_group)
        
        # محتوى الترجمة
        translation_group = QGroupBox("محتوى الترجمة")
        translation_layout = QVBoxLayout(translation_group)
        
        # أزرار استيراد الملفات
        file_buttons_layout = QHBoxLayout()
        
        import_source_btn = QPushButton("استيراد المستند الأصلي")
        import_source_btn.clicked.connect(self.import_source_document)
        file_buttons_layout.addWidget(import_source_btn)
        
        import_translated_btn = QPushButton("استيراد الترجمة")
        import_translated_btn.clicked.connect(self.import_translated_document)
        file_buttons_layout.addWidget(import_translated_btn)
        
        file_buttons_layout.addStretch()
        
        translation_layout.addLayout(file_buttons_layout)
        
        # محرر النص
        self.translation_text_edit = QTextEdit()
        self.translation_text_edit.setPlaceholderText("أدخل محتوى الترجمة هنا...")
        translation_layout.addWidget(self.translation_text_edit)
        
        layout.addWidget(translation_group)
        
        return tab
    
    def create_translators_tab(self):
        """إنشاء تبويب المترجمين"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # أزرار التحكم
        buttons_layout = QHBoxLayout()
        
        add_translator_btn = QPushButton("إضافة مترجم")
        add_translator_btn.clicked.connect(self.add_translator)
        buttons_layout.addWidget(add_translator_btn)
        
        edit_translator_btn = QPushButton("تعديل")
        edit_translator_btn.clicked.connect(self.edit_translator)
        buttons_layout.addWidget(edit_translator_btn)
        
        delete_translator_btn = QPushButton("حذف")
        delete_translator_btn.clicked.connect(self.delete_translator)
        buttons_layout.addWidget(delete_translator_btn)
        
        buttons_layout.addStretch()
        
        layout.addLayout(buttons_layout)
        
        # جدول المترجمين
        self.translators_table = QTableWidget()
        self.translators_table.setColumnCount(6)
        self.translators_table.setHorizontalHeaderLabels([
            "الاسم", "رقم الترخيص", "اللغات المصدر", "اللغات الهدف", 
            "البريد الإلكتروني", "الحالة"
        ])
        
        layout.addWidget(self.translators_table)
        
        return tab
    
    def create_settings_tab(self):
        """إنشاء تبويب الإعدادات"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # إعدادات Google Drive
        drive_group = QGroupBox("إعدادات Google Drive")
        drive_layout = QFormLayout(drive_group)
        
        self.drive_folder_id_edit = QLineEdit()
        drive_layout.addRow("معرف مجلد Google Drive:", self.drive_folder_id_edit)
        
        test_drive_btn = QPushButton("اختبار الاتصال")
        test_drive_btn.clicked.connect(self.test_google_drive_connection)
        drive_layout.addRow(test_drive_btn)
        
        layout.addWidget(drive_group)
        
        # إعدادات PDF
        pdf_group = QGroupBox("إعدادات PDF")
        pdf_layout = QFormLayout(pdf_group)
        
        self.pdf_margin_top_spin = QSpinBox()
        self.pdf_margin_top_spin.setRange(1, 10)
        self.pdf_margin_top_spin.setValue(3)
        pdf_layout.addRow("الهامش العلوي (سم):", self.pdf_margin_top_spin)
        
        self.pdf_margin_bottom_spin = QSpinBox()
        self.pdf_margin_bottom_spin.setRange(1, 10)
        self.pdf_margin_bottom_spin.setValue(2)
        pdf_layout.addRow("الهامش السفلي (سم):", self.pdf_margin_bottom_spin)
        
        layout.addWidget(pdf_group)
        
        layout.addStretch()
        
        return tab
    
    def create_status_bar(self):
        """إنشاء شريط الحالة"""
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        self.status_bar.showMessage("جاهز")
        
        # شريط التقدم
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.status_bar.addPermanentWidget(self.progress_bar)
    
    def setup_connections(self):
        """إعداد الاتصالات بين العناصر"""
        # ربط جدول المشاريع
        self.projects_table.itemSelectionChanged.connect(self.on_project_selected)
        
        # ربط جدول المترجمين
        self.translators_table.itemSelectionChanged.connect(self.on_translator_selected)
    
    def load_sample_data(self):
        """تحميل بيانات تجريبية"""
        # التحقق من وجود بيانات تجريبية
        if self.translation_manager.get_all_translators():
            return  # البيانات موجودة بالفعل
        
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
        
        self.refresh_projects()
        self.refresh_translators()
        self.update_statistics()
    
    def new_project(self):
        """إنشاء مشروع جديد"""
        dialog = NewProjectDialog(self.translation_manager, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.refresh_projects()
            self.update_statistics()
            # اختيار المشروع الجديد
            if self.projects_table.rowCount() > 0:
                self.projects_table.selectRow(self.projects_table.rowCount() - 1)
    
    def open_project(self):
        """فتح مشروع موجود"""
        QMessageBox.information(
            self,
            "فتح مشروع",
            "يمكنك اختيار المشروع من قائمة المشاريع في تبويب 'المشاريع'"
        )
    
    def import_document(self):
        """استيراد مستند"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "اختر ملف للاستيراد",
            "",
            "ملفات Word (*.docx);;ملفات PDF (*.pdf);;جميع الملفات (*)"
        )
        
        if file_path:
            success, content, file_type = self.document_processor.read_document(file_path)
            if success:
                QMessageBox.information(self, "نجح الاستيراد", f"تم استيراد الملف بنجاح\nالنوع: {file_type}")
            else:
                QMessageBox.warning(self, "خطأ في الاستيراد", f"فشل في استيراد الملف: {content}")
    
    def create_translation_template(self):
        """إنشاء نموذج ترجمة"""
        if not self.current_project:
            QMessageBox.warning(self, "تحذير", "يرجى تحديد مشروع أولاً")
            return
        
        # طلب مسار حفظ النموذج
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "حفظ نموذج الترجمة",
            f"{self.current_project.title}_template.docx",
            "ملفات Word (*.docx)"
        )
        
        if file_path:
            # الحصول على المحتوى الأصلي
            original_content = getattr(self.current_project, 'original_content', "")
            if not original_content:
                QMessageBox.warning(self, "تحذير", "يرجى استيراد المستند الأصلي أولاً")
                return
            
            # إنشاء النموذج
            success = self.document_processor.create_translation_template(
                original_content=original_content,
                output_path=file_path
            )
            
            if success:
                QMessageBox.information(self, "نجح الإنشاء", "تم إنشاء نموذج الترجمة بنجاح")
            else:
                QMessageBox.warning(self, "خطأ في الإنشاء", "فشل في إنشاء نموذج الترجمة")
    
    def export_pdf(self):
        """تصدير PDF"""
        if not self.current_project:
            QMessageBox.warning(self, "تحذير", "يرجى تحديد مشروع أولاً")
            return
        
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "حفظ PDF",
            f"{self.current_project.title}.pdf",
            "ملفات PDF (*.pdf)"
        )
        
        if file_path:
            # تجميع بيانات المشروع
            project_data = {
                'project_id': self.current_project.id,
                'client_name': self.current_project.client_name,
                'client_email': self.current_project.client_email,
                'source_language': self.current_project.source_language,
                'target_language': self.current_project.target_language,
                'translator_name': self.current_translator.name if self.current_translator else "",
                'translator_license': self.current_translator.license_number if self.current_translator else "",
                'translation_date': self.current_project.created_at.strftime("%Y-%m-%d"),
                'certification_date': QDate.currentDate().toString("yyyy-MM-dd"),
                'translated_content': self.translation_text_edit.toPlainText(),
                'original_content': getattr(self.current_project, 'original_content', "")  # المحتوى الأصلي المحفوظ
            }
            
            success = self.pdf_generator.generate_final_pdf(project_data, file_path)
            if success:
                # تحديث حالة المشروع
                self.current_project.status = "completed"
                self.current_project.final_pdf_path = file_path
                # رفع إلى Google Drive وحفظ الرابط
                drive_link = None
                try:
                    if not self.google_drive_service:
                        self.google_drive_service = GoogleDriveService()
                    file_id = self.google_drive_service.upload_file(file_path)
                    if file_id:
                        self.current_project.google_drive_id = file_id
                        drive_link = self.google_drive_service.get_shareable_link(file_id)
                except Exception as e:
                    print(f"خطأ رفع Google Drive: {e}")
                self.refresh_projects()
                if drive_link:
                    QMessageBox.information(self, "نجح التصدير", f"تم إنشاء ورفع PDF بنجاح\nالرابط: {drive_link}")
                else:
                    QMessageBox.information(self, "نجح التصدير", "تم إنشاء PDF بنجاح")
            else:
                QMessageBox.warning(self, "خطأ في التصدير", "فشل في إنشاء PDF")
    
    def add_translator(self):
        """إضافة مترجم جديد"""
        dialog = AddTranslatorDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.refresh_translators()
            self.update_statistics()
    
    def manage_translators(self):
        """إدارة المترجمين"""
        QMessageBox.information(
            self,
            "إدارة المترجمين",
            "يمكنك إضافة وتعديل وحذف المترجمين من تبويب 'المترجمين'"
        )
    
    def show_about(self):
        """عرض معلومات حول التطبيق"""
        about_text = f"""
{APP_NAME}
الإصدار 1.0.0

نظام متكامل لإدارة الترجمة المكتبية

المميزات:
• إدارة مشاريع الترجمة
• معالجة ملفات Word و PDF
• تكامل مع Google Drive
• إنشاء PDF مع QR Code
• نظام التحقق من الوثائق

المطور: فريق نظام الترجمة المكتبي
البريد الإلكتروني: info@translation-office.com

© 2024 جميع الحقوق محفوظة
        """
        QMessageBox.about(self, "حول التطبيق", about_text.strip())
    
    def refresh_projects(self):
        """تحديث قائمة المشاريع"""
        projects = self.translation_manager.get_all_projects()
        self.projects_table.setRowCount(len(projects))
        
        for row, project in enumerate(projects):
            translator = self.translation_manager.get_translator(project.translator_id)
            
            self.projects_table.setItem(row, 0, QTableWidgetItem(project.title))
            self.projects_table.setItem(row, 1, QTableWidgetItem(project.client_name))
            self.projects_table.setItem(row, 2, QTableWidgetItem(project.source_language))
            self.projects_table.setItem(row, 3, QTableWidgetItem(project.target_language))
            self.projects_table.setItem(row, 4, QTableWidgetItem(translator.name if translator else ""))
            self.projects_table.setItem(row, 5, QTableWidgetItem(project.status))
            self.projects_table.setItem(row, 6, QTableWidgetItem(project.created_at.strftime("%Y-%m-%d")))
        
        # تحديث الإحصائيات
        self.update_statistics()
    
    def refresh_translators(self):
        """تحديث قائمة المترجمين"""
        translators = self.translation_manager.get_all_translators()
        self.translators_table.setRowCount(len(translators))
        
        for row, translator in enumerate(translators):
            self.translators_table.setItem(row, 0, QTableWidgetItem(translator.name))
            self.translators_table.setItem(row, 1, QTableWidgetItem(translator.license_number))
            self.translators_table.setItem(row, 2, QTableWidgetItem(", ".join(translator.source_languages)))
            self.translators_table.setItem(row, 3, QTableWidgetItem(", ".join(translator.target_languages)))
            self.translators_table.setItem(row, 4, QTableWidgetItem(translator.email))
            self.translators_table.setItem(row, 5, QTableWidgetItem("نشط" if translator.is_active else "غير نشط"))
        
        # تحديث الإحصائيات
        self.update_statistics()
    
    def update_statistics(self):
        """تحديث الإحصائيات"""
        projects = self.translation_manager.get_all_projects()
        translators = self.translation_manager.get_all_translators()
        completed_projects = [p for p in projects if p.status == "completed"]
        
        self.total_projects_label.setText(f"إجمالي المشاريع: {len(projects)}")
        self.completed_projects_label.setText(f"المشاريع المكتملة: {len(completed_projects)}")
        
        # إضافة إحصائيات المترجمين
        active_translators = [t for t in translators if t.is_active]
        self.total_translators_label.setText(f"إجمالي المترجمين: {len(translators)}")
        self.active_translators_label.setText(f"المترجمين النشطين: {len(active_translators)}")
    
    def on_project_selected(self):
        """عند اختيار مشروع"""
        current_row = self.projects_table.currentRow()
        if current_row >= 0:
            project_title = self.projects_table.item(current_row, 0).text()  # استخدام العنوان كمعرف مؤقت
            # البحث عن المشروع بالمعرف الحقيقي
            for project in self.translation_manager.get_all_projects():
                if project.title == project_title:
                    self.current_project = project
                    self.current_translator = self.translation_manager.get_translator(project.translator_id)
                    self.update_project_info()
                    break
        else:
            self.current_project = None
            self.update_project_info()
    
    def on_translator_selected(self):
        """عند اختيار مترجم"""
        current_row = self.translators_table.currentRow()
        if current_row >= 0:
            translator_name = self.translators_table.item(current_row, 0).text()
            # البحث عن المترجم بالاسم
            for translator in self.translation_manager.get_all_translators():
                if translator.name == translator_name:
                    self.current_translator = translator
                    self.update_translator_info()
                    break
        else:
            self.current_translator = None
            self.update_translator_info()
    
    def update_project_info(self):
        """تحديث معلومات المشروع"""
        if self.current_project:
            self.project_title_label.setText(self.current_project.title)
            self.project_status_label.setText(f"الحالة: {self.current_project.status}")
            
            # تحديث حقول الترجمة
            self.project_title_edit.setText(self.current_project.title)
            self.client_name_edit.setText(self.current_project.client_name)
            self.client_email_edit.setText(self.current_project.client_email)
        else:
            self.project_title_label.setText("لا يوجد مشروع محدد")
            self.project_status_label.setText("")
            
            # مسح حقول الترجمة
            self.project_title_edit.clear()
            self.client_name_edit.clear()
            self.client_email_edit.clear()
    
    def update_translator_info(self):
        """تحديث معلومات المترجم"""
        if self.current_translator:
            self.translator_name_label.setText(self.current_translator.name)
            self.translator_license_label.setText(f"الترخيص: {self.current_translator.license_number}")
        else:
            self.translator_name_label.setText("لم يتم تحديد مترجم")
            self.translator_license_label.setText("")
    
    def import_source_document(self):
        """استيراد المستند الأصلي"""
        if not self.current_project:
            QMessageBox.warning(self, "تحذير", "يرجى تحديد مشروع أولاً")
            return
        
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "اختر المستند الأصلي",
            "",
            "ملفات Word (*.docx);;ملفات PDF (*.pdf)"
        )
        
        if file_path:
            success, content, file_type = self.document_processor.read_document(file_path)
            if success:
                # حفظ المستند الأصلي في المشروع
                self.current_project.original_file_path = file_path
                # حفظ المحتوى للاستخدام لاحقاً
                self.current_project.original_content = content
                QMessageBox.information(self, "نجح الاستيراد", f"تم استيراد المستند الأصلي بنجاح\nالنوع: {file_type}")
            else:
                QMessageBox.warning(self, "خطأ في الاستيراد", f"فشل في استيراد الملف: {content}")
    
    def import_translated_document(self):
        """استيراد الترجمة"""
        if not self.current_project:
            QMessageBox.warning(self, "تحذير", "يرجى تحديد مشروع أولاً")
            return
        
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "اختر ملف الترجمة",
            "",
            "ملفات Word (*.docx);;ملفات PDF (*.pdf)"
        )
        
        if file_path:
            success, content, file_type = self.document_processor.read_document(file_path)
            if success:
                self.translation_text_edit.setPlainText(content)
                QMessageBox.information(self, "نجح الاستيراد", f"تم استيراد الترجمة بنجاح\nالنوع: {file_type}")
            else:
                QMessageBox.warning(self, "خطأ في الاستيراد", f"فشل في استيراد الملف: {content}")
    
    def edit_translator(self):
        """تعديل المترجم"""
        if not self.current_translator:
            QMessageBox.warning(self, "تحذير", "يرجى تحديد مترجم أولاً")
            return
        
        QMessageBox.information(
            self,
            "تعديل المترجم",
            f"تعديل معلومات المترجم: {self.current_translator.name}\n\nهذه الميزة ستكون متاحة في الإصدارات القادمة."
        )
    
    def delete_translator(self):
        """حذف المترجم"""
        if not self.current_translator:
            QMessageBox.warning(self, "تحذير", "يرجى تحديد مترجم أولاً")
            return
        
        reply = QMessageBox.question(
            self,
            "تأكيد الحذف",
            f"هل أنت متأكد من حذف المترجم {self.current_translator.name}؟",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # حذف المترجم من القائمة
            translators = self.translation_manager.get_all_translators()
            translators = [t for t in translators if t.id != self.current_translator.id]
            # إعادة إنشاء مدير الترجمة مع القائمة المحدثة
            self.translation_manager.translators = {t.id: t for t in translators}
            self.refresh_translators()
            self.current_translator = None
            self.update_translator_info()
            QMessageBox.information(self, "تم الحذف", "تم حذف المترجم بنجاح")
    
    def test_google_drive_connection(self):
        """اختبار الاتصال بـ Google Drive"""
        try:
            if not self.google_drive_service:
                self.google_drive_service = GoogleDriveService()
            QMessageBox.information(self, "نجح الاتصال", "تم الاتصال بـ Google Drive بنجاح")
        except Exception as e:
            QMessageBox.warning(self, "خطأ في الاتصال", f"فشل في الاتصال بـ Google Drive: {str(e)}")
            print(f"تفاصيل الخطأ: {e}")


class NewProjectDialog(QDialog):
    """حوار إنشاء مشروع جديد"""
    
    def __init__(self, translation_manager, parent=None):
        super().__init__(parent)
        self.translation_manager = translation_manager
        self.init_ui()
    
    def init_ui(self):
        self.setWindowTitle("مشروع جديد")
        self.setModal(True)
        
        layout = QVBoxLayout(self)
        
        # نموذج المشروع
        form_layout = QFormLayout()
        
        self.title_edit = QLineEdit()
        form_layout.addRow("عنوان المشروع:", self.title_edit)
        
        self.description_edit = QTextEdit()
        self.description_edit.setMaximumHeight(100)
        form_layout.addRow("وصف المشروع:", self.description_edit)
        
        self.client_name_edit = QLineEdit()
        form_layout.addRow("اسم العميل:", self.client_name_edit)
        
        self.client_email_edit = QLineEdit()
        form_layout.addRow("البريد الإلكتروني:", self.client_email_edit)
        
        self.source_lang_combo = QComboBox()
        self.source_lang_combo.addItems(SUPPORTED_LANGUAGES.values())
        form_layout.addRow("اللغة المصدر:", self.source_lang_combo)
        
        self.target_lang_combo = QComboBox()
        self.target_lang_combo.addItems(SUPPORTED_LANGUAGES.values())
        form_layout.addRow("اللغة الهدف:", self.target_lang_combo)
        
        self.translator_combo = QComboBox()
        translators = self.translation_manager.get_all_translators()
        for translator in translators:
            self.translator_combo.addItem(translator.name, translator.id)
        form_layout.addRow("المترجم:", self.translator_combo)
        
        layout.addLayout(form_layout)
        
        # أزرار الحوار
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
    
    def accept(self):
        """قبول إنشاء المشروع"""
        if not self.title_edit.text().strip():
            QMessageBox.warning(self, "خطأ", "يرجى إدخال عنوان المشروع")
            return
        
        if self.translator_combo.currentData() is None:
            QMessageBox.warning(self, "خطأ", "يرجى اختيار مترجم")
            return
        
        if not self.client_name_edit.text().strip():
            QMessageBox.warning(self, "خطأ", "يرجى إدخال اسم العميل")
            return
        
        # إنشاء المشروع
        project = self.translation_manager.create_project(
            title=self.title_edit.text().strip(),
            description=self.description_edit.toPlainText().strip(),
            source_lang=list(SUPPORTED_LANGUAGES.keys())[self.source_lang_combo.currentIndex()],
            target_lang=list(SUPPORTED_LANGUAGES.keys())[self.target_lang_combo.currentIndex()],
            translator_id=self.translator_combo.currentData(),
            client_name=self.client_name_edit.text().strip(),
            client_email=self.client_email_edit.text().strip()
        )
        
        super().accept()


class AddTranslatorDialog(QDialog):
    """حوار إضافة مترجم جديد"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
    
    def init_ui(self):
        self.setWindowTitle("إضافة مترجم جديد")
        self.setModal(True)
        
        layout = QVBoxLayout(self)
        
        # نموذج المترجم
        form_layout = QFormLayout()
        
        self.name_edit = QLineEdit()
        form_layout.addRow("الاسم:", self.name_edit)
        
        self.license_edit = QLineEdit()
        form_layout.addRow("رقم الترخيص:", self.license_edit)
        
        self.email_edit = QLineEdit()
        form_layout.addRow("البريد الإلكتروني:", self.email_edit)
        
        self.phone_edit = QLineEdit()
        form_layout.addRow("رقم الهاتف:", self.phone_edit)
        
        self.address_edit = QLineEdit()
        form_layout.addRow("العنوان:", self.address_edit)
        
        layout.addLayout(form_layout)
        
        # أزرار الحوار
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
    
    def accept(self):
        """قبول إضافة المترجم"""
        if not self.name_edit.text().strip():
            QMessageBox.warning(self, "خطأ", "يرجى إدخال اسم المترجم")
            return
        
        if not self.license_edit.text().strip():
            QMessageBox.warning(self, "خطأ", "يرجى إدخال رقم الترخيص")
            return
        
        # إضافة المترجم إلى مدير الترجمة
        from models import TranslationManager
        translation_manager = TranslationManager()
        translation_manager.add_translator(
            name=self.name_edit.text().strip(),
            license_number=self.license_edit.text().strip(),
            source_langs=[],  # سيتم إضافتها لاحقاً
            target_langs=[],  # سيتم إضافتها لاحقاً
            email=self.email_edit.text().strip(),
            phone=self.phone_edit.text().strip(),
            address=self.address_edit.text().strip()
        )
        
        super().accept()


def main():
    """الدالة الرئيسية"""
    app = QApplication(sys.argv)
    
    # إعداد التطبيق
    app.setApplicationName(APP_NAME)
    app.setApplicationVersion("1.0.0")
    
    # إنشاء النافذة الرئيسية
    window = MainWindow()
    window.show()
    
    # تشغيل التطبيق
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
