import React, { useState, useEffect } from 'react';
import { Bell, Clock, User, MessageSquare, CheckCircle, XCircle, Eye, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

interface TelegramNotification {
  id: string;
  session_id: string;
  message: string;
  language: string;
  request_type: string;
  user_info: any;
  additional_data: any;
  created_at: string;
  status: 'pending' | 'resolved' | 'in_progress';
  priority: 'low' | 'normal' | 'high';
  admin_response?: string;
  resolved_at?: string;
  resolved_by?: string;
}

const TelegramNotifications: React.FC = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<TelegramNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<TelegramNotification | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'high_priority'>('all');
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('telegram_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationStatus = async (id: string, status: string, response?: string) => {
    try {
      const { error } = await supabase
        .from('telegram_notifications')
        .update({
          status,
          admin_response: response,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          resolved_by: status === 'resolved' ? 'admin' : null
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating notification:', error);
        return;
      }

      // Refresh notifications
      await fetchNotifications();
      setSelectedNotification(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'normal': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'resolved': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getRequestTypeTitle = (type: string) => {
    const titles: Record<string, string> = {
      meeting_request: language === 'ar' ? 'طلب موعد/لقاء' : 'Meeting Request',
      chat_support: language === 'ar' ? 'طلب دعم' : 'Support Request',
      translation: language === 'ar' ? 'طلب ترجمة' : 'Translation Request',
      insurance: language === 'ar' ? 'طلب تأمين' : 'Insurance Request',
      service_request: language === 'ar' ? 'طلب خدمة' : 'Service Request',
      general_inquiry: language === 'ar' ? 'استفسار عام' : 'General Inquiry'
    };
    return titles[type] || type;
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'pending': return notification.status === 'pending';
      case 'resolved': return notification.status === 'resolved';
      case 'high_priority': return notification.priority === 'high';
      default: return true;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-caribbean-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Bell className="w-8 h-8 text-caribbean-600" />
          <h1 className="text-2xl font-bold text-jet-800 dark:text-white">
            {language === 'ar' ? 'إشعارات التلغرام' : 'Telegram Notifications'}
          </h1>
        </div>
        <button
          onClick={fetchNotifications}
          className="bg-caribbean-600 text-white px-4 py-2 rounded-lg hover:bg-caribbean-700 transition-colors"
        >
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 rtl:space-x-reverse mb-6">
        {[
          { key: 'all', label: language === 'ar' ? 'الكل' : 'All' },
          { key: 'pending', label: language === 'ar' ? 'معلقة' : 'Pending' },
          { key: 'resolved', label: language === 'ar' ? 'محلولة' : 'Resolved' },
          { key: 'high_priority', label: language === 'ar' ? 'أولوية عالية' : 'High Priority' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === key
                ? 'bg-caribbean-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications found'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white dark:bg-jet-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedNotification(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority === 'high' ? '🔔' : ''} {notification.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getRequestTypeTitle(notification.request_type)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-jet-800 dark:text-white mb-2">
                    {notification.message.length > 100 
                      ? `${notification.message.substring(0, 100)}...` 
                      : notification.message
                    }
                  </h3>
                  
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                    {notification.user_info?.email && (
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <User className="w-4 h-4" />
                        <span>{notification.user_info.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {notification.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNotificationStatus(notification.id, 'in_progress');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={language === 'ar' ? 'بدء المعالجة' : 'Start Processing'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {notification.status === 'in_progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNotificationStatus(notification.id, 'resolved');
                      }}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title={language === 'ar' ? 'تم الحل' : 'Mark Resolved'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-jet-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-jet-800 dark:text-white">
                  {language === 'ar' ? 'تفاصيل الإشعار' : 'Notification Details'}
                </h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'نوع الطلب' : 'Request Type'}
                  </label>
                  <p className="text-jet-800 dark:text-white">{getRequestTypeTitle(selectedNotification.request_type)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <p className="text-jet-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedNotification.message}
                  </p>
                </div>

                {selectedNotification.user_info && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'معلومات المستخدم' : 'User Information'}
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                      {selectedNotification.user_info.email && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-jet-800 dark:text-white">{selectedNotification.user_info.email}</span>
                        </div>
                      )}
                      {selectedNotification.user_info.name && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-jet-800 dark:text-white">{selectedNotification.user_info.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
                  </label>
                  <p className="text-jet-800 dark:text-white">{formatDate(selectedNotification.created_at)}</p>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                    {selectedNotification.priority === 'high' ? '🔔' : ''} {selectedNotification.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedNotification.status)}`}>
                    {selectedNotification.status}
                  </span>
                </div>

                {selectedNotification.status === 'in_progress' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'رد المشرف (اختياري)' : 'Admin Response (Optional)'}
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-jet-800 dark:text-white"
                      rows={3}
                      placeholder={language === 'ar' ? 'اكتب ردك هنا...' : 'Write your response here...'}
                    />
                  </div>
                )}

                <div className="flex space-x-3 rtl:space-x-reverse">
                  {selectedNotification.status === 'pending' && (
                    <button
                      onClick={() => updateNotificationStatus(selectedNotification.id, 'in_progress')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {language === 'ar' ? 'بدء المعالجة' : 'Start Processing'}
                    </button>
                  )}
                  
                  {selectedNotification.status === 'in_progress' && (
                    <button
                      onClick={() => updateNotificationStatus(selectedNotification.id, 'resolved', adminResponse)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {language === 'ar' ? 'تم الحل' : 'Mark Resolved'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramNotifications;

