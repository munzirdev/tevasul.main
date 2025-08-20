import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Search,
  Edit,
  Calendar,
  Phone,
  Mail,
  Save,
  X,
  Plus,
  Eye,
  Download,
  Lock,
  Home,
  ArrowLeft,
  Send,
  Upload,
  Image,
  RefreshCw,
  CreditCard,
  Building,
  Star,
  Globe,
  Shield,
  Heart,
  Users
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { useLanguage } from '../hooks/useLanguage';
import { formatDisplayDate } from '../lib/utils';
import { UserAvatar } from './UserAvatar';
import { servicesData } from '../data/services';
import GlassLoadingScreen from './GlassLoadingScreen';
import SkeletonLoading from './SkeletonLoading';
import ResidenceRequestForm from './ResidenceRequestForm';
import ChangePasswordModal from './ChangePasswordModal';
import { telegramService } from '../services/telegramService';

interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
}

interface UserAccountProps {
  onBack: () => void;
  isDarkMode: boolean;
}

const UserAccount: React.FC<UserAccountProps> = ({ 
  onBack, 
  isDarkMode
}) => {
  const { user, profile } = useAuthContext();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Utility function to format phone number with RTL support for Arabic
  const formatPhoneNumber = (phoneNumber: string, isArabic: boolean) => {
    if (!phoneNumber) return '';
    
    if (isArabic) {
      // For Arabic, format with RTL direction but keep original format
      return (
        <span className="phone-number" style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'bidi-override' }}>
          {phoneNumber}
        </span>
      );
    } else {
      // For English, return original format
      return phoneNumber;
    }
  };
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  
  // New request creation state
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [newRequestForm, setNewRequestForm] = useState({
    title: '',
    description: '',
    file: null as File | null,
    fileUrl: '',
    fileName: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [newRequestSuccess, setNewRequestSuccess] = useState(false);

  // Residence request state
  const [showResidenceRequestModal, setShowResidenceRequestModal] = useState(false);
  const [selectedResidenceType, setSelectedResidenceType] = useState<'renewal' | 'first-time'>('first-time');

  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // دوال عرض وتحميل الملفات
  const handleFileView = async (fileUrl: string, fileName: string, requestId?: string) => {
    try {
      let fileData = null;
      let fileType = 'application/octet-stream';
      
      // التحقق من نوع الملف (Base64 أم URL عادي)
      if (fileUrl.startsWith('base64://')) {
        // استخراج ID من الرابط
        const fileId = fileUrl.replace('base64://', '');
        
        // محاولة جلب الملف من file_attachments أولاً
        let { data: attachmentData, error } = await supabase
          .from('file_attachments')
          .select('file_data, file_type')
          .eq('id', fileId)
          .single();
        
        if (error || !attachmentData) {
          // إذا لم يوجد في file_attachments، جرب جلب من service_requests
          if (requestId) {
            const { data: requestData, error: requestError } = await supabase
              .from('service_requests')
              .select('file_data, file_name')
              .eq('id', requestId)
              .single();
            
            if (requestError || !requestData || !requestData.file_data) {
              throw new Error('فشل في جلب الملف من قاعدة البيانات');
            }
            
            fileData = requestData.file_data;
            // تحديد نوع الملف من اسم الملف
            const fileNameLower = requestData.file_name?.toLowerCase() || '';
            if (fileNameLower.endsWith('.pdf')) {
              fileType = 'application/pdf';
            } else if (fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg')) {
              fileType = 'image/jpeg';
            } else if (fileNameLower.endsWith('.png')) {
              fileType = 'image/png';
            } else if (fileNameLower.endsWith('.gif')) {
              fileType = 'image/gif';
            } else if (fileNameLower.endsWith('.txt')) {
              fileType = 'text/plain';
            } else if (fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.docx')) {
              fileType = 'application/msword';
            }
          } else {
            throw new Error('فشل في جلب الملف من قاعدة البيانات');
          }
        } else {
          fileData = attachmentData.file_data;
          fileType = attachmentData.file_type;
        }
      } else {
        // تحميل الملف من URL عادي
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*'
          }
        });
        
        if (!response.ok) {
          console.error('فشل في تحميل الملف:', response.status, response.statusText);
          throw new Error(`فشل في تحميل الملف: ${response.status}`);
        }
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise((resolve) => {
          reader.onload = () => {
            const base64Data = reader.result as string;
            fileData = base64Data.split(',')[1];
            fileType = blob.type;
            
            // فتح الملف في نافذة جديدة
            const url = window.URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');
            
            if (!newWindow) {
              alert('يرجى السماح بفتح النوافذ المنبثقة لعرض الملف');
            }
            
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
            }, 5000);
          };
          
          reader.readAsDataURL(blob);
        });
      }
      
      // فتح الملف في نافذة جديدة
      const blob = new Blob([Uint8Array.from(atob(fileData), c => c.charCodeAt(0))], { type: fileType });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        alert('يرجى السماح بفتح النوافذ المنبثقة لعرض الملف');
      }
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
      
    } catch (error) {
      console.error('خطأ في عرض الملف:', error);
      alert('فشل في عرض الملف. يرجى المحاولة مرة أخرى أو تحميل الملف مباشرة.');
    }
  };

  const handleFileDownload = async (fileUrl: string, fileName: string, requestId?: string) => {
    try {
      let blob: Blob;
      
      // التحقق من نوع الملف (Base64 أم URL عادي)
      if (fileUrl.startsWith('base64://')) {
        // استخراج ID من الرابط
        const fileId = fileUrl.replace('base64://', '');
        
        // محاولة جلب الملف من file_attachments أولاً
        let { data: fileData, error } = await supabase
          .from('file_attachments')
          .select('file_data, file_type')
          .eq('id', fileId)
          .single();
        
        if (error || !fileData) {
          // إذا لم يوجد في file_attachments، جرب جلب من service_requests
          if (requestId) {
            const { data: requestData, error: requestError } = await supabase
              .from('service_requests')
              .select('file_data, file_name')
              .eq('id', requestId)
              .single();
            
            if (requestError || !requestData || !requestData.file_data) {
              throw new Error('فشل في جلب الملف من قاعدة البيانات');
            }
            
            // تحويل Base64 إلى Blob
            const byteCharacters = atob(requestData.file_data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            // تحديد نوع الملف من اسم الملف
            const fileNameLower = requestData.file_name?.toLowerCase() || '';
            let fileType = 'application/octet-stream';
            if (fileNameLower.endsWith('.pdf')) {
              fileType = 'application/pdf';
            } else if (fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg')) {
              fileType = 'image/jpeg';
            } else if (fileNameLower.endsWith('.png')) {
              fileType = 'image/png';
            } else if (fileNameLower.endsWith('.gif')) {
              fileType = 'image/gif';
            } else if (fileNameLower.endsWith('.txt')) {
              fileType = 'text/plain';
            } else if (fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.docx')) {
              fileType = 'application/msword';
            }
            
            blob = new Blob([byteArray], { type: fileType });
          } else {
            throw new Error('فشل في جلب الملف من قاعدة البيانات');
          }
        } else {
          // تحويل Base64 إلى Blob
          const byteCharacters = atob(fileData.file_data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: fileData.file_type });
        }
      } else {
        // تحميل الملف من URL عادي
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*'
          }
        });
        
        if (!response.ok) {
          console.error('فشل في تحميل الملف:', response.status, response.statusText);
          throw new Error(`فشل في تحميل الملف: ${response.status}`);
        }
        
        blob = await response.blob();
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'file';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1000);
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      alert('فشل في تحميل الملف. يرجى المحاولة مرة أخرى.');
    }
  };

  // New request creation functions
  const handleNewRequestFileUpload = async (file: File): Promise<{
    url: string;
    name: string;
    path: string;
    isBase64?: boolean;
    base64Data?: string;
  } | null> => {
    if (!file) return null;

    if (!user) {
      console.error('المستخدم غير مسجل الدخول');
      return null;
    }

    setUploadingFile(true);

    try {
      return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64String = base64Data.split(',')[1];
            
            if (base64String.length > 1024 * 1024) {
              console.error('حجم الملف كبير جداً بعد التحويل إلى Base64');
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
                  url: `base64://service_requests/${file.name}`,
                  name: file.name,
                  path: `base64/service_requests/${file.name}`,
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
              resolve({
                url: `base64://service_requests/${file.name}`,
                name: file.name,
                path: `base64/service_requests/${file.name}`,
                isBase64: true,
                base64Data: base64String
              });
            }
          } catch (error) {
            console.error('خطأ في معالجة الملف:', error);
            resolve(null);
          }
        };
        
        reader.onerror = () => {
          console.error('خطأ في قراءة الملف');
          resolve(null);
        };
        
        reader.readAsDataURL(file);
      });

    } catch (error) {
      console.error('خطأ غير متوقع في رفع الملف:', error);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleNewRequestFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, GIF) أو ملف PDF أو Word');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت');
      return;
    }

    setNewRequestForm({...newRequestForm, file});
  };

  const handleCreateNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!selectedServiceType) {
      alert('يرجى اختيار نوع الخدمة');
      return;
    }

    if (!newRequestForm.title.trim()) {
      alert('يرجى إدخال عنوان الطلب');
      return;
    }

    setCreatingRequest(true);

    let fileUrl = '';
    let fileName = '';
    let fileData = null;

    if (newRequestForm.file) {
      const uploadResult = await handleNewRequestFileUpload(newRequestForm.file);
      if (uploadResult) {
        fileUrl = uploadResult.url || '';
        fileName = uploadResult.name || '';
        fileData = uploadResult.base64Data || null;
      }
    }

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          service_type: selectedServiceType,
          title: newRequestForm.title.trim(),
          description: newRequestForm.description.trim() || null,
          priority: 'medium',
          status: 'pending',
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_data: fileData
        })
        .select()
        .single();

      if (insertError) {
        console.error('خطأ في إرسال الطلب:', insertError);
        alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
        return;
      }

      // إرسال إشعار للتيليجرام
      if (insertData) {
        try {
          const requestData = {
            id: insertData.id,
            title: insertData.title,
            description: insertData.description,
            service_type: insertData.service_type,
            priority: insertData.priority,
            status: insertData.status,
            created_at: insertData.created_at,
            file_url: insertData.file_url,
            file_name: insertData.file_name,
            user_name: profile?.full_name || 'غير محدد',
            user_email: profile?.email || 'غير محدد',
            user_phone: profile?.phone ? `${profile.country_code} ${profile.phone}` : 'غير محدد'
          };

          // إرسال إشعار حسب نوع الخدمة
          if (selectedServiceType === 'translation') {
            await telegramService.sendTranslationRequestNotification(requestData);
          } else if (selectedServiceType === 'consultation') {
            await telegramService.sendConsultationRequestNotification(requestData);
          } else if (selectedServiceType === 'legal') {
            await telegramService.sendLegalRequestNotification(requestData);
          } else {
            await telegramService.sendGeneralRequestNotification(requestData);
          }
        } catch (telegramError) {
          console.error('خطأ في إرسال إشعار التيليجرام:', telegramError);
          // لا نوقف العملية إذا فشل إرسال الإشعار
        }
      }

      setNewRequestSuccess(true);
      setNewRequestForm({ 
        title: '', 
        description: '', 
        file: null,
        fileUrl: '',
        fileName: ''
      });
      setSelectedServiceType('');
      
      // Refresh the requests list
      await fetchUserRequests();
      
      setTimeout(() => {
        setNewRequestSuccess(false);
        setShowNewRequestModal(false);
      }, 2000);

    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      alert('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setCreatingRequest(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  // Hide skeleton after a very short delay to show glass loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 100); // Very short delay to prevent white screen

    return () => clearTimeout(timer);
  }, []);

  // إضافة useEffect لمراقبة profile
  useEffect(() => {
    if (profile) {
      console.log('Profile updated:', profile);
    }
  }, [profile]);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب الطلبات:', error);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request: ServiceRequest) => {
    setEditingRequest(request);
    setEditForm({
      title: request.title,
      description: request.description || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRequest) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRequest.id);

      if (error) {
        console.error('خطأ في تحديث الطلب:', error);
        return;
      }

      await fetchUserRequests();
      setEditingRequest(null);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };



  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getServiceTypeArabic = (serviceType: string) => {
    const serviceTypes: { [key: string]: string } = {
      'health-insurance': 'التأمين الصحي للأجانب',
      'translation': 'خدمات الترجمة المحلفة',
      'travel': 'خدمات السفر والسياحة',
      'legal': 'الاستشارات القانونية',
      'government': 'الخدمات الحكومية',
      'insurance': 'خدمات التأمين الصحي وتأمين المركبات'
    };
    return serviceTypes[serviceType] || serviceType;
  };

  const getServiceName = (serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) return serviceId;
    
    // Map service IDs to Arabic names
    const serviceNames: { [key: string]: string } = {
      'health-insurance': 'التأمين الصحي',
      'translation': 'الترجمة',
      'travel': 'السفر والسياحة',
      'legal': 'الخدمات القانونية',
      'government': 'الخدمات الحكومية',
      'insurance': 'التأمين',
      'tourist-residence-renewal': 'تجديد الإقامة السياحية',
      'first-time-tourist-residence': 'الإقامة السياحية أول مرة'
    };
    
    return serviceNames[serviceId] || service.titleKey;
  };

  const getServiceIcon = (serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) return <FileText className="w-5 h-5" />;
    
    const IconComponent = service.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  const canUploadFile = (serviceType: string) => {
    return serviceType === 'translation' || serviceType === 'insurance' || serviceType === 'health-insurance';
  };

  const getStatusArabic = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const getPriorityArabic = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  // Show skeleton loading immediately to prevent white screen
  if (showSkeleton) {
    return (
      <SkeletonLoading
        isDarkMode={isDarkMode}
      />
    );
  }

  if (loading) {
    return (
      <GlassLoadingScreen
        text="جاري تحميل طلباتك..."
        subText="يرجى الانتظار"
        variant="sparkles"
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-platinum-50/80 via-caribbean-50/60 to-indigo-50/80 dark:from-jet-900/90 dark:via-caribbean-900/80 dark:to-indigo-900/90 relative overflow-hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Glass Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,110,113,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(60,110,113,0.2),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(122,146,171,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(122,146,171,0.15),transparent_50%)]"></div>
      
      
      
      {/* Navigation Bar - Enhanced Glass Effect */}
      <nav className="fixed top-0 left-0 right-0 z-[9999] bg-white/70 dark:bg-jet-800/70 backdrop-blur-2xl border-b border-white/30 dark:border-jet-700/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back to Home Button - Enhanced Glass */}
            <button
              onClick={onBack}
              className={`flex items-center px-3 py-2 text-caribbean-600 dark:text-caribbean-400 hover:text-caribbean-700 dark:hover:text-caribbean-300 hover:bg-caribbean-50/80 dark:hover:bg-caribbean-900/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-jet-700/20`}
            >
              <ArrowLeft className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
              <Home className={`w-5 h-5 ${isArabic ? 'ml-1' : 'mr-1'}`} />
              <span className="hidden sm:inline">العودة للصفحة الرئيسية</span>
            </button>

            {/* Page Title - Enhanced */}
            <h1 className="text-lg sm:text-xl font-bold text-jet-800 dark:text-white bg-gradient-to-r from-caribbean-600 to-indigo-700 bg-clip-text text-transparent">
              حسابي
            </h1>

            {/* User Info and Logout - Enhanced Glass */}
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <UserAvatar 
                user={user} 
                profile={profile} 
                size="sm" 
                showName={false}
                className="text-jet-600 dark:text-platinum-300"
              />
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  } catch (error) {
                    console.error('خطأ في تسجيل الخروج:', error);
                  }
                }}
                className="flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-jet-700/20"
                title="تسجيل الخروج"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline mr-2">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </nav>



      {/* Main Content Container - Mobile Friendly */}
      <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Profile Header Card - Enhanced Glass Effect */}
        <div className="bg-gradient-to-r from-caribbean-600/80 via-indigo-700/80 to-caribbean-700/80 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl mb-6 sm:mb-8 text-white border border-white/30 relative overflow-hidden">
          {/* Glass Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]"></div>
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
              <div className="relative flex justify-center sm:justify-start">
                <UserAvatar 
                  user={user} 
                  profile={profile} 
                  size="xl" 
                  showName={false}
                  className="ring-4 ring-white/40 backdrop-blur-sm shadow-2xl"
                />
                {/* Badge for Google users */}
                {user?.user_metadata?.provider === 'google' && (
                  <div className="absolute -bottom-1 -right-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/30">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white drop-shadow-lg">{profile?.full_name || 'مستخدم'}</h1>
                <p className="text-caribbean-100 text-base sm:text-lg">{profile?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start items-center mt-2 space-x-2 sm:space-x-4 space-x-reverse">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                    <User className="w-4 h-4 ml-1" />
                    {profile?.role === 'admin' ? 'مدير' : profile?.role === 'moderator' ? 'مشرف' : 'مستخدم'}
                  </span>
                  {user?.user_metadata?.provider === 'google' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      </svg>
                      Google
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-caribbean-600 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-white/30"
              >
                <Lock className="w-4 h-4 ml-2" />
                تغيير كلمة المرور
              </button>
            </div>
          </div>
        </div>



        {/* Stats - Enhanced Glass Effect */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-caribbean-500/5 to-indigo-500/5"></div>
            <div className="relative flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-caribbean-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl border border-caribbean-200/30 dark:border-caribbean-700/30">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-caribbean-600 dark:text-caribbean-400" />
              </div>
              <div className="mr-3 sm:mr-4">
                <p className="text-xs sm:text-sm text-jet-600 dark:text-platinum-300">إجمالي الطلبات</p>
                <p className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white stat-number">{requests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
            <div className="relative flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-amber-200/30 dark:border-amber-700/30">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mr-3 sm:mr-4">
                <p className="text-xs sm:text-sm text-jet-600 dark:text-platinum-300">قيد الانتظار</p>
                <p className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white stat-number">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-blue-500/5"></div>
            <div className="relative flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-sky-200/30 dark:border-sky-700/30">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="mr-3 sm:mr-4">
                <p className="text-xs sm:text-sm text-jet-600 dark:text-platinum-300">قيد التنفيذ</p>
                <p className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white stat-number">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <div className="relative flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mr-3 sm:mr-4">
                <p className="text-xs sm:text-sm text-jet-600 dark:text-platinum-300">مكتملة</p>
                <p className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white stat-number">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Request Button - Enhanced Glass */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="w-full bg-gradient-to-r from-caribbean-600/80 via-indigo-700/80 to-caribbean-700/80 backdrop-blur-2xl text-white py-4 px-6 rounded-3xl font-semibold hover:from-caribbean-700 hover:via-indigo-800 hover:to-caribbean-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center border border-white/30 relative overflow-hidden"
          >
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]"></div>
            <span className="relative flex items-center">
              <Plus className="w-5 h-5 ml-2" />
              إنشاء طلب جديد
            </span>
          </button>
        </div>

        {/* Quick Services Section - Enhanced Glass */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white mb-4 text-center">
            الخدمات السريعة
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tourist Residence Renewal */}
            <button
              onClick={() => {
                setSelectedResidenceType('renewal');
                setShowResidenceRequestModal(true);
              }}
              className="bg-gradient-to-r from-emerald-600/80 to-teal-700/80 backdrop-blur-2xl text-white py-4 px-6 rounded-3xl font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center border border-white/30 relative overflow-hidden"
            >
              {/* Glass Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]"></div>
              <span className="relative flex items-center">
                <RefreshCw className="w-5 h-5 ml-2" />
                تجديد الإقامة السياحية
              </span>
            </button>

            {/* First Time Tourist Residence */}
            <button
              onClick={() => {
                setSelectedResidenceType('first-time');
                setShowResidenceRequestModal(true);
              }}
              className="bg-gradient-to-r from-blue-600/80 to-indigo-700/80 backdrop-blur-2xl text-white py-4 px-6 rounded-3xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center border border-white/30 relative overflow-hidden"
            >
              {/* Glass Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]"></div>
              <span className="relative flex items-center">
                <Home className="w-5 h-5 ml-2" />
                الإقامة السياحية أول مرة
              </span>
            </button>
          </div>

          {/* Other Quick Services */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'translation', icon: Users, color: 'from-purple-600/80 to-purple-700/80', hover: 'from-purple-700 to-purple-800' },
              { id: 'health-insurance', icon: Shield, color: 'from-red-600/80 to-red-700/80', hover: 'from-red-700 to-red-800' },
              { id: 'legal', icon: Star, color: 'from-yellow-600/80 to-yellow-700/80', hover: 'from-yellow-700 to-yellow-800' },
              { id: 'travel', icon: Globe, color: 'from-green-600/80 to-green-700/80', hover: 'from-green-700 to-green-800' }
            ].map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedServiceType(service.id);
                    setShowNewRequestModal(true);
                  }}
                  className={`bg-gradient-to-r ${service.color} backdrop-blur-2xl text-white py-3 px-4 rounded-2xl font-medium hover:${service.hover} transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex flex-col items-center justify-center border border-white/30 relative overflow-hidden`}
                >
                  {/* Glass Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]"></div>
                  <span className="relative flex flex-col items-center">
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-xs">{getServiceName(service.id)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters - Enhanced Glass Effect */}
        <div className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 mb-6 sm:mb-8 relative overflow-hidden">
          {/* Glass Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-caribbean-500/5 to-indigo-500/5"></div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-jet-400 dark:text-platinum-500 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في طلباتك..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white placeholder-jet-500 dark:placeholder-platinum-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغية</option>
            </select>
          </div>
        </div>

        {/* Requests List - Enhanced Glass Effect */}
        <div className="space-y-4 sm:space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 p-8 sm:p-12 text-center relative overflow-hidden">
              {/* Glass Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-caribbean-500/5 to-indigo-500/5"></div>
              <div className="relative">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-jet-400 dark:text-platinum-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-jet-800 dark:text-white mb-2">لا توجد طلبات</h3>
                <p className="text-jet-600 dark:text-platinum-400">لم تقم بإنشاء أي طلبات بعد</p>
              </div>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white/60 dark:bg-jet-800/60 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/30 dark:border-jet-700/30 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                {/* Glass Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-caribbean-500/3 to-indigo-500/3"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse mb-3 sm:mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-jet-800 dark:text-white">
                        {request.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)} backdrop-blur-sm border border-white/20`}>
                        {getStatusIcon(request.status)}
                        <span className="mr-1">{getStatusArabic(request.status)}</span>
                      </span>
                    </div>
                    <p className="font-medium text-jet-800 dark:text-white font-mono text-sm" dir="ltr">
                      {new Date(request.updated_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </p>
                    {request.description && (
                      <p className="text-jet-700 dark:text-platinum-300 mb-3 text-sm sm:text-base">
                        {request.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse text-sm text-jet-500 dark:text-platinum-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 ml-1" />
                        <span className="font-mono text-xs sm:text-sm" dir="ltr">
                          {formatDisplayDate(request.created_at)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)} backdrop-blur-sm border border-white/20`}>
                        {getPriorityArabic(request.priority)}
                      </span>
                    </div>
                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                          <strong>ملاحظات الإدارة:</strong> {request.admin_notes}
                        </p>
                      </div>
                    )}
                    
                    {/* File Display - Enhanced Glass */}
                    {request.file_url && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-700/30">
                        <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                          <strong>الملف المرفق:</strong> {request.file_name || 'ملف مرفق'}
                          {request.file_url.startsWith('base64://') && (
                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                              (محفوظ في قاعدة البيانات)
                            </span>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                          <button
                            onClick={() => handleFileView(request.file_url!, request.file_name || 'file', request.id)}
                            className="group flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm text-white text-sm rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform border border-white/20"
                          >
                            <Eye className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                            <span className="font-semibold">عرض</span>
                          </button>
                          <button
                            onClick={() => handleFileDownload(request.file_url!, request.file_name || 'file', request.id)}
                            className="group flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-sm text-white text-sm rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform border border-white/20"
                          >
                            <Download className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                            <span className="font-semibold">تحميل</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    {(request.status === 'pending' || request.status === 'in_progress') && (
                      <button
                        onClick={() => handleEdit(request)}
                        className="p-2 text-caribbean-600 hover:text-caribbean-700 dark:text-caribbean-400 dark:hover:text-caribbean-300 hover:bg-caribbean-50/80 dark:hover:bg-caribbean-900/20 backdrop-blur-sm rounded-2xl transition-all duration-300 border border-white/20"
                        title="تعديل الطلب"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal - Enhanced Glass Effect */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingRequest(null)}></div>
          <div className="relative bg-white/80 dark:bg-jet-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md mx-auto p-6 sm:p-8 border border-white/30 dark:border-jet-700/30 relative overflow-hidden">
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-caribbean-500/5 to-indigo-500/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white">تعديل الطلب</h2>
                <button
                  onClick={() => setEditingRequest(null)}
                  className="text-jet-400 hover:text-jet-600 dark:text-platinum-400 dark:hover:text-platinum-200 p-2 hover:bg-platinum-100/50 dark:hover:bg-jet-700/50 rounded-2xl transition-all duration-300"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                    عنوان الطلب
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                    وصف الطلب
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-gradient-to-r from-caribbean-600/90 to-indigo-700/90 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 border border-white/20"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </button>
                  <button
                    onClick={() => setEditingRequest(null)}
                    className="flex-1 bg-platinum-200/80 dark:bg-jet-600/80 backdrop-blur-sm text-jet-800 dark:text-white py-3 px-6 rounded-2xl font-semibold hover:bg-platinum-300/80 dark:hover:bg-jet-500/80 transition-all duration-300 border border-white/20"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal - Enhanced Glass Effect */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewRequestModal(false)}></div>
          
          <div className="relative bg-white/80 dark:bg-jet-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md mx-auto p-6 sm:p-8 border border-white/30 dark:border-jet-700/30 max-h-[90vh] overflow-y-auto relative overflow-hidden">
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-caribbean-500/5 to-indigo-500/5"></div>
            <div className="relative">
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="absolute top-4 right-4 p-2 text-jet-400 hover:text-jet-600 dark:text-platinum-400 dark:hover:text-platinum-200 transition-colors duration-300 hover:bg-platinum-100/50 dark:hover:bg-jet-700/50 rounded-2xl"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-caribbean-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <FileText className="w-6 h-6 text-caribbean-600 dark:text-caribbean-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white mb-2">
                  طلب خدمة جديد
                </h2>
                <p className="text-jet-600 dark:text-platinum-400 text-sm sm:text-base">
                  اختر نوع الخدمة وأدخل تفاصيل طلبك
                </p>
              </div>

              {newRequestSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                    <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-jet-800 dark:text-white mb-2">
                    تم إرسال الطلب بنجاح!
                  </h2>
                  <p className="text-jet-600 dark:text-platinum-400 mb-4 text-sm sm:text-base">
                    سيتم التواصل معك قريباً لمتابعة طلبك
                  </p>
                  <div className="w-full bg-emerald-200/80 dark:bg-emerald-900/30 backdrop-blur-sm rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateNewRequest} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                      نوع الخدمة *
                    </label>
                    <select
                      value={selectedServiceType}
                      onChange={(e) => setSelectedServiceType(e.target.value)}
                      className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                      required
                    >
                      <option value="">اختر نوع الخدمة</option>
                      {servicesData.map((service) => (
                        <option key={service.id} value={service.id}>
                          {getServiceName(service.id)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                      عنوان الطلب *
                    </label>
                    <input
                      type="text"
                      value={newRequestForm.title}
                      onChange={(e) => setNewRequestForm({...newRequestForm, title: e.target.value})}
                      className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                      placeholder="مثال: ترجمة شهادة الميلاد"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                      وصف الطلب
                    </label>
                    <textarea
                      value={newRequestForm.description}
                      onChange={(e) => setNewRequestForm({...newRequestForm, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-jet-300/50 dark:border-jet-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-caribbean-500/50 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-jet-700/50 backdrop-blur-sm text-jet-900 dark:text-white"
                      placeholder="اكتب تفاصيل إضافية عن طلبك..."
                    />
                  </div>

                  {/* File Upload - only for specific services */}
                  {selectedServiceType && canUploadFile(selectedServiceType) && (
                    <div>
                      <label className="block text-sm font-medium text-jet-700 dark:text-platinum-300 mb-2">
                        {selectedServiceType === 'translation' ? 'صورة الوثيقة المطلوب ترجمتها' : 'صورة جواز السفر أو الإقامة'}
                      </label>
                      <div className="relative border-2 border-dashed border-jet-300/50 dark:border-jet-600/50 rounded-2xl p-6 text-center hover:border-caribbean-500/50 dark:hover:border-caribbean-400/50 transition-all duration-300 bg-white/30 dark:bg-jet-700/30 backdrop-blur-sm">
                        {newRequestForm.file ? (
                          <div className="flex items-center justify-center space-x-2 space-x-reverse">
                            <Image className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                              {newRequestForm.file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewRequestForm({...newRequestForm, file: null})}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-jet-400 dark:text-platinum-500 mx-auto mb-4" />
                            <p className="text-jet-600 dark:text-platinum-400 mb-2 text-sm">
                              اضغط لاختيار ملف أو اسحبه هنا
                            </p>
                            <p className="text-xs text-jet-500 dark:text-platinum-500">
                              JPG, PNG, GIF, PDF (حتى 2 ميجابايت)
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          onChange={handleNewRequestFileChange}
                          accept="image/*,.pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={uploadingFile}
                        />
                      </div>
                      <p className="text-xs text-jet-500 dark:text-platinum-500 mt-1">
                        {selectedServiceType === 'translation' 
                          ? 'رفع صورة الوثيقة يساعدنا في تقديم عرض سعر دقيق'
                          : 'رفع صورة الوثائق يسرع من عملية معالجة طلبك'
                        }
                      </p>
                    </div>
                  )}

                  <div className="bg-platinum-50/80 dark:bg-jet-700/80 backdrop-blur-sm p-4 rounded-2xl border border-platinum-200/50 dark:border-jet-600/50">
                    <h4 className="font-medium text-jet-800 dark:text-white mb-2">معلومات التواصل</h4>
                    <div className="text-sm text-jet-600 dark:text-platinum-400 space-y-1">
                      <p><strong>الاسم:</strong> {profile?.full_name}</p>
                      <p><strong>البريد الإلكتروني:</strong> {profile?.email}</p>
                      {profile?.phone && (
                        <p><strong>الهاتف:</strong> {profile.country_code} {profile.phone}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingRequest || uploadingFile}
                    className="w-full bg-gradient-to-r from-caribbean-600/90 to-indigo-700/90 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold hover:from-caribbean-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center border border-white/20"
                  >
                    {creatingRequest || uploadingFile ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        {uploadingFile ? 'جاري رفع الملف...' : 'جاري الإرسال...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 ml-2" />
                        إرسال الطلب
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-jet-500 dark:text-platinum-500">
                  سيتم التواصل معك خلال 24 ساعة لمتابعة طلبك
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Residence Request Form Modal */}
      <ResidenceRequestForm
        isOpen={showResidenceRequestModal}
        onClose={() => setShowResidenceRequestModal(false)}
        residenceType={selectedResidenceType}
        isDarkMode={isDarkMode}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default UserAccount;
