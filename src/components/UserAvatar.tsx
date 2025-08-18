import React from 'react';

interface UserAvatarProps {
  user: any;
  profile?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  profile,
  size = 'md',
  className = '',
  showName = false
}) => {
  // تحديد حجم الصورة
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // الحصول على اسم المستخدم
  const getUserName = () => {
    // أولاً: استخدم الاسم من الملف الشخصي
    if (profile?.full_name && profile.full_name !== 'مستخدم جديد') {
      return profile.full_name;
    }
    
    // ثانياً: استخدم الاسم من user_metadata
    const googleData = user?.user_metadata;
    if (googleData?.full_name) {
      return googleData.full_name;
    } else if (googleData?.name) {
      return googleData.name;
    } else if (googleData?.display_name) {
      return googleData.display_name;
    } else if (googleData?.given_name && googleData?.family_name) {
      return `${googleData.given_name} ${googleData.family_name}`;
    } else if (googleData?.given_name) {
      return googleData.given_name;
    }
    
    // ثالثاً: إذا كان الاسم في الملف الشخصي هو "مستخدم جديد"، استخدم "مستخدم"
    if (profile?.full_name === 'مستخدم جديد') {
      return 'مستخدم';
    }
    
    // رابعاً: استخدم "مستخدم" بدلاً من البريد الإلكتروني
    return 'مستخدم';
  };

  const userName = getUserName();
  
  // الحصول على صورة المستخدم - أولوية لصورة Google
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || '';
  
  // Debug: طباعة معلومات الصورة
  if (user?.user_metadata?.provider === 'google') {
    }

  // إنشاء الأحرف الأولى من الاسم
  const getInitials = (name: string) => {
    if (!name) return 'م';
    
    // إذا كان الاسم باللغة العربية
    if (/[\u0600-\u06FF]/.test(name)) {
      return name.charAt(0);
    }
    
    // إذا كان الاسم باللغة الإنجليزية
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // إنشاء لون خلفية عشوائي بناءً على الاسم
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* صورة المستخدم */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
        {avatarUrl ? (
          // عرض صورة Google إذا كانت متوفرة
          <img
            src={avatarUrl}
            alt={userName}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // إذا فشل تحميل الصورة، إخفاءها وإظهار الأحرف الأولى
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gradient-to-br', getBackgroundColor(userName));
                parent.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'font-semibold');
              }
            }}
            onLoad={() => {
              }}
          />
        ) : (
          // عرض الأحرف الأولى إذا لم تكن الصورة متوفرة
          <div className={`w-full h-full bg-gradient-to-br ${getBackgroundColor(userName)} flex items-center justify-center text-white font-semibold`}>
            {getInitials(userName)}
          </div>
        )}
      </div>

      {/* اسم المستخدم */}
      {showName && (
        <div className="flex flex-col">
          <span className="font-medium text-jet-800 dark:text-white">
            {userName}
          </span>
          {profile?.email && (
            <span className="text-sm text-jet-600 dark:text-platinum-400">
              {profile.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
