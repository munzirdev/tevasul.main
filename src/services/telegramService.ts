import { supabase } from '../lib/supabase';

interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  isEnabled: boolean;
}

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: any;
}

// إضافة واجهة لإرسال الملفات
interface TelegramFileMessage {
  chat_id: string;
  document?: string; // Base64 encoded file
  photo?: string; // Base64 encoded image
  caption?: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: any;
}

// أنواع الطلبات المختلفة
export type RequestType = 
  | 'chat_support'
  | 'translation'
  | 'insurance'
  | 'voluntary_return'
  | 'health_insurance_activation'
  | 'health_insurance'
  | 'service_request'
  | 'tourist_residence_renewal'
  | 'first_time_tourist_residence'
  | 'general_inquiry'
  | 'consultation'
  | 'legal'
  | 'general';

interface RequestData {
  type: RequestType;
  title?: string;
  description?: string;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
  sessionId?: string;
  formId?: string;
  requestId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
  createdAt?: string;
  additionalData?: any;
}

class TelegramService {
  private config: TelegramConfig = {
    botToken: '',
    adminChatId: '',
    isEnabled: false
  };

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .eq('id', 2)
        .single();

      if (data && !error) {
        this.config = {
          botToken: data.bot_token || '',
          adminChatId: data.admin_chat_id || '',
          isEnabled: data.is_enabled || false
        };
        } else {
        }
    } catch (error) {
    }
  }

  async updateConfig(config: Partial<TelegramConfig>) {
    try {
      const { error } = await supabase
        .from('telegram_config')
        .upsert({
          id: 2,
          bot_token: config.botToken || this.config.botToken,
          admin_chat_id: config.adminChatId || this.config.adminChatId,
          is_enabled: config.isEnabled !== undefined ? config.isEnabled : this.config.isEnabled,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        this.config = { ...this.config, ...config };
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    try {
      // استخدام Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          sessionId: 'message-' + Date.now(),
          message: message.text,
          language: 'ar',
          requestType: 'general_inquiry'
        }
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async sendChatReply(sessionId: string, message: string, adminName?: string): Promise<boolean> {
    try {
      const text = `💬 <b>رد من المدير</b>\n\n` +
                   `📝 <b>الرسالة:</b> ${message}\n` +
                   `🆔 <b>رقم الجلسة:</b> ${sessionId.substring(0, 8)}...\n` +
                   `👤 <b>المدير:</b> ${adminName || 'غير محدد'}\n` +
                   `⏰ <b>التاريخ:</b> ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

      // استخدام Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          sessionId: sessionId,
          message: text,
          language: 'ar',
          requestType: 'admin_reply',
          adminName: adminName
        }
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // دالة جديدة لإرسال الملفات
  async sendFile(fileMessage: TelegramFileMessage): Promise<boolean> {
    try {
      // استخدام Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          sessionId: 'file-' + Date.now(),
          message: fileMessage.caption || 'ملف مرفق',
          language: 'ar',
          requestType: 'general_inquiry',
          filePath: fileMessage.document || fileMessage.photo
        }
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // دالة جديدة لإرسال ملف فعلي إلى التيليجرام
  async sendActualFile(chatId: string, fileData: { data: string; type: string; name: string }, caption: string, replyMarkup?: any): Promise<boolean> {
    try {
      // استخدام Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          sessionId: 'file-' + Date.now(),
          message: caption,
          language: 'ar',
          requestType: 'general_inquiry',
          filePath: `temp/${fileData.name}` // سيتم التعامل مع الملف في الـ Edge Function
        }
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // دالة لجلب الملف من قاعدة البيانات
  private async getFileFromDatabase(fileUrl: string): Promise<{ data: string; type: string; name: string } | null> {
    try {
      if (fileUrl.startsWith('base64://')) {
        const fileId = fileUrl.replace('base64://', '');
        
        // محاولة جلب الملف من file_attachments أولاً
        let { data: attachmentData, error } = await supabase
          .from('file_attachments')
          .select('file_data, file_type, file_name')
          .eq('id', fileId)
          .single();
        
        if (error || !attachmentData) {
          // محاولة جلب الملف من service_requests
          const { data: requestData, error: requestError } = await supabase
            .from('service_requests')
            .select('file_data, file_name')
            .eq('id', fileId)
            .single();
          
          if (requestError || !requestData || !requestData.file_data) {
            return null;
          }
          
          return {
            data: requestData.file_data,
            type: this.getFileTypeFromName(requestData.file_name),
            name: requestData.file_name
          };
        }
        
        return {
          data: attachmentData.file_data,
          type: attachmentData.file_type,
          name: attachmentData.file_name
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // دالة لتحديد نوع الملف من اسمه
  private getFileTypeFromName(fileName: string): string {
    const fileNameLower = fileName.toLowerCase();
    if (fileNameLower.endsWith('.pdf')) {
      return 'application/pdf';
    } else if (fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (fileNameLower.endsWith('.png')) {
      return 'image/png';
    } else if (fileNameLower.endsWith('.gif')) {
      return 'image/gif';
    } else if (fileNameLower.endsWith('.txt')) {
      return 'text/plain';
    } else if (fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.docx')) {
      return 'application/msword';
    }
    return 'application/octet-stream';
  }

  // دالة محسنة لإرسال إشعارات مع المرفقات
  async sendRequestNotificationWithFile(requestData: RequestData): Promise<boolean> {
    try {
      // استخدام Supabase Edge Function بدلاً من السيرفر
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          sessionId: requestData.sessionId || `req-${Date.now()}`,
          message: requestData.description || '',
          language: 'ar',
          requestType: requestData.type,
          filePath: requestData.additionalData?.fileUrl || requestData.additionalData?.passportImageUrl,
          userInfo: requestData.userInfo,
          additionalData: requestData.additionalData,
          requestId: requestData.requestId
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return false;
      }

      console.log('Edge function response:', data);
      return true;
    } catch (error) {
      console.error('Error in sendRequestNotificationWithFile:', error);
      return false;
    }
  }

  // دالة عامة لإرسال إشعارات لجميع أنواع الطلبات
  async sendRequestNotification(requestData: RequestData): Promise<boolean> {
    try {
      console.log('Sending telegram notification:', {
        type: requestData.type,
        sessionId: requestData.sessionId,
        hasUserInfo: !!requestData.userInfo
      });

      // استخدام fetch مباشرة بدلاً من supabase.functions.invoke
      // لأن edge function الآن بدون JWT verification
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          sessionId: requestData.sessionId,
          message: requestData.description || '',
          language: 'ar',
          requestType: requestData.type,
          filePath: requestData.additionalData?.fileUrl, // إرسال مسار الملف إذا وجد
          userInfo: requestData.userInfo,
          additionalData: requestData.additionalData,
          requestId: requestData.requestId
        })
      });

      if (!response.ok) {
        console.error('Telegram webhook error:', await response.text());
        return false;
      }

      const data = await response.json();
      console.log('Telegram notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending telegram notification:', error);
      return false;
    }
  }

  // إشعارات الدعم الفني (المحادثات)
  async sendSupportRequestNotification(sessionData: any) {
    return this.sendRequestNotification({
      type: 'chat_support',
      title: 'طلب ممثل خدمة عملاء',
      description: sessionData.last_message,
      userInfo: sessionData.user_info,
      sessionId: sessionData.session_id,
      priority: sessionData.priority,
      status: sessionData.status,
      createdAt: sessionData.last_message_time,
      additionalData: {
        messageCount: sessionData.message_count,
        language: sessionData.language
      }
    });
  }

  async sendNewMessageNotification(sessionData: any, messageContent: string) {
    return this.sendRequestNotification({
      type: 'chat_support',
      title: 'رسالة جديدة من العميل',
      description: messageContent,
      userInfo: sessionData.user_info,
      sessionId: sessionData.session_id,
      priority: sessionData.priority,
      status: sessionData.status,
      createdAt: new Date().toISOString(),
      additionalData: {
        messageCount: sessionData.message_count,
        language: sessionData.language
      }
    });
  }

  async sendUrgentMessageNotification(sessionData: any, messageContent: string) {
    return this.sendRequestNotification({
      type: 'chat_support',
      title: 'رسالة مستعجلة!',
      description: messageContent,
      userInfo: sessionData.user_info,
      sessionId: sessionData.session_id,
      priority: 'urgent',
      status: sessionData.status,
      createdAt: new Date().toISOString(),
      additionalData: {
        messageCount: sessionData.message_count,
        language: sessionData.language,
        isUrgent: true
      }
    });
  }

  // إشعارات طلبات الترجمة
  async sendTranslationRequestNotification(requestData: any) {
    return this.sendRequestNotificationWithFile({
      type: 'translation',
      title: requestData.title || 'طلب ترجمة جديد',
      description: requestData.description,
      userInfo: {
        name: requestData.user_name,
        email: requestData.user_email,
        phone: requestData.user_phone
      },
      requestId: requestData.id,
      priority: requestData.priority || 'medium',
      status: requestData.status,
      createdAt: requestData.created_at,
      additionalData: {
        hasFile: !!requestData.file_url,
        fileName: requestData.file_name,
        fileUrl: requestData.file_url
      }
    });
  }

  // إشعارات طلبات التأمين
  async sendInsuranceRequestNotification(requestData: any) {
    return this.sendRequestNotificationWithFile({
      type: 'insurance',
      title: requestData.title || 'طلب تأمين جديد',
      description: requestData.description,
      userInfo: {
        name: requestData.user_name,
        email: requestData.user_email,
        phone: requestData.user_phone
      },
      requestId: requestData.id,
      priority: requestData.priority || 'medium',
      status: requestData.status,
      createdAt: requestData.created_at,
      additionalData: {
        hasFile: !!requestData.file_url,
        fileName: requestData.file_name,
        fileUrl: requestData.file_url
      }
    });
  }

  // إشعارات طلبات الاستشارة
  async sendConsultationRequestNotification(requestData: any) {
    return this.sendRequestNotificationWithFile({
      type: 'consultation',
      title: requestData.title || 'طلب استشارة جديد',
      description: requestData.description,
      userInfo: {
        name: requestData.user_name,
        email: requestData.user_email,
        phone: requestData.user_phone
      },
      requestId: requestData.id,
      priority: requestData.priority || 'medium',
      status: requestData.status,
      createdAt: requestData.created_at,
      additionalData: {
        hasFile: !!requestData.file_url,
        fileName: requestData.file_name,
        fileUrl: requestData.file_url
      }
    });
  }

  // إشعارات طلبات الخدمات القانونية
  async sendLegalRequestNotification(requestData: any) {
    return this.sendRequestNotificationWithFile({
      type: 'legal',
      title: requestData.title || 'طلب خدمة قانونية جديد',
      description: requestData.description,
      userInfo: {
        name: requestData.user_name,
        email: requestData.user_email,
        phone: requestData.user_phone
      },
      requestId: requestData.id,
      priority: requestData.priority || 'medium',
      status: requestData.status,
      createdAt: requestData.created_at,
      additionalData: {
        hasFile: !!requestData.file_url,
        fileName: requestData.file_name,
        fileUrl: requestData.file_url
      }
    });
  }

  // إشعارات الطلبات العامة
  async sendGeneralRequestNotification(requestData: any) {
    return this.sendRequestNotificationWithFile({
      type: 'general',
      title: requestData.title || 'طلب خدمة جديد',
      description: requestData.description,
      userInfo: {
        name: requestData.user_name,
        email: requestData.user_email,
        phone: requestData.user_phone
      },
      requestId: requestData.id,
      priority: requestData.priority || 'medium',
      status: requestData.status,
      createdAt: requestData.created_at,
      additionalData: {
        hasFile: !!requestData.file_url,
        fileName: requestData.file_name,
        fileUrl: requestData.file_url
      }
    });
  }

  // إشعارات طلبات العودة الطوعية
  async sendVoluntaryReturnNotification(formData: any) {
    return this.sendRequestNotification({
      type: 'voluntary_return',
      title: 'طلب عودة طوعية جديد',
      description: `طلب عودة طوعية من ${formData.full_name_tr}`,
      userInfo: {
        name: formData.full_name_tr,
        phone: formData.gsm
      },
      formId: formData.id,
      priority: 'high',
      status: 'pending',
      createdAt: formData.created_at,
      additionalData: {
        kimlikNo: formData.kimlik_no,
        sinirKapisi: formData.sinir_kapisi,
        refakatCount: formData.refakat_entries?.length || 0,
        customDate: formData.custom_date
      }
    });
  }

  // إشعارات طلبات تفعيل التأمين الصحي
  async sendHealthInsuranceActivationNotification(formData: any) {
    return this.sendRequestNotification({
      type: 'health_insurance_activation',
      title: 'طلب تفعيل تأمين صحي جديد',
      description: `طلب تفعيل تأمين صحي من ${formData.full_name}`,
      userInfo: {
        name: formData.full_name,
        phone: formData.phone
      },
      formId: formData.id,
      priority: 'high',
      status: 'pending',
      createdAt: formData.created_at,
      additionalData: {
        kimlikNo: formData.kimlik_no,
        address: formData.address
      }
    });
  }

  // إشعارات طلبات التأمين الصحي للأجانب
  async sendHealthInsuranceRequestNotification(requestData: any) {
    return this.sendRequestNotificationWithFile({
      type: 'health_insurance',
      title: requestData.title || 'طلب تأمين صحي للأجانب جديد',
      description: requestData.description || 'طلب تأمين صحي للأجانب',
      userInfo: {
        name: requestData.user_name,
        email: requestData.user_email,
        phone: requestData.user_phone
      },
      requestId: requestData.requestId,
      priority: requestData.priority || 'medium',
      status: requestData.status || 'pending',
      createdAt: requestData.createdAt,
      additionalData: {
        companyName: requestData.additionalData?.companyName,
        ageGroup: requestData.additionalData?.ageGroup,
        calculatedAge: requestData.additionalData?.calculatedAge,
        durationMonths: requestData.additionalData?.durationMonths,
        calculatedPrice: requestData.additionalData?.calculatedPrice,
        hasPassportImage: requestData.additionalData?.hasPassportImage,
        passportImageUrl: requestData.additionalData?.passportImageUrl
      }
    });
  }

  // إشعارات طلبات الخدمات العامة
  async sendServiceRequestNotification(requestData: any) {
    try {
      return await this.sendRequestNotificationWithFile({
        type: 'service_request',
        title: requestData.title || 'طلب خدمة جديد',
        description: requestData.description,
        userInfo: {
          name: requestData.user_name,
          email: requestData.user_email,
          phone: requestData.user_phone
        },
        requestId: requestData.id,
        priority: requestData.priority || 'medium',
        status: requestData.status,
        createdAt: requestData.created_at,
        additionalData: {
          serviceType: requestData.service_type || requestData.additionalData?.serviceType,
          hasFile: !!requestData.file_url,
          fileName: requestData.file_name,
          fileUrl: requestData.file_url
        }
      });
    } catch (error) {
      console.error('Error in sendServiceRequestNotification:', error);
      throw error;
    }
  }

  private formatRequestNotification(requestData: RequestData): string {
    const emoji = this.getRequestTypeEmoji(requestData.type);
    const priorityEmoji = this.getPriorityEmoji(requestData.priority);
    
    let message = `
${emoji} <b>${requestData.title}</b>

👤 <b>معلومات العميل:</b>
• الاسم: ${requestData.userInfo?.name || 'غير محدد'}
• البريد الإلكتروني: ${requestData.userInfo?.email || 'غير محدد'}
• رقم الهاتف: ${requestData.userInfo?.phone || 'غير محدد'}
${requestData.userInfo?.country ? `• البلد: ${requestData.userInfo.country}` : ''}

📝 <b>تفاصيل الطلب:</b>
${requestData.description || 'لا يوجد وصف'}

📊 <b>معلومات إضافية:</b>
• نوع الطلب: ${this.getRequestTypeText(requestData.type)}
• الأولوية: ${priorityEmoji} ${this.getPriorityText(requestData.priority)}
• الحالة: ${requestData.status || 'معلق'}
`;

    // إضافة معلومات خاصة بكل نوع طلب
    if (requestData.additionalData) {
      message += this.getAdditionalDataText(requestData.type, requestData.additionalData);
    }

    // إضافة معرفات
    if (requestData.sessionId) {
      message += `\n💬 <b>معرف الجلسة:</b> <code>${requestData.sessionId}</code>`;
    }
    if (requestData.formId) {
      message += `\n📋 <b>معرف النموذج:</b> <code>${requestData.formId}</code>`;
    }
    if (requestData.requestId) {
      message += `\n🆔 <b>معرف الطلب:</b> <code>${requestData.requestId}</code>`;
    }

    const date = new Date(requestData.createdAt || Date.now());
   const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
   message += `\n\n⏰ <b>التوقيت:</b>
${dateStr}`;

    return message.trim();
  }

  private getRequestTypeEmoji(type: RequestType): string {
    switch (type) {
      case 'chat_support': return '💬';
      case 'translation': return '🌐';
      case 'insurance': return '🛡️';
      case 'voluntary_return': return '🛂';
      case 'health_insurance_activation': return '🏥';
      case 'health_insurance': return '🏥';
      case 'service_request': return '📋';
      case 'general_inquiry': return '❓';
      default: return '📝';
    }
  }

  private getRequestTypeText(type: RequestType): string {
    switch (type) {
      case 'chat_support': return 'دعم فني / محادثة';
      case 'translation': return 'ترجمة';
      case 'insurance': return 'تأمين';
      case 'voluntary_return': return 'عودة طوعية';
      case 'health_insurance_activation': return 'تفعيل تأمين صحي';
      case 'health_insurance': return 'تأمين صحي للأجانب';
      case 'service_request': return 'طلب خدمة';
      case 'tourist_residence_renewal': return 'تجديد الإقامة السياحية';
      case 'first_time_tourist_residence': return 'الإقامة السياحية أول مرة';
      case 'general_inquiry': return 'استفسار عام';
      default: return 'طلب عام';
    }
  }

  private getPriorityEmoji(priority?: string): string {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  private getPriorityText(priority?: string): string {
    switch (priority) {
      case 'urgent': return 'مستعجل';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'عادي';
    }
  }

  private getAdditionalDataText(type: RequestType, additionalData: any): string {
    let text = '';
    
    switch (type) {
      case 'chat_support':
        if (additionalData.messageCount) {
          text += `• عدد الرسائل: ${additionalData.messageCount}\n`;
        }
        if (additionalData.language) {
          text += `• اللغة: ${additionalData.language === 'ar' ? 'العربية' : 'English'}\n`;
        }
        if (additionalData.isUrgent) {
          text += `• ⚠️ هذه رسالة مستعجلة تتطلب رداً فورياً!\n`;
        }
        break;
        
      case 'translation':
      case 'insurance':
      case 'service_request':
        if (additionalData.hasFile) {
          text += `• 📎 مرفق ملف: ${additionalData.fileName || 'ملف مرفق'}\n`;
        }
        if (additionalData.serviceType) {
          text += `• نوع الخدمة: ${this.getRequestTypeText(additionalData.serviceType)}\n`;
        }
        break;
        
      case 'voluntary_return':
        if (additionalData.kimlikNo) {
          text += `• رقم الهوية: ${additionalData.kimlikNo}\n`;
        }
        if (additionalData.sinirKapisi) {
          text += `• نقطة الحدود: ${additionalData.sinirKapisi}\n`;
        }
        if (additionalData.refakatCount > 0) {
          text += `• عدد المرافقين: ${additionalData.refakatCount}\n`;
        }
        if (additionalData.customDate) {
          text += `• تاريخ مخصص: ${additionalData.customDate}\n`;
        }
        break;
        
      case 'health_insurance_activation':
        if (additionalData.kimlikNo) {
          text += `• رقم الهوية: ${additionalData.kimlikNo}\n`;
        }
        if (additionalData.address) {
          text += `• العنوان: ${additionalData.address}\n`;
        }
        break;
        
      case 'health_insurance':
        if (additionalData.companyName) {
          text += `• شركة التأمين: ${additionalData.companyName}\n`;
        }
        if (additionalData.ageGroup) {
          text += `• الفئة العمرية: ${additionalData.ageGroup}\n`;
        }
        if (additionalData.calculatedAge) {
          text += `• العمر المحسوب: ${additionalData.calculatedAge} سنة\n`;
        }
        if (additionalData.durationMonths) {
          text += `• مدة التأمين: ${additionalData.durationMonths} شهر\n`;
        }
        if (additionalData.calculatedPrice) {
          text += `• السعر المحسوب: ${additionalData.calculatedPrice} ليرة تركية\n`;
        }
        if (additionalData.hasPassportImage) {
          text += `• 📎 مرفق صورة جواز السفر\n`;
        }
        break;
    }
    
    return text;
  }

  private getRequestReplyMarkup(requestData: RequestData): any {
    const buttons = [];
    
    switch (requestData.type) {
      case 'chat_support':
        buttons.push([
          {
            text: '💬 الرد على العميل',
            callback_data: `reply_${requestData.sessionId}`
          }
        ]);
        buttons.push([
          {
            text: '📋 عرض التفاصيل',
            callback_data: `details_${requestData.sessionId}`
          }
        ]);
        break;
        
      case 'translation':
      case 'insurance':
      case 'service_request':
        buttons.push([
          {
            text: '📞 التواصل مع العميل',
            callback_data: `contact_${requestData.requestId}`
          }
        ]);
        buttons.push([
          {
            text: '📋 عرض الطلب',
            callback_data: `view_${requestData.requestId}`
          }
        ]);
        break;
        
      case 'voluntary_return':
      case 'health_insurance_activation':
        buttons.push([
          {
            text: '📋 عرض النموذج',
            callback_data: `view_form_${requestData.formId}`
          }
        ]);
        buttons.push([
          {
            text: '📞 التواصل مع العميل',
            callback_data: `contact_form_${requestData.formId}`
          }
        ]);
        break;
        
      case 'health_insurance':
        buttons.push([
          {
            text: '📋 عرض الطلب',
            callback_data: `view_${requestData.requestId}`
          }
        ]);
        buttons.push([
          {
            text: '📞 التواصل مع العميل',
            callback_data: `contact_${requestData.requestId}`
          }
        ]);
        break;
    }
    
    // إضافة زر إغلاق للجميع
    buttons.push([
      {
        text: '✅ تم التعامل معه',
        callback_data: `close_${requestData.type}_${requestData.sessionId || requestData.formId || requestData.requestId}`
      }
    ]);
    
    return {
      inline_keyboard: buttons
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      // استخدام Supabase Edge Function لاختبار الاتصال
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: {
          sessionId: 'test-connection-' + Date.now(),
          message: '🔔 اختبار الاتصال - تم إرسال هذه الرسالة من نظام الـ webhooks الجديد',
          language: 'ar',
          requestType: 'general_inquiry'
        }
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  getConfig(): TelegramConfig {
    return { 
      botToken: this.config.botToken ? `${this.config.botToken.substring(0, 10)}...` : '',
      adminChatId: this.config.adminChatId,
      isEnabled: this.config.isEnabled
    };
  }



  async reloadConfig() {
    await this.loadConfig();
  }

  // إرسال تفاصيل الصندوق عند إضافة معاملة جديدة - استخدام بوت المحاسبة المخصص
  async sendCashBoxDetails(cashBoxData: {
    transactionType: 'income' | 'expense';
    amount: number;
    description: string;
    categoryName: string;
    transactionDate: string;
    netProfit: number;
    totalPayments: number;
    dailyIncome: number;
    dailyExpense: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }): Promise<boolean> {
    try {
      const emoji = cashBoxData.transactionType === 'income' ? '💰' : '💸';
      const typeText = cashBoxData.transactionType === 'income' ? 'وارد' : 'صادر';
      
      const message = `
${emoji} <b>${typeText} جديد في الصندوق</b>

📋 <b>تفاصيل المعاملة:</b>
• النوع: ${typeText}
• المبلغ: <b>${cashBoxData.amount.toLocaleString()} ₺</b>
• الفئة: ${cashBoxData.categoryName}
• الوصف: ${cashBoxData.description || 'لا يوجد وصف'}
• التاريخ: ${cashBoxData.transactionDate}

💵 <b>تفاصيل الصندوق:</b>
• صافي الربح: <b>${cashBoxData.netProfit.toLocaleString()} ₺</b>
• مجموع المدفوعات: <b>${cashBoxData.totalPayments.toLocaleString()} ₺</b>
• الرصيد النقدي: <b>${(cashBoxData.netProfit - cashBoxData.totalPayments).toLocaleString()} ₺</b>
• الواردات اليوم: ${cashBoxData.dailyIncome.toLocaleString()} ₺
• الصادرات اليوم: ${cashBoxData.dailyExpense.toLocaleString()} ₺
• صافي اليوم: <b>${(cashBoxData.dailyIncome - cashBoxData.dailyExpense).toLocaleString()} ₺</b>

📊 <b>إجماليات الشهر:</b>
• الواردات الشهرية: ${cashBoxData.monthlyIncome.toLocaleString()} ₺
• الصادرات الشهرية: ${cashBoxData.monthlyExpense.toLocaleString()} ₺
• صافي الشهر: <b>${(cashBoxData.monthlyIncome - cashBoxData.monthlyExpense).toLocaleString()} ₺</b>

🕐 ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
      `.trim();

      // استخدام Edge Function الخاص بالمحاسبة بدلاً من الإشعارات العامة
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      console.log('📤 Sending accounting notification to Telegram...', {
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        messageLength: message.length,
        transactionType: cashBoxData.transactionType
      });
      
      const response = await fetch(`${supabaseUrl}/functions/v1/accounting-telegram-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          bot_token: '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0', // بوت المحاسبة المخصص
          message: message,
          transaction_type: cashBoxData.transactionType,
          amount: cashBoxData.amount,
          transaction_id: `txn_${Date.now()}`
        })
      });

      console.log('📥 Accounting notification response status:', response.status);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          const errorData = JSON.parse(errorText);
          console.error('❌ Accounting telegram notification error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error || errorText,
            message: errorData.message || 'Unknown error'
          });
          
          // Show user-friendly error message
          if (errorData.message?.includes('No recipients')) {
            console.error('💡 To fix this issue:');
            console.error('   1. Login to the bot via Telegram:');
            console.error('      - Open Telegram and find the accounting bot');
            console.error('      - Send: /login email:your@email.com password:yourpassword');
            console.error('      - Or send: /start and follow the instructions');
            console.error('   2. Or add admin_chat_id to telegram_config (id=3) in Supabase');
            console.error('   3. Or provide chat_id in the request body');
          }
        } catch (parseError) {
          errorText = await response.text();
          console.error('❌ Accounting telegram notification error (raw):', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
        }
        return false;
      }

      const data = await response.json();
      console.log('✅ Accounting notification sent:', data);
      
      if (!data.success) {
        console.warn('⚠️ Accounting notification returned false:', data);
        if (data.message) {
          console.warn('⚠️ Message:', data.message);
        }
        return false;
      }
      
      console.log(`✅ Successfully sent accounting notification to ${data.sent_to || 0} recipient(s)`);
      return true;
    } catch (error) {
      console.error('Error sending cash box details to Telegram:', error);
      return false;
    }
  }

  // دالة عامة لإرسال إشعارات المحاسبة
  private async sendAccountingNotification(message: string, actionType: string, data?: any): Promise<boolean> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      console.log(`📤 Sending accounting ${actionType} notification to Telegram...`, {
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        messageLength: message.length,
        actionType
      });
      
      const response = await fetch(`${supabaseUrl}/functions/v1/accounting-telegram-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          bot_token: '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0',
          message: message,
          action_type: actionType,
          ...data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Accounting ${actionType} notification error:`, {
          status: response.status,
          error: errorText
        });
        return false;
      }

      const result = await response.json();
      if (result.success) {
        console.log(`✅ Accounting ${actionType} notification sent successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error sending accounting ${actionType} notification:`, error);
      return false;
    }
  }

  // إرسال إشعار عند إنشاء/تحديث/حذف فاتورة
  async sendInvoiceNotification(invoice: any, action: 'create' | 'update' | 'delete', invoiceHtml?: string): Promise<boolean> {
    const actionText = action === 'create' ? 'إنشاء' : action === 'update' ? 'تحديث' : 'حذف';
    const emoji = action === 'create' ? '📄' : action === 'update' ? '✏️' : '🗑️';
    
    const message = `
${emoji} <b>${actionText} فاتورة</b>

📋 <b>تفاصيل الفاتورة:</b>
• رقم الفاتورة: ${invoice.invoice_number || 'غير محدد'}
• العميل: <b>${invoice.client_name || 'غير محدد'}</b>
• المبلغ الإجمالي: <b>${(invoice.total_amount || 0).toLocaleString()} ₺</b>
• المبلغ المستحق: <b>${(invoice.due_amount || 0).toLocaleString()} ₺</b>
• تاريخ الإصدار: ${invoice.issue_date || 'غير محدد'}
• تاريخ الاستحقاق: ${invoice.due_date || 'غير محدد'}
• الحالة: ${invoice.status === 'paid' ? '✅ مدفوعة' : invoice.status === 'partial' ? '⚠️ جزئية' : '⏳ مستحقة'}

${invoice.items && invoice.items.length > 0 ? `
📦 <b>البنود:</b>
${invoice.items.slice(0, 3).map((item: any, idx: number) => 
  `${idx + 1}. ${item.description_ar || item.description_en || 'بند'} - ${item.quantity}x ${item.unit_price?.toLocaleString()} ₺`
).join('\n')}
${invoice.items.length > 3 ? `\n... و ${invoice.items.length - 3} بند آخر` : ''}
` : ''}

🕐 ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
    `.trim();

    // إرسال رسالة النص أولاً
    const messageSent = await this.sendAccountingNotification(message, `invoice_${action}`, {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number
    });

    // إرسال PDF إذا كان موجوداً وعند إنشاء فاتورة جديدة
    if (action === 'create' && invoiceHtml) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        console.log('📄 Sending invoice PDF to Telegram...', {
          supabaseUrl: supabaseUrl ? 'configured' : 'missing',
          invoiceNumber: invoice.invoice_number
        });
        
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-invoice-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({
            bot_token: '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0',
            invoice_html: invoiceHtml,
            invoice_number: invoice.invoice_number || 'invoice'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Invoice PDF generation error:', {
            status: response.status,
            error: errorText
          });
          // لا نوقف العملية إذا فشل إرسال PDF
          return messageSent;
        }

        const result = await response.json();
        if (result.success) {
          console.log(`✅ Invoice PDF sent successfully to ${result.sent_to} recipient(s)`);
        } else {
          console.warn('⚠️ Invoice PDF generation failed:', result.error);
        }
      } catch (error) {
        console.error('Error sending invoice PDF:', error);
        // لا نوقف العملية إذا فشل إرسال PDF
      }
    }

    return messageSent;
  }

  // إرسال إشعار عند إنشاء/تحديث/حذف عميل
  async sendCustomerNotification(customer: any, action: 'create' | 'update' | 'delete'): Promise<boolean> {
    const actionText = action === 'create' ? 'إضافة' : action === 'update' ? 'تحديث' : 'حذف';
    const emoji = action === 'create' ? '👤' : action === 'update' ? '✏️' : '🗑️';
    
    const message = `
${emoji} <b>${actionText} عميل</b>

📋 <b>تفاصيل العميل:</b>
• الاسم: <b>${customer.name_ar || customer.name_en || 'غير محدد'}</b>
• البريد الإلكتروني: ${customer.email || 'غير محدد'}
• الهاتف: ${customer.phone || 'غير محدد'}
• العنوان: ${customer.address || 'غير محدد'}
• حد الائتمان: ${(customer.credit_limit || 0).toLocaleString()} ₺
• الحالة: ${customer.status === 'active' ? '✅ نشط' : '❌ غير نشط'}

🕐 ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
    `.trim();

    return this.sendAccountingNotification(message, `customer_${action}`, {
      customer_id: customer.id
    });
  }

  // إرسال إشعار عند إنشاء/تحديث/حذف دفعة
  async sendPaymentNotification(payment: any, action: 'create' | 'update' | 'delete'): Promise<boolean> {
    const actionText = action === 'create' ? 'إضافة' : action === 'update' ? 'تحديث' : 'حذف';
    const emoji = action === 'create' ? '💳' : action === 'update' ? '✏️' : '🗑️';
    
    const paymentMethodText: Record<string, string> = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      credit_card: 'بطاقة ائتمانية',
      check: 'شيك',
      other: 'أخرى'
    };
    
    const statusText: Record<string, string> = {
      pending: '⏳ قيد الانتظار',
      completed: '✅ مكتملة',
      failed: '❌ فاشلة',
      cancelled: '🚫 ملغاة'
    };
    
    const message = `
${emoji} <b>${actionText} دفعة</b>

📋 <b>تفاصيل الدفعة:</b>
• المبلغ: <b>${(payment.amount || 0).toLocaleString()} ₺</b>
• طريقة الدفع: ${paymentMethodText[payment.payment_method] || payment.payment_method || 'غير محدد'}
• تاريخ الدفع: ${payment.payment_date || 'غير محدد'}
• رقم المرجع: ${payment.reference_number || 'غير محدد'}
• الحالة: ${statusText[payment.status] || payment.status || 'غير محدد'}

${payment.invoice_id ? `• مرتبطة بفاتورة: ${payment.invoice_id}` : ''}
${payment.transaction_id ? `• مرتبطة بمعاملة: ${payment.transaction_id}` : ''}

🕐 ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
    `.trim();

    return this.sendAccountingNotification(message, `payment_${action}`, {
      payment_id: payment.id,
      amount: payment.amount
    });
  }

  // إرسال إشعار عند إنشاء/تحديث/حذف فئة
  async sendCategoryNotification(category: any, action: 'create' | 'update' | 'delete'): Promise<boolean> {
    const actionText = action === 'create' ? 'إضافة' : action === 'update' ? 'تحديث' : 'حذف';
    const emoji = action === 'create' ? '📁' : action === 'update' ? '✏️' : '🗑️';
    const typeEmoji = category.type === 'income' ? '📈' : '📉';
    const typeText = category.type === 'income' ? 'وارد' : 'صادر';
    
    const message = `
${emoji} <b>${actionText} فئة</b>

📋 <b>تفاصيل الفئة:</b>
• الاسم: <b>${category.name_ar || category.name_en || 'غير محدد'}</b>
• النوع: ${typeEmoji} ${typeText}
${category.description_ar || category.description_en ? `• الوصف: ${category.description_ar || category.description_en}` : ''}

🕐 ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
    `.trim();

    return this.sendAccountingNotification(message, `category_${action}`, {
      category_id: category.id,
      category_type: category.type
    });
  }

  // إرسال إشعار عند حذف معاملة
  async sendTransactionDeleteNotification(transaction: any): Promise<boolean> {
    const typeEmoji = transaction.type === 'income' ? '📈' : '📉';
    const typeText = transaction.type === 'income' ? 'وارد' : 'صادر';
    
    const message = `
🗑️ <b>حذف معاملة</b>

📋 <b>تفاصيل المعاملة المحذوفة:</b>
• النوع: ${typeEmoji} ${typeText}
• المبلغ: <b>${(transaction.amount || 0).toLocaleString()} ₺</b>
• التاريخ: ${transaction.transaction_date || 'غير محدد'}
${transaction.description_ar || transaction.description_en ? `• الوصف: ${transaction.description_ar || transaction.description_en}` : ''}

🕐 ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
    `.trim();

    return this.sendAccountingNotification(message, 'transaction_delete', {
      transaction_id: transaction.id,
      transaction_type: transaction.type,
      amount: transaction.amount
    });
  }
}

export const telegramService = new TelegramService();
export type { TelegramConfig, TelegramMessage, RequestData };
