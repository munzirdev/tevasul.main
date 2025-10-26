import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Allow both production and local development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development and webhooks
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Log the request for debugging
  console.log('Telegram notifications webhook request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
  // Check authorization header
  const authHeader = req.headers.get('authorization');
  const apikey = req.headers.get('apikey');
  
  if (!authHeader && !apikey) {
    console.log('No authorization provided - rejecting request');
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  console.log('Authorization provided:', {
    hasAuth: !!authHeader,
    hasApikey: !!apikey
  });
  
  // Basic rate limiting check (you can implement more sophisticated rate limiting)
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      sessionId, 
      message, 
      language = 'ar', 
      filePath, 
      requestType = 'chat_support',
      userInfo,
      additionalData,
      requestId
    } = requestBody;

    console.log('Parsed request data:', {
      sessionId: sessionId ? 'present' : 'missing',
      requestType,
      hasFile: !!filePath,
      userInfo: userInfo ? 'present' : 'missing',
      additionalData: additionalData ? 'present' : 'missing'
    });

    // Get Telegram configuration
    const { data: config, error: configError } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('id', 2)
      .single()

    if (configError || !config?.is_enabled || !config?.bot_token) {
      console.error('Telegram not configured:', configError);
      return new Response(
        JSON.stringify({ error: 'Telegram not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active allowed users with telegram_chat_id
    const { data: allowedUsers, error: usersError } = await supabase
      .from('telegram_allowed_users')
      .select('telegram_chat_id, full_name')
      .eq('is_active', true)
      .not('telegram_chat_id', 'is', null)

    // Create list of chat IDs to send to
    const chatIds: string[] = []
    
    // إضافة admin_chat_id إذا كان موجوداً
    if (config.admin_chat_id) {
      chatIds.push(config.admin_chat_id)
    }
    
    // إضافة chat IDs للمستخدمين المصرح لهم
    if (allowedUsers && !usersError) {
      allowedUsers.forEach(user => {
        if (user.telegram_chat_id && !chatIds.includes(user.telegram_chat_id)) {
          chatIds.push(user.telegram_chat_id)
        }
      })
    }

    if (chatIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No recipients configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format notification message
    const messageData = {
      title: getRequestTypeTitle(requestType, language),
      userInfo: userInfo || { email: 'user@example.com' },
      description: message,
      type: requestType,
      priority: requestType === 'meeting_request' ? 'high' : 'normal',
      status: 'pending',
      sessionId,
      requestId,
      language,
      additionalData
    };
    
    // Format message data
    const formattedMessage = formatNotificationMessage(messageData);

    // إرسال الرسالة لجميع المستخدمين المصرح لهم
    const sendPromises = chatIds.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: formattedMessage,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { 
                    text: language === 'ar' ? '💬 الرد على العميل' : '💬 Reply to Customer', 
                    callback_data: `start_chat:${sessionId}` 
                  }
                ],
                [
                  { 
                    text: language === 'ar' ? '🌐 عرض في لوحة التحكم' : '🌐 View in Dashboard', 
                    url: `https://tevasul.group/admin`
                  }
                ]
              ]
            }
          })
        })
        
        const result = await response.json()
        return { chatId, success: result.ok, error: result.ok ? null : result.description }
      } catch (error) {
        return { chatId, success: false, error: error.message }
      }
    })

    const results = await Promise.all(sendPromises)
    const successCount = results.filter(r => r.success).length
    const failedResults = results.filter(r => !r.success)
    
    // إذا فشلت جميع المحاولات
    if (successCount === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send to all recipients',
          details: failedResults 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save notification to database
    try {
      const { error: dbError } = await supabase
        .from('telegram_notifications')
        .insert({
          session_id: sessionId,
          message: message,
          language: language,
          request_type: requestType,
          user_info: userInfo,
          additional_data: additionalData,
          status: 'pending',
          priority: requestType === 'meeting_request' ? 'high' : 'normal'
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }
    } catch (error) {
      console.error('Database error:', error);
    }

    // Send file attachment if provided
    if (filePath) {
      try {
        // Processing file attachment
        
        let fileData = null;
        let fileName = filePath.split('/').pop() || 'file';
        
        // Check if it's a base64 file from database
        if (filePath.startsWith('base64://')) {
          const fileId = filePath.replace('base64://', '');
          
          // Try to get file from file_attachments table
          let { data: attachmentData, error: attachmentError } = await supabase
            .from('file_attachments')
            .select('file_data, file_name, file_type')
            .eq('id', fileId)
            .single();
          
          if (attachmentError || !attachmentData) {
            // Try to get file from service_requests table
            const { data: requestData, error: requestError } = await supabase
              .from('service_requests')
              .select('file_data, file_name')
              .eq('id', fileId)
              .single();
            
            if (requestError || !requestData || !requestData.file_data) {
              // File not found in database
            } else {
              fileData = requestData.file_data;
              fileName = requestData.file_name || fileName;
            }
          } else {
            fileData = attachmentData.file_data;
            fileName = attachmentData.file_name || fileName;
          }
        } else {
          // Download file from Supabase Storage
          const { data: storageFileData, error: fileError } = await supabase.storage
            .from('passport-images') // أو اسم البكت المناسب
            .download(filePath)

          if (fileError) {
            // Error downloading file from storage
          } else {
            fileData = storageFileData;
          }
        }

        if (fileData) {
          // Convert base64 to blob if needed
          let blob;
          if (typeof fileData === 'string' && fileData.startsWith('data:')) {
            // It's already a data URL
            const response = await fetch(fileData);
            blob = await response.blob();
          } else if (typeof fileData === 'string') {
            // It's base64 data
            const base64Data = fileData.replace(/^data:.*?;base64,/, '');
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            blob = new Blob([bytes]);
          } else {
            // It's already a blob
            blob = fileData;
          }

          // إرسال الملف لجميع المستخدمين
          const filePromises = chatIds.map(async (chatId) => {
            try {
              const formData = new FormData()
              formData.append('chat_id', chatId)
              formData.append('document', blob, fileName)
              formData.append('caption', language === 'ar' ? '📎 ملف مرفق مع الطلب' : '📎 File attached with request')

              const fileResponse = await fetch(`https://api.telegram.org/bot${config.bot_token}/sendDocument`, {
                method: 'POST',
                body: formData
              })

              const fileResult = await fileResponse.json()
              return { chatId, success: fileResult.ok }
            } catch (error) {
              return { chatId, success: false }
            }
          })

          await Promise.all(filePromises)
        }
      } catch (fileError) {
        console.error('Error processing file:', fileError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: language === 'ar' ? 'تم إرسال الإشعار بنجاح' : 'Notification sent successfully',
        sentTo: successCount,
        totalRecipients: chatIds.length,
        failed: failedResults.length > 0 ? failedResults : undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error);
  return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper functions
function getRequestTypeTitle(type, language) {
  const titles = {
    chat_support: language === 'ar' ? 'طلب دعم جديد' : 'New Support Request',
    translation: language === 'ar' ? 'طلب ترجمة جديد' : 'New Translation Request',
    insurance: language === 'ar' ? 'طلب تأمين جديد' : 'New Insurance Request',
    health_insurance: language === 'ar' ? 'طلب تأمين صحي للأجانب' : 'Foreign Health Insurance Request',
    meeting_request: language === 'ar' ? '🔔 طلب موعد/لقاء رسمي' : '🔔 Meeting/Appointment Request',
    voluntary_return: language === 'ar' ? 'طلب عودة طوعية' : 'Voluntary Return Request',
    health_insurance_activation: language === 'ar' ? 'طلب تفعيل تأمين صحي' : 'Health Insurance Activation',
    service_request: language === 'ar' ? 'طلب خدمة جديد' : 'New Service Request',
    general_inquiry: language === 'ar' ? 'استفسار عام' : 'General Inquiry'
  }
  return titles[type] || titles.general_inquiry
}

function formatNotificationMessage(data) {
  const { language, additionalData } = data
  
  const emoji = getRequestTypeEmoji(data.type)
  const priorityEmoji = getPriorityEmoji(data.priority)
  
  let message = `
${emoji} <b>${data.title}</b>

👤 <b>${language === 'ar' ? 'معلومات العميل:' : 'Client Information:'}</b>
• ${language === 'ar' ? 'الاسم:' : 'Name:'} ${data.userInfo?.name || (language === 'ar' ? 'غير محدد' : 'Not specified')}
• ${language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} ${data.userInfo?.email || (language === 'ar' ? 'غير محدد' : 'Not specified')}
• ${language === 'ar' ? 'رقم الهاتف:' : 'Phone:'} ${data.userInfo?.phone || (language === 'ar' ? 'غير محدد' : 'Not specified')}

📝 <b>${language === 'ar' ? 'تفاصيل الطلب:' : 'Request Details:'}</b>
${data.description}

📊 <b>${language === 'ar' ? 'معلومات إضافية:' : 'Additional Info:'}</b>
• ${language === 'ar' ? 'نوع الخدمة:' : 'Service Type:'} ${getRequestTypeText(data.type, language)}
• ${language === 'ar' ? 'الأولوية:' : 'Priority:'} ${priorityEmoji} ${getPriorityText(data.priority, language)}
• ${language === 'ar' ? 'الحالة:' : 'Status:'} ${data.status || (language === 'ar' ? 'معلق' : 'Pending')}
`

  // إضافة معلومات خاصة بكل نوع خدمة
  if (additionalData) {
    switch (data.type) {
      case 'translation':
        message += `\n\n🌐 <b>${language === 'ar' ? 'تفاصيل الترجمة:' : 'Translation Details:'}</b>`
        if (additionalData.hasFile) {
          message += `\n• ${language === 'ar' ? 'ملف مرفق:' : 'File attached:'} ${additionalData.fileName || (language === 'ar' ? 'ملف' : 'File')}`
        }
        if (additionalData.serviceType) {
          message += `\n• ${language === 'ar' ? 'نوع الترجمة:' : 'Translation type:'} ${additionalData.serviceType}`
        }
        break;
        
      case 'insurance':
        message += `\n\n🛡️ <b>${language === 'ar' ? 'تفاصيل التأمين:' : 'Insurance Details:'}</b>`
        if (additionalData.hasFile) {
          message += `\n• ${language === 'ar' ? 'ملف مرفق:' : 'File attached:'} ${additionalData.fileName || (language === 'ar' ? 'ملف' : 'File')}`
        }
        if (additionalData.serviceType) {
          message += `\n• ${language === 'ar' ? 'نوع التأمين:' : 'Insurance type:'} ${additionalData.serviceType}`
        }
        break;
        
      case 'service_request':
        message += `\n\n📋 <b>${language === 'ar' ? 'تفاصيل الخدمة:' : 'Service Details:'}</b>`
        if (additionalData.serviceType) {
          message += `\n• ${language === 'ar' ? 'نوع الخدمة:' : 'Service type:'} ${getServiceTypeText(additionalData.serviceType, language)}`
        }
        if (additionalData.hasFile) {
          message += `\n• ${language === 'ar' ? 'ملف مرفق:' : 'File attached:'} ${additionalData.fileName || (language === 'ar' ? 'ملف' : 'File')}`
        }
        break;
        
      case 'health_insurance':
        message += `\n\n🏥 <b>${language === 'ar' ? 'تفاصيل التأمين الصحي:' : 'Health Insurance Details:'}</b>`
        
        if (additionalData.ageGroup) {
          message += `\n• ${language === 'ar' ? 'الفئة العمرية:' : 'Age Group:'} ${additionalData.ageGroup}`
        }
        
        if (additionalData.calculatedAge) {
          message += `\n• ${language === 'ar' ? 'العمر المحسوب:' : 'Calculated Age:'} ${additionalData.calculatedAge} ${language === 'ar' ? 'سنة' : 'years'}`
        }
        
        if (additionalData.birthDate) {
          message += `\n• ${language === 'ar' ? 'تاريخ الميلاد:' : 'Birth Date:'} ${additionalData.birthDate}`
        }
        
        if (additionalData.companyName) {
          message += `\n• ${language === 'ar' ? 'الشركة المطلوبة:' : 'Requested Company:'} ${additionalData.companyName}`
        }
        
        if (additionalData.durationMonths) {
          message += `\n• ${language === 'ar' ? 'المدة المطلوبة:' : 'Duration:'} ${additionalData.durationMonths} ${language === 'ar' ? 'شهر' : 'months'}`
        }
        
        if (additionalData.calculatedPrice) {
          message += `\n• ${language === 'ar' ? 'السعر المحسوب:' : 'Calculated Price:'} ${additionalData.calculatedPrice} ${language === 'ar' ? 'ليرة تركية' : 'TL'}`
        }
        
        if (additionalData.hasPassportImage) {
          message += `\n• ${language === 'ar' ? 'صورة جواز السفر:' : 'Passport Image:'} ${language === 'ar' ? 'مرفقة' : 'Attached'}`
        }
        break;
        
      case 'voluntary_return':
        message += `\n\n🔄 <b>${language === 'ar' ? 'تفاصيل العودة الطوعية:' : 'Voluntary Return Details:'}</b>`
        
        if (additionalData.kimlikNo) {
          message += `\n• ${language === 'ar' ? 'رقم الهوية:' : 'Identity Number:'} ${additionalData.kimlikNo}`
        }
        
        if (additionalData.sinirKapisi) {
          message += `\n• ${language === 'ar' ? 'نقطة الحدود:' : 'Border Point:'} ${additionalData.sinirKapisi}`
        }
        
        if (additionalData.refakatCount > 0) {
          message += `\n• ${language === 'ar' ? 'عدد المرافقين:' : 'Number of companions:'} ${additionalData.refakatCount}`
        }
        
        if (additionalData.customDate) {
          message += `\n• ${language === 'ar' ? 'تاريخ مخصص:' : 'Custom date:'} ${additionalData.customDate}`
        }
        break;
        
      case 'health_insurance_activation':
        message += `\n\n🏥 <b>${language === 'ar' ? 'تفاصيل تفعيل التأمين الصحي:' : 'Health Insurance Activation Details:'}</b>`
        
        if (additionalData.kimlikNo) {
          message += `\n• ${language === 'ar' ? 'رقم الهوية:' : 'Identity Number:'} ${additionalData.kimlikNo}`
        }
        
        if (additionalData.address) {
          message += `\n• ${language === 'ar' ? 'العنوان:' : 'Address:'} ${additionalData.address}`
        }
        break;
        
      case 'chat_support':
        message += `\n\n💬 <b>${language === 'ar' ? 'تفاصيل الدعم الفني:' : 'Support Details:'}</b>`
        
        if (additionalData.messageCount) {
          message += `\n• ${language === 'ar' ? 'عدد الرسائل:' : 'Message count:'} ${additionalData.messageCount}`
        }
        
        if (additionalData.language) {
          message += `\n• ${language === 'ar' ? 'اللغة:' : 'Language:'} ${additionalData.language === 'ar' ? 'العربية' : 'English'}`
        }
        
        if (additionalData.isUrgent) {
          message += `\n• ⚠️ ${language === 'ar' ? 'هذه رسالة مستعجلة تتطلب رداً فورياً!' : 'This is an urgent message requiring immediate response!'}`
        }
        break;
    }
  }

  // Add identifiers
  if (data.sessionId) {
    message += `\n💬 <b>${language === 'ar' ? 'معرف الجلسة:' : 'Session ID:'}</b> <code>${data.sessionId}</code>`
  }
  if (data.requestId) {
    message += `\n🆔 <b>${language === 'ar' ? 'معرف الطلب:' : 'Request ID:'}</b> <code>${data.requestId}</code>`
  }

  return message
}

function getRequestTypeEmoji(type) {
  const emojis = {
    chat_support: '💬',
    translation: '🌐',
    insurance: '🛡️',
    health_insurance: '🏥',
    voluntary_return: '🔄',
    health_insurance_activation: '🏥',
    service_request: '📋',
    general_inquiry: '❓'
  }
  return emojis[type] || '❓'
}

function getRequestTypeText(type, language) {
  const types = {
    chat_support: language === 'ar' ? 'دعم فني' : 'Chat Support',
    translation: language === 'ar' ? 'ترجمة' : 'Translation',
    insurance: language === 'ar' ? 'تأمين' : 'Insurance',
    health_insurance: language === 'ar' ? 'تأمين صحي للأجانب' : 'Foreign Health Insurance',
    voluntary_return: language === 'ar' ? 'عودة طوعية' : 'Voluntary Return',
    health_insurance_activation: language === 'ar' ? 'تفعيل تأمين صحي' : 'Health Insurance Activation',
    service_request: language === 'ar' ? 'طلب خدمة' : 'Service Request',
    general_inquiry: language === 'ar' ? 'استفسار عام' : 'General Inquiry'
  }
  return types[type] || types.general_inquiry
}

function getServiceTypeText(serviceType, language) {
  const serviceTypes = {
    translation: language === 'ar' ? 'ترجمة' : 'Translation',
    insurance: language === 'ar' ? 'تأمين' : 'Insurance',
    consultation: language === 'ar' ? 'استشارات' : 'Consultation',
    government_services: language === 'ar' ? 'خدمات حكومية' : 'Government Services',
    legal_services: language === 'ar' ? 'خدمات قانونية' : 'Legal Services',
    business_services: language === 'ar' ? 'خدمات تجارية' : 'Business Services',
    education_services: language === 'ar' ? 'خدمات تعليمية' : 'Education Services',
    health_services: language === 'ar' ? 'خدمات صحية' : 'Health Services',
    travel_services: language === 'ar' ? 'خدمات سفر' : 'Travel Services',
    support_message: language === 'ar' ? 'رسالة دعم' : 'Support Message',
    general_inquiry: language === 'ar' ? 'استفسار عام' : 'General Inquiry',
    other: language === 'ar' ? 'خدمات أخرى' : 'Other Services'
  }
  return serviceTypes[serviceType] || serviceType
}

function getPriorityEmoji(priority) {
  const emojis = {
    low: '🟢',
    normal: '🟡',
    high: '🔴',
    urgent: '🚨'
  }
  return emojis[priority] || emojis.normal
}

function getPriorityText(priority, language) {
  const priorities = {
    low: language === 'ar' ? 'منخفضة' : 'Low',
    normal: language === 'ar' ? 'عادية' : 'Normal',
    high: language === 'ar' ? 'عالية' : 'High',
    urgent: language === 'ar' ? 'مستعجلة' : 'Urgent'
  }
  return priorities[priority] || priorities.normal
}