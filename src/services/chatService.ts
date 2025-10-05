import trainingData from '../data/chatbot-training-data.json';
import { Groq } from 'groq-sdk';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ChatService {
  private static instance: ChatService;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private groqClient: any;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  private readonly REQUEST_DELAY = 1000; // 1 second between requests
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds base delay
  private responseCache: Map<string, { response: string; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  constructor() {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (apiKey) {
      this.groqClient = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const delayTime = this.REQUEST_DELAY - timeSinceLastRequest;
      await this.delay(delayTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  private generateCacheKey(userMessage: string, language: string): string {
    return `${language}:${userMessage.toLowerCase().trim()}`;
  }

  private getCachedResponse(userMessage: string, language: string): string | null {
    const cacheKey = this.generateCacheKey(userMessage, language);
    const cached = this.responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('Using cached response for:', userMessage.substring(0, 50) + '...');
      return cached.response;
    }
    
    return null;
  }

  private setCachedResponse(userMessage: string, language: string, response: string): void {
    const cacheKey = this.generateCacheKey(userMessage, language);
    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  private async makeGroqRequest(requestConfig: any, retryCount: number = 0): Promise<any> {
    try {
      await this.rateLimitDelay();
      
      const completion = await this.groqClient.chat.completions.create(requestConfig);
      return completion;
    } catch (error: any) {
      console.error(`Groq API request failed (attempt ${retryCount + 1}):`, error);
      
      // Handle rate limit errors
      if (error.status === 429 || error.message?.includes('429')) {
        if (retryCount < this.MAX_RETRIES) {
          const backoffDelay = this.RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Rate limited. Retrying in ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
          return this.makeGroqRequest(requestConfig, retryCount + 1);
        } else {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }
      
      // Handle other errors
      throw error;
    }
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on character sets
    const arabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
    
    // Check for Arabic text first
    if (arabicChars.test(text)) {
      return 'ar';
    } 
    // Check for Turkish text
    else if (turkishChars.test(text) || text.toLowerCase().includes('merhaba') || text.toLowerCase().includes('nasılsın')) {
      return 'tr';
    } 
    // Default to English
    else {
      return 'en';
    }
  }

  private getSystemPrompt(language: string, userInfo?: { id?: string; name?: string; email?: string; isRegistered?: boolean }): string {
    const data = trainingData as any;
    let lang = 'en';
    let personality, guidelines;
    
    if (language === 'ar') {
      lang = 'ar';
      personality = data.chatbot_personality.ar;
      guidelines = data.response_guidelines.ar;
    } else if (language === 'tr') {
      lang = 'en'; // Use English data for Turkish for now
      personality = data.chatbot_personality.en;
      guidelines = data.response_guidelines.en;
    } else {
      lang = 'en';
      personality = data.chatbot_personality.en;
      guidelines = data.response_guidelines.en;
    }
    
    if (language === 'ar') {
      const userInfoText = userInfo?.isRegistered 
        ? `\nمعلومات المستخدم:
- المستخدم مسجل: نعم
- الاسم: ${userInfo.name || 'غير محدد'}
- البريد الإلكتروني: ${userInfo.email || 'غير محدد'}
- معرف المستخدم: ${userInfo.id || 'غير محدد'}

ملاحظة: هذا المستخدم مسجل في النظام، يمكنك تقديم خدمات مخصصة له.`
        : '\nملاحظة: هذا مستخدم غير مسجل، قدم له الخدمات الأساسية.';

      return `أنت ${personality.name}، ${personality.role} في ${data.company_info.name}. 

شخصيتك:
- النبرة: ${personality.tone}
- الأسلوب: ${personality.style}
- طول الرد: ${personality.response_length}
- التكيف اللغوي: ${personality.language_adaptation}

المؤهلات المهنية:
${personality.professional_qualities.map((q: any) => `- ${q}`).join('\n')}

إرشادات الرد:
يجب عليك:
${guidelines.do.map((g: any) => `- ${g}`).join('\n')}

لا يجب عليك:
${guidelines.dont.map((g: any) => `- ${g}`).join('\n')}

معلومات الشركة:
- الاسم: ${data.company_info.name}
- الوصف: ${data.company_info.description}
- العنوان: ${data.company_info.address}
- الهاتف: ${data.company_info.phone}
- البريد الإلكتروني: ${data.company_info.email}
- الموقع: ${data.company_info.website}
- الخبرة: ${data.company_info.experience}
- العملاء: ${data.company_info.clients}

الخدمات المتوفرة:
${Object.entries(data.services).map(([key, service]: [string, any]) => 
  `- ${service[lang].title}: ${service[lang].description}`
).join('\n')}

الأسئلة الشائعة:
${data.common_questions[lang].general_inquiries.map((q: any) => 
  `س: ${q.question}\nج: ${q.answer}`
).join('\n\n')}

${data.common_questions[lang].service_specific.map((q: any) => 
  `س: ${q.question}\nج: ${q.answer}`
).join('\n\n')}

أزرار الخدمات الموجهة:
${data.service_buttons.ar.map((button: any) => 
  `${button.icon} ${button.title}: ${button.description}`
).join('\n')}

رسائل الترحيب:
${personality.greeting_messages.join('\n')}

رسائل الوداع:
${personality.closing_messages.join('\n')}${userInfoText}

تذكر: رد دائماً باللغة العربية، كن محترفاً ومهذباً، قدم معلومات دقيقة، وكن مختصراً وواضحاً. إذا لم تكن متأكداً من إجابة، اطلب من العميل التواصل مع فريق خدمة العملاء للحصول على معلومات محدثة ودقيقة.`;
    } else {
      if (language === 'tr') {
        return `Sen ${personality.name}, ${data.company_info.english_name} şirketinde ${personality.role}. 

Kişiliğin:
- Ton: ${personality.tone}
- Stil: ${personality.style}
- Cevap uzunluğu: ${personality.response_length}
- Dil adaptasyonu: ${personality.language_adaptation}

Profesyonel nitelikler:
${personality.professional_qualities.map((q: any) => `- ${q}`).join('\n')}

Cevap kuralları:
Yapmalısın:
${guidelines.do.map((g: any) => `- ${g}`).join('\n')}

Yapmamalısın:
${guidelines.dont.map((g: any) => `- ${g}`).join('\n')}

Şirket bilgileri:
- İsim: ${data.company_info.english_name}
- Açıklama: ${data.company_info.english_description}
- Adres: ${data.company_info.address}
- Telefon: ${data.company_info.phone}
- E-posta: ${data.company_info.email}
- Web sitesi: ${data.company_info.website}
- Deneyim: ${data.company_info.experience}
- Müşteriler: ${data.company_info.clients}

Mevcut hizmetler:
${Object.entries(data.services).map(([key, service]: [string, any]) => 
  `- ${service[lang].title}: ${service[lang].description}`
).join('\n')}

Yaygın sorular:
${data.common_questions[lang].general_inquiries.map((q: any) => 
  `S: ${q.question}\nC: ${q.answer}`
).join('\n\n')}

${data.common_questions[lang].service_specific.map((q: any) => 
  `S: ${q.question}\nC: ${q.answer}`
).join('\n\n')}

Karşılama mesajları:
${personality.greeting_messages.join('\n')}

Veda mesajları:
${personality.closing_messages.join('\n')}

Hatırla: Her zaman Türkçe cevap ver, profesyonel ve nazik ol, doğru bilgi ver, kısa ve net ol. Bir cevaptan emin değilsen, müşteriden güncel ve doğru bilgi için müşteri hizmetleri ekibiyle iletişime geçmesini iste.`;
      } else {
        return `You are ${personality.name}, a ${personality.role} at ${data.company_info.english_name}. 

Your personality:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Response length: ${personality.response_length}
- Language adaptation: ${personality.language_adaptation}

Professional qualifications:
${personality.professional_qualities.map((q: any) => `- ${q}`).join('\n')}

Response guidelines:
You should:
${guidelines.do.map((g: any) => `- ${g}`).join('\n')}

You should not:
${guidelines.dont.map((g: any) => `- ${g}`).join('\n')}

Company information:
- Name: ${data.company_info.english_name}
- Description: ${data.company_info.english_description}
- Address: ${data.company_info.address}
- Phone: ${data.company_info.phone}
- Email: ${data.company_info.email}
- Website: ${data.company_info.website}
- Experience: ${data.company_info.experience}
- Clients: ${data.company_info.clients}

Available services:
${Object.entries(data.services).map(([key, service]: [string, any]) => 
  `- ${service[lang].title}: ${service[lang].description}`
).join('\n')}

Common questions:
${data.common_questions[lang].general_inquiries.map((q: any) => 
  `Q: ${q.question}\nA: ${q.answer}`
).join('\n\n')}

${data.common_questions[lang].service_specific.map((q: any) => 
  `Q: ${q.question}\nA: ${q.answer}`
).join('\n\n')}

Service guidance buttons:
${data.service_buttons.en.map((button: any) => 
  `${button.icon} ${button.title}: ${button.description}`
).join('\n')}

Greeting messages:
${personality.greeting_messages.join('\n')}

Closing messages:
${personality.closing_messages.join('\n')}

Remember: Always respond in English, be professional and polite, provide accurate information, and be concise and clear. If you're unsure about an answer, ask the customer to contact the customer service team for updated and accurate information.`;
      }
    }
  }

  private filterThinkingContent(content: string): string {
    // Remove thinking tags and their content
    let filtered = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Remove any remaining thinking patterns
    filtered = filtered.replace(/^<think>[\s\S]*$/gm, '');
    
    // Clean up extra whitespace
    filtered = filtered.trim();
    
    return filtered;
  }

  private detectMeetingRequest(userMessage: string, language: string): boolean {
    const message = userMessage.toLowerCase();
    
    // Arabic patterns
    if (language === 'ar') {
      const arabicPatterns = [
        /موعد|لقاء|اجتماع|زيارة|استشارة/i,
        /أريد.*موعد|أحتاج.*لقاء|أرغب.*اجتماع/i,
        /متى.*أستطيع.*القدوم|متى.*يمكن.*الزيارة/i,
        /حجز.*موعد|تحديد.*لقاء|ترتيب.*اجتماع/i,
        /استشارة.*شخصية|استشارة.*مباشرة/i,
        /مكتبكم|مقركم|عنوانكم/i
      ];
      return arabicPatterns.some(pattern => pattern.test(message));
    }
    
    // English patterns
    const englishPatterns = [
      /appointment|meeting|visit|consultation/i,
      /i want.*appointment|i need.*meeting|i would like.*visit/i,
      /when.*can.*come|when.*can.*visit|when.*available/i,
      /book.*appointment|schedule.*meeting|arrange.*visit/i,
      /personal.*consultation|direct.*consultation/i,
      /your office|your location|your address/i
    ];
    
    return englishPatterns.some(pattern => pattern.test(message));
  }

  private async sendTelegramNotification(
    userMessage: string,
    sessionId: string,
    userInfo?: { id?: string; name?: string; email?: string; isRegistered?: boolean },
    language: string = 'ar'
  ): Promise<void> {
    try {
      const notificationData = {
        sessionId,
        message: userMessage,
        language,
        requestType: 'meeting_request',
        userInfo: userInfo || {},
        additionalData: {
          timestamp: new Date().toISOString(),
          type: 'meeting_request',
          priority: 'high'
        }
      };

      // Send to Telegram webhook
      const response = await fetch('/api/supabase/functions/v1/telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
      } else {
      }
    } catch (error) {
    }
  }

  private getFallbackResponse(language: string, userMessage: string): string {
    const data = trainingData as any;
    const lowerMessage = userMessage.toLowerCase();
    
    if (language === 'ar') {
      if (lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام عليكم') || lowerMessage.includes('أهلا')) {
        return 'مرحباً! كيف يمكنني مساعدتك اليوم؟ أنا أحمد، ممثل خدمة العملاء في مجموعة تواصل.';
      }
      if (lowerMessage.includes('خدمات') || lowerMessage.includes('ماذا تقدمون') || lowerMessage.includes('ما هي خدماتكم')) {
        return 'نقدم خدمات متعددة: التأمين الصحي، تجديد الإقامة، خدمات الترجمة، تجديد الجواز، والتصوير الفوري. \n\n🩺 التأمين الصحي: أسعار حسب العمر\n📄 تجديد الإقامة: إجراءات سريعة\n📝 الترجمة المحلفة: ترجمة معتمدة\n🔄 تحديث البيانات: للحماية المؤقتة\n📘 تجديد الجواز: جواز سوري\n📸 التصوير الفوري: وثائق وصور\n⚖️ الاستشارة القانونية: متخصصة\n✈️ خدمات السفر: رحلات سياحية\n\nكيف يمكنني مساعدتك؟';
      }
      if (lowerMessage.includes('تأمين صحي') || lowerMessage.includes('أسعار التأمين') || lowerMessage.includes('تكلفة التأمين الصحي')) {
        return 'أسعار التأمين الصحي حسب العمر:\n• 0-18 سنة: 1200-1800 ليرة تركية سنوياً\n• 19-30 سنة: 1500-2200 ليرة تركية سنوياً\n• 31-45 سنة: 2000-2800 ليرة تركية سنوياً\n• 46-60 سنة: 2500-3500 ليرة تركية سنوياً\n• 61+ سنة: 3000-4500 ليرة تركية سنوياً\n\nخصومات العائلة: 15% لـ 2 شخص، 20% لـ 3+ أشخاص\nهل تريد استشارة مجانية؟';
      }
      if (lowerMessage.includes('إقامة') || lowerMessage.includes('تكلفة') || lowerMessage.includes('كم تكلفة')) {
        return 'تكلفة الإقامة 810 ليرة تركية للبطاقة، بالإضافة للتأمين والرسوم حسب الجنسية والعمر. هل تريد استشارة مجانية؟';
      }
      if (lowerMessage.includes('عنوان') || lowerMessage.includes('أين') || lowerMessage.includes('مكتب')) {
        return 'مكتبنا في: CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin مرسين - التشارشي مقابل ادارة الهجرة. الهاتف: +90 534 962 72 41';
      }
      if (lowerMessage.includes('هاتف') || lowerMessage.includes('اتصال') || lowerMessage.includes('رقم')) {
        return 'يمكنك التواصل معنا على الهاتف: +90 534 962 72 41 أو البريد الإلكتروني: info@tevasul.group';
      }
      if (lowerMessage.includes('حماية مؤقتة') || lowerMessage.includes('تحديث بيانات') || lowerMessage.includes('الحماية المؤقتة')) {
        return 'نعم، نقدم خدمة تحديث البيانات للحماية المؤقتة. نختص في جميع إجراءات تحديث البيانات والمعلومات المطلوبة للحماية المؤقتة في تركيا. يمكننا مساعدتك في المُعاملات والشكاوى اللازمة لكي تحصل على الحماية المؤقتة الجديدة بسهولة. هل هناك أي بيانات مُحددة تحتاجها؟';
      }
      return 'عذراً، حدث خطأ في الاتصال. يرجى التواصل معنا مباشرة على الهاتف: +90 534 962 72 41 أو البريد الإلكتروني: info@tevasul.group';
    } else if (language === 'tr') {
      if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || lowerMessage.includes('merhaba')) {
        return 'Merhaba! Size nasıl yardımcı olabilirim? Ben Tevasul Group müşteri hizmetleri temsilcisiyim.';
      }
      if (lowerMessage.includes('hizmet') || lowerMessage.includes('ne sunuyorsunuz') || lowerMessage.includes('hizmetleriniz')) {
        return 'Sağlık sigortası, ikamet yenileme, çeviri hizmetleri, pasaport yenileme ve anlık fotoğraf hizmetleri sunuyoruz. Size nasıl yardımcı olabilirim?';
      }
      if (lowerMessage.includes('ikamet') || lowerMessage.includes('maliyet') || lowerMessage.includes('fiyat')) {
        return 'İkamet maliyeti kart için 810 Türk Lirası, ayrıca sigorta ve milliyet ve yaşa göre harçlar. Ücretsiz danışmanlık ister misiniz?';
      }
      if (lowerMessage.includes('adres') || lowerMessage.includes('nerede') || lowerMessage.includes('ofis')) {
        return 'Ofisimiz: CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin - Göç İdaresi karşısı. Telefon: +90 534 962 72 41';
      }
      if (lowerMessage.includes('telefon') || lowerMessage.includes('iletişim') || lowerMessage.includes('numara')) {
        return 'Bize telefon: +90 534 962 72 41 veya e-posta: info@tevasul.group ile ulaşabilirsiniz.';
      }
      return 'Üzgünüz, bağlantı hatası oluştu. Lütfen doğrudan telefon: +90 534 962 72 41 veya e-posta: info@tevasul.group ile iletişime geçin.';
    } else {
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return 'Hello! How can I help you today? I\'m a customer service representative at Tevasul Group.';
      }
      if (lowerMessage.includes('services') || lowerMessage.includes('what do you offer') || lowerMessage.includes('help')) {
        return 'We offer various services: health insurance, residence renewal, translation services, passport renewal, and instant photography.\n\n🩺 Health Insurance: Prices by age\n📄 Residence Renewal: Fast procedures\n📝 Certified Translation: Official translation\n🔄 Data Updates: For temporary protection\n📘 Passport Renewal: Syrian passport\n📸 Instant Photography: Documents and photos\n⚖️ Legal Consultation: Specialized\n✈️ Travel Services: Tourist trips\n\nHow can I assist you?';
      }
      if (lowerMessage.includes('health insurance') || lowerMessage.includes('insurance prices') || lowerMessage.includes('health insurance cost')) {
        return 'Health insurance prices by age:\n• 0-18 years: 1200-1800 Turkish Lira annually\n• 19-30 years: 1500-2200 Turkish Lira annually\n• 31-45 years: 2000-2800 Turkish Lira annually\n• 46-60 years: 2500-3500 Turkish Lira annually\n• 61+ years: 3000-4500 Turkish Lira annually\n\nFamily discounts: 15% for 2 people, 20% for 3+ people\nWould you like a free consultation?';
      }
      if (lowerMessage.includes('residence') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        return 'Residence permit cost is 810 Turkish Lira for the card, plus insurance and fees based on nationality and age. Would you like a free consultation?';
      }
      if (lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('office')) {
        return 'Our office is at: CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin - opposite Immigration Office. Phone: +90 534 962 72 41';
      }
      if (lowerMessage.includes('phone') || lowerMessage.includes('contact') || lowerMessage.includes('number')) {
        return 'You can contact us at phone: +90 534 962 72 41 or email: info@tevasul.group';
      }
      if (lowerMessage.includes('temporary protection') || lowerMessage.includes('data update') || lowerMessage.includes('protection')) {
        return 'Yes, we provide data update services for temporary protection. We specialize in all procedures for updating data and information required for temporary protection in Turkey. We can help you with the necessary transactions and complaints to obtain new temporary protection easily. Is there any specific data you need?';
      }
      return 'Sorry, there was a connection error. Please contact us directly at phone: +90 534 962 72 41 or email: info@tevasul.group';
    }
  }

  async getResponse(
    userMessage: string,
    sessionId: string,
    language?: string,
    userInfo?: { id?: string; name?: string; email?: string; isRegistered?: boolean }
  ): Promise<string> {
    // Auto-detect language if not provided
    const detectedLanguage = language || this.detectLanguage(userMessage);
    
    // Check cache first for simple queries (no conversation context needed)
    const conversation = this.conversationHistory.get(sessionId) || [];
    if (conversation.length <= 1) { // Only system message or empty
      const cachedResponse = this.getCachedResponse(userMessage, detectedLanguage);
      if (cachedResponse) {
        // Add to conversation history
        const newConversation = [
          ...conversation,
          { role: 'user' as const, content: userMessage },
          { role: 'assistant' as const, content: cachedResponse }
        ];
        this.conversationHistory.set(sessionId, newConversation);
        return cachedResponse;
      }
    }
    
    // Check if this is a meeting request and send notification
    if (this.detectMeetingRequest(userMessage, detectedLanguage)) {
      // Send notification in background (don't wait for it)
      this.sendTelegramNotification(userMessage, sessionId, userInfo, detectedLanguage)
    }
    
    try {
      // Get conversation history for this session
      let currentConversation = conversation;
      
      // Add system message if this is the first message
      if (currentConversation.length === 0) {
        const systemPrompt = this.getSystemPrompt(detectedLanguage, userInfo);
        currentConversation.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add user message
      currentConversation.push({
        role: 'user',
        content: userMessage
      });

      // Keep only last 10 messages to manage context length
      if (currentConversation.length > 11) { // system + 10 messages
        currentConversation = [
          currentConversation[0], // Keep system message
          ...currentConversation.slice(-10) // Keep last 10 messages
        ];
      }

      // Use Groq with compound-beta-oss model
      if (!this.groqClient) {
        throw new Error('Groq client not initialized');
      }

      const completion = await this.makeGroqRequest({
        model: "qwen/qwen3-32b",
        messages: currentConversation,
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
        reasoning_effort: "none",
        stream: false,
        stop: null
      });

      const assistantResponse = completion.choices[0]?.message?.content || '';
      
      // Filter out thinking content
      const filteredResponse = this.filterThinkingContent(assistantResponse);

      // Cache the response for simple queries
      if (currentConversation.length <= 2) { // Only system + user message
        this.setCachedResponse(userMessage, detectedLanguage, filteredResponse);
      }

      // Add assistant response to conversation
      currentConversation.push({
        role: 'assistant',
        content: filteredResponse
      });

      // Update conversation history
      this.conversationHistory.set(sessionId, currentConversation);

      return filteredResponse;
    } catch (error) {
      // Use fallback response instead of generic error
      return this.getFallbackResponse(detectedLanguage, userMessage);
    }
  }

  async getResponseStream(
    userMessage: string,
    sessionId: string,
    language?: string,
    onChunk: (chunk: string) => void,
    userInfo?: { id?: string; name?: string; email?: string; isRegistered?: boolean }
  ): Promise<string> {
    // Auto-detect language if not provided
    const detectedLanguage = language || this.detectLanguage(userMessage);
    
    // Check if this is a meeting request and send notification
    if (this.detectMeetingRequest(userMessage, detectedLanguage)) {
      // Send notification in background (don't wait for it)
      this.sendTelegramNotification(userMessage, sessionId, userInfo, detectedLanguage)
    }
    
    try {
      // Get conversation history for this session
      let conversation = this.conversationHistory.get(sessionId) || [];
      
      // Add system message if this is the first message
      if (conversation.length === 0) {
        const systemPrompt = this.getSystemPrompt(detectedLanguage, userInfo);
        conversation.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add user message
      conversation.push({
        role: 'user',
        content: userMessage
      });

      // Keep only last 10 messages to manage context length
      if (conversation.length > 11) { // system + 10 messages
        conversation = [
          conversation[0], // Keep system message
          ...conversation.slice(-10) // Keep last 10 messages
        ];
      }

      // Use Groq with compound-beta-oss model
      if (!this.groqClient) {
        throw new Error('Groq client not initialized');
      }

      const completion = await this.makeGroqRequest({
        model: "qwen/qwen3-32b",
        messages: conversation,
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
        reasoning_effort: "none",
        stream: true,
        stop: null
      });

      let fullResponse = '';

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // Filter out thinking content
          const filteredContent = this.filterThinkingContent(content);
          if (filteredContent) {
            onChunk(filteredContent);
          }
        }
      }

      // Filter the final response
      const filteredResponse = this.filterThinkingContent(fullResponse);

      // Add assistant response to conversation
      conversation.push({
        role: 'assistant',
        content: filteredResponse
      });

      // Update conversation history
      this.conversationHistory.set(sessionId, conversation);
      
      return filteredResponse;
    } catch (error) {
      // Use fallback response instead of generic error
      const fallbackResponse = this.getFallbackResponse(detectedLanguage, userMessage);
      
      // Simulate streaming by calling onChunk with the full response
      onChunk(fallbackResponse);
      
      return fallbackResponse;
    }
  }

  clearConversation(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  getConversationHistory(sessionId: string): ChatMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  clearCache(): void {
    this.responseCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.responseCache.size,
      keys: Array.from(this.responseCache.keys())
    };
  }
}

export default ChatService.getInstance();
