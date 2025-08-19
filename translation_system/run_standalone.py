#!/usr/bin/env python3
"""
واجهة تشغيل مستقلة لنظام الترجمة
يوفر رابط داخلي للوصول إلى النظام عبر المتصفح
"""

import sys
import os
import webbrowser
import threading
import time
from pathlib import Path
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget, QPushButton, QLabel, QTextEdit, QMessageBox, QSystemTrayIcon, QMenu, QStyle
from PyQt6.QtCore import QThread, pyqtSignal, QTimer, QUrl
from PyQt6.QtGui import QIcon, QAction
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEnginePage

# إضافة مسار المشروع
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from main_window import MainWindow
from verification_server import VerificationServer
from config import FLASK_HOST, FLASK_PORT, BASE_URL

class StandaloneLauncher(QMainWindow):
    """واجهة التشغيل المستقلة"""
    
    def __init__(self):
        super().__init__()
        self.main_window = None
        self.server_thread = None
        self.server = None
        self.web_view = None
        self.init_ui()
        self.start_services()
        
    def init_ui(self):
        """تهيئة واجهة المستخدم"""
        self.setWindowTitle("نظام الترجمة - واجهة التشغيل المستقلة")
        self.setGeometry(100, 100, 1200, 800)
        
        # إنشاء القائمة الرئيسية
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # التخطيط الرئيسي
        layout = QHBoxLayout(central_widget)
        
        # اللوحة اليسرى - أزرار التحكم
        control_panel = QWidget()
        control_layout = QVBoxLayout(control_panel)
        control_panel.setMaximumWidth(300)
        
        # عنوان
        title_label = QLabel("نظام الترجمة")
        title_label.setStyleSheet("font-size: 18px; font-weight: bold; margin: 10px;")
        control_layout.addWidget(title_label)
        
        # أزرار التحكم
        self.open_gui_btn = QPushButton("فتح واجهة التطبيق")
        self.open_gui_btn.clicked.connect(self.open_main_gui)
        control_layout.addWidget(self.open_gui_btn)
        
        self.open_web_btn = QPushButton("فتح الواجهة الويبية")
        self.open_web_btn.clicked.connect(self.open_web_interface)
        control_layout.addWidget(self.open_web_btn)
        
        self.open_browser_btn = QPushButton("فتح في المتصفح")
        self.open_browser_btn.clicked.connect(self.open_in_browser)
        control_layout.addWidget(self.open_browser_btn)
        
        # معلومات الحالة
        self.status_label = QLabel("جاري بدء الخدمات...")
        self.status_label.setStyleSheet("color: blue; margin: 10px;")
        control_layout.addWidget(self.status_label)
        
        # معلومات الروابط
        self.links_label = QLabel()
        self.links_label.setStyleSheet("margin: 10px;")
        control_layout.addWidget(self.links_label)
        
        # سجل النظام
        log_label = QLabel("سجل النظام:")
        control_layout.addWidget(log_label)
        
        self.log_text = QTextEdit()
        self.log_text.setMaximumHeight(200)
        control_layout.addWidget(self.log_text)
        
        control_layout.addStretch()
        
        # اللوحة اليمنى - معاينة الويب
        self.web_panel = QWidget()
        web_layout = QVBoxLayout(self.web_panel)
        
        web_title = QLabel("معاينة الواجهة الويبية")
        web_title.setStyleSheet("font-size: 14px; font-weight: bold; margin: 5px;")
        web_layout.addWidget(web_title)
        
        # إنشاء معاينة الويب
        self.web_view = QWebEngineView()
        self.web_view.setMinimumSize(800, 600)
        web_layout.addWidget(self.web_view)
        
        # إضافة اللوحات للتخطيط الرئيسي
        layout.addWidget(control_panel)
        layout.addWidget(self.web_panel)
        
        # إنشاء أيقونة النظام
        self.create_system_tray()
        
    def create_system_tray(self):
        """إنشاء أيقونة النظام"""
        self.tray_icon = QSystemTrayIcon(self)
        self.tray_icon.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_ComputerIcon))
        
        # إنشاء قائمة الأيقونة
        tray_menu = QMenu()
        
        show_action = QAction("إظهار", self)
        show_action.triggered.connect(self.show)
        tray_menu.addAction(show_action)
        
        open_gui_action = QAction("فتح واجهة التطبيق", self)
        open_gui_action.triggered.connect(self.open_main_gui)
        tray_menu.addAction(open_gui_action)
        
        open_web_action = QAction("فتح الواجهة الويبية", self)
        open_web_action.triggered.connect(self.open_web_interface)
        tray_menu.addAction(open_web_action)
        
        tray_menu.addSeparator()
        
        quit_action = QAction("خروج", self)
        quit_action.triggered.connect(self.close_application)
        tray_menu.addAction(quit_action)
        
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.show()
        
    def start_services(self):
        """بدء الخدمات في خيوط منفصلة"""
        # بدء خادم التحقق
        self.start_verification_server()
        
        # بدء واجهة التطبيق الرئيسية
        self.start_main_gui()
        
    def start_verification_server(self):
        """بدء خادم التحقق"""
        try:
            self.server = VerificationServer()
            self.server_thread = ServerThread(self.server)
            self.server_thread.started.connect(self.on_server_started)
            self.server_thread.error.connect(self.on_server_error)
            self.server_thread.start()
            
            self.log_message("جاري بدء خادم التحقق...")
        except Exception as e:
            self.log_message(f"خطأ في بدء الخادم: {e}")
            
    def start_main_gui(self):
        """بدء واجهة التطبيق الرئيسية"""
        try:
            self.main_window = MainWindow()
            self.main_window.hide()  # إخفاء النافذة الرئيسية
            self.log_message("تم تحميل واجهة التطبيق الرئيسية")
        except Exception as e:
            self.log_message(f"خطأ في تحميل واجهة التطبيق: {e}")
            
    def on_server_started(self):
        """عند بدء الخادم"""
        self.status_label.setText("الخدمات جاهزة")
        self.status_label.setStyleSheet("color: green; margin: 10px;")
        
        # تحديث معلومات الروابط
        web_url = f"http://{FLASK_HOST}:{FLASK_PORT}"
        self.links_label.setText(f"الرابط الداخلي:\n{web_url}")
        
        # تحميل الواجهة الويبية في المعاينة
        self.web_view.setUrl(QUrl(web_url))
        
        self.log_message("تم بدء جميع الخدمات بنجاح")
        
    def on_server_error(self, error):
        """عند حدوث خطأ في الخادم"""
        self.status_label.setText("خطأ في الخادم")
        self.status_label.setStyleSheet("color: red; margin: 10px;")
        self.log_message(f"خطأ في الخادم: {error}")
        
    def open_main_gui(self):
        """فتح واجهة التطبيق الرئيسية"""
        if self.main_window:
            self.main_window.show()
            self.main_window.raise_()
            self.main_window.activateWindow()
            self.log_message("تم فتح واجهة التطبيق الرئيسية")
        else:
            QMessageBox.warning(self, "خطأ", "واجهة التطبيق غير متوفرة")
            
    def open_web_interface(self):
        """فتح الواجهة الويبية في المعاينة"""
        web_url = f"http://{FLASK_HOST}:{FLASK_PORT}"
        self.web_view.setUrl(QUrl(web_url))
        self.log_message("تم فتح الواجهة الويبية في المعاينة")
        
    def open_in_browser(self):
        """فتح في المتصفح الخارجي"""
        web_url = f"http://{FLASK_HOST}:{FLASK_PORT}"
        try:
            webbrowser.open(web_url)
            self.log_message("تم فتح الرابط في المتصفح")
        except Exception as e:
            self.log_message(f"خطأ في فتح المتصفح: {e}")
            
    def log_message(self, message):
        """إضافة رسالة إلى السجل"""
        from datetime import datetime
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.append(f"[{timestamp}] {message}")
        
    def closeEvent(self, event):
        """عند إغلاق النافذة"""
        reply = QMessageBox.question(
            self, 
            "تأكيد الإغلاق", 
            "هل تريد إغلاق جميع الخدمات؟",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.close_application()
        else:
            event.ignore()
            
    def close_application(self):
        """إغلاق التطبيق بالكامل"""
        if self.server_thread and self.server_thread.isRunning():
            self.server_thread.quit()
            self.server_thread.wait()
            
        if self.main_window:
            self.main_window.close()
            
        self.tray_icon.hide()
        QApplication.quit()


class ServerThread(QThread):
    """خيط منفصل لتشغيل الخادم"""
    started = pyqtSignal()
    error = pyqtSignal(str)
    
    def __init__(self, server):
        super().__init__()
        self.server = server
        
    def run(self):
        """تشغيل الخادم"""
        try:
            self.server.start()
            self.started.emit()
        except Exception as e:
            self.error.emit(str(e))


def main():
    """الدالة الرئيسية"""
    app = QApplication(sys.argv)
    app.setApplicationName("نظام الترجمة - واجهة التشغيل المستقلة")
    
    # تعيين أيقونة التطبيق
    icon_path = project_root / "assets" / "icon.png"
    if icon_path.exists():
        app.setWindowIcon(QIcon(str(icon_path)))
    
    launcher = StandaloneLauncher()
    launcher.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()



