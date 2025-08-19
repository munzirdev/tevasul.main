import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Save,
  X,
  Plus,
  Download,
  Eye,
  Reply,
  HelpCircle,
  ExternalLink,
  Globe,
  BarChart3,
  Sun,
  Moon,
  Home,
  Shield,
  Heart,
  Menu,
  ArrowRight,
  Star,
  Zap,
  MapPin,
  Building,
  ChevronDown,
  UserPlus,
  User,
  Settings,
  LogOut,
  Send,
  Printer,
  Filter,
  AlertTriangle,
  MessageCircle,
  RefreshCw,
  Bot,

} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { useLanguage } from '../hooks/useLanguage';
import VoluntaryReturnFormsList from './VoluntaryReturnFormsList';
import VoluntaryReturnForm from './VoluntaryReturnForm';
import VoluntaryReturnChart from './VoluntaryReturnChart';
import ModeratorManagement from './ModeratorManagement';
import HealthInsuranceManagement from './HealthInsuranceManagement';
import TinyMCEEditor from './TinyMCEEditor';

import WebhookSettings from './WebhookSettings';
import { formatDisplayDate } from '../lib/utils';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import GlassLoadingScreen from './GlassLoadingScreen';
import SkeletonLoading from './SkeletonLoading';


interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_country_code: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  file_name?: string;
  admin_reply_date?: string;
}

interface SupportMessage {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  admin_reply: string;
  created_at: string;
  updated_at: string;
  admin_reply_date?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut?: () => void;
}

// دالة لتنسيق رقم الهاتف للواتساب
const formatPhoneForWhatsApp = (phone: string): string => {
  // إزالة جميع الأحرف غير الرقمية
  let cleanPhone = phone.replace(/\D/g, '');
  
  // إذا كان الرقم يبدأ بـ 0، نزيله ونضيف 90
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '90' + cleanPhone.substring(1);
  }
  
  // إذا كان الرقم لا يبدأ بـ 90، نضيفه
  if (!cleanPhone.startsWith('90')) {
    cleanPhone = '90' + cleanPhone;
  }
  
  // إذا كان الرقم أقل من 12 رقم، نضيف أصفار في البداية
  while (cleanPhone.length < 12) {
    cleanPhone = '90' + cleanPhone;
  }
  
  // نأخذ أول 12 رقم فقط (90 + 10 أرقام)
  return cleanPhone.substring(0, 12);
};

// إضافة أنواع جديدة للنماذج الديناميكية
interface DynamicForm {
  id: string;
  name: string;
  description: string;
  variables: FormVariable[];
  template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormVariable {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // للقوائم المنسدلة
  placeholder?: string;
  default_value?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, isDarkMode, onToggleDarkMode, onSignOut }) => {
  const { user, profile } = useAuthContext();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'support' | 'faqs' | 'ready-forms' | 'moderators' | 'health-insurance' | 'webhooks' | 'chat-messages'>('requests');
  const [voluntaryReturnView, setVoluntaryReturnView] = useState<'list' | 'create' | 'chart'>('list');
  const [healthInsuranceView, setHealthInsuranceView] = useState<'list' | 'create'>('list');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);
  const [editingSupport, setEditingSupport] = useState<SupportMessage | null>(null);
  
  // Chat messages state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<string | null>(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessageNotification, setNewMessageNotification] = useState<string | null>(null);
  const [chatFilter, setChatFilter] = useState<'all' | 'user' | 'bot' | 'admin'>('all');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [chatDateFilter, setChatDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [claimedSessions, setClaimedSessions] = useState<Set<string>>(new Set());

  // إضافة state للنماذج الديناميكية
  const [dynamicForms, setDynamicForms] = useState<DynamicForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('voluntary-return');
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [formValues, setFormValues] = useState<{[key: string]: string}>({});
  const [editingForm, setEditingForm] = useState<DynamicForm | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingVariable, setEditingVariable] = useState<{name: string, value: string} | null>(null);

  // Interface for template parts
  interface TemplatePart {
    type: 'text' | 'variable';
    content?: string;
    name?: string;
    value?: string;
    original?: string;
  }

  // إعادة تعيين قيم النموذج عند تغيير النموذج المحدد
  useEffect(() => {
    setFormValues({});
  }, [selectedForm]);

  // إضافة دالة JavaScript عامة لتحرير المتغيرات
  useEffect(() => {
    (window as any).editVariable = (variableName: string, element: HTMLElement) => {
      const currentValue = formValues[variableName] || '';
      setEditingVariable({ name: variableName, value: currentValue });
    };

    return () => {
      delete (window as any).editVariable;
    };
  }, [formValues]);
  const [newForm, setNewForm] = useState<Partial<DynamicForm>>({
    name: '',
    description: '',
    variables: [],
    template: '',
    is_active: true
  });


  // Load claimed sessions from localStorage on component mount
  useEffect(() => {
    const savedClaimedSessions = localStorage.getItem('admin_claimed_sessions');
    if (savedClaimedSessions) {
      try {
        const parsedSessions = JSON.parse(savedClaimedSessions);
        setClaimedSessions(new Set(parsedSessions));
        } catch (error) {
        console.error('Error loading claimed sessions from localStorage:', error);
      }
    }
  }, []);

  // Hide skeleton after a very short delay to show glass loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 100); // Very short delay to prevent white screen

    return () => clearTimeout(timer);
  }, []);
  const [clickedSessionId, setClickedSessionId] = useState<string | null>(null);
  
  // Auto scroll ref for chat messages
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time subscription for all chat messages
  useEffect(() => {
    const channel = supabase
      .channel(`admin_chat_messages_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload: any) => {
          const newMessage = payload.new as any;
          
          // Update chat sessions list to show new message count
          setChatSessions(prev => {
            const updatedSessions = prev.map(session => {
              if (session.session_id === newMessage.session_id) {
                return {
                  ...session,
                  message_count: session.message_count + 1,
                  last_message: {
                    content: newMessage.content,
                    created_at: newMessage.created_at
                  },
                  hasNewMessage: true // Mark as having new message
                };
              }
              return session;
            });
            
            // If this is a new session, add it to the list
            if (!prev.some(session => session.session_id === newMessage.session_id)) {
              const newSession = {
                session_id: newMessage.session_id,
                messages: [newMessage],
                last_message: {
                  content: newMessage.content,
                  created_at: newMessage.created_at
                },
                message_count: 1,
                created_at: newMessage.created_at,
                hasNewMessage: true // Mark as having new message
              };
              updatedSessions.unshift(newSession); // Add to beginning
            }
            
            return updatedSessions;
          });
          
          // Show notification for new message
          if (newMessage.sender === 'user') {
            setNewMessageNotification(`رسالة جديدة من العميل في الجلسة: ${newMessage.session_id.substring(0, 8)}...`);
            setTimeout(() => setNewMessageNotification(null), 5000); // Hide after 5 seconds
          }
          
          // If this message is for the currently selected session, add it to chat messages
          if (selectedChatSession === newMessage.session_id) {
            setChatMessages(prev => {
              // Check if message already exists
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              
              const formattedMessage = {
                id: newMessage.id,
                content: newMessage.content,
                sender: newMessage.sender,
                created_at: newMessage.created_at,
                session_id: newMessage.session_id,
                user_id: newMessage.user_id
              };
              
              return [...prev, formattedMessage];
            });
            
            // Auto scroll to bottom - Disabled to prevent page jumping
            // setTimeout(() => {
            //   if (chatMessagesEndRef.current) {
            //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            //   }
            // }, 100);
          }
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for admin dashboard');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error for admin dashboard');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatSession]);

  // Periodic refresh for chat sessions (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatSessions();
      
      // Also refresh messages for currently selected session
      if (selectedChatSession) {
        fetchChatMessages(selectedChatSession);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedChatSession]);

  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    category: 'عام',
    order_index: 0,
    is_active: true
  });
  const [editForm, setEditForm] = useState({
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    admin_notes: ''
  });
  const [supportReplyForm, setSupportReplyForm] = useState({
    admin_reply: '',
    status: 'pending' as 'pending' | 'in_progress' | 'resolved' | 'closed'
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [fileViewModal, setFileViewModal] = useState<{
    isOpen: boolean;
    fileName: string;
    fileData: string | null;
  }>({
    isOpen: false,
    fileName: '',
    fileData: null
  });

  // Get search params for use throughout the component
  const searchParams = new URLSearchParams(location.search);
  const viewParam = searchParams.get('view');
  const formParam = searchParams.get('form');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
    itemType: 'request' | 'message' | 'faq' | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    itemId: null,
    itemName: '',
    itemType: null,
    isLoading: false
  });

  useEffect(() => {
    if (user) {
      fetchServiceRequests();
      fetchSupportMessages();
      fetchFAQs();
      fetchChatSessions();
      fetchDynamicForms(); // إضافة جلب العريضات الديناميكية
      
      // Prevent auto scroll to top when loading chat messages
      if (activeTab === 'chat-messages') {
        window.scrollTo(0, 0);
      }
    }
  }, [user]);

  // Auto-refresh chat sessions every 30 seconds when on chat tab
  useEffect(() => {
    if (activeTab === 'chat-messages') {
      const interval = setInterval(() => {
        // Only refresh if not currently loading
        if (!chatLoading) {
          fetchChatSessions();
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, chatLoading]);

  // Auto scroll to bottom when chat messages change - Disabled to prevent page jumping
  // useEffect(() => {
  //   if (chatMessagesEndRef.current) {
  //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [chatMessages]);

  // Add timeout to prevent loading state from getting stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Handle permalink navigation based on URL
  useEffect(() => {
    const path = location.pathname;
    
    // Map URL paths to dashboard sections
    if (path === '/admin' || path === '/admin/dashboard') {
      setActiveTab('requests');
      setVoluntaryReturnView('list');
    } else if (path === '/admin/service-requests') {
      setActiveTab('requests');
      setVoluntaryReturnView('list');
    } else if (path === '/admin/support-messages') {
      setActiveTab('support');
      setVoluntaryReturnView('list');
    } else if (path === '/admin/ready-forms') {
      setActiveTab('ready-forms');
      // Check for form and view parameters
      if (formParam === 'voluntary-return') {
        if (viewParam === 'create') {
          setVoluntaryReturnView('create');
        } else if (viewParam === 'chart') {
          setVoluntaryReturnView('chart');
        } else {
          setVoluntaryReturnView('list');
        }
      } else {
        // Default to voluntary return list
        setVoluntaryReturnView('list');
      }
    } else if (path === '/admin/faq') {
      setActiveTab('faqs');
      setVoluntaryReturnView('list');
    } else if (path === '/admin/moderators') {
      setActiveTab('moderators');
      setVoluntaryReturnView('list');
    } else if (path === '/admin/analytics') {
      setActiveTab('ready-forms');
      setVoluntaryReturnView('chart');
    }
  }, [location.pathname, location.search, formParam, viewParam]);

  // Navigation functions for permalinks
  const navigateToTab = (tab: 'requests' | 'support' | 'faqs' | 'ready-forms' | 'moderators' | 'health-insurance' | 'webhooks' | 'chat-messages') => {
    setActiveTab(tab);
    // Stay on the same page, just change the active tab
    // No need to navigate to different URLs since everything is in one component
  };

  const navigateToVoluntaryReturnView = (view: 'list' | 'create' | 'chart') => {
    setVoluntaryReturnView(view);
    switch (view) {
      case 'list':
        navigate('/admin/ready-forms?form=voluntary-return&view=list');
        break;
      case 'create':
        navigate('/admin/ready-forms?form=voluntary-return&view=create');
        break;
      case 'chart':
        navigate('/admin/ready-forms?form=voluntary-return&view=chart');
        break;
    }
  };

  const navigateToHealthInsuranceView = (view: 'list' | 'create') => {
    setHealthInsuranceView(view);
    switch (view) {
      case 'list':
        navigate('/admin/ready-forms?form=health-insurance&view=list');
        break;
      case 'create':
        navigate('/admin/ready-forms?form=health-insurance&view=create');
        break;
    }
  };





  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      // Add timeout to the database query
      const queryPromise = supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 3000); // 3 second timeout
      });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

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

  const fetchSupportMessages = async () => {
    try {
      // Add timeout to the database query
      const queryPromise = supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 3000); // 3 second timeout
      });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('خطأ في جلب رسائل الدعم:', error);
        return;
      }

      setSupportMessages(data || []);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      // Add timeout to the database query
      const queryPromise = supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 3000); // 3 second timeout
      });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('خطأ في جلب الأسئلة المتكررة:', error);
        return;
      }

      setFaqs(data || []);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  const fetchChatSessions = async () => {
    try {
      setChatLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب المحادثات:', error);
        return;
      }

      // Group messages by session_id
      const sessionsMap = new Map();
      data?.forEach((message: any) => {
        if (!sessionsMap.has(message.session_id)) {
          sessionsMap.set(message.session_id, {
            session_id: message.session_id,
            messages: [],
            last_message: message,
            message_count: 0,
            created_at: message.created_at
          });
        }
        sessionsMap.get(message.session_id).messages.push(message);
        sessionsMap.get(message.session_id).message_count += 1;
      });

      const sessions = Array.from(sessionsMap.values());
      setChatSessions(sessions);
      
      // Select first session by default
      if (sessions.length > 0 && !selectedChatSession) {
        setSelectedChatSession(sessions[0].session_id);
        setChatMessages(sessions[0].messages);
        
        // Remove new message indicator for default session
        setChatSessions(prev => prev.map(session => 
          session.session_id === sessions[0].session_id 
            ? { ...session, hasNewMessage: false }
            : session
        ));
      }
      
      // Check for claimed sessions from database
      const claimedSessionsFromDB = new Set<string>();
      for (const session of sessions) {
        const { data: claimMessages } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('session_id', session.session_id)
          .eq('sender', 'admin')
          .ilike('content', '%تم استلام المحادثة%')
          .limit(1);

        if (claimMessages && claimMessages.length > 0) {
          claimedSessionsFromDB.add(session.session_id);
        }
      }

      // Update claimed sessions state and localStorage
      if (claimedSessionsFromDB.size > 0) {
        setClaimedSessions(prev => {
          const newSet = new Set([...prev, ...claimedSessionsFromDB]);
          localStorage.setItem('admin_claimed_sessions', JSON.stringify(Array.from(newSet)));
          return newSet;
        });
      }
      
      } catch (error) {
      console.error('خطأ غير متوقع في جلب المحادثات:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchChatMessages = async (sessionId: string) => {
    try {
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 10000); // 10 second timeout
      });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ خطأ في جلب رسائل المحادثة:', error);
        throw error;
      }

      setChatMessages(data || []);
      
      // Auto scroll to bottom after fetching messages - Disabled to prevent page jumping
      // setTimeout(() => {
      //   if (chatMessagesEndRef.current) {
      //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      //   }
      // }, 100);
      
      // Force a second refresh after a short delay to catch any missed messages
      setTimeout(() => {
        if (selectedChatSession === sessionId) {
          supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .then(({ data: refreshData, error: refreshError }) => {
              if (!refreshError && refreshData) {
                if (refreshData.length !== data?.length) {
                  setChatMessages(refreshData);
                }
              }
            });
        }
      }, 2000);
    } catch (error) {
      console.error('❌ خطأ غير متوقع في جلب رسائل المحادثة:', error);
      setChatMessages([]);
      throw error;
    }
  };

  const sendChatReply = async (sessionId: string, content: string) => {
    try {
      // Insert message to database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content,
          sender: 'admin',
          session_id: sessionId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refresh messages and sessions
      await fetchChatMessages(sessionId);
      await fetchChatSessions();
      setChatReplyText('');
      
      // Clear notification after sending reply
      setNewMessageNotification(null);
      
      // Remove new message indicator for this session
      setChatSessions(prev => prev.map(session => 
        session.session_id === sessionId 
          ? { ...session, hasNewMessage: false }
          : session
      ));
      
      // Auto scroll to bottom after sending message - Disabled to prevent page jumping
      // setTimeout(() => {
      //   if (chatMessagesEndRef.current) {
      //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      //   }
      // }, 100);
      
      // Auto scroll to bottom after sending message - Disabled to prevent page jumping
      // setTimeout(() => {
      //   if (chatMessagesEndRef.current) {
      //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      //   }
      // }, 100);
    } catch (error) {
      console.error('خطأ في إرسال الرد:', error);
    }
  };

  const claimChatSession = async (sessionId: string) => {
    try {
      // Add claimed session to state
      setClaimedSessions(prev => {
        const newSet = new Set(prev).add(sessionId);
        // Save to localStorage
        localStorage.setItem('admin_claimed_sessions', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      
      // Send notification message to user
      const notificationMessage = '🔔 تم استلام المحادثة من قبل ممثل خدمة العملاء. سيتم الرد عليك قريباً.';
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: notificationMessage,
          sender: 'admin',
          session_id: sessionId,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('خطأ في إرسال رسالة الاستلام:', error);
        throw error;
      }
      
      // Refresh messages and sessions
      await fetchChatMessages(sessionId);
      await fetchChatSessions();
      
      // Auto scroll to bottom - Disabled to prevent page jumping
      // setTimeout(() => {
      //   if (chatMessagesEndRef.current) {
      //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      //   }
      // }, 100);
      
      } catch (error) {
      console.error('خطأ في استلام المحادثة:', error);
    }
  };

  const handleChatSessionSelect = async (sessionId: string) => {
    // Prevent multiple clicks on the same session
    if (clickedSessionId === sessionId || chatLoading) {
      return;
    }

    try {
      // Set clicked session to prevent multiple clicks
      setClickedSessionId(sessionId);
      
      // Set loading state
      setChatLoading(true);
      
      // Update selected session immediately for UI feedback
      setSelectedChatSession(sessionId);
      
      // Remove new message indicator when session is selected
      setChatSessions(prev => prev.map(session => 
        session.session_id === sessionId 
          ? { ...session, hasNewMessage: false }
          : session
      ));
      
      // Fetch messages for this session
      await fetchChatMessages(sessionId);
      
      // Auto scroll to bottom when selecting a new session - Disabled to prevent page jumping
      // setTimeout(() => {
      //   if (chatMessagesEndRef.current) {
      //     chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      //   }
      // }, 100);
      
      } catch (error) {
      console.error('❌ خطأ في فتح جلسة المحادثة:', error);
      // Reset selection on error
      setSelectedChatSession(null);
    } finally {
      setChatLoading(false);
      // Clear clicked session after a short delay
      setTimeout(() => {
        setClickedSessionId(null);
      }, 1000);
    }
  };

  // Filter chat messages based on sender and search term
  const filteredChatMessages = chatMessages.filter(message => {
    const matchesFilter = chatFilter === 'all' || message.sender === chatFilter;
    const matchesSearch = !chatSearchTerm || message.content.toLowerCase().includes(chatSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filter chat sessions based on search term and date
  const filteredChatSessions = chatSessions.filter(session => {
    const matchesSearch = !chatSearchTerm || session.messages.some((message: any) => 
      message.content.toLowerCase().includes(chatSearchTerm.toLowerCase())
    );
    
    const sessionDate = new Date(session.created_at);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let matchesDate = true;
    if (chatDateFilter === 'today') {
      matchesDate = sessionDate >= today;
    } else if (chatDateFilter === 'week') {
      matchesDate = sessionDate >= weekAgo;
    } else if (chatDateFilter === 'month') {
      matchesDate = sessionDate >= monthAgo;
    }
    
    return matchesSearch && matchesDate;
  });

  const deleteChatSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      
      // Remove from claimed sessions
      setClaimedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        localStorage.setItem('admin_claimed_sessions', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      
      // Refresh sessions and clear selected session if it was deleted
      await fetchChatSessions();
      if (selectedChatSession === sessionId) {
        setSelectedChatSession(null);
        setChatMessages([]);
      }
      
      // Clear notification if the deleted session was showing a notification
      setNewMessageNotification(null);
    } catch (error) {
      console.error('خطأ في حذف جلسة المحادثة:', error);
    }
  };

  const handleEdit = (request: ServiceRequest) => {
    setEditingRequest(request);
    setEditForm({
      status: request.status,
      priority: request.priority,
      admin_notes: request.admin_notes || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRequest) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          status: editForm.status,
          priority: editForm.priority,
          admin_notes: editForm.admin_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRequest.id);

      if (error) {
        console.error('خطأ في تحديث الطلب:', error);
        return;
      }

      await fetchServiceRequests();
      setEditingRequest(null);
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  const handleEditSupport = (message: SupportMessage) => {
    setEditingSupport(message);
    setSupportReplyForm({
      admin_reply: message.admin_reply || '',
      status: message.status as any
    });
  };

  const handleSaveSupportReply = async () => {
    if (!editingSupport) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .update({
          admin_reply: supportReplyForm.admin_reply || null,
          status: supportReplyForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSupport.id);

      if (error) {
        console.error('خطأ في تحديث الرد:', error);
        return;
      }

      await fetchSupportMessages();
      setEditingSupport(null);
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFAQ(faq);
  };

  const handleSaveFaq = async (faqData: Partial<FAQ>) => {
    try {
      if (editingFAQ) {
        // تحديث سؤال موجود
        const { error } = await supabase
          .from('faqs')
          .update({
            question: faqData.question,
            answer: faqData.answer,
            category: faqData.category,
            order_index: faqData.order_index,
            is_active: faqData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFAQ.id);

        if (error) {
          console.error('خطأ في تحديث السؤال:', error);
          return;
        }
      } else {
        // إضافة سؤال جديد
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: faqData.question,
            answer: faqData.answer,
            category: faqData.category || 'عام',
            order_index: faqData.order_index || 0,
            is_active: faqData.is_active !== false
          });

        if (error) {
          console.error('خطأ في إضافة السؤال:', error);
          return;
        }
      }

      await fetchFAQs();
      setEditingFAQ(null);
      setShowAddFaq(false);
      setNewFaq({
        question: '',
        answer: '',
        category: 'عام',
        order_index: 0,
        is_active: true
      });
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) {
        console.error('خطأ في حذف السؤال:', error);
        return;
      }

      await fetchFAQs();
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

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
            
            setFileViewModal({
              isOpen: true,
              fileName: fileName,
              fileData: fileData
            });
          };
          
          reader.readAsDataURL(blob);
        });
      }
      
      // فتح الملف في مودال
      setFileViewModal({
        isOpen: true,
        fileName: fileName,
        fileData: fileData
      });
      
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

  const handleDelete = async (id: string) => {
    try {
      console.log('حذف الطلب:', id);
      
      // محاولة الحذف مع إرجاع البيانات المحذوفة للتحقق
      const { data: deletedRows, error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', id)
        .select('*');

      if (error) {
        console.error('خطأ في حذف الطلب:', error);
        console.error('تفاصيل الخطأ:', error.message, error.details, error.hint);
        return;
      }

      console.log('تم حذف الصفوف:', deletedRows);

      // تحديث واجهة المستخدم مباشرة (تفاؤلياً)
      setRequests(prev => prev.filter(r => r.id !== id));

      // إعادة جلب البيانات للتأكد
      await fetchServiceRequests();
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  const handleDeleteSupportMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('خطأ في حذف رسالة الدعم:', error);
        return;
      }

      await fetchSupportMessages();

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesRequestFilter = requestFilter === 'all' || request.status === requestFilter;
    
    return matchesSearch && matchesStatus && matchesRequestFilter;
  });

  // Filter support messages
  const filteredSupportMessages = supportMessages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-100/80 dark:bg-amber-900/30 dark:text-amber-400';
      case 'in_progress': return 'text-purple-600 bg-purple-100/80 dark:bg-purple-900/30 dark:text-purple-400';
      case 'completed': return 'text-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'resolved': return 'text-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'cancelled': return 'text-red-600 bg-red-100/80 dark:bg-red-900/30 dark:text-red-400';
      case 'closed': return 'text-slate-600 bg-slate-100/80 dark:bg-slate-900/30 dark:text-slate-400';
      default: return 'text-slate-600 bg-slate-100/80 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100/80 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-blue-600 bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low': return 'text-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'text-slate-600 bg-slate-100/80 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getServiceTypeArabic = (serviceType: string) => {
    const serviceTypes: { [key: string]: string } = {
      'translation': 'خدمات الترجمة المحلفة',
      'travel': 'خدمات السفر والسياحة',
      'legal': 'الاستشارات القانونية',
      'government': 'الخدمات الحكومية',
      'insurance': 'خدمات التأمين'
    };
    return serviceTypes[serviceType] || serviceType;
  };

  const getStatusArabic = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتملة';
      case 'resolved': return 'محلولة';
      case 'cancelled': return 'ملغية';
      case 'closed': return 'مغلقة';
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

  const handleDeleteClick = (id: string, name: string, type: 'request' | 'message' | 'faq') => {
    setDeleteModal({
      isOpen: true,
      itemId: id,
      itemName: name,
      itemType: type,
      isLoading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.itemId || !deleteModal.itemType) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));

      if (deleteModal.itemType === 'request') {
        await handleDelete(deleteModal.itemId);
      } else if (deleteModal.itemType === 'faq') {
        await handleDeleteFaq(deleteModal.itemId);
      } else if (deleteModal.itemType === 'message') {
        await handleDeleteSupportMessage(deleteModal.itemId);
      }
      // Add other delete types as needed

      // Close modal
      setDeleteModal({
        isOpen: false,
        itemId: null,
        itemName: '',
        itemType: null,
        isLoading: false
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      itemId: null,
      itemName: '',
      itemType: null,
      isLoading: false
    });
  };

  // دالة لجلب العريضات الديناميكية
  const fetchDynamicForms = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب العريضات الديناميكية:', error);
        return;
      }

      setDynamicForms(data || []);
    } catch (error) {
      console.error('خطأ غير متوقع في جلب العريضات:', error);
    }
  };

  // دالة لحفظ عريضة ديناميكية
  const saveDynamicForm = async (formData: Partial<DynamicForm>) => {
    console.log('بدء حفظ العريضة:', formData);
    
    // التحقق من البيانات المطلوبة
    if (!formData.name || formData.name.trim() === '') {
      alert('يرجى إدخال اسم النموذج');
      return;
    }
    
    if (!formData.template || formData.template.trim() === '') {
      alert('يرجى إدخال محتوى النموذج');
      return;
    }
    
    try {
      if (editingForm) {
        // تحديث نموذج موجود
        const { error } = await supabase
          .from('dynamic_forms')
          .update({
            name: formData.name,
            description: formData.description,
            variables: formData.variables,
            template: formData.template,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingForm.id);

        if (error) {
          console.error('خطأ في تحديث العريضة:', error);
          alert('خطأ في تحديث النموذج: ' + error.message);
          return;
        }
      } else {
        // إضافة نموذج جديد
        const { error } = await supabase
          .from('dynamic_forms')
          .insert({
            name: formData.name,
            description: formData.description,
            variables: formData.variables || [],
            template: formData.template,
            is_active: formData.is_active !== false
          });

        if (error) {
          console.error('خطأ في إضافة العريضة:', error);
          alert('خطأ في إضافة النموذج: ' + error.message);
          return;
        }
      }

      console.log('تم حفظ العريضة بنجاح');
      await fetchDynamicForms();
      setEditingForm(null);
      setNewForm({
        name: '',
        description: '',
        variables: [],
        template: '',
        is_active: true
      });
      
      setUpdateSuccess(true);
      alert('تم حفظ النموذج بنجاح!');
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع في حفظ العريضة:', error);
    }
  };

  // دالة لتطبيق القيم على قالب النموذج
  const applyFormValues = (template: string, values: {[key: string]: string}) => {
    let result = template;
    
    // إضافة التاريخ الحالي تلقائياً إذا لم يتم تحديده
    const updatedValues = { ...values };
    if (!updatedValues.date && template.includes('{date}')) {
      const today = new Date();
      updatedValues.date = today.toLocaleDateString('tr-TR'); // تنسيق تركي
    }
    
    Object.entries(updatedValues).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value || placeholder);
    });
    return result;
  };

  // دالة لتطبيق القيم مع إمكانية التحرير المباشر
  const applyFormValuesWithEditableFields = (template: string, values: {[key: string]: string}) => {
    let result = template;
    
    // إضافة التاريخ الحالي تلقائياً إذا لم يتم تحديده
    const updatedValues = { ...values };
    if (!updatedValues.date && template.includes('{date}')) {
      const today = new Date();
      updatedValues.date = today.toLocaleDateString('tr-TR');
    }
    
    // استخراج جميع المتغيرات من القالب
    const variableMatches = template.match(/\{([^}]+)\}/g) || [];
    const uniqueVariables = [...new Set(variableMatches)];
    
    uniqueVariables.forEach(placeholder => {
      const key = placeholder.replace(/[{}]/g, '');
      const value = updatedValues[key] || '';
      const editableSpan = `<span 
        class="editable-variable" 
        data-variable="${key}" 
        style="
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1)); 
          border: 2px solid rgba(59, 130, 246, 0.3); 
          border-radius: 8px; 
          padding: 4px 8px; 
          cursor: pointer;
          display: inline-block;
          min-width: 80px;
          text-align: center;
          transition: all 0.3s ease;
          font-weight: 500;
          color: rgba(59, 130, 246, 0.9);
          position: relative;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        "
        onmouseover="this.style.backgroundColor='rgba(59, 130, 246, 0.2)'; this.style.borderColor='rgba(59, 130, 246, 0.5)'; this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(59, 130, 246, 0.2)'"
        onmouseout="this.style.backgroundColor='rgba(59, 130, 246, 0.1)'; this.style.borderColor='rgba(59, 130, 246, 0.3)'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(59, 130, 246, 0.1)'"
        onclick="editVariable('${key}', this)"
        title="🖊️ انقر للتعديل"
      >${value || `<em style="color: rgba(156, 163, 175, 0.8);">${placeholder}</em>`}</span>`;
      
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), editableSpan);
    });
    
    return result;
  };

  // دالة لطباعة النموذج
  const printForm = () => {
    const currentForm = dynamicForms.find(f => f.id === selectedForm);
    if (currentForm?.template) {
      const finalContent = applyFormValues(currentForm.template, formValues);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>طباعة النموذج</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  direction: ltr;
                  text-align: left;
                  line-height: 1.6;
                }
                .form-content {
                  white-space: pre-wrap;
                  font-size: 14px;
                  color: #333;
                }
                @media print {
                  body { margin: 0; padding: 15px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="form-content">${finalContent}</div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // دالة لحذف عريضة ديناميكية
  const deleteDynamicForm = async (formId: string) => {
    try {
      const { error } = await supabase
        .from('dynamic_forms')
        .delete()
        .eq('id', formId);

      if (error) {
        console.error('خطأ في حذف العريضة:', error);
        return;
      }

      await fetchDynamicForms();
      
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('خطأ غير متوقع في حذف العريضة:', error);
    }
  };

  // دالة لإضافة متغير جديد
  const addFormVariable = () => {
    const newVariable: FormVariable = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'text',
      required: false
    };
    
    if (editingForm) {
      setEditingForm({
        ...editingForm,
        variables: [...editingForm.variables, newVariable]
      });
    } else {
      setNewForm({
        ...newForm,
        variables: [...(newForm.variables || []), newVariable]
      });
    }
  };

  // دالة لإضافة متغيرات افتراضية للعريضة
  const addDefaultDilekceVariables = () => {
    const defaultVariables: FormVariable[] = [
      {
        id: Date.now().toString(),
        name: 'full_name',
        label: 'الاسم الكامل / Adı Soyadı',
        type: 'text',
        required: true,
        placeholder: 'أدخل الاسم الكامل'
      },
      {
        id: (Date.now() + 1).toString(),
        name: 'id_number',
        label: 'رقم الهوية / Kimlik No',
        type: 'text',
        required: true,
        placeholder: 'أدخل رقم الهوية'
      },
      {
        id: (Date.now() + 2).toString(),
        name: 'phone_number',
        label: 'رقم الهاتف / GSM',
        type: 'phone',
        required: true,
        placeholder: 'أدخل رقم الهاتف'
      },
      {
        id: (Date.now() + 3).toString(),
        name: 'city',
        label: 'المدينة / Şehir',
        type: 'text',
        required: true,
        placeholder: 'أدخل اسم المدينة'
      },
      {
        id: (Date.now() + 4).toString(),
        name: 'nationality',
        label: 'الجنسية / Uyruk',
        type: 'text',
        required: true,
        placeholder: 'أدخل الجنسية'
      },
      {
        id: (Date.now() + 5).toString(),
        name: 'content',
        label: 'محتوى العريضة / Dilekçe İçeriği',
        type: 'textarea',
        required: true,
        placeholder: 'أدخل محتوى العريضة'
      },
      {
        id: (Date.now() + 6).toString(),
        name: 'date',
        label: 'التاريخ / Tarih',
        type: 'date',
        required: true,
        placeholder: 'أدخل التاريخ'
      },
      {
        id: (Date.now() + 7).toString(),
        name: 'signature',
        label: 'التوقيع / İmza',
        type: 'text',
        required: true,
        placeholder: 'أدخل التوقيع'
      }
    ];
    
    if (editingForm) {
      setEditingForm({
        ...editingForm,
        variables: [...editingForm.variables, ...defaultVariables]
      });
    } else {
      setNewForm({
        ...newForm,
        variables: [...(newForm.variables || []), ...defaultVariables]
      });
    }
  };



  // دالة لحذف متغير
  const removeFormVariable = (variableId: string) => {
    if (editingForm) {
      setEditingForm({
        ...editingForm,
        variables: editingForm.variables.filter(v => v.id !== variableId)
      });
    } else {
      setNewForm({
        ...newForm,
        variables: (newForm.variables || []).filter(v => v.id !== variableId)
      });
    }
  };

  // دالة لتحديث متغير
  const updateFormVariable = (variableId: string, updates: Partial<FormVariable>) => {
    if (editingForm) {
      setEditingForm({
        ...editingForm,
        variables: editingForm.variables.map(v => 
          v.id === variableId ? { ...v, ...updates } : v
        )
      });
    } else {
      setNewForm({
        ...newForm,
        variables: (newForm.variables || []).map(v => 
          v.id === variableId ? { ...v, ...updates } : v
        )
      });
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

  // Show loading screen for both loading state and when user is not available
  // This prevents flickering between different loading states
  if (loading || !user || !profile) {
    return (
      <GlassLoadingScreen
        text="جاري تحميل لوحة التحكم..."
        subText={language === 'ar' ? 'يرجى الانتظار، قد يستغرق الأمر بضع ثوانٍ' : 'Please wait, this may take a few seconds'}
        variant="gradient"
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      
      {/* New Message Notification */}
      {newMessageNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2 space-x-reverse">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{newMessageNotification}</span>
          </div>
        </div>
      )}
      
      {/* Enhanced Glass Morphism Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle floating orbs with glass effect */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/10 to-indigo-200/5 backdrop-blur-sm rounded-full animate-pulse border border-white/20" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-bl from-sky-200/8 to-blue-200/4 backdrop-blur-sm rounded-full animate-pulse border border-white/15" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-tr from-indigo-200/6 to-purple-200/3 backdrop-blur-sm rounded-full animate-pulse border border-white/10" style={{ animationDelay: '1s', animationDuration: '12s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-r from-sky-200/5 to-indigo-200/3 backdrop-blur-sm rounded-full animate-pulse border border-white/10" style={{ animationDelay: '3s', animationDuration: '9s' }}></div>
        
        {/* Additional subtle elements */}
        <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-purple-200/4 to-pink-200/2 backdrop-blur-sm rounded-full animate-pulse border border-white/5" style={{ animationDelay: '4s', animationDuration: '11s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-12 h-12 bg-gradient-to-bl from-cyan-200/3 to-blue-200/2 backdrop-blur-sm rounded-full animate-pulse border border-white/5" style={{ animationDelay: '5s', animationDuration: '7s' }}></div>
      </div>
      
      {/* Enhanced Glass Morphism Styles */}
      <style>{`
        /* Enhanced Glass Morphism Effects */
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .glass-card-dark {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .glass-button-dark {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-button-dark:hover {
          background: rgba(15, 23, 42, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        /* Phone number formatting for Arabic */
        .phone-number {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: bidi-override !important;
          font-family: monospace !important;
        }

        /* Flag Gloss Effect */
        .flag-gloss {
          position: relative;
          overflow: hidden;
        }
        
        .flag-gloss::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 40%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 60%,
            transparent 70%
          );
          transform: rotate(45deg);
          transition: all 0.3s ease;
          opacity: 0;
        }
        
        .flag-gloss:hover::before {
          opacity: 1;
          animation: gloss-shine 1.5s ease-in-out;
        }
        
        @keyframes gloss-shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          50% {
            transform: translateX(0%) translateY(0%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        /* Flag Shadow Effect */
        .flag-shadow {
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.1),
            0 4px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Ensure cursor is always on top */
        .cursor-element {
          z-index: 9999 !important;
          position: fixed !important;
        }

        /* Hide custom cursor on touch devices */
        @media (hover: none) and (pointer: coarse) {
          .cursor-element {
            display: none !important;
          }
        }
      `}</style>
      {/* Admin Navbar - Now the topmost element */}
      <AdminNavbar 
        onBack={onBack}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onSignOut={onSignOut}
      />
      
      {/* Admin Top Bar - Now below navbar */}
      

              <div className="relative max-w-7xl mx-auto px-1 sm:px-2 md:px-3 lg:px-4 py-4 md:py-8 z-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center text-sm text-jet-600 dark:text-platinum-400">
          <button
            onClick={() => navigate('/admin')}
            className="hover:text-caribbean-600 dark:hover:text-caribbean-400 transition-colors duration-200"
          >
            لوحة التحكم
          </button>
          {activeTab !== 'requests' && (
            <>
              <span className="mx-2">/</span>
              <span className="text-caribbean-600 dark:text-caribbean-400">
                {activeTab === 'support' && 'رسائل الدعم'}
                {activeTab === 'faqs' && 'الأسئلة الشائعة'}
                {activeTab === 'ready-forms' && 'نماذج جاهزة'}
                {activeTab === 'moderators' && (profile?.role === 'admin' ? 'إدارة المشرفين' : 'الوصول مرفوض')}
                {activeTab === 'chat-messages' && 'المحادثات'}
              </span>
            </>
          )}
          {activeTab === 'ready-forms' && voluntaryReturnView !== 'list' && (
            <>
              <span className="mx-2">/</span>
              <span className="text-caribbean-600 dark:text-caribbean-400">
                {voluntaryReturnView === 'create' && 'إنشاء نموذج جديد'}
                {voluntaryReturnView === 'chart' && 'الإحصائيات'}
              </span>
            </>
          )}
        </div>

        {/* Enhanced Glass Morphism Tabs */}
        <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl mb-8 overflow-hidden border border-white/20 dark:border-white/10`}>
          <div className="flex border-b border-white/20 dark:border-white/10 overflow-x-auto bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5">
            <button
              onClick={() => navigateToTab('requests')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'requests'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">طلبات ({requests.length})</span>
              </div>
            </button>
            <button
              onClick={() => navigateToTab('support')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'support'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <Mail className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">دعم ({supportMessages.length})</span>
              </div>
            </button>
            <button
              onClick={() => navigateToTab('faqs')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'faqs'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">أسئلة ({faqs.length})</span>
              </div>
            </button>
            <button
              onClick={() => navigateToTab('ready-forms')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'ready-forms'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <Globe className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">نماذج جاهزة</span>
              </div>
            </button>
            <button
              onClick={() => navigateToTab('moderators')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'moderators'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <Shield className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">المشرفين</span>
              </div>
            </button>
            <button
              onClick={() => navigateToTab('chat-messages')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'chat-messages'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">المحادثات</span>
              </div>
            </button>

            <button
              onClick={() => navigateToTab('health-insurance')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'health-insurance'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <Heart className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">التأمين الصحي</span>
              </div>
            </button>
            <button
              onClick={() => navigateToTab('webhooks')}
              className={`px-4 md:px-6 py-4 md:py-5 font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${
                activeTab === 'webhooks'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-white/10 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3" />
                <span className="text-sm md:text-base font-medium">الـ Webhooks</span>
              </div>
            </button>
          </div>
        </div>

        {/* Service Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة طلبات الخدمات</h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => fetchServiceRequests()}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>
            </div>

            {/* Standardized Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <button
                onClick={() => setRequestFilter('all')}
                className={`group ${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden ${
                  requestFilter === 'all'
                    ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/50 shadow-blue-500/20'
                    : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    requestFilter === 'all'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:animate-pulse'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{requests.length}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRequestFilter('pending')}
                className={`group ${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden ${
                  requestFilter === 'pending'
                    ? 'ring-2 ring-amber-500/50 dark:ring-amber-400/50 shadow-amber-500/20'
                    : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    requestFilter === 'pending'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg group-hover:animate-pulse'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400'
                  }`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {requests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRequestFilter('in_progress')}
                className={`group ${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden ${
                  requestFilter === 'in_progress'
                    ? 'ring-2 ring-purple-500/50 dark:ring-purple-400/50 shadow-purple-500/20'
                    : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    requestFilter === 'in_progress'
                      ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg group-hover:animate-pulse'
                      : 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">قيد التنفيذ</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {requests.filter(r => r.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRequestFilter('completed')}
                className={`group ${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden ${
                  requestFilter === 'completed'
                    ? 'ring-2 ring-emerald-500/50 dark:ring-emerald-400/50 shadow-emerald-500/20'
                    : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    requestFilter === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:animate-pulse'
                      : 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">مكتملة</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {requests.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Active Filter Indicator */}
            {requestFilter !== 'all' && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-4 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg mr-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">عرض الطلبات:</p>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {requestFilter === 'pending' ? 'قيد الانتظار' : 
                         requestFilter === 'in_progress' ? 'قيد التنفيذ' : 
                         requestFilter === 'completed' ? 'مكتملة' : 'جميع الطلبات'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRequestFilter('all')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    عرض الكل
                  </button>
                </div>
              </div>
            )}

            {/* Standardized Filters */}
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  />
                </div>

                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغية</option>
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

                                      {/* Requests List */}
            <div className="space-y-4 md:space-y-6">
              {filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-jet-800 rounded-xl shadow-sm border border-platinum-200 dark:border-jet-700 p-12 text-center">
                  <FileText className="w-16 h-16 text-jet-400 dark:text-platinum-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-jet-800 dark:text-white mb-2">لا توجد طلبات</h3>
                  <p className="text-jet-600 dark:text-platinum-400">لا توجد طلبات تطابق معايير البحث</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className={`group ${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden`}>
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white ml-4">
                            {request.title}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="mr-2">{getStatusArabic(request.status)}</span>
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-3 font-medium">
                          <strong>نوع الخدمة:</strong> {getServiceTypeArabic(request.service_type)}
                        </p>
                        {request.description && (
                          <p className="text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">
                            {request.description}
                          </p>
                        )}
                        
                        {/* Enhanced File Display */}
                        {request.file_url && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200/30 dark:border-blue-700/20 backdrop-blur-sm">
                            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-medium">
                              <strong>الملف المرفق:</strong> {request.file_name || 'ملف مرفق'}
                              {request.file_url.startsWith('base64://') && (
                                <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                                  (محفوظ في قاعدة البيانات)
                                </span>
                              )}
                            </p>
                            <div className="flex space-x-3 space-x-reverse">
                              <button
                                onClick={() => handleFileView(request.file_url!, request.file_name || 'file', request.id)}
                                className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform font-semibold"
                              >
                                <Eye className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                                <span>عرض</span>
                              </button>
                              <button
                                onClick={() => handleFileDownload(request.file_url!, request.file_name || 'file', request.id)}
                                className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform font-semibold"
                              >
                                <Download className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                                <span>تحميل</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-500 dark:text-slate-400 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 ml-2" />
                            <span>{formatDisplayDate(request.created_at)}</span>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20 ${getPriorityColor(request.priority)}`}>
                            {getPriorityArabic(request.priority)}
                          </span>
                        </div>
                        
                        {/* Enhanced Contact Info */}
                        <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-800/30 dark:to-blue-900/10 p-4 rounded-xl border border-slate-200/30 dark:border-slate-700/20 backdrop-blur-sm mb-4">
                          <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center">
                            <User className="w-4 h-4 ml-2" />
                            معلومات التواصل
                          </h4>
                          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                            <p><strong>الاسم:</strong> {request.contact_name}</p>
                            <p><strong>البريد الإلكتروني:</strong> {request.contact_email}</p>
                            {request.contact_phone && (
                              <div className="flex items-center">
                                <span className="text-slate-600 dark:text-slate-300">
                                  <strong>رقم الجوال:</strong> <span className="font-mono text-left font-bold" dir="ltr">{request.contact_country_code} {request.contact_phone}</span>
                                </span>
                                <a
                                  href={`https://wa.me/${formatPhoneForWhatsApp(request.contact_country_code + request.contact_phone)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-300 cursor-pointer ml-2"
                                  title="فتح الواتساب"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                  </svg>
                                </a>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 ml-2" />
                              <a 
                                href={`mailto:${request.contact_email}?subject=بخصوص طلبك: ${request.title}`}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-300"
                              >
                                إرسال بريد إلكتروني
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {request.admin_notes && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-200/30 dark:border-emerald-700/20 backdrop-blur-sm">
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                              <strong>ملاحظات الإدارة:</strong> {request.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          onClick={() => handleEdit(request)}
                          className="p-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title="تعديل الطلب"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(request.id, `طلب ${request.service_type}`, 'request')}
                          className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Support Messages Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة رسائل الدعم</h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => fetchSupportMessages()}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>
            </div>

            {/* Standardized Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">إجمالي الرسائل</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{supportMessages.length}</p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {supportMessages.filter(m => m.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">قيد المعالجة</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {supportMessages.filter(m => m.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">محلولة</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {supportMessages.filter(m => m.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Standardized Filters */}
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="البحث في رسائل الدعم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  />
                </div>

                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="in_progress">قيد المعالجة</option>
                    <option value="resolved">محلولة</option>
                    <option value="closed">مغلقة</option>
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Support Messages List */}
            <div className="space-y-6">
              {filteredSupportMessages.length === 0 ? (
                <div className="bg-white dark:bg-jet-800 rounded-xl shadow-sm border border-platinum-200 dark:border-jet-700 p-12 text-center">
                  <Mail className="w-16 h-16 text-jet-400 dark:text-platinum-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-jet-800 dark:text-white mb-2">لا توجد رسائل</h3>
                  <p className="text-jet-600 dark:text-platinum-400">لا توجد رسائل دعم تطابق معايير البحث</p>
                </div>
              ) : (
                filteredSupportMessages.map((message) => (
                  <div key={message.id} className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden`}>
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white ml-4">
                            {message.subject}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 ${getStatusColor(message.status)}`}>
                            {getStatusIcon(message.status)}
                            <span className="mr-2">{getStatusArabic(message.status)}</span>
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-slate-600 dark:text-slate-300 mb-3 font-medium">
                            <strong>من:</strong> {message.name} ({message.email})
                          </p>
                          <p className="text-slate-700 dark:text-slate-200 bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-800/30 dark:to-blue-900/10 p-4 rounded-xl border border-slate-200/30 dark:border-slate-700/20 backdrop-blur-sm leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-500 dark:text-slate-400 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 ml-2" />
                            <span>{formatDisplayDate(message.created_at)}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 ml-2" />
                            <a 
                              href={`mailto:${message.email}?subject=رد على: ${message.subject}`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-300"
                            >
                              رد بالبريد الإلكتروني
                            </a>
                          </div>
                        </div>
                        
                        {message.admin_reply && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-200/30 dark:border-emerald-700/20 backdrop-blur-sm">
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                              <strong>رد الإدارة:</strong> {message.admin_reply}
                            </p>
                            {message.admin_reply_date && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                                تاريخ الرد: {formatDisplayDate(message.admin_reply_date)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          onClick={() => handleEditSupport(message)}
                          className="p-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title="الرد على الرسالة"
                        >
                          <Reply className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(message.id, `رسالة من ${message.name}`, 'message')}
                          className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Messages Tab */}
        {activeTab === 'chat-messages' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المحادثات</h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => fetchChatSessions()}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث المحادثات
                </button>
              </div>
            </div>

            {/* Standardized Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">إجمالي الجلسات</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{filteredChatSessions.length}</p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">رسائل العملاء</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {chatMessages.filter(m => m.sender === 'user').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-600 dark:text-purple-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">ردود البوت</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {chatMessages.filter(m => m.sender === 'bot').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-right relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">ردود المدير</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {chatMessages.filter(m => m.sender === 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Search and Filters - Responsive */}
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-4 md:p-6 rounded-2xl shadow-xl mb-4 md:mb-6 border border-white/20 dark:border-white/10`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="relative group">
                  <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 md:w-5 h-4 md:h-5 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="البحث في المحادثات..."
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 md:w-5 h-4 md:h-5" />
                  <select
                    value={chatDateFilter}
                    onChange={(e) => setChatDateFilter(e.target.value as any)}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                  >
                    <option value="all">جميع التواريخ</option>
                    <option value="today">اليوم</option>
                    <option value="week">آخر أسبوع</option>
                    <option value="month">آخر شهر</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Sessions and Messages Layout - Full Height Responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-8 lg:grid-cols-7 md:grid-cols-1 gap-4 h-[calc(100vh-300px)] min-h-[600px]">
              {/* Chat Sessions List */}
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col xl:col-span-2 lg:col-span-2 md:col-span-1`}>
                <div className="p-4 md:p-6 border-b border-white/20 dark:border-white/10 flex-shrink-0">
                  <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">جلسات المحادثات</h3>
                  {chatLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredChatSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-8 md:w-12 h-8 md:h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">لا توجد محادثات</p>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
                      {filteredChatSessions.map((session) => (
                        <div
                          key={session.session_id}
                          className={`w-full p-3 md:p-4 rounded-xl text-right transition-all duration-300 hover:shadow-lg cursor-pointer ${
                            selectedChatSession === session.session_id
                              ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600'
                              : 'bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(session.created_at).toLocaleDateString('ar-SA')}
                            </span>
                            <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse">
                              {claimedSessions.has(session.session_id) && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  مستلمة
                                </span>
                              )}
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                                {session.message_count} رسالة
                              </span>
                              {session.session_id === selectedChatSession && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full animate-pulse">
                                  🔴 متصل
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
                                    deleteChatSession(session.session_id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="حذف الجلسة"
                              >
                                <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => handleChatSessionSelect(session.session_id)}
                            className={`w-full text-right transition-all duration-200 ${
                              chatLoading && clickedSessionId === session.session_id
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer'
                            }`}
                            disabled={chatLoading && clickedSessionId === session.session_id}
                          >
                            <p className="text-xs md:text-sm font-medium text-slate-800 dark:text-white truncate">
                              {session.last_message?.content?.substring(0, 40)}...
                            </p>
                            {chatLoading && selectedChatSession === session.session_id && (
                              <div className="flex items-center justify-center mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-xs text-blue-600 mr-2">جاري التحميل...</span>
                              </div>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages - Full Height */}
              <div className="xl:col-span-6 lg:col-span-5 md:col-span-1">
                <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 h-full flex flex-col`}>
                  <div className="p-4 md:p-6 border-b border-white/20 dark:border-white/10 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
                        المحادثة
                        {selectedChatSession && (
                          <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mr-2">
                            (جلسة: {selectedChatSession.substring(0, 8)}...)
                          </span>
                        )}
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full ml-2 animate-pulse">
                          🔴 متصل مباشر
                        </span>
                      </h3>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <select
                          value={chatFilter}
                          onChange={(e) => setChatFilter(e.target.value as any)}
                          className="px-2 md:px-3 py-1 text-xs md:text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white"
                        >
                          <option value="all">جميع الرسائل</option>
                          <option value="user">رسائل العميل</option>
                          <option value="bot">ردود البوت</option>
                          <option value="admin">ردود المدير</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area - Full Height */}
                  <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3 max-h-[500px] scrollbar-thin">
                    {selectedChatSession ? (
                      filteredChatMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-600 dark:text-slate-400">لا توجد رسائل تطابق الفلتر المحدد</p>
                        </div>
                      ) : (
                        <>
                          {filteredChatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${
                                  message.sender === 'user'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-slate-800 dark:text-white'
                                    : message.sender === 'admin'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-slate-800 dark:text-white'
                                    : 'bg-gray-100 dark:bg-gray-900/30 text-slate-800 dark:text-white'
                                }`}
                              >
                                <div className="flex items-center mb-2">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {message.sender === 'user' ? 'العميل' : message.sender === 'admin' ? 'المدير' : 'البوت'}
                                  </span>
                                  <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
                                    {new Date(message.created_at).toLocaleTimeString('ar-SA')}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ))}
                          {/* Auto scroll target - Disabled to prevent auto scrolling */}
                          {/* <div ref={chatMessagesEndRef} /> */}
                        </>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-slate-400">اختر جلسة محادثة لعرض الرسائل</p>
                      </div>
                    )}
                  </div>

                  {/* Reply Input - Responsive */}
                  {selectedChatSession && (
                    <div className="p-3 md:p-4 border-t border-white/20 dark:border-white/10 flex-shrink-0">
                      {/* Claim Chat Button */}
                      {!claimedSessions.has(selectedChatSession) && (
                        <div className="mb-3">
                          <button
                            onClick={() => claimChatSession(selectedChatSession)}
                            className="w-full px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Shield className="w-4 md:w-5 h-4 md:h-5" />
                            <span className="text-sm md:text-base font-semibold">استلام المحادثة</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Claimed Status */}
                      {claimedSessions.has(selectedChatSession) && (
                        <div className="mb-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-xl">
                          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold">تم استلام المحادثة - البوت متوقف</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={chatReplyText}
                          onChange={(e) => setChatReplyText(e.target.value)}
                          placeholder="اكتب ردك هنا..."
                          className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && chatReplyText.trim()) {
                              sendChatReply(selectedChatSession, chatReplyText.trim());
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (chatReplyText.trim()) {
                              sendChatReply(selectedChatSession, chatReplyText.trim());
                            }
                          }}
                          disabled={!chatReplyText.trim()}
                          className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                        >
                          <Send className="w-4 md:w-5 h-4 md:h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الأسئلة المتكررة</h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => fetchFAQs()}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </button>
                <button
                  onClick={() => setShowAddFaq(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة سؤال جديد
                </button>
              </div>
            </div>

            {/* Standardized Search */}
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="البحث في الأسئلة المتكررة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                />
              </div>
            </div>

            {/* FAQs List */}
            <div className="space-y-6">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white dark:bg-jet-800 rounded-xl shadow-sm border border-platinum-200 dark:border-jet-700 p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-jet-400 dark:text-platinum-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-jet-800 dark:text-white mb-2">لا توجد أسئلة</h3>
                  <p className="text-jet-600 dark:text-platinum-400">لا توجد أسئلة متكررة تطابق معايير البحث</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden`}>
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white ml-4">
                            {faq.question}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 ${
                            faq.is_active 
                              ? 'text-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'text-red-600 bg-red-100/80 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {faq.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                          <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full mr-3 font-medium backdrop-blur-sm border border-white/20">
                            {faq.category}
                          </span>
                        </div>
                        
                        <p className="text-slate-700 dark:text-slate-200 mb-4 bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-800/30 dark:to-blue-900/10 p-4 rounded-xl border border-slate-200/30 dark:border-slate-700/20 backdrop-blur-sm leading-relaxed">
                          {faq.answer}
                        </p>
                        
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 ml-2" />
                            <span>{formatDisplayDate(faq.created_at)}</span>
                          </div>
                          <span className="bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1 rounded-full text-xs font-medium">ترتيب: {faq.order_index}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          onClick={() => handleEditFaq(faq)}
                          className="p-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title="تعديل السؤال"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(faq.id, faq.question, 'faq')}
                          className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Ready Forms Tab */}
        {activeTab === 'ready-forms' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
                              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة نماذج العرائض</h2>
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => fetchDynamicForms()}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث العريضات
                </button>
              </div>
            </div>

            {/* Form Type Selection - Dropdown */}
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 relative z-10`}>
              <div className="p-4">
                <div className="relative">
                <button
                    onClick={() => setShowFormDropdown(!showFormDropdown)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl text-right hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${showFormDropdown ? 'ring-2 ring-blue-500/50 shadow-lg' : ''}`}
                >
                  <div className="flex items-center">
                      <FileText className="w-5 h-5 ml-3" />
                                             <span className="font-medium text-slate-800 dark:text-white">
                         {selectedForm === 'voluntary-return' ? 'نموذج عودة طوعية' : 
                          selectedForm === 'new-form' ? 'إنشاء عريضة جديدة' :
                          dynamicForms.find(f => f.id === selectedForm)?.name || 'اختر العريضة'}
                       </span>
                  </div>
                    <ChevronDown className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${showFormDropdown ? 'rotate-180' : ''}`} />
                </button>
                  
                  {showFormDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto transform transition-all duration-200 ease-out animate-in slide-in-from-top-2 ring-1 ring-black/5 dark:ring-white/10">
                      <div className="p-2">
                <button
                  onClick={() => {
                            setSelectedForm('voluntary-return');
                            setShowFormDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-right hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <FileText className="w-5 h-5 ml-3 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-slate-800 dark:text-white">نموذج عودة طوعية</span>
                        </button>
                        

                        
                        <button
                          onClick={() => {
                            setSelectedForm('new-form');
                            setShowFormDropdown(false);
                            setEditingForm(null);
                            setNewForm({
                              name: '',
                              description: '',
                              variables: [],
                              template: '',
                              is_active: true
                            });
                          }}
                          className="w-full flex items-center px-4 py-3 text-right hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Plus className="w-5 h-5 ml-3 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-slate-800 dark:text-white">إنشاء عريضة جديدة</span>
                        </button>
                        
                                                 
                         {dynamicForms.length > 0 && (
                           <>
                             <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                             <div className="px-2 py-1">
                               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">النماذج المحفوظة:</p>
                             </div>
                           </>
                         )}
                         
                         {dynamicForms.map((form) => (
                          <button
                            key={form.id}
                            onClick={() => {
                              setSelectedForm(form.id);
                              setShowFormDropdown(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center">
                              <FileText className="w-5 h-5 ml-3 text-slate-600 dark:text-slate-400" />
                              <div className="text-right">
                                <span className="font-medium text-slate-800 dark:text-white block">{form.name}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{form.description}</span>
                  </div>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {form.is_active && (
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingForm(form);
                                  setSelectedForm('edit-form');
                                  setShowFormDropdown(false);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                                                   if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
                                   deleteDynamicForm(form.id);
                                 }
                                }}
                                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                </button>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Voluntary Return Form Content */}
            {selectedForm === 'voluntary-return' && (
              <>
                {/* Voluntary Return Navigation Tabs */}
                <div className="bg-white dark:bg-jet-800 rounded-xl shadow-sm border border-platinum-200 dark:border-jet-700 mb-8">
                  <div className="flex border-b border-platinum-200 dark:border-jet-700 overflow-x-auto">
                    <button
                      onClick={() => navigateToVoluntaryReturnView('list')}
                      className={`px-3 md:px-6 py-3 md:py-4 font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                        voluntaryReturnView === 'list'
                          ? 'text-caribbean-600 dark:text-caribbean-400 border-b-2 border-caribbean-600 dark:border-caribbean-400'
                          : 'text-jet-600 dark:text-platinum-400 hover:text-caribbean-600 dark:hover:text-caribbean-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                        <span className="text-sm md:text-base">قائمة النماذج المنشأة</span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateToVoluntaryReturnView('create')}
                      className={`px-3 md:px-6 py-3 md:py-4 font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                        voluntaryReturnView === 'create'
                          ? 'text-caribbean-600 dark:text-caribbean-400 border-b-2 border-caribbean-600 dark:border-caribbean-400'
                          : 'text-jet-600 dark:text-platinum-400 hover:text-caribbean-600 dark:hover:text-caribbean-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <Plus className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                        <span className="text-sm md:text-base">إنشاء نموذج عريضة جديد</span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateToVoluntaryReturnView('chart')}
                      className={`px-3 md:px-6 py-3 md:py-4 font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                        voluntaryReturnView === 'chart'
                          ? 'text-caribbean-600 dark:text-caribbean-400 border-b-2 border-caribbean-600 dark:border-caribbean-400'
                          : 'text-jet-600 dark:text-platinum-400 hover:text-caribbean-600 dark:hover:text-caribbean-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                        <span className="text-sm md:text-base">الإحصائيات</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Voluntary Return Content */}
                <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 dark:border-white/20">
                  {voluntaryReturnView === 'list' ? (
                    <VoluntaryReturnFormsList isDarkMode={isDarkMode} />
                  ) : voluntaryReturnView === 'create' ? (
                    <VoluntaryReturnForm isDarkMode={isDarkMode} />
                  ) : (
                    <VoluntaryReturnChart isDarkMode={isDarkMode} />
                  )}
                </div>
              </>
            )}

            {/* Dynamic Form Editor */}
            {(selectedForm === 'new-form' || selectedForm === 'edit-form') && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {selectedForm === 'new-form' ? 'إنشاء عريضة جديدة' : 'تعديل العريضة'}
                  </h3>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                      onClick={() => {
                        setSelectedForm('voluntary-return');
                        setEditingForm(null);
                        setNewForm({
                          name: '',
                          description: '',
                          variables: [],
                          template: '',
                          is_active: true
                        });
                      }}
                      className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 ml-2" />
                      رجوع
                    </button>
                      </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Form Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        اسم النموذج *
                      </label>
                      <input
                        type="text"
                        value={editingForm?.name || newForm.name || ''}
                        onChange={(e) => {
                          if (editingForm) {
                            setEditingForm({ ...editingForm, name: e.target.value });
                          } else {
                            setNewForm({ ...newForm, name: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white"
                        placeholder="أدخل اسم النموذج"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        وصف النموذج
                      </label>
                      <input
                        type="text"
                        value={editingForm?.description || newForm.description || ''}
                        onChange={(e) => {
                          if (editingForm) {
                            setEditingForm({ ...editingForm, description: e.target.value });
                          } else {
                            setNewForm({ ...newForm, description: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white"
                        placeholder="أدخل وصف النموذج"
                      />
                    </div>
                  </div>

                  {/* Form Variables */}
                  <div>
                                         <div className="flex items-center justify-between mb-4">
                       <h4 className="text-lg font-semibold text-slate-800 dark:text-white">متغيرات العريضة التركية</h4>
                       <div className="flex items-center space-x-2 space-x-reverse">
                         <button
                           onClick={addDefaultDilekceVariables}
                           className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                         >
                           <Plus className="w-3 h-3 ml-1" />
                           متغيرات افتراضية
                    </button>
                    <button
                           onClick={addFormVariable}
                           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                         >
                           <Plus className="w-4 h-4 ml-2" />
                           إضافة متغير
                         </button>
                      </div>
                     </div>

                    <div className="space-y-4">
                      {(editingForm?.variables || newForm.variables || []).map((variable, index) => (
                        <div key={variable.id} className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-4 rounded-xl border border-white/20 dark:border-white/10`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                اسم المتغير *
                              </label>
                              <input
                                type="text"
                                value={variable.name}
                                onChange={(e) => updateFormVariable(variable.id, { name: e.target.value })}
                                className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-sm"
                                placeholder="اسم_المتغير"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                التسمية *
                              </label>
                              <input
                                type="text"
                                value={variable.label}
                                onChange={(e) => updateFormVariable(variable.id, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-sm"
                                placeholder="اسم المتغير"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                نوع الحقل
                              </label>
                              <select
                                value={variable.type}
                                onChange={(e) => updateFormVariable(variable.id, { type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-sm"
                              >
                                <option value="text">نص</option>
                                <option value="email">بريد إلكتروني</option>
                                <option value="phone">رقم هاتف</option>
                                <option value="date">تاريخ</option>
                                <option value="number">رقم</option>
                                <option value="textarea">نص طويل</option>
                                <option value="select">قائمة منسدلة</option>
                                <option value="checkbox">خانة اختيار</option>
                              </select>
                            </div>
                            <div className="flex items-end space-x-2 space-x-reverse">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={variable.required}
                                  onChange={(e) => updateFormVariable(variable.id, { required: e.target.checked })}
                                  className="ml-2 w-4 h-4 text-blue-600 bg-white border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">مطلوب</span>
                              </label>
                    <button
                                onClick={() => removeFormVariable(variable.id)}
                                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="حذف المتغير"
                              >
                                <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                          {/* Additional options for select type */}
                          {variable.type === 'select' && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                خيارات القائمة (مفصولة بفواصل)
                              </label>
                              <input
                                type="text"
                                value={variable.options?.join(', ') || ''}
                                onChange={(e) => updateFormVariable(variable.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-sm"
                                placeholder="الخيار الأول، الخيار الثاني، الخيار الثالث"
                              />
                            </div>
                          )}

                          {/* Placeholder for text inputs */}
                          {(variable.type === 'text' || variable.type === 'email' || variable.type === 'phone' || variable.type === 'number') && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                النص التوضيحي
                              </label>
                              <input
                                type="text"
                                value={variable.placeholder || ''}
                                onChange={(e) => updateFormVariable(variable.id, { placeholder: e.target.value })}
                                className="w-full px-3 py-2 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-sm"
                                placeholder="أدخل النص التوضيحي"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                                     {/* Form Template - Text Editor */}
                   <div>
                     <div className="flex items-center justify-between mb-4">
                       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                         محتوى النموذج - محاذي من اليسار لليمين
                       </label>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                           <button
                             type="button"
                             onClick={() => {
                               const template = `İL GÖÇ İDARESİ MÜDÜRLÜĞÜNE
${'{city}'}		${'{date}'}

	

Ben, ${'{nationality}'} uyrukluyum , Adım ${'{full_name}'} ,${'{id_number}'}  numaralı Geçici Koruma Kimlik Belgesi sahibiyim.
${'{content}'}

GSM : ${'{phone_number}'}  
Saygılarımla,
Adı Soyadı: ${'{full_name}'}
Kimlik No: ${'{id_number}'}  
İmza: ${'{signature}'}`;
                               
                               if (editingForm) {
                                 setEditingForm({ ...editingForm, template });
                               } else {
                                 setNewForm({ ...newForm, template });
                               }
                               

                             }}
                             className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                           >
                             قالب نموذج جاهز
                           </button>
                         </div>
                     </div>
                     
                     {/* Variable Insertion Panel - Above Text Editor */}
                     <div className="mb-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-white/30 dark:border-white/10 p-4 shadow-lg">
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">إدراج متغيرات النموذج (انقر لإدراج في المحرر):</p>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {[
                           { key: '{full_name}', label: 'الاسم الكامل', icon: '👤' },
                           { key: '{id_number}', label: 'رقم الهوية', icon: '🆔' },
                           { key: '{phone_number}', label: 'رقم الهاتف', icon: '📞' },
                           { key: '{city}', label: 'المدينة', icon: '🏙️' },
                           { key: '{nationality}', label: 'الجنسية', icon: '🌍' },
                           { key: '{content}', label: 'المحتوى', icon: '📝' },
                           { key: '{date}', label: 'التاريخ', icon: '📅' },
                           { key: '{signature}', label: 'التوقيع', icon: '✍️' }
                         ].map((variable) => (
                           <button
                             key={variable.key}
                             type="button"
                             onClick={() => {
                               // إدراج المتغير في TinyMCE Editor
                               const editor = (window as any).tinymce?.get('tinymce-editor');
                               if (editor) {
                                 editor.insertContent(variable.key);
                               } else {
                                 // fallback: إضافة في نهاية النص
                                 const currentContent = editingForm?.template || newForm.template || '';
                                 const newContent = currentContent + variable.key;
                                 
                                 if (editingForm) {
                                   setEditingForm({ ...editingForm, template: newContent });
                                 } else {
                                   setNewForm({ ...newForm, template: newContent });
                                 }
                               }
                             }}
                             className="flex items-center justify-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium cursor-pointer"
                             title={`انقر لإدراج ${variable.label}`}
                           >
                             <span className="ml-1">{variable.icon}</span>
                             <span>{variable.label}</span>
                           </button>
                         ))}
                       </div>
                     </div>


                     
                                          <TinyMCEEditor
                       content={editingForm?.template || newForm.template || ''}
                       onChange={(content: string) => {
                         if (editingForm) {
                           setEditingForm({ ...editingForm, template: content });
                         } else {
                           setNewForm({ ...newForm, template: content });
                         }
                       }}
                       placeholder={`İL GÖÇ İDARESİ MÜDÜRLÜĞÜNE
{city}		{date}

	

Ben, {nationality} uyrukluyum , Adım {full_name} ,{id_number}  numaralı Geçici Koruma Kimlik Belgesi sahibiyim.
{content}

GSM : {phone_number}  
Saygılarımla,
Adı Soyadı: {full_name}
Kimlik No: {id_number}  
İmza: {signature}`}
                       isDarkMode={isDarkMode}
                     />


                     
                     <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-700/20">
                       <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">💡 نصائح لكتابة النموذج:</p>
                       <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                         <li>استخدم المتغيرات بين قوسين مثل {`{full_name}`} لإدراج البيانات</li>
                         <li>اكتب النموذج بأسلوب رسمي ومحترم</li>
                         <li>اذكر جميع المعلومات المطلوبة بوضوح ودقة</li>
                         <li>تأكد من صحة جميع البيانات المدخلة</li>
                         <li>النص محاذي من اليسار لليمين</li>
                         <li>💡 <strong>نصيحة:</strong> استخدم المحرر المتقدم للحصول على ميزات تحرير متقدمة</li>
                       </ul>
                     </div>
                   </div>

                  {/* Form Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingForm?.is_active !== false && newForm.is_active !== false}
                        onChange={(e) => {
                          if (editingForm) {
                            setEditingForm({ ...editingForm, is_active: e.target.checked });
                          } else {
                            setNewForm({ ...newForm, is_active: e.target.checked });
                          }
                        }}
                        className="ml-2 w-4 h-4 text-blue-600 bg-white border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">النموذج نشط</span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-3 space-x-reverse">
                    <button
                      onClick={async () => {
                        // حفظ العريضة مباشرة
                        saveDynamicForm(editingForm || newForm);
                      }}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {selectedForm === 'new-form' ? 'إنشاء النموذج' : 'حفظ التغييرات'}
                    </button>

                   </div>
                </div>
              </div>
            )}

            {/* Dynamic Form Display */}
            {selectedForm !== 'voluntary-return' && selectedForm !== 'new-form' && selectedForm !== 'edit-form' && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-6`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 space-x-reverse mb-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {dynamicForms.find(f => f.id === selectedForm)?.name}
                      </h3>
                      {dynamicForms.find(f => f.id === selectedForm)?.is_active && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1"></span>
                          نشط
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {dynamicForms.find(f => f.id === selectedForm)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Printer className="w-4 h-4 ml-2" />
                      طباعة
                    </button>
                    <button
                      onClick={() => {
                        setEditingForm(dynamicForms.find(f => f.id === selectedForm) || null);
                        setSelectedForm('edit-form');
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </button>
                  </div>
                </div>

                {/* Form Content with Variables Input */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Variables Input Section */}
                  {(dynamicForms.find(f => f.id === selectedForm)?.variables || []).length > 0 && (
                    <div className="lg:col-span-1">
                      <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-white/30 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-white">إدخال المتغيرات</h4>
                          <button
                            onClick={() => setFormValues({})}
                            className="flex items-center px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs"
                          >
                            <RefreshCw className="w-3 h-3 ml-1" />
                            مسح
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(dynamicForms.find(f => f.id === selectedForm)?.variables || []).map((variable) => (
                            <div key={variable.id} className="space-y-1">
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                {variable.label}
                                {variable.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              {variable.type === 'select' ? (
                                <select
                                  value={formValues[variable.name] || ''}
                                  onChange={(e) => setFormValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                                  className="w-full px-2 py-1 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-xs"
                                >
                                  <option value="">{variable.placeholder || 'اختر...'}</option>
                                  {variable.options?.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : variable.type === 'textarea' ? (
                                <textarea
                                  value={formValues[variable.name] || ''}
                                  onChange={(e) => setFormValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                                  placeholder={variable.placeholder}
                                  rows={2}
                                  className="w-full px-2 py-1 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-xs resize-none"
                                />
                              ) : variable.type === 'checkbox' ? (
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formValues[variable.name] === 'true'}
                                    onChange={(e) => setFormValues(prev => ({ ...prev, [variable.name]: e.target.checked ? 'true' : 'false' }))}
                                    className="ml-1 w-3 h-3 text-blue-600 bg-white border-white/30 rounded focus:ring-blue-500 focus:ring-1"
                                  />
                                  <span className="text-xs text-slate-700 dark:text-slate-300">{variable.placeholder || 'نعم'}</span>
                                </label>
                              ) : (
                                <input
                                  type={variable.type === 'email' ? 'email' : variable.type === 'phone' ? 'tel' : variable.type === 'date' ? 'date' : variable.type === 'number' ? 'number' : 'text'}
                                  value={formValues[variable.name] || ''}
                                  onChange={(e) => setFormValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                                  placeholder={variable.placeholder}
                                  className="w-full px-2 py-1 border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white text-xs"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Preview Section */}
                  <div className={`${(dynamicForms.find(f => f.id === selectedForm)?.variables || []).length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white">معاينة النموذج</h4>
                                               <div className="flex items-center space-x-2 space-x-reverse">
                         <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                           🖊️ انقر على المتغيرات للتعديل
                         </span>
                         <span className="text-xs text-slate-500 dark:text-slate-400">محاذي من اليسار لليمين</span>
                         <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                       </div>
                       {/* Debug Info */}
                       <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/30">
                         <p className="text-xs text-yellow-800 dark:text-yellow-200">
                           <strong>معلومات التصحيح:</strong><br/>
                           المتغيرات في النموذج: {(() => {
                             const currentForm = dynamicForms.find(f => f.id === selectedForm);
                             return currentForm?.variables?.length || 0;
                           })()} متغير<br/>
                           القالب يحتوي متغيرات: {(() => {
                             const currentForm = dynamicForms.find(f => f.id === selectedForm);
                             const hasVariables = currentForm?.template?.includes('{') || false;
                             return hasVariables ? 'نعم' : 'لا';
                           })()}
                         </p>
                         {(() => {
                           const currentForm = dynamicForms.find(f => f.id === selectedForm);
                           const hasVariables = currentForm?.template?.includes('{') || false;
                           const hasFormVariables = (currentForm?.variables?.length || 0) > 0;
                           
                           if (!hasVariables || !hasFormVariables) {
                             return (
                               <div className="mt-2 space-y-2">
                                 {!hasVariables && (
                                   <button
                                     onClick={() => {
                                       const currentForm = dynamicForms.find(f => f.id === selectedForm);
                                       if (currentForm) {
                                         const updatedTemplate = `İL GÖÇ İDARESİ MÜDÜRLÜĞÜNE
{city}		{date}

Ben, {nationality} uyrukluyum , Adım {full_name} ,{id_number}  numaralı Geçici Koruma Kimlik Belgesi sahibiyim.
{content}

GSM : {phone_number}  
Saygılarımla,
Adı Soyadı: {full_name}
Kimlik No: {id_number}  
İmza: {signature}`;
                                         
                                         setEditingForm({ ...currentForm, template: updatedTemplate });
                                         setSelectedForm('edit-form');
                                       }
                                     }}
                                     className="w-full px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                                   >
                                     إضافة متغيرات للقالب
                                   </button>
                                 )}
                                 {!hasFormVariables && (
                                   <button
                                     onClick={() => {
                                       const currentForm = dynamicForms.find(f => f.id === selectedForm);
                                       if (currentForm) {
                                         const defaultVariables: FormVariable[] = [
                                           { id: '1', name: 'full_name', label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل الاسم الكامل' },
                                           { id: '2', name: 'id_number', label: 'رقم الهوية', type: 'text', required: true, placeholder: 'أدخل رقم الهوية' },
                                           { id: '3', name: 'phone_number', label: 'رقم الهاتف', type: 'phone', required: true, placeholder: 'أدخل رقم الهاتف' },
                                           { id: '4', name: 'city', label: 'المدينة', type: 'text', required: true, placeholder: 'أدخل المدينة' },
                                           { id: '5', name: 'nationality', label: 'الجنسية', type: 'text', required: true, placeholder: 'أدخل الجنسية' },
                                           { id: '6', name: 'content', label: 'المحتوى', type: 'textarea', required: true, placeholder: 'أدخل محتوى العريضة' },
                                           { id: '7', name: 'date', label: 'التاريخ', type: 'date', required: false, placeholder: 'أدخل التاريخ' },
                                           { id: '8', name: 'signature', label: 'التوقيع', type: 'text', required: false, placeholder: 'أدخل التوقيع' }
                                         ];
                                         
                                         setEditingForm({ ...currentForm, variables: defaultVariables });
                                         setSelectedForm('edit-form');
                                       }
                                     }}
                                     className="w-full px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                                   >
                                     إضافة متغيرات افتراضية
                                   </button>
                                 )}
                               </div>
                             );
                           }
                           return null;
                         })()}
                       </div>
                      </div>
                                             <div 
                         className="prose prose-sm max-w-none text-slate-800 dark:text-slate-200 leading-relaxed turkish-petition-preview"
                         style={{ direction: 'ltr', textAlign: 'left' }}
                       >
                         {(() => {
                           const currentForm = dynamicForms.find(f => f.id === selectedForm);
                           if (currentForm?.template) {
                             console.log('Template:', currentForm.template);
                             console.log('Variables:', currentForm.variables);
                             console.log('Form Values:', formValues);
                             
                             // تقسيم النص إلى أجزاء (نص عادي ومتغيرات)
                             const parts: TemplatePart[] = [];
                             let lastIndex = 0;
                             const variableMatches = currentForm.template.match(/\{([^}]+)\}/g) || [];
                             
                             variableMatches.forEach((match, index) => {
                               const variableName = match.replace(/[{}]/g, '');
                               const matchIndex = currentForm.template.indexOf(match, lastIndex);
                               
                               // إضافة النص قبل المتغير
                               if (matchIndex > lastIndex) {
                                 const textBefore = currentForm.template.substring(lastIndex, matchIndex);
                                 parts.push({ type: 'text', content: textBefore });
                               }
                               
                               // إضافة المتغير
                               const value = formValues[variableName] || match;
                               parts.push({ 
                                 type: 'variable', 
                                 name: variableName, 
                                 value: value,
                                 original: match 
                               });
                               
                               lastIndex = matchIndex + match.length;
                             });
                             
                             // إضافة النص المتبقي
                             if (lastIndex < currentForm.template.length) {
                               const remainingText = currentForm.template.substring(lastIndex);
                               parts.push({ type: 'text', content: remainingText });
                             }
                             
                                                            return parts.map((part: TemplatePart, index) => {
                                                                  if (part.type === 'text' && part.content) {
                                   return (
                                     <span key={index}>
                                       {part.content.split('\n').map((line, lineIndex) => (
                                         <span key={lineIndex}>
                                           {line}
                                           {lineIndex < part.content!.split('\n').length - 1 && <br />}
                                         </span>
                                       ))}
                                     </span>
                                   );
                                 } else if (part.type === 'variable' && part.name) {
                                 return (
                                   <span
                                     key={index}
                                     className="editable-variable"
                                     data-variable={part.name}
                                     style={{
                                       background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
                                       border: '2px solid rgba(59, 130, 246, 0.3)',
                                       borderRadius: '8px',
                                       padding: '4px 8px',
                                       cursor: 'pointer',
                                       display: 'inline-block',
                                       minWidth: '80px',
                                       textAlign: 'center',
                                       transition: 'all 0.3s ease',
                                       fontWeight: '500',
                                       color: 'rgba(59, 130, 246, 0.9)',
                                       position: 'relative',
                                       boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                                     }}
                                     onMouseOver={(e) => {
                                       e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                       e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                       e.currentTarget.style.transform = 'scale(1.05)';
                                       e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                                     }}
                                     onMouseOut={(e) => {
                                       e.currentTarget.style.backgroundColor = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))';
                                       e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                       e.currentTarget.style.transform = 'scale(1)';
                                       e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                                     }}
                                                                            onClick={() => {
                                         setEditingVariable({ name: part.name!, value: part.value || '' });
                                       }}
                                     title="🖊️ انقر للتعديل"
                                                                        >
                                       {part.value || part.original || part.name}
                                     </span>
                                 );
                               } else {
                                 return null;
                               }
                             });
                           }
                           return 'لا يوجد محتوى محدد للنموذج';
                         })()}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Moderators Tab */}
        {activeTab === 'moderators' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المشرفين</h2>
            </div>

            {/* Show moderator management for admin users */}
            {profile?.role === 'admin' && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <ModeratorManagement isDarkMode={isDarkMode} />
              </div>
            )}
            
            {/* Show access denied for non-admin users */}
            {profile?.role !== 'admin' && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-8 text-center`}>
                <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                  🔒 الوصول مرفوض
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                  فقط الأدمن يمكنه الوصول إلى هذه الصفحة
                </p>
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    هذه الصفحة مخصصة لإدارة المشرفين وتتطلب صلاحيات أدمن كاملة
                  </p>
                </div>
              </div>
            )}
          </div>
        )}



        {/* Health Insurance Tab */}
        {activeTab === 'health-insurance' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة التأمين الصحي</h2>
            </div>

            {/* Show health insurance management for admin and moderator users */}
            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                  <HealthInsuranceManagement />
                </div>
            )}
            
            {/* Show access denied for non-admin/moderator users */}
            {(profile?.role !== 'admin' && profile?.role !== 'moderator') && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-8 text-center`}>
                <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                  🔒 الوصول مرفوض
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                  فقط الأدمن والمشرفين يمكنهم الوصول إلى هذه الصفحة
                </p>
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    هذه الصفحة مخصصة لإدارة التأمين الصحي وتتطلب صلاحيات أدمن أو مشرف
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            {/* Standardized Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الـ Webhooks</h2>
            </div>

            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
                <WebhookSettings isDarkMode={isDarkMode} />
              </div>
            )}
            
            {/* Show access denied for non-admin/moderator users */}
            {(profile?.role !== 'admin' && profile?.role !== 'moderator') && (
              <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-8 text-center`}>
                <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                  🔒 الوصول مرفوض
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                  فقط الأدمن والمشرفين يمكنهم الوصول إلى هذه الصفحة
                </p>
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    هذه الصفحة مخصصة لإدارة إعدادات الـ webhooks وتتطلب صلاحيات أدمن أو مشرف
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {updateSuccess && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-2xl shadow-2xl p-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                تم الحفظ بنجاح! ✨
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                تم تحديث البيانات بنجاح
              </p>
              
              {/* Progress bar */}
              <div className="mt-4 w-full bg-white/20 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                <div className="h-full bg-green-500/60 rounded-full animate-expand-width"></div>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Enhanced Edit Modal with Glass Morphism */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingRequest(null)}></div>
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 border border-white/30 dark:border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">تحديث الطلب</h2>
              <button
                onClick={() => setEditingRequest(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  حالة الطلب
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  أولوية الطلب
                </label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value as any})}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  ملاحظات الإدارة
                </label>
                <textarea
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  placeholder="أضف ملاحظات للعميل..."
                />
              </div>

              <div className="flex space-x-4 space-x-reverse pt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-5 h-5 ml-3" />
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Support Reply Modal with Glass Morphism */}
      {editingSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingSupport(null)}></div>
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 border border-white/30 dark:border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">الرد على الرسالة</h2>
              <button
                onClick={() => setEditingSupport(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-800/30 dark:to-blue-900/10 p-4 rounded-xl border border-slate-200/30 dark:border-slate-700/20 backdrop-blur-sm">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">
                  <strong>الموضوع:</strong> {editingSupport.subject}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <strong>من:</strong> {editingSupport.name} ({editingSupport.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  حالة الرسالة
                </label>
                <select
                  value={supportReplyForm.status}
                  onChange={(e) => setSupportReplyForm({...supportReplyForm, status: e.target.value as any})}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="resolved">محلولة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  رد الإدارة
                </label>
                <textarea
                  value={supportReplyForm.admin_reply}
                  onChange={(e) => setSupportReplyForm({...supportReplyForm, admin_reply: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  placeholder="اكتب ردك هنا..."
                />
              </div>

              <div className="flex space-x-4 space-x-reverse pt-6">
                <button
                  onClick={handleSaveSupportReply}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Reply className="w-5 h-5 ml-3" />
                  إرسال الرد
                </button>
                <button
                  onClick={() => setEditingSupport(null)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Add/Edit FAQ Modal with Glass Morphism */}
      {(showAddFaq || editingFAQ) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => {
            setShowAddFaq(false);
            setEditingFAQ(null);
          }}></div>
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 border border-white/30 dark:border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {editingFAQ ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowAddFaq(false);
                  setEditingFAQ(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  السؤال
                </label>
                <input
                  type="text"
                  value={editingFAQ ? editingFAQ.question : newFaq.question}
                  onChange={(e) => {
                    if (editingFAQ) {
                      setEditingFAQ({...editingFAQ, question: e.target.value});
                    } else {
                      setNewFaq({...newFaq, question: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  placeholder="اكتب السؤال هنا..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  الإجابة
                </label>
                <textarea
                  value={editingFAQ ? editingFAQ.answer : newFaq.answer}
                  onChange={(e) => {
                    if (editingFAQ) {
                      setEditingFAQ({...editingFAQ, answer: e.target.value});
                    } else {
                      setNewFaq({...newFaq, answer: e.target.value});
                    }
                  }}
                  rows={4}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  placeholder="اكتب الإجابة هنا..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  التصنيف
                </label>
                <input
                  type="text"
                  value={editingFAQ ? editingFAQ.category : newFaq.category}
                  onChange={(e) => {
                    if (editingFAQ) {
                      setEditingFAQ({...editingFAQ, category: e.target.value});
                    } else {
                      setNewFaq({...newFaq, category: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  placeholder="مثال: عام، خدمات، أسعار..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={editingFAQ ? editingFAQ.order_index : newFaq.order_index}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (editingFAQ) {
                      setEditingFAQ({...editingFAQ, order_index: value});
                    } else {
                      setNewFaq({...newFaq, order_index: value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingFAQ ? editingFAQ.is_active : newFaq.is_active}
                  onChange={(e) => {
                    if (editingFAQ) {
                      setEditingFAQ({...editingFAQ, is_active: e.target.checked});
                    } else {
                      setNewFaq({...newFaq, is_active: e.target.checked});
                    }
                  }}
                  className="w-5 h-5 text-blue-600 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 rounded focus:ring-blue-500/50 focus:ring-2 backdrop-blur-sm"
                />
                <label htmlFor="is_active" className="mr-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  نشط (يظهر للعملاء)
                </label>
              </div>

              <div className="flex space-x-4 space-x-reverse pt-6">
                <button
                  onClick={() => handleSaveFaq(editingFAQ || newFaq)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-5 h-5 ml-3" />
                  {editingFAQ ? 'حفظ التغييرات' : 'إضافة السؤال'}
                </button>
                <button
                  onClick={() => {
                    setShowAddFaq(false);
                    setEditingFAQ(null);
                  }}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={language === 'ar' 
          ? 'هل أنت متأكد من أنك تريد حذف'
          : 'Are you sure you want to delete'
        }
        itemName={deleteModal.itemName}
        isLoading={deleteModal.isLoading}
      />

      {/* File View Modal - Glass Effect */}
      {fileViewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with enhanced blur */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/40 via-purple-900/20 to-blue-900/20 backdrop-blur-xl"
            onClick={() => setFileViewModal({...fileViewModal, isOpen: false})}
          ></div>
          
          {/* Glass Modal */}
          <div className="relative w-full max-w-3xl mx-auto animate-fade-in-up">
            {/* Glass Container */}
            <div className="bg-white/10 dark:bg-jet-900/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-jet-600/20 overflow-hidden">
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-jet-600/20 bg-white/10 dark:bg-jet-800/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-jet-800 animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        عرض الملف
                      </h2>
                      <p className="text-sm text-jet-600 dark:text-platinum-400 mt-1">
                        {fileViewModal.fileName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFileViewModal({...fileViewModal, isOpen: false})}
                    className="group w-10 h-10 bg-white/20 dark:bg-jet-700/20 hover:bg-white/30 dark:hover:bg-jet-600/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
                  >
                    <X className="w-5 h-5 text-jet-600 dark:text-platinum-400 group-hover:text-red-500 transition-colors duration-200" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {fileViewModal.fileData ? (
                    <div className="space-y-4">
                      {/* File Preview Card */}
                      <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-jet-600/30 shadow-xl">
                        
                        {/* File Preview Section */}
                        <div className="mb-6">
                          {(() => {
                            const fileName = fileViewModal.fileName.toLowerCase();
                            const isImage = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp');
                            const isPDF = fileName.endsWith('.pdf');
                                                         const isText = fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.rtf');
                            
                                                         if (isImage) {
                               // عرض معاينة الصورة
                               let imageUrl = `data:image/jpeg;base64,${fileViewModal.fileData}`;
                               
                               // تحديد نوع الصورة الصحيح
                               if (fileName.endsWith('.png')) {
                                 imageUrl = `data:image/png;base64,${fileViewModal.fileData}`;
                               } else if (fileName.endsWith('.gif')) {
                                 imageUrl = `data:image/gif;base64,${fileViewModal.fileData}`;
                               } else if (fileName.endsWith('.webp')) {
                                 imageUrl = `data:image/webp;base64,${fileViewModal.fileData}`;
                               }
                              return (
                                <div className="text-center">
                                  <div className="relative inline-block">
                                    <img 
                                      src={imageUrl} 
                                      alt={fileViewModal.fileName}
                                      className="max-w-full max-h-64 rounded-xl shadow-lg border-2 border-white/30 dark:border-jet-600/30 object-contain"
                                                                             onError={(e) => {
                                         // إذا فشل عرض الصورة، اعرض أيقونة
                                         const target = e.currentTarget as HTMLImageElement;
                                         target.style.display = 'none';
                                         const nextElement = target.nextElementSibling as HTMLElement;
                                         if (nextElement) {
                                           nextElement.style.display = 'flex';
                                         }
                                       }}
                                    />
                                    <div className="hidden w-64 h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                      <FileText className="w-16 h-16 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-jet-600 dark:text-platinum-400 mt-2">
                                    معاينة الصورة
                                  </p>
                                </div>
                              );
                            } else if (isPDF) {
                              // عرض معاينة PDF
                              return (
                                <div className="text-center">
                                  <div className="w-64 h-64 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                    <div className="text-center">
                                      <FileText className="w-16 h-16 text-white mb-2" />
                                      <p className="text-white font-semibold">PDF</p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-jet-600 dark:text-platinum-400 mt-2">
                                    ملف PDF - اضغط "فتح في تبويب جديد" لعرضه
                                  </p>
                                </div>
                              );
                            } else if (isText) {
                              // عرض معاينة النص
                              try {
                                const textContent = atob(fileViewModal.fileData);
                                const previewText = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;
                                return (
                                  <div className="text-center">
                                    <div className="w-64 h-32 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mx-auto overflow-hidden">
                                      <div className="text-white text-sm text-right leading-relaxed h-full overflow-y-auto">
                                        {previewText}
                                      </div>
                                    </div>
                                    <p className="text-sm text-jet-600 dark:text-platinum-400 mt-2">
                                      معاينة النص
                                    </p>
                                  </div>
                                );
                              } catch (error) {
                                // إذا فشل في فك تشفير النص
                                return (
                                  <div className="text-center">
                                    <div className="w-64 h-32 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto">
                                      <FileText className="w-12 h-12 text-white" />
                                    </div>
                                    <p className="text-sm text-jet-600 dark:text-platinum-400 mt-2">
                                      ملف نصي
                                    </p>
                                  </div>
                                );
                              }
                            } else {
                              // عرض أيقونة عامة للملفات الأخرى
                              return (
                                <div className="text-center">
                                  <div className="w-64 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                    <FileText className="w-12 h-12 text-white" />
                                  </div>
                                  <p className="text-sm text-jet-600 dark:text-platinum-400 mt-2">
                                    ملف مرفق
                                  </p>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        
                        {/* File Info */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-jet-800 dark:text-white mb-1">
                            {fileViewModal.fileName}
                          </h3>
                          <p className="text-jet-600 dark:text-platinum-400 text-sm">
                            ملف مرفق جاهز للعرض
                          </p>
                        </div>
                        
                        {/* File Actions */}
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                          <button
                            onClick={() => handleFileDownload('', fileViewModal.fileName)}
                            className="group flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform text-sm"
                          >
                            <Download className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                            <span className="font-semibold">تحميل الملف</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const blob = new Blob([Uint8Array.from(atob(fileViewModal.fileData!), c => c.charCodeAt(0))], { type: 'application/octet-stream' });
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, '_blank');
                            }}
                            className="group flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform text-sm"
                          >
                            <ExternalLink className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                            <span className="font-semibold">فتح في تبويب جديد</span>
                          </button>
                        </div>
                      </div>

                      {/* File Info Card */}
                      <div className="bg-white/30 dark:bg-jet-700/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-jet-600/20">
                        <h4 className="font-bold text-jet-800 dark:text-white mb-3 text-base flex items-center">
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center ml-2">
                            <FileText className="w-3 h-3 text-white" />
                          </div>
                          معلومات الملف
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/20 dark:bg-jet-600/20 rounded-xl p-3">
                            <span className="text-jet-600 dark:text-platinum-400 text-xs font-medium">اسم الملف:</span>
                            <span className="block font-bold text-jet-800 dark:text-white text-sm mt-1 truncate">{fileViewModal.fileName}</span>
                          </div>
                          <div className="bg-white/20 dark:bg-jet-600/20 rounded-xl p-3">
                            <span className="text-jet-600 dark:text-platinum-400 text-xs font-medium">حجم البيانات:</span>
                            <span className="block font-bold text-jet-800 dark:text-white text-sm mt-1">
                              {Math.round(fileViewModal.fileData.length * 0.75 / 1024)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-jet-700 dark:to-jet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-jet-800 dark:text-white mb-2">
                        لا يمكن عرض الملف
                      </h3>
                      <p className="text-jet-600 dark:text-platinum-400">
                        يرجى تحميل الملف لعرضه
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderators Tab */}
      {activeTab === 'moderators' && (
        <div className="space-y-6">
          {/* Standardized Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المشرفين</h2>
          </div>

          {/* Show moderator management for admin users */}
          {profile?.role === 'admin' && (
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
              <ModeratorManagement isDarkMode={isDarkMode} />
            </div>
          )}
          
          {/* Show access denied for non-admin users */}
          {profile?.role !== 'admin' && (
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-8 text-center`}>
              <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                🔒 الوصول مرفوض
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                فقط الأدمن يمكنه الوصول إلى هذه الصفحة
              </p>
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  هذه الصفحة مخصصة لإدارة المشرفين وتتطلب صلاحيات أدمن كاملة
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Health Insurance Tab */}
      {activeTab === 'health-insurance' && (
        <div className="space-y-6">
          {/* Standardized Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة التأمين الصحي</h2>
          </div>

          {/* Show health insurance management for admin and moderator users */}
          {(profile?.role === 'admin' || profile?.role === 'moderator') && (
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
              <HealthInsuranceManagement />
            </div>
          )}
          
          {/* Show access denied for non-admin/moderator users */}
          {(profile?.role !== 'admin' && profile?.role !== 'moderator') && (
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-8 text-center`}>
              <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                🔒 الوصول مرفوض
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                فقط الأدمن والمشرفين يمكنهم الوصول إلى هذه الصفحة
              </p>
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  هذه الصفحة مخصصة لإدارة التأمين الصحي وتتطلب صلاحيات أدمن أو مشرف
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Standardized Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الـ Webhooks</h2>
          </div>

          {(profile?.role === 'admin' || profile?.role === 'moderator') && (
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10`}>
              <WebhookSettings isDarkMode={isDarkMode} />
            </div>
          )}
          
          {/* Show access denied for non-admin/moderator users */}
          {(profile?.role !== 'admin' && profile?.role !== 'moderator') && (
            <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-2xl shadow-xl border border-white/20 dark:border-white/10 p-8 text-center`}>
              <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                🔒 الوصول مرفوض
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                فقط الأدمن والمشرفين يمكنهم الوصول إلى هذه الصفحة
              </p>
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  هذه الصفحة مخصصة لإدارة إعدادات الـ webhooks وتتطلب صلاحيات أدمن أو مشرف
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variable Edit Modal */}
      {editingVariable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">تحرير المتغير</h3>
              <button
                onClick={() => setEditingVariable(null)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    المتغير: <span className="text-blue-600 dark:text-blue-400">{editingVariable.name}</span>
                  </label>
                  <input
                    type="text"
                    value={editingVariable.value}
                    onChange={(e) => setEditingVariable({ ...editingVariable, value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setFormValues(prev => ({ 
                          ...prev, 
                          [editingVariable.name]: editingVariable.value 
                        }));
                        setEditingVariable(null);
                      } else if (e.key === 'Escape') {
                        setEditingVariable(null);
                      }
                    }}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="أدخل القيمة الجديدة..."
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    💡 اضغط Enter للحفظ، أو Escape للإلغاء
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <button
                onClick={() => setEditingVariable(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (editingVariable) {
                    setFormValues(prev => ({ 
                      ...prev, 
                      [editingVariable.name]: editingVariable.value 
                    }));
                    setEditingVariable(null);
                  }
                }}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">معاينة الطباعة</h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div 
                  className="prose prose-sm max-w-none text-slate-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const currentForm = dynamicForms.find(f => f.id === selectedForm);
                      if (currentForm?.template) {
                        const content = applyFormValues(currentForm.template, formValues);
                        return content
                          .replace(/\n/g, '<br>')
                          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                          .replace(/\s{2,}/g, (match) => '&nbsp;'.repeat(match.length));
                      }
                      return 'لا يوجد محتوى محدد للنموذج';
                    })()
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  printForm();
                  setShowPrintModal(false);
                }}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminDashboard;
