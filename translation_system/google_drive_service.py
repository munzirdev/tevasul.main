"""
نظام الترجمة المكتبي - خدمة Google Drive
Translation Office System - Google Drive Service
"""

import os
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
import io
import mimetypes

from config import (
    GOOGLE_DRIVE_CREDENTIALS_FILE,
    GOOGLE_DRIVE_TOKEN_FILE,
    GOOGLE_DRIVE_FOLDER_ID
)


class GoogleDriveService:
    """خدمة Google Drive للتعامل مع الملفات"""
    
    # نطاق الصلاحيات المطلوبة
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    
    def __init__(self):
        self.service = None
        self.credentials = None
        self._authenticate()
    
    def _authenticate(self):
        """المصادقة مع Google Drive API"""
        try:
            # التحقق من وجود ملف الرمز المميز
            if GOOGLE_DRIVE_TOKEN_FILE.exists():
                self.credentials = Credentials.from_authorized_user_file(
                    str(GOOGLE_DRIVE_TOKEN_FILE), self.SCOPES
                )
            
            # إذا لم تكن هناك بيانات اعتماد صالحة، اطلب من المستخدم المصادقة
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    self.credentials.refresh(Request())
                else:
                    if not GOOGLE_DRIVE_CREDENTIALS_FILE.exists():
                        raise FileNotFoundError(
                            f"ملف بيانات الاعتماد غير موجود: {GOOGLE_DRIVE_CREDENTIALS_FILE}"
                        )
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        str(GOOGLE_DRIVE_CREDENTIALS_FILE), self.SCOPES
                    )
                    self.credentials = flow.run_local_server(port=0)
                
                # حفظ الرمز المميز للمرة القادمة
                GOOGLE_DRIVE_TOKEN_FILE.parent.mkdir(exist_ok=True)
                with open(GOOGLE_DRIVE_TOKEN_FILE, 'w') as token:
                    token.write(self.credentials.to_json())
            
            # إنشاء خدمة Google Drive
            self.service = build('drive', 'v3', credentials=self.credentials)
            print("تم الاتصال بنجاح بـ Google Drive")
            
        except Exception as e:
            print(f"خطأ في المصادقة مع Google Drive: {e}")
            raise
    
    def upload_file(self, file_path: str, folder_id: Optional[str] = None) -> Optional[str]:
        """رفع ملف إلى Google Drive"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            file_path = Path(file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"الملف غير موجود: {file_path}")
            
            # تحديد نوع MIME
            mime_type, _ = mimetypes.guess_type(str(file_path))
            if mime_type is None:
                mime_type = 'application/octet-stream'
            
            # إعداد بيانات الملف
            file_metadata = {
                'name': file_path.name,
                'parents': [folder_id or GOOGLE_DRIVE_FOLDER_ID] if (folder_id or GOOGLE_DRIVE_FOLDER_ID) else []
            }
            
            # إنشاء وسيط الملف
            media = MediaFileUpload(str(file_path), mimetype=mime_type, resumable=True)
            
            # رفع الملف
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink'
            ).execute()
            
            print(f"تم رفع الملف بنجاح: {file.get('name')} (ID: {file.get('id')})")
            return file.get('id')
            
        except HttpError as error:
            print(f"خطأ في رفع الملف: {error}")
            return None
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return None
    
    def download_file(self, file_id: str, destination_path: str) -> bool:
        """تحميل ملف من Google Drive"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            # طلب تحميل الملف
            request = self.service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
                print(f"تحميل: {int(status.progress() * 100)}%")
            
            # حفظ الملف
            destination_path = Path(destination_path)
            destination_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(destination_path, 'wb') as f:
                f.write(file.getvalue())
            
            print(f"تم تحميل الملف بنجاح: {destination_path}")
            return True
            
        except HttpError as error:
            print(f"خطأ في تحميل الملف: {error}")
            return False
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return False
    
    def get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على معلومات الملف"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            file = self.service.files().get(
                fileId=file_id,
                fields='id, name, size, mimeType, createdTime, modifiedTime, webViewLink'
            ).execute()
            
            return file
            
        except HttpError as error:
            print(f"خطأ في الحصول على معلومات الملف: {error}")
            return None
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return None
    
    def list_files(self, folder_id: Optional[str] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
        """قائمة الملفات في مجلد معين"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            # بناء الاستعلام
            q = f"'{folder_id or GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false"
            if query:
                q += f" and {query}"
            
            results = self.service.files().list(
                q=q,
                pageSize=100,
                fields="nextPageToken, files(id, name, size, mimeType, createdTime, modifiedTime)"
            ).execute()
            
            return results.get('files', [])
            
        except HttpError as error:
            print(f"خطأ في قائمة الملفات: {error}")
            return []
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return []
    
    def delete_file(self, file_id: str) -> bool:
        """حذف ملف من Google Drive"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            self.service.files().delete(fileId=file_id).execute()
            print(f"تم حذف الملف بنجاح: {file_id}")
            return True
            
        except HttpError as error:
            print(f"خطأ في حذف الملف: {error}")
            return False
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return False
    
    def create_folder(self, folder_name: str, parent_folder_id: Optional[str] = None) -> Optional[str]:
        """إنشاء مجلد جديد"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_folder_id or GOOGLE_DRIVE_FOLDER_ID] if (parent_folder_id or GOOGLE_DRIVE_FOLDER_ID) else []
            }
            
            folder = self.service.files().create(
                body=folder_metadata,
                fields='id, name'
            ).execute()
            
            print(f"تم إنشاء المجلد بنجاح: {folder.get('name')} (ID: {folder.get('id')})")
            return folder.get('id')
            
        except HttpError as error:
            print(f"خطأ في إنشاء المجلد: {error}")
            return None
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return None
    
    def get_shareable_link(self, file_id: str) -> Optional[str]:
        """الحصول على رابط قابل للمشاركة"""
        try:
            if not self.service:
                raise Exception("خدمة Google Drive غير متاحة")
            
            # إنشاء إذن للقراءة العامة
            permission = {
                'type': 'anyone',
                'role': 'reader'
            }
            
            self.service.permissions().create(
                fileId=file_id,
                body=permission
            ).execute()
            
            # الحصول على الرابط
            file_info = self.get_file_info(file_id)
            if file_info:
                return file_info.get('webViewLink')
            
            return None
            
        except HttpError as error:
            print(f"خطأ في إنشاء الرابط القابل للمشاركة: {error}")
            return None
        except Exception as e:
            print(f"خطأ غير متوقع: {e}")
            return None


