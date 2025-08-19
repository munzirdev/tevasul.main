"""
نظام الترجمة المكتبي - النماذج والكلاسات
Translation Office System - Models and Classes
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
import uuid


@dataclass
class Translator:
    """نموذج المترجم"""
    id: str
    name: str
    license_number: str
    source_languages: List[str]
    target_languages: List[str]
    email: str
    phone: str
    address: str
    created_at: datetime
    is_active: bool = True


@dataclass
class TranslationProject:
    """نموذج مشروع الترجمة"""
    id: str
    title: str
    description: str
    source_language: str
    target_language: str
    translator_id: str
    client_name: str
    client_email: str
    created_at: datetime
    updated_at: datetime
    status: str  # draft, in_progress, completed, delivered
    source_file_path: Optional[str] = None
    translated_file_path: Optional[str] = None
    original_file_path: Optional[str] = None
    final_pdf_path: Optional[str] = None
    google_drive_id: Optional[str] = None
    qr_code_path: Optional[str] = None
    verification_url: Optional[str] = None


@dataclass
class TranslationDocument:
    """نموذج وثيقة الترجمة"""
    id: str
    project_id: str
    file_path: str
    file_type: str  # docx, pdf
    content: str
    translated_content: str
    created_at: datetime
    updated_at: datetime


class TranslationManager:
    """مدير الترجمة - المسؤول عن إدارة مشاريع الترجمة"""
    
    def __init__(self):
        self.projects: Dict[str, TranslationProject] = {}
        self.translators: Dict[str, Translator] = {}
        self.documents: Dict[str, TranslationDocument] = {}
    
    def create_project(self, title: str, description: str, source_lang: str, 
                      target_lang: str, translator_id: str, client_name: str, 
                      client_email: str) -> TranslationProject:
        """إنشاء مشروع ترجمة جديد"""
        project_id = str(uuid.uuid4())
        now = datetime.now()
        
        project = TranslationProject(
            id=project_id,
            title=title,
            description=description,
            source_language=source_lang,
            target_language=target_lang,
            translator_id=translator_id,
            client_name=client_name,
            client_email=client_email,
            created_at=now,
            updated_at=now,
            status="draft"
        )
        
        self.projects[project_id] = project
        return project
    
    def get_project(self, project_id: str) -> Optional[TranslationProject]:
        """الحصول على مشروع ترجمة"""
        return self.projects.get(project_id)
    
    def update_project_status(self, project_id: str, status: str) -> bool:
        """تحديث حالة المشروع"""
        project = self.projects.get(project_id)
        if project:
            project.status = status
            project.updated_at = datetime.now()
            return True
        return False
    
    def add_translator(self, name: str, license_number: str, source_langs: List[str],
                      target_langs: List[str], email: str, phone: str, address: str) -> Translator:
        """إضافة مترجم جديد"""
        translator_id = str(uuid.uuid4())
        translator = Translator(
            id=translator_id,
            name=name,
            license_number=license_number,
            source_languages=source_langs,
            target_languages=target_langs,
            email=email,
            phone=phone,
            address=address,
            created_at=datetime.now()
        )
        
        self.translators[translator_id] = translator
        return translator
    
    def get_translator(self, translator_id: str) -> Optional[Translator]:
        """الحصول على مترجم"""
        return self.translators.get(translator_id)
    
    def create_document(self, project_id: str, file_path: str, file_type: str, 
                       content: str) -> TranslationDocument:
        """إنشاء وثيقة ترجمة جديدة"""
        doc_id = str(uuid.uuid4())
        now = datetime.now()
        
        document = TranslationDocument(
            id=doc_id,
            project_id=project_id,
            file_path=file_path,
            file_type=file_type,
            content=content,
            translated_content="",
            created_at=now,
            updated_at=now
        )
        
        self.documents[doc_id] = document
        return document
    
    def update_translated_content(self, document_id: str, translated_content: str) -> bool:
        """تحديث المحتوى المترجم"""
        document = self.documents.get(document_id)
        if document:
            document.translated_content = translated_content
            document.updated_at = datetime.now()
            return True
        return False
    
    def get_project_documents(self, project_id: str) -> List[TranslationDocument]:
        """الحصول على وثائق المشروع"""
        return [doc for doc in self.documents.values() if doc.project_id == project_id]
    
    def get_all_projects(self) -> List[TranslationProject]:
        """الحصول على جميع المشاريع"""
        return list(self.projects.values())
    
    def get_all_translators(self) -> List[Translator]:
        """الحصول على جميع المترجمين"""
        return list(self.translators.values())



