import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Phone, 
  User, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Save,
  X,
  MessageSquare,
  Calendar,
  AlertCircle,
  Bot,
  Copy,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';

interface TelegramAllowedUser {
  id: string;
  phone_number: string;
  country_code: string;
  full_name: string | null;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TelegramUsersManagementProps {
  isDarkMode?: boolean;
}

const TelegramUsersManagement: React.FC<TelegramUsersManagementProps> = ({ isDarkMode = false }) => {
  const { t, language } = useLanguage();
  const { user } = useAuthContext();
  const [users, setUsers] = useState<TelegramAllowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<TelegramAllowedUser | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'connected' | 'not_connected'>('all');
  const [botUsername, setBotUsername] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const [formData, setFormData] = useState({
    phone_number: '',
    country_code: '+90',
    full_name: '',
    telegram_username: '',
    notes: ''
  });

  const countryCodes = [
    { code: '+90', flag: '🇹🇷', name: 'تركيا', nameEn: 'Turkey' },
    { code: '+963', flag: '🇸🇾', name: 'سوريا', nameEn: 'Syria' },
    { code: '+966', flag: '🇸🇦', name: 'السعودية', nameEn: 'Saudi Arabia' },
    { code: '+20', flag: '🇪🇬', name: 'مصر', nameEn: 'Egypt' },
    { code: '+971', flag: '🇦🇪', name: 'الإمارات', nameEn: 'UAE' },
    { code: '+962', flag: '🇯🇴', name: 'الأردن', nameEn: 'Jordan' },
    { code: '+961', flag: '🇱🇧', name: 'لبنان', nameEn: 'Lebanon' },
    { code: '+964', flag: '🇮🇶', name: 'العراق', nameEn: 'Iraq' },
    { code: '+965', flag: '🇰🇼', name: 'الكويت', nameEn: 'Kuwait' },
    { code: '+968', flag: '🇴🇲', name: 'عمان', nameEn: 'Oman' },
    { code: '+974', flag: '🇶🇦', name: 'قطر', nameEn: 'Qatar' },
    { code: '+973', flag: '🇧🇭', name: 'البحرين', nameEn: 'Bahrain' },
    { code: '+967', flag: '🇾🇪', name: 'اليمن', nameEn: 'Yemen' },
    { code: '+970', flag: '🇵🇸', name: 'فلسطين', nameEn: 'Palestine' },
    { code: '+212', flag: '🇲🇦', name: 'المغرب', nameEn: 'Morocco' },
    { code: '+213', flag: '🇩🇿', name: 'الجزائر', nameEn: 'Algeria' },
    { code: '+216', flag: '🇹🇳', name: 'تونس', nameEn: 'Tunisia' },
    { code: '+218', flag: '🇱🇾', name: 'ليبيا', nameEn: 'Libya' },
    { code: '+249', flag: '🇸🇩', name: 'السودان', nameEn: 'Sudan' },
    { code: '+1', flag: '🇺🇸', name: 'الولايات المتحدة', nameEn: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'بريطانيا', nameEn: 'UK' },
  ];

  useEffect(() => {
    fetchUsers();
    fetchBotUsername();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('telegram_allowed_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telegram_allowed_users'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBotUsername = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('bot_token')
        .eq('id', 2)
        .single();

      if (data?.bot_token && !error) {
        // استخراج username من bot token
        const response = await fetch(`https://api.telegram.org/bot${data.bot_token}/getMe`);
        const result = await response.json();
        if (result.ok && result.result.username) {
          setBotUsername(result.result.username);
        }
      }
    } catch (error) {
      console.error('Error fetching bot username:', error);
    }
  };

  const copyBotLink = () => {
    const botLink = `https://t.me/${botUsername}`;
    navigator.clipboard.writeText(botLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('telegram_allowed_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('telegram_allowed_users')
        .insert([
          {
            ...formData,
            added_by: user?.id
          }
        ]);

      if (error) {
        console.error('Error adding user:', error);
        alert('خطأ في إضافة المستخدم: ' + error.message);
        return;
      }

      // Reset form and close modal
      setFormData({
        phone_number: '',
        country_code: '+90',
        full_name: '',
        telegram_username: '',
        notes: ''
      });
      setShowAddModal(false);
      
      await fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('telegram_allowed_users')
        .update({
          phone_number: formData.phone_number,
          country_code: formData.country_code,
          full_name: formData.full_name,
          telegram_username: formData.telegram_username,
          notes: formData.notes
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Error updating user:', error);
        alert('خطأ في تحديث المستخدم: ' + error.message);
        return;
      }

      // Reset form and close modal
      setEditingUser(null);
      setFormData({
        phone_number: '',
        country_code: '+90',
        full_name: '',
        telegram_username: '',
        notes: ''
      });
      
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('telegram_allowed_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error toggling user status:', error);
        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      const { error } = await supabase
        .from('telegram_allowed_users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openEditModal = (user: TelegramAllowedUser) => {
    setEditingUser(user);
    setFormData({
      phone_number: user.phone_number,
      country_code: user.country_code,
      full_name: user.full_name || '',
      telegram_username: user.telegram_username || '',
      notes: user.notes || ''
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({
      phone_number: '',
      country_code: '+90',
      full_name: '',
      telegram_username: '',
      notes: ''
    });
  };

  const filteredUsers = users.filter(user => {
    // Filter by status
    if (filter === 'active' && !user.is_active) return false;
    if (filter === 'inactive' && user.is_active) return false;
    if (filter === 'connected' && !user.telegram_chat_id) return false;
    if (filter === 'not_connected' && user.telegram_chat_id) return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.phone_number.includes(search) ||
        user.full_name?.toLowerCase().includes(search) ||
        user.telegram_username?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Bot className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                إدارة مستخدمي بوت التلغرام
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                إضافة وإدارة المستخدمين المصرح لهم بالوصول إلى بوت التلغرام
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            إضافة مستخدم جديد
          </button>
        </div>

        {/* Bot Link and Instructions */}
        {botUsername && (
          <div className={`rounded-xl p-6 mb-6 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'} shadow-xl`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Info className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    رابط البوت
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    شارك هذا الرابط مع المستخدمين المصرح لهم
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                }`}
              >
                {showInstructions ? 'إخفاء' : 'عرض'} التعليمات
              </button>
            </div>

            {/* Bot Link */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex-1 px-4 py-3 rounded-lg font-mono text-sm ${
                isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                https://t.me/{botUsername}
              </div>
              <button
                onClick={copyBotLink}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  copied
                    ? isDarkMode
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-green-100 text-green-600'
                    : isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    نسخ
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            {showInstructions && (
              <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  خطوات ربط المستخدم (بسيطة جداً! 🎉):
                </h4>
                <ol className={`space-y-2 list-decimal list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>اطلب من المستخدم username التلغرام الخاص به (مثلاً: @Munzir_Alusy)</li>
                  <li>أضف المستخدم من خلال زر "إضافة مستخدم جديد" وأدخل الـ username</li>
                  <li>شارك رابط البوت مع المستخدم</li>
                  <li>يفتح المستخدم الرابط ويضغط "Start" <strong>فقط!</strong></li>
                  <li>سيتم ربط الحساب تلقائياً بناءً على username ✨</li>
                  <li>سيبدأ المستخدم باستقبال الإشعارات فوراً 🔔</li>
                </ol>
                <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                    <strong>💡 ملاحظة مهمة:</strong> يجب أن يكون للمستخدم username في التلغرام (مثل @username). إذا لم يكن لديه، يمكنه إضافته من إعدادات التلغرام → الملف الشخصي.
                  </p>
                </div>
                <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                    <strong>✅ مزايا الطريقة الجديدة:</strong> لا حاجة لإرسال رقم الهاتف! البوت يتعرف على المستخدم تلقائياً من username التلغرام.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <div className={`rounded-xl p-6 mb-6 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'} shadow-xl`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث برقم الهاتف، الاسم، أو اسم المستخدم..."
                  className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? isDarkMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                الكل ({users.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'active'
                    ? isDarkMode
                      ? 'bg-green-600 text-white'
                      : 'bg-green-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                نشط ({users.filter(u => u.is_active).length})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'inactive'
                    ? isDarkMode
                      ? 'bg-red-600 text-white'
                      : 'bg-red-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                غير نشط ({users.filter(u => !u.is_active).length})
              </button>
              <button
                onClick={() => setFilter('connected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'connected'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                مربوط ({users.filter(u => u.telegram_chat_id).length})
              </button>
              <button
                onClick={() => setFilter('not_connected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'not_connected'
                    ? isDarkMode
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                غير مربوط ({users.filter(u => !u.telegram_chat_id).length})
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`text-center py-12 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'} shadow-xl`}>
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'لا توجد نتائج بحث' : 'لا يوجد مستخدمون مضافون بعد'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`rounded-xl p-6 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'} shadow-xl hover:shadow-2xl transition-all duration-200 border ${
                  user.is_active
                    ? isDarkMode
                      ? 'border-green-500/30'
                      : 'border-green-200'
                    : isDarkMode
                    ? 'border-red-500/30'
                    : 'border-red-200'
                }`}
              >
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <User className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.full_name || 'بدون اسم'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                          {user.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                        <span className="text-gray-400">•</span>
                        {user.telegram_chat_id ? (
                          <span className="text-sm text-blue-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            مربوط
                          </span>
                        ) : (
                          <span className="text-sm text-orange-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            غير مربوط
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-red-100 hover:bg-red-200 text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user.country_code} {user.phone_number}
                    </span>
                  </div>
                  
                  {user.telegram_username && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        @{user.telegram_username}
                      </span>
                    </div>
                  )}
                  
                  {user.notes && (
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {user.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${
                      user.is_active
                        ? isDarkMode
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-red-100 hover:bg-red-200 text-red-600'
                        : isDarkMode
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                  >
                    {user.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-2xl rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
              {/* Modal Header */}
              <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                </h2>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode
                      ? 'hover:bg-slate-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="أدخل الاسم الكامل"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>

                {/* Phone Number */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      كود الدولة
                      <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> (اختياري)</span>
                    </label>
                    <select
                      value={formData.country_code}
                      onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      رقم الهاتف
                      <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> (اختياري - للسجلات فقط)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="5XXXXXXXXX"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono`}
                    />
                  </div>
                </div>

                {/* Telegram Username */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    اسم المستخدم في التلغرام <span className="text-red-500">*</span>
                    <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> (مطلوب للربط التلقائي)</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.telegram_username}
                      onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value.replace('@', '') })}
                      placeholder="Munzir_Alusy"
                      className={`w-full pr-8 pl-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    مثال: Munzir_Alusy (بدون @)
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أضف ملاحظات إضافية..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none`}
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Save className="w-5 h-5" />
                    {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramUsersManagement;

