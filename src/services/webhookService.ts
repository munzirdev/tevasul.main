import { telegramService, RequestType } from './telegramService';
import { supabase } from '../lib/supabase';

interface WebhookData {
  type: RequestType;
  data: any;
  userId?: string;
  userProfile?: any;
}

class WebhookService {
  private isEnabled: boolean = true;

  constructor() {
    // تأخير تحميل الإعدادات لتجنب مشاكل التزامن
    setTimeout(() => {
      this.loadWebhookConfig();
    }, 100);
  }

  private async loadWebhookConfig() {
    try {
      
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        this.isEnabled = true;
        return;
      }

      // Try to get webhook config, but don't fail if we can't access it
      try {
        const { data, error } = await supabase
          .from('telegram_config')
          .select('is_enabled')
          .maybeSingle();

        if (error) {
          this.isEnabled = true;
          // Don't throw error, just use default state
          return;
        }

        if (data) {
          this.isEnabled = data.is_enabled;
        } else {
          this.isEnabled = true;
        }
      } catch (configError) {
        this.isEnabled = true;
      }
    } catch (error) {
      // في حالة الخطأ، نستخدم الحالة الافتراضية
      this.isEnabled = true;
    }
  }

  // إرسال إشعار لطلب ترجمة
  async sendTranslationRequestWebhook(requestData: any) {
    if (!this.isEnabled) return;

    try {
      // جلب معلومات المستخدم
      const userProfile = await this.getUserProfile(requestData.user_id);
      
      const webhookData: WebhookData = {
        type: 'translation',
        data: {
          ...requestData,
          user_name: userProfile?.full_name,
          user_email: userProfile?.email,
          user_phone: userProfile?.phone,
          additionalData: {
            hasFile: !!requestData.file_url,
            fileName: requestData.file_name,
            fileUrl: requestData.file_url
          }
        },
        userId: requestData.user_id,
        userProfile
      };

      await telegramService.sendTranslationRequestNotification(webhookData.data);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لطلب تأمين
  async sendInsuranceRequestWebhook(requestData: any) {
    if (!this.isEnabled) return;

    try {
      // جلب معلومات المستخدم
      const userProfile = await this.getUserProfile(requestData.user_id);
      
      const webhookData: WebhookData = {
        type: 'insurance',
        data: {
          ...requestData,
          user_name: userProfile?.full_name,
          user_email: userProfile?.email,
          user_phone: userProfile?.phone,
          additionalData: {
            hasFile: !!requestData.file_url,
            fileName: requestData.file_name,
            fileUrl: requestData.file_url
          }
        },
        userId: requestData.user_id,
        userProfile
      };

      await telegramService.sendInsuranceRequestNotification(webhookData.data);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لطلب عودة طوعية
  async sendVoluntaryReturnWebhook(formData: any) {
    if (!this.isEnabled) return;

    try {
      await telegramService.sendVoluntaryReturnNotification(formData);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لطلب تفعيل التأمين الصحي
  async sendHealthInsuranceActivationWebhook(formData: any) {
    if (!this.isEnabled) return;

    try {
      await telegramService.sendHealthInsuranceActivationNotification(formData);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لطلب التأمين الصحي للأجانب
  async sendHealthInsuranceRequestNotification(requestData: any) {
    if (!this.isEnabled) return;

    try {
      // جلب معلومات المستخدم إذا كان مسجل دخول
      let userProfile = null;
      if (requestData.userInfo?.email) {
        // محاولة جلب معلومات المستخدم من البريد الإلكتروني
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', requestData.userInfo.email)
          .single();
        
        if (userData && !error) {
          userProfile = userData;
        }
      }

      const webhookData: WebhookData = {
        type: 'health_insurance',
        data: {
          ...requestData,
          user_name: requestData.userInfo?.name || userProfile?.full_name,
          user_email: requestData.userInfo?.email || userProfile?.email,
          user_phone: requestData.userInfo?.phone || userProfile?.phone,
          additionalData: {
            ...requestData.additionalData,
            hasPassportImage: !!requestData.additionalData?.passportImageUrl,
            passportImageUrl: requestData.additionalData?.passportImageUrl
          }
        },
        userId: userProfile?.id,
        userProfile
      };

      await telegramService.sendHealthInsuranceRequestNotification(webhookData.data);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لطلب خدمة عام
  async sendServiceRequestWebhook(requestData: any) {
    if (!this.isEnabled) {
      return;
    }

    try {
      // جلب معلومات المستخدم مع timeout
      const userProfilePromise = this.getUserProfile(requestData.user_id);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User profile timeout')), 5000)
      );
      
      let userProfile = null;
      try {
        userProfile = await Promise.race([userProfilePromise, timeoutPromise]);
      } catch (profileError) {
        // Failed to get user profile, continuing without it
      }
      
      const webhookData: WebhookData = {
        type: 'service_request',
        data: {
          ...requestData,
          user_name: userProfile?.full_name || requestData.user_name || 'غير محدد',
          user_email: userProfile?.email || requestData.user_email || 'غير محدد',
          user_phone: userProfile?.phone || requestData.phone || 'غير محدد',
          additionalData: {
            hasFile: !!requestData.file_url,
            fileName: requestData.file_name,
            fileUrl: requestData.file_url,
            serviceType: requestData.service_type || requestData.serviceType
          }
        },
        userId: requestData.user_id,
        userProfile
      };

      // إرسال الإشعار مع timeout
      const telegramPromise = telegramService.sendServiceRequestNotification(webhookData.data);
      const telegramTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Telegram timeout')), 8000)
      );
      
      try {
        await Promise.race([telegramPromise, telegramTimeoutPromise]);
      } catch (telegramError) {
        throw telegramError;
      }
    } catch (error) {
      throw error;
    }
  }

  // إرسال إشعار لطلب دعم فني (محادثة)
  async sendChatSupportWebhook(sessionData: any) {
    if (!this.isEnabled) return;

    try {
      await telegramService.sendSupportRequestNotification(sessionData);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لرسالة جديدة في المحادثة
  async sendNewMessageWebhook(sessionData: any, messageContent: string) {
    if (!this.isEnabled) return;

    try {
      await telegramService.sendNewMessageNotification(sessionData, messageContent);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // إرسال إشعار لرسالة مستعجلة
  async sendUrgentMessageWebhook(sessionData: any, messageContent: string) {
    if (!this.isEnabled) return;

    try {
      await telegramService.sendUrgentMessageNotification(sessionData, messageContent);
      } catch (error) {
        // Handle error silently in production
      }
  }

  // دالة مساعدة لجلب معلومات المستخدم
  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  // تفعيل/إلغاء تفعيل الـ webhooks
  async setWebhookEnabled(enabled: boolean) {
    try {
      // أولاً، نحاول تحديث السجل الموجود
      let { error } = await supabase
        .from('telegram_config')
        .update({ is_enabled: enabled })
        .eq('id', 2);

      // إذا لم يوجد سجل، نقوم بإنشائه
      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('telegram_config')
          .insert({ 
            id: 2,
            bot_token: 'placeholder',
            admin_chat_id: 'placeholder',
            is_enabled: enabled 
          });
        
        if (!insertError) {
          this.isEnabled = enabled;
          return true;
        }
      } else if (!error) {
        this.isEnabled = enabled;
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  // جلب حالة الـ webhooks
  isWebhookEnabled(): boolean {
    return this.isEnabled;
  }

  // إعادة تحميل الإعدادات
  async reloadConfig() {
    await this.loadWebhookConfig();
  }

  // جلب إعدادات التيليجرام
  async getTelegramConfig() {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .eq('id', 2)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  // تحديث إعدادات التيليجرام
  async updateTelegramConfig(botToken: string, adminChatId: string) {
    try {
      // التحقق من صحة البيانات
      if (!botToken || !adminChatId) {
        return false;
      }

      // التحقق من وجود السجل أولاً
      const { data: existingConfig, error: fetchError } = await supabase
        .from('telegram_config')
        .select('*')
        .eq('id', 1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        return false;
      }

      let result;
      if (existingConfig) {
        // تحديث السجل الموجود
        result = await supabase
          .from('telegram_config')
          .update({ 
            bot_token: botToken,
            admin_chat_id: adminChatId,
            is_enabled: true
          })
          .eq('id', 2);
      } else {
        // إنشاء سجل جديد
        result = await supabase
          .from('telegram_config')
          .insert({ 
            id: 2,
            bot_token: botToken,
            admin_chat_id: adminChatId,
            is_enabled: true
          });
      }

      if (result.error) {
        return false;
      }

      // التحقق من الحفظ
      const { data: savedConfig, error: verifyError } = await supabase
        .from('telegram_config')
        .select('*')
        .eq('id', 2)
        .single();

      if (verifyError) {
        return false;
      }

      if (savedConfig && savedConfig.bot_token === botToken && savedConfig.admin_chat_id === adminChatId) {
        this.isEnabled = true; // تحديث الحالة المحلية
        
        // تحديث إعدادات التيليجرام في telegramService
        await telegramService.updateConfig({
          botToken: botToken,
          adminChatId: adminChatId,
          isEnabled: true
        });
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // اختبار اتصال التيليجرام
  async testTelegramConnection(botToken: string, adminChatId: string) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: '🔔 اختبار الاتصال - تم إرسال هذه الرسالة من نظام الـ webhooks',
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();
      if (result.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // التحقق من وجود معرفات التيليجرام
  async hasTelegramCredentials(): Promise<boolean> {
    try {
      const config = await this.getTelegramConfig();
      
      const hasValidCredentials = !!(config?.bot_token && config?.admin_chat_id && 
                config.bot_token !== 'placeholder' && 
                config.admin_chat_id !== 'placeholder');
      
      return hasValidCredentials;
    } catch (error) {
      return false;
    }
  }

  // إرسال إشعار تجريبي
  async sendTestWebhook() {
    if (!this.isEnabled) {
      return false;
    }

    try {
      // إعادة تحميل إعدادات التيليجرام أولاً
      await telegramService.reloadConfig();
      
      // جلب معرفات التيليجرام من قاعدة البيانات
      const config = await this.getTelegramConfig();
      if (!config || !config.bot_token || !config.admin_chat_id) {
        return false;
      }

      // تحديث إعدادات التيليجرام في telegramService
      const updateSuccess = await telegramService.updateConfig({
        botToken: config.bot_token,
        adminChatId: config.admin_chat_id,
        isEnabled: true
      });

      if (!updateSuccess) {
        return false;
      }


      // التحقق من أن telegramService تم تحديثه بشكل صحيح
      const telegramConfig = telegramService.getConfig();
      if (!telegramConfig.isEnabled) {
        return false;
      }

      // إرسال رسالة تجريبية باستخدام telegramService
      const testData = {
        type: 'service_request' as RequestType,
        title: 'إشعار تجريبي من نظام الـ Webhooks',
        description: `هذا إشعار تجريبي لاختبار نظام الـ webhooks

📋 تفاصيل الإشعار:
• النوع: إشعار تجريبي
• الوقت: ${new Date().toLocaleString('ar-SA')}
• الحالة: تم الإرسال بنجاح

✅ هذا الإشعار يؤكد أن نظام الـ webhooks يعمل بشكل صحيح`,
        userInfo: {
          name: 'مستخدم تجريبي',
          email: 'test@example.com',
          phone: '+966501234567'
        },
        requestId: 'test-' + Date.now(),
        priority: 'medium' as const,
        status: 'pending',
        createdAt: new Date().toISOString(),
        additionalData: {
          serviceType: 'test',
          hasFile: false
        }
      };

      const success = await telegramService.sendRequestNotification(testData);
      
      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

export const webhookService = new WebhookService();
export type { WebhookData };
