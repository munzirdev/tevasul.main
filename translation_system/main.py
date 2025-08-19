"""
نظام الترجمة المكتبي - الملف الرئيسي
Translation Office System - Main Entry Point
"""

import sys
import os
from pathlib import Path
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QThread, pyqtSignal
import threading

from main_window import MainWindow
from verification_server import VerificationServer, create_templates
from config import APP_NAME, FLASK_HOST, FLASK_PORT


class ServerThread(QThread):
    """خيط تشغيل خادم التحقق"""
    
    def __init__(self):
        super().__init__()
        self.server = None
    
    def run(self):
        """تشغيل الخادم"""
        try:
            # إنشاء القوالب
            create_templates()
            
            # إنشاء وتشغيل الخادم
            self.server = VerificationServer()
            self.server.start()
        except Exception as e:
            print(f"خطأ في تشغيل الخادم: {e}")


def main():
    """الدالة الرئيسية للتطبيق"""
    print(f"تشغيل {APP_NAME}")
    print("=" * 50)
    
    # إنشاء تطبيق PyQt
    app = QApplication(sys.argv)
    app.setApplicationName(APP_NAME)
    app.setApplicationVersion("1.0.0")
    
    # إنشاء النافذة الرئيسية
    main_window = MainWindow()
    main_window.show()
    
    # تشغيل خادم التحقق في خيط منفصل
    server_thread = ServerThread()
    server_thread.start()
    
    print(f"تم تشغيل خادم التحقق على http://{FLASK_HOST}:{FLASK_PORT}")
    print("يمكنك الآن استخدام التطبيق والتحقق من الوثائق عبر الخادم")
    print("=" * 50)
    
    # تشغيل التطبيق
    sys.exit(app.exec())


if __name__ == "__main__":
    main()


