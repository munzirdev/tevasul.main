"""
نظام الترجمة المكتبي - مولّد PDF
Translation Office System - PDF Generator
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import qrcode
from datetime import datetime
import uuid

from config import (
    PDF_MARGIN_TOP,
    PDF_MARGIN_BOTTOM,
    PDF_MARGIN_LEFT,
    PDF_MARGIN_RIGHT,
    QR_CODE_SIZE,
    QR_CODE_BASE_URL,
    COMPANY_NAME,
    COMPANY_LOGO
)


class PDFGenerator:
    """مولّد PDF للوثائق النهائية"""
    
    def __init__(self):
        self.page_width, self.page_height = A4
        self._setup_fonts()
        self._setup_styles()
    
    def _setup_fonts(self):
        """إعداد الخطوط العربية"""
        try:
            # محاولة إضافة خط عربي (يجب تثبيت الخط أولاً)
            arabic_font_path = "fonts/arabic.ttf"  # مسار الخط العربي
            if Path(arabic_font_path).exists():
                pdfmetrics.registerFont(TTFont('Arabic', arabic_font_path))
                addMapping('Arabic', 0, 0, 'Arabic')
        except:
            # استخدام الخط الافتراضي إذا لم يتوفر الخط العربي
            pass
    
    def _setup_styles(self):
        """إعداد أنماط النص"""
        self.styles = getSampleStyleSheet()
        
        # نمط العنوان الرئيسي
        self.styles.add(ParagraphStyle(
            name='ArabicTitle',
            parent=self.styles['Title'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
        ))
        
        # نمط العنوان الفرعي
        self.styles.add(ParagraphStyle(
            name='ArabicHeading',
            parent=self.styles['Heading1'],
            fontSize=14,
            spaceAfter=20,
            alignment=TA_RIGHT,
            fontName='Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
        ))
        
        # نمط النص العادي
        self.styles.add(ParagraphStyle(
            name='ArabicNormal',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            fontName='Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
        ))
        
        # نمط معلومات المشروع
        self.styles.add(ParagraphStyle(
            name='ProjectInfo',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_RIGHT,
            fontName='Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
        ))
    
    def generate_final_pdf(self, project_data: Dict[str, Any], output_path: str) -> bool:
        """إنشاء PDF نهائي صفحتان فقط: 1) الترجمة + صندوق الاعتماد + QR، 2) المستند الأصلي"""
        try:
            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                leftMargin=PDF_MARGIN_LEFT * cm,
                rightMargin=PDF_MARGIN_RIGHT * cm,
                topMargin=PDF_MARGIN_TOP * cm,
                bottomMargin=PDF_MARGIN_BOTTOM * cm
            )
            
            story = []

            # صفحة 1: الترجمة + صندوق الاعتماد + QR في الأسفل
            if COMPANY_LOGO.exists():
                story.append(self._create_logo_paragraph())
                story.append(Spacer(1, 10))

            title = Paragraph("الترجمة", self.styles['ArabicHeading'])
            story.append(title)
            story.append(Spacer(1, 10))

            story.extend(self._create_translation_section(project_data))
            story.append(Spacer(1, 12))

            # صندوق الاعتماد
            story.extend(self._create_certification_section(project_data))

            # QR Code بجانب الصندوق يسار الصفحة
            try:
                qr_data = self._generate_qr_data(project_data)
                qr_image = self._create_qr_code(qr_data)
                qr_temp_path = Path(output_path).parent / f"qr_{uuid.uuid4().hex}.png"
                qr_image.save(qr_temp_path)
                story.append(Spacer(1, 8))
                story.append(Image(str(qr_temp_path), width=QR_CODE_SIZE, height=QR_CODE_SIZE))
                # سيتم حذف الملف المؤقت بعد البناء
                temp_to_cleanup = [qr_temp_path]
            except Exception:
                temp_to_cleanup = []

            story.append(PageBreak())

            # صفحة 2: المستند الأصلي
            heading = Paragraph("المستند الأصلي", self.styles['ArabicHeading'])
            story.append(heading)
            story.append(Spacer(1, 10))
            story.extend(self._create_original_document_section(project_data))
            
            # بناء PDF
            doc.build(story)

            # تنظيف صور QR المؤقتة
            for p in temp_to_cleanup:
                try:
                    if p.exists():
                        p.unlink()
                except Exception:
                    pass
            
            return True
            
        except Exception as e:
            print(f"خطأ في إنشاء PDF: {e}")
            return False
    
    def _create_logo_paragraph(self) -> Paragraph:
        """إنشاء فقرة الشعار"""
        logo_text = f"<img src='{COMPANY_LOGO}' width='100' height='50'/>"
        return Paragraph(logo_text, self.styles['ArabicNormal'])
    
    def _create_project_info_section(self, project_data: Dict[str, Any]) -> list:
        """إنشاء قسم معلومات المشروع"""
        story = []
        
        # عنوان القسم
        heading = Paragraph("معلومات المشروع", self.styles['ArabicHeading'])
        story.append(heading)
        story.append(Spacer(1, 15))
        
        # معلومات العميل
        client_info = [
            f"اسم العميل: {project_data.get('client_name', '')}",
            f"البريد الإلكتروني: {project_data.get('client_email', '')}"
        ]
        
        for info in client_info:
            story.append(Paragraph(info, self.styles['ProjectInfo']))
        
        story.append(Spacer(1, 10))
        
        # معلومات الترجمة
        translation_info = [
            f"اللغة المصدر: {project_data.get('source_language', '')}",
            f"اللغة الهدف: {project_data.get('target_language', '')}",
            f"تاريخ الترجمة: {project_data.get('translation_date', '')}"
        ]
        
        for info in translation_info:
            story.append(Paragraph(info, self.styles['ProjectInfo']))
        
        story.append(Spacer(1, 10))
        
        # معلومات المترجم
        translator_info = [
            f"المترجم: {project_data.get('translator_name', '')}",
            f"رقم الترخيص: {project_data.get('translator_license', '')}"
        ]
        
        for info in translator_info:
            story.append(Paragraph(info, self.styles['ProjectInfo']))
        
        return story
    
    def _create_translation_section(self, project_data: Dict[str, Any]) -> list:
        """إنشاء قسم الترجمة"""
        story = []
        
        # عنوان القسم
        heading = Paragraph("الترجمة", self.styles['ArabicHeading'])
        story.append(heading)
        story.append(Spacer(1, 15))
        
        # محتوى الترجمة
        translated_content = project_data.get('translated_content', '')
        if translated_content:
            paragraphs = translated_content.split('\n')
            for para_text in paragraphs:
                if para_text.strip():
                    story.append(Paragraph(para_text, self.styles['ArabicNormal']))
                    story.append(Spacer(1, 8))
        
        return story
    
    def _create_original_document_section(self, project_data: Dict[str, Any]) -> list:
        """إنشاء قسم المستند الأصلي"""
        story = []
        
        # عنوان القسم
        heading = Paragraph("المستند الأصلي", self.styles['ArabicHeading'])
        story.append(heading)
        story.append(Spacer(1, 15))
        
        # محتوى المستند الأصلي
        original_content = project_data.get('original_content', '')
        if original_content:
            paragraphs = original_content.split('\n')
            for para_text in paragraphs:
                if para_text.strip():
                    story.append(Paragraph(para_text, self.styles['ArabicNormal']))
                    story.append(Spacer(1, 8))
        
        return story
    
    def _create_certification_section(self, project_data: Dict[str, Any]) -> list:
        """إنشاء قسم اعتماد المترجم"""
        story = []
        
        # عنوان القسم
        heading = Paragraph("اعتماد المترجم المحلف", self.styles['ArabicHeading'])
        story.append(heading)
        story.append(Spacer(1, 20))
        
        # نص الاعتماد
        certification_text = "أعتمد أنا الموقع أدناه، المترجم المحلف، أن الترجمة المرفقة صحيحة ومطابقة للمستند الأصلي."
        story.append(Paragraph(certification_text, self.styles['ArabicNormal']))
        story.append(Spacer(1, 20))
        
        # معلومات المترجم في جدول
        translator_data = [
            ['اسم المترجم:', project_data.get('translator_name', '')],
            ['رقم الترخيص:', project_data.get('translator_license', '')],
            ['اللغة المصدر:', project_data.get('source_language', '')],
            ['اللغة الهدف:', project_data.get('target_language', '')],
            ['تاريخ الاعتماد:', project_data.get('certification_date', '')]
        ]
        
        table = Table(translator_data, colWidths=[4*cm, 8*cm])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        story.append(Spacer(1, 30))
        
        # مساحة للتوقيع
        signature_text = "التوقيع: _________________"
        story.append(Paragraph(signature_text, self.styles['ArabicNormal']))
        
        return story
    
    def _add_qr_code_to_pdf(self, pdf_path: str, project_data: Dict[str, Any]):
        """إضافة QR Code إلى PDF"""
        try:
            # إنشاء QR Code
            qr_data = self._generate_qr_data(project_data)
            qr_image = self._create_qr_code(qr_data)
            
            # حفظ QR Code مؤقتاً
            qr_temp_path = Path(pdf_path).parent / f"qr_temp_{uuid.uuid4().hex}.png"
            qr_image.save(qr_temp_path)
            
            # إضافة QR Code إلى PDF
            c = canvas.Canvas(pdf_path, pagesize=A4)
            c.drawImage(str(qr_temp_path), 50, 50, width=QR_CODE_SIZE, height=QR_CODE_SIZE)
            c.save()
            
            # حذف الملف المؤقت
            if qr_temp_path.exists():
                qr_temp_path.unlink()
            
        except Exception as e:
            print(f"خطأ في إضافة QR Code: {e}")
    
    def _generate_qr_data(self, project_data: Dict[str, Any]) -> str:
        """توليد بيانات QR Code"""
        project_id = project_data.get('project_id', str(uuid.uuid4()))
        verification_url = f"{QR_CODE_BASE_URL}{project_id}"
        return verification_url
    
    def _create_qr_code(self, data: str) -> Any:
        """إنشاء QR Code"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        return qr.make_image(fill_color="black", back_color="white")
    
    def create_simple_pdf(self, content: str, output_path: str, title: str = "وثيقة") -> bool:
        """إنشاء PDF بسيط"""
        try:
            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                leftMargin=2*cm,
                rightMargin=2*cm,
                topMargin=2*cm,
                bottomMargin=2*cm
            )
            
            story = []
            
            # إضافة العنوان
            title_para = Paragraph(title, self.styles['ArabicTitle'])
            story.append(title_para)
            story.append(Spacer(1, 20))
            
            # إضافة المحتوى
            paragraphs = content.split('\n')
            for para_text in paragraphs:
                if para_text.strip():
                    story.append(Paragraph(para_text, self.styles['ArabicNormal']))
                    story.append(Spacer(1, 8))
            
            # بناء PDF
            doc.build(story)
            return True
            
        except Exception as e:
            print(f"خطأ في إنشاء PDF بسيط: {e}")
            return False
