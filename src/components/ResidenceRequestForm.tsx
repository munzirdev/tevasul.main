import React, { useState, useEffect } from 'react';
import { X, Send, FileText, AlertCircle, Upload, Image, Calendar, Home, RefreshCw, User, CreditCard, Building, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { webhookService } from '../services/webhookService';

interface ResidenceRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  residenceType: 'renewal' | 'first-time';
  isDarkMode: boolean;
}

interface ResidenceFormData {
  // Basic Information
  passport_number: string;
  passport_expiry_date: string;
  entry_date: string;
  intended_duration_months: number;
  
  // Accommodation
  accommodation_address: string;
  accommodation_type: 'hotel' | 'apartment' | 'house' | 'other';
  
  // Financial Information
  financial_guarantee_amount: number;
  financial_guarantee_source: string;
  monthly_income: number;
  
  // Employment
  employment_status: 'employed' | 'unemployed' | 'student' | 'retired' | 'other';
  employer_name: string;
  employer_address: string;
  
  // Additional Information
  family_members_count: number;
  special_requirements: string;
  
  // Files
  passport_copy: File | null;
  current_residence_permit: File | null;
  financial_documents: File | null;
  accommodation_contract: File | null;
  additional_documents: File[];
}

const ResidenceRequestForm: React.FC<ResidenceRequestFormProps> = ({
  isOpen,
  onClose,
  residenceType,
  isDarkMode
}) => {
  const { user, profile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [formData, setFormData] = useState<ResidenceFormData>({
    passport_number: '',
    passport_expiry_date: '',
    entry_date: '',
    intended_duration_months: 12,
    accommodation_address: '',
    accommodation_type: 'apartment',
    financial_guarantee_amount: 0,
    financial_guarantee_source: '',
    monthly_income: 0,
    employment_status: 'employed',
    employer_name: '',
    employer_address: '',
    family_members_count: 0,
    special_requirements: '',
    passport_copy: null,
    current_residence_permit: null,
    financial_documents: null,
    accommodation_contract: null,
    additional_documents: []
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        passport_number: '',
        passport_expiry_date: '',
        entry_date: '',
        intended_duration_months: 12,
        accommodation_address: '',
        accommodation_type: 'apartment',
        financial_guarantee_amount: 0,
        financial_guarantee_source: '',
        monthly_income: 0,
        employment_status: 'employed',
        employer_name: '',
        employer_address: '',
        family_members_count: 0,
        special_requirements: '',
        passport_copy: null,
        current_residence_permit: null,
        financial_documents: null,
        accommodation_contract: null,
        additional_documents: []
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleFileUpload = async (file: File): Promise<{
    url: string;
    name: string;
    path: string;
    isBase64?: boolean;
    base64Data?: string;
  } | null> => {
    if (!file) return null;

    if (!user) {
      console.error('المستخدم غير مسجل الدخول');
      setError('يجب تسجيل الدخول أولاً');
      return null;
    }

    setUploadingFile(true);
    setError(null);

    try {
      return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64String = base64Data.split(',')[1];
            
            if (base64String.length > 1024 * 1024) {
              console.error('حجم الملف كبير جداً بعد التحويل إلى Base64');
              setError('حجم الملف كبير جداً. يرجى اختيار ملف أصغر');
              resolve(null);
              return;
            }
            
            try {
              const { data: insertData, error: insertError } = await supabase
                .from('file_attachments')
                .insert({
                  user_id: user.id,
                  file_name: file.name,
                  file_type: file.type,
                  file_size: file.size,
                  file_data: base64String,
                  created_at: new Date().toISOString()
                })
                .select()
                .single();
              
              if (insertError) {
                console.error('خطأ في حفظ الملف في file_attachments:', insertError);
                resolve({
                  url: `base64://residence_requests/${file.name}`,
                  name: file.name,
                  path: `base64/residence_requests/${file.name}`,
                  isBase64: true,
                  base64Data: base64String
                });
                return;
              } else {
                resolve({
                  url: `base64://${insertData.id}`,
                  name: file.name,
                  path: `base64/${insertData.id}`,
                  isBase64: true
                });
              }
            } catch (error) {
              console.error('تفاصيل الخطأ:', error);
              resolve({
                url: `base64://residence_requests/${file.name}`,
                name: file.name,
                path: `base64/residence_requests/${file.name}`,
                isBase64: true,
                base64Data: base64String
              });
            }
          } catch (error) {
            console.error('خطأ في معالجة الملف:', error);
            setError('فشل في معالجة الملف. يرجى المحاولة مرة أخرى.');
            resolve(null);
          }
        };
        
        reader.onerror = () => {
          console.error('خطأ في قراءة الملف');
          setError('فشل في قراءة الملف. يرجى المحاولة مرة أخرى.');
          resolve(null);
        };
        
        reader.readAsDataURL(file);
      });

    } catch (error) {
      console.error('خطأ غير متوقع في رفع الملف:', error);
      setError('حدث خطأ غير متوقع في رفع الملف. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof ResidenceFormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'application/pdf', 
      'text/plain', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, GIF) أو ملف PDF أو Word');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت');
      return;
    }

    if (field === 'additional_documents') {
      setFormData(prev => ({
        ...prev,
        additional_documents: [...prev.additional_documents, file]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const removeAdditionalDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_documents: prev.additional_documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    // Validation
    if (!formData.passport_number.trim()) {
      setError('يرجى إدخال رقم جواز السفر');
      return;
    }

    if (!formData.passport_expiry_date) {
      setError('يرجى إدخال تاريخ انتهاء صلاحية جواز السفر');
      return;
    }

    if (!formData.entry_date) {
      setError('يرجى إدخال تاريخ الدخول');
      return;
    }

    if (!formData.accommodation_address.trim()) {
      setError('يرجى إدخال عنوان السكن');
      return;
    }

    if (formData.financial_guarantee_amount <= 0) {
      setError('يرجى إدخال مبلغ الضمان المالي');
      return;
    }

    if (!formData.financial_guarantee_source.trim()) {
      setError('يرجى إدخال مصدر الضمان المالي');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload files
      const uploadedFiles: { [key: string]: string } = {};
      const fileFields = ['passport_copy', 'current_residence_permit', 'financial_documents', 'accommodation_contract'];
      
      for (const field of fileFields) {
        const file = formData[field as keyof ResidenceFormData] as File | null;
        if (file) {
          const uploadResult = await handleFileUpload(file);
          if (uploadResult) {
            uploadedFiles[field] = uploadResult.url;
          }
        }
      }

      // Upload additional documents
      const additionalDocuments: string[] = [];
      for (const file of formData.additional_documents) {
        const uploadResult = await handleFileUpload(file);
        if (uploadResult) {
          additionalDocuments.push(uploadResult.url);
        }
      }

      // Create service request
      const serviceRequestData = {
        user_id: user.id,
        service_type: residenceType === 'renewal' ? 'tourist-residence-renewal' : 'first-time-tourist-residence',
        title: `طلب ${residenceType === 'renewal' ? 'تجديد إقامة سياحية' : 'إقامة سياحية أول مرة'}`,
        description: `طلب ${residenceType === 'renewal' ? 'تجديد إقامة سياحية' : 'إقامة سياحية أول مرة'} - جواز السفر: ${formData.passport_number}`,
        priority: 'medium',
        status: 'pending',
        file_url: uploadedFiles.passport_copy || null,
        file_name: formData.passport_copy?.name || null,
        file_data: null
      };

      const { data: serviceRequest, error: serviceError } = await supabase
        .from('service_requests')
        .insert(serviceRequestData)
        .select()
        .single();

      if (serviceError) {
        console.error('خطأ في إنشاء طلب الخدمة:', serviceError);
        setError('حدث خطأ في إنشاء الطلب. يرجى المحاولة مرة أخرى.');
        return;
      }

      // Create residence request
      const residenceRequestData = {
        service_request_id: serviceRequest.id,
        user_id: user.id,
        residence_type: residenceType,
        passport_number: formData.passport_number,
        passport_expiry_date: formData.passport_expiry_date,
        entry_date: formData.entry_date,
        intended_duration_months: formData.intended_duration_months,
        accommodation_address: formData.accommodation_address,
        accommodation_type: formData.accommodation_type,
        financial_guarantee_amount: formData.financial_guarantee_amount,
        financial_guarantee_source: formData.financial_guarantee_source,
        employment_status: formData.employment_status,
        employer_name: formData.employer_name || null,
        employer_address: formData.employer_address || null,
        monthly_income: formData.monthly_income,
        family_members_count: formData.family_members_count,
        additional_documents: additionalDocuments,
        special_requirements: formData.special_requirements || null,
        status: 'pending'
      };

      const { error: residenceError } = await supabase
        .from('residence_requests')
        .insert(residenceRequestData);

      if (residenceError) {
        console.error('خطأ في إنشاء طلب الإقامة:', residenceError);
        setError('حدث خطأ في إنشاء طلب الإقامة. يرجى المحاولة مرة أخرى.');
        return;
      }

      setSuccess(true);
      
      // Send webhook notification
      try {
        const requestData = {
          id: serviceRequest.id,
          user_id: user.id,
          service_type: serviceRequestData.service_type,
          title: serviceRequestData.title,
          description: serviceRequestData.description,
          priority: 'medium',
          status: 'pending',
          file_url: uploadedFiles.passport_copy,
          file_name: formData.passport_copy?.name,
          created_at: new Date().toISOString(),
          residence_data: residenceRequestData
        };
        
        await webhookService.sendServiceRequestWebhook(requestData);
      } catch (webhookError) {
        console.error('Error sending webhook notification:', webhookError);
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getResidenceTypeText = () => {
    return residenceType === 'renewal' ? 'تجديد إقامة سياحية' : 'إقامة سياحية أول مرة';
  };

  const getResidenceTypeIcon = () => {
    return residenceType === 'renewal' ? <RefreshCw className="w-6 h-6" /> : <Home className="w-6 h-6" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-jet-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-8 border border-platinum-300 dark:border-jet-600 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-jet-400 hover:text-jet-600 dark:text-platinum-400 dark:hover:text-platinum-200 transition-colors duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-caribbean-100 dark:bg-caribbean-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {getResidenceTypeIcon()}
          </div>
          <h2 className="text-2xl font-bold text-jet-800 dark:text-white mb-2">
            {getResidenceTypeText()}
          </h2>
          <p className="text-jet-600 dark:text-platinum-400">
            يرجى ملء جميع الحقول المطلوبة
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-2" />
            <p className="text-green-600 dark:text-green-400 text-sm">
              تم إرسال طلب الإقامة بنجاح! سنتواصل معك قريباً.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-platinum-50 dark:bg-jet-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-jet-800 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 ml-2" />
              المعلومات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  رقم جواز السفر *
                </label>
                <input
                  type="text"
                  value={formData.passport_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, passport_number: e.target.value }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  تاريخ انتهاء صلاحية جواز السفر *
                </label>
                <input
                  type="date"
                  value={formData.passport_expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, passport_expiry_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  تاريخ الدخول *
                </label>
                <input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  المدة المطلوبة (بالشهور) *
                </label>
                <select
                  value={formData.intended_duration_months}
                  onChange={(e) => setFormData(prev => ({ ...prev, intended_duration_months: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                >
                  <option value={3}>3 أشهر</option>
                  <option value={6}>6 أشهر</option>
                  <option value={12}>12 شهر</option>
                  <option value={24}>24 شهر</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accommodation Information */}
          <div className="bg-platinum-50 dark:bg-jet-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-jet-800 dark:text-white mb-4 flex items-center">
              <Home className="w-5 h-5 ml-2" />
              معلومات السكن
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  عنوان السكن *
                </label>
                <input
                  type="text"
                  value={formData.accommodation_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, accommodation_address: e.target.value }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  placeholder="أدخل العنوان الكامل"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  نوع السكن *
                </label>
                <select
                  value={formData.accommodation_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, accommodation_type: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                >
                  <option value="hotel">فندق</option>
                  <option value="apartment">شقة</option>
                  <option value="house">منزل</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  عدد أفراد العائلة
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.family_members_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_members_count: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-platinum-50 dark:bg-jet-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-jet-800 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 ml-2" />
              المعلومات المالية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  مبلغ الضمان المالي (بالليرة التركية) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.financial_guarantee_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, financial_guarantee_amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  مصدر الضمان المالي *
                </label>
                <input
                  type="text"
                  value={formData.financial_guarantee_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, financial_guarantee_source: e.target.value }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  placeholder="مثال: حساب بنكي، نقد، إلخ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  الدخل الشهري (بالليرة التركية)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_income: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-platinum-50 dark:bg-jet-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-jet-800 dark:text-white mb-4 flex items-center">
              <Building className="w-5 h-5 ml-2" />
              معلومات العمل
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  حالة التوظيف *
                </label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, employment_status: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  required
                >
                  <option value="employed">موظف</option>
                  <option value="unemployed">عاطل عن العمل</option>
                  <option value="student">طالب</option>
                  <option value="retired">متقاعد</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              {formData.employment_status === 'employed' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                      اسم صاحب العمل
                    </label>
                    <input
                      type="text"
                      value={formData.employer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, employer_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                      عنوان العمل
                    </label>
                    <input
                      type="text"
                      value={formData.employer_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, employer_address: e.target.value }))}
                      className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-platinum-50 dark:bg-jet-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-jet-800 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 ml-2" />
              المستندات المطلوبة
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  صورة جواز السفر *
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'passport_copy')}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  accept="image/*,.pdf"
                  required
                />
              </div>

              {residenceType === 'renewal' && (
                <div>
                  <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                    تصريح الإقامة الحالي
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'current_residence_permit')}
                    className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                    accept="image/*,.pdf"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  المستندات المالية
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'financial_documents')}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  accept="image/*,.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                  عقد السكن
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'accommodation_contract')}
                  className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            {/* Additional Documents */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                مستندات إضافية
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'additional_documents')}
                className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                accept="image/*,.pdf"
                multiple
              />
              
              {formData.additional_documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.additional_documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-jet-700 p-3 rounded-lg">
                      <span className="text-sm text-jet-700 dark:text-platinum-300">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAdditionalDocument(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
              متطلبات خاصة أو ملاحظات إضافية
            </label>
            <textarea
              value={formData.special_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
              placeholder="أي متطلبات خاصة أو ملاحظات إضافية..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-jet-600 dark:text-platinum-400 hover:text-jet-800 dark:hover:text-white transition-colors duration-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFile}
              className="px-8 py-3 bg-gradient-to-r from-caribbean-600 to-indigo-700 text-white rounded-2xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 space-x-reverse"
            >
              {loading || uploadingFile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال الطلب</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidenceRequestForm;
