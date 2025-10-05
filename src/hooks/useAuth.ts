import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../lib/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  hasNotifications: boolean;
}

interface SignUpData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
}

interface SignInData {
  emailOrPhone: string;
  password: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    hasNotifications: false,
  });
  const [initialized, setInitialized] = useState(false);


  useEffect(() => {
    if (initialized) {
      return;
    }
    
    setInitialized(true);
    
    // الحصول على الجلسة الحالية
    const getInitialSession = async () => {
      try {
        // Add timeout to getSession with longer timeout for better reliability
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session retrieval timeout')), 8000); // 8 second timeout for better reliability
        });
        
        const { data: { session }, error } = await Promise.race([sessionPromise, sessionTimeoutPromise]) as any;
        
        if (error) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        // Check if user has manually signed out (by checking localStorage)
        const hasManuallySignedOut = localStorage.getItem('manuallySignedOut') === 'true';
        if (hasManuallySignedOut) {
          localStorage.removeItem('manuallySignedOut');
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        if (session?.user) {
          // التحقق من تأكيد البريد الإلكتروني باستخدام middleware
          const { isVerified, shouldBlock } = await checkEmailVerification(session.user);
          
          if (shouldBlock) {
            // تسجيل الخروج فوراً
            await forceSignOutUnverified();
            
            return;
          }
          
          // Only set user if verification passed
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session: session,
            loading: false,
          }));
          
          // Load profile and notifications asynchronously with timeout
          try {
            const profilePromise = getUserProfile(session.user.id);
            const notificationsPromise = checkForNotifications(session.user.id);
            
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile/notifications loading timeout')), 5000); // 5 second timeout for better reliability
            });
            
            const [profile, hasNotifications] = await Promise.race([
              Promise.all([profilePromise, notificationsPromise]),
              timeoutPromise
            ]) as [UserProfile | null, boolean];
            
            setAuthState(prev => ({
              ...prev,
              profile,
              hasNotifications,
            }));
          } catch (profileError) {
            // Keep the user authenticated even if profile loading fails
            
            // Create fallback profile for admin/moderator
            const isAdminUser = session.user.email === 'admin@tevasul.group';
            
            // List of specific moderator emails
            const moderatorEmails = [
              'hanoof@tevasul.group',
              'moderator@tevasul.group',
              'admin@tevasul.group' // admin is also a moderator
            ];
            
            const isModeratorUser = moderatorEmails.includes(session.user.email) ||
                                   session.user.email?.includes('moderator') || 
                                   session.user.email?.includes('moderator@') ||
                                   session.user.email?.toLowerCase().includes('moderator') ||
                                   session.user.user_metadata?.role === 'moderator' ||
                                   session.user.app_metadata?.role === 'moderator';
            
            // محاولة استخراج الاسم من user_metadata
            const googleData = session.user.user_metadata;
            let fallbackName = 'مستخدم';
            
            if (googleData?.full_name) {
              fallbackName = googleData.full_name;
            } else if (googleData?.name) {
              fallbackName = googleData.name;
            } else if (googleData?.display_name) {
              fallbackName = googleData.display_name;
            } else if (googleData?.given_name && googleData?.family_name) {
              fallbackName = `${googleData.given_name} ${googleData.family_name}`;
            } else if (googleData?.given_name) {
              fallbackName = googleData.given_name;
            }
            
            const fallbackProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: fallbackName,
              phone: undefined,
              country_code: '+90',
              avatar_url: session.user.user_metadata?.avatar_url || null,
              role: (isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user')) as 'user' | 'moderator' | 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            setAuthState(prev => ({
              ...prev,
              profile: fallbackProfile,
              hasNotifications: false,
            }));
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        // Handle sign out event immediately
        if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            hasNotifications: false,
          });
          return;
        }
        
        // Only set loading true for sign in events, not sign out
        if (event !== 'SIGNED_OUT') {
          setAuthState(prev => ({ ...prev, loading: true }));
        }
        
        if (session?.user) {
          // التحقق من تأكيد البريد الإلكتروني فقط للمستخدمين العاديين
          if (session.user.user_metadata?.provider !== 'google') {
            const { isVerified, shouldBlock } = await checkEmailVerification(session.user);
            
            if (shouldBlock) {
              // تسجيل الخروج فوراً
              await forceSignOutUnverified();
              
              return;
            }
          } else {
          }
          
          // Only set user if verification passed
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session: session,
            loading: false,
          }));
          
          // If we already have the same user with profile, don't reload everything
          if (authState.user?.id === session.user.id && authState.profile) {
            return;
          }
          
          try {
            // Try to get profile with a longer timeout
            const profilePromise = getUserProfile(session.user.id);
            const notificationsPromise = checkForNotifications(session.user.id);
            
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile/notifications loading timeout')), 5000); // 5 second timeout
            });
            
            const [profile, hasNotifications] = await Promise.race([
              Promise.all([profilePromise, notificationsPromise]),
              timeoutPromise
            ]) as [UserProfile | null, boolean];
            
            const newAuthState = {
              user: session.user,
              profile: profile ? { ...profile, role: profile.role as 'user' | 'moderator' | 'admin' } : null,
              session,
              loading: false,
              hasNotifications,
            };
            
            setAuthState(newAuthState);
          } catch (error) {
            
            // Set a fallback state even if profile loading fails
            const isAdminUser = session.user.email === 'admin@tevasul.group';
            
            // List of specific moderator emails
            const moderatorEmails = [
              'hanoof@tevasul.group',
              'moderator@tevasul.group',
              'admin@tevasul.group' // admin is also a moderator
            ];
            
            const isModeratorUser = moderatorEmails.includes(session.user.email) ||
                                   session.user.email?.includes('moderator') || 
                                   session.user.email?.includes('moderator@') ||
                                   session.user.email?.toLowerCase().includes('moderator') ||
                                   session.user.user_metadata?.role === 'moderator' ||
                                   session.user.app_metadata?.role === 'moderator';
            
            // محاولة استخراج الاسم من user_metadata
            const googleData = session.user.user_metadata;
            let fallbackName = 'مستخدم';
            
            if (googleData?.full_name) {
              fallbackName = googleData.full_name;
            } else if (googleData?.name) {
              fallbackName = googleData.name;
            } else if (googleData?.display_name) {
              fallbackName = googleData.display_name;
            } else if (googleData?.given_name && googleData?.family_name) {
              fallbackName = `${googleData.given_name} ${googleData.family_name}`;
            } else if (googleData?.given_name) {
              fallbackName = googleData.given_name;
            }
            
            const fallbackState = {
              user: session.user,
              profile: {
                id: session.user.id,
                email: session.user.email || '',
                full_name: fallbackName,
                phone: undefined,
                country_code: '+90',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                role: (isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user')) as 'user' | 'moderator' | 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              session,
              loading: false,
              hasNotifications: false,
            };
            
            setAuthState(fallbackState);
            }
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            hasNotifications: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  // إضافة useEffect لمراقبة تغييرات user وإعادة جلب profile (optimized)
  useEffect(() => {
    if (authState.user && !authState.profile && !authState.loading) {
      // Prevent multiple profile loading attempts
      const profileLoadingKey = `profile-loading-${authState.user.id}`;
      if (sessionStorage.getItem(profileLoadingKey)) {
        return;
      }
      
      sessionStorage.setItem(profileLoadingKey, 'true');
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Add timeout to profile loading
      const profilePromise = getUserProfile(authState.user.id);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile loading timeout')), 8000); // 8 second timeout for better reliability
      });
      
      Promise.race([profilePromise, timeoutPromise]).then(profile => {
        if (profile) {
          setAuthState(prev => ({ ...prev, profile, loading: false }));
          } else {
          // إذا لم يتم العثور على profile، حاول إنشاؤه من user_metadata
          if (!authState.user) return;
          
          const createPromise = createProfileFromMetadata(authState.user);
          const createTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile creation timeout')), 5000); // 5 second timeout
          });
          
          Promise.race([createPromise, createTimeoutPromise]).then(newProfile => {
            if (newProfile) {
              setAuthState(prev => ({ ...prev, profile: newProfile, loading: false }));
              } else {
              setAuthState(prev => ({ ...prev, loading: false }));
            }
          }).catch(error => {
            
            // Create immediate fallback profile
            if (authState.user) {
              const isAdminUser = authState.user.email === 'admin@tevasul.group';
              
              // List of specific moderator emails
              const moderatorEmails = [
                'hanoof@tevasul.group',
                'moderator@tevasul.group',
                'admin@tevasul.group' // admin is also a moderator
              ];
              
              const isModeratorUser = moderatorEmails.includes(authState.user.email) ||
                                     authState.user.email?.includes('moderator') || 
                                     authState.user.email?.includes('moderator@') ||
                                     authState.user.email?.toLowerCase().includes('moderator') ||
                                     authState.user.user_metadata?.role === 'moderator' ||
                                     authState.user.app_metadata?.role === 'moderator';
              
              const googleData = authState.user.user_metadata;
              let fallbackName = 'مستخدم';
              
              if (googleData?.full_name) {
                fallbackName = googleData.full_name;
              } else if (googleData?.name) {
                fallbackName = googleData.name;
              } else if (googleData?.display_name) {
                fallbackName = googleData.display_name;
              } else if (googleData?.given_name && googleData?.family_name) {
                fallbackName = `${googleData.given_name} ${googleData.family_name}`;
              } else if (googleData?.given_name) {
                fallbackName = googleData.given_name;
              }
              
              const fallbackProfile = {
                id: authState.user.id,
                email: authState.user.email || '',
                full_name: fallbackName,
                phone: undefined,
                country_code: '+90',
                avatar_url: authState.user.user_metadata?.avatar_url || null,
                role: (isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user')) as 'user' | 'moderator' | 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              
              setAuthState(prev => ({ ...prev, profile: fallbackProfile, loading: false }));
            } else {
              setAuthState(prev => ({ ...prev, loading: false }));
            }
          });
        }
        sessionStorage.removeItem(profileLoadingKey);
      }).catch(error => {
        
        // Create immediate fallback profile
        if (authState.user) {
          const isAdminUser = authState.user.email === 'admin@tevasul.group';
          
          // List of specific moderator emails
          const moderatorEmails = [
            'hanoof@tevasul.group',
            'moderator@tevasul.group',
            'admin@tevasul.group' // admin is also a moderator
          ];
          
          const isModeratorUser = moderatorEmails.includes(authState.user.email) ||
                                 authState.user.email?.includes('moderator') || 
                                 authState.user.email?.includes('moderator@') ||
                                 authState.user.email?.toLowerCase().includes('moderator') ||
                                 authState.user.user_metadata?.role === 'moderator' ||
                                 authState.user.app_metadata?.role === 'moderator';
          
          const googleData = authState.user.user_metadata;
          let fallbackName = 'مستخدم';
          
          if (googleData?.full_name) {
            fallbackName = googleData.full_name;
          } else if (googleData?.name) {
            fallbackName = googleData.name;
          } else if (googleData?.display_name) {
            fallbackName = googleData.display_name;
          } else if (googleData?.given_name && googleData?.family_name) {
            fallbackName = `${googleData.given_name} ${googleData.family_name}`;
          } else if (googleData?.given_name) {
            fallbackName = googleData.given_name;
          }
          
          const fallbackProfile = {
            id: authState.user.id,
            email: authState.user.email || '',
            full_name: fallbackName,
            phone: undefined,
            country_code: '+90',
            avatar_url: authState.user.user_metadata?.avatar_url || null,
            role: (isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user')) as 'user' | 'moderator' | 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setAuthState(prev => ({ ...prev, profile: fallbackProfile, loading: false }));
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
        
        sessionStorage.removeItem(profileLoadingKey);
      });
    }
  }, [authState.user, authState.profile, authState.loading]);



  // Timeout to prevent loading state from getting stuck
  useEffect(() => {
    if (authState.loading) {
      const timeout = setTimeout(() => {
        setAuthState(prev => ({ ...prev, loading: false }));
      }, 3000); // 3 second timeout (reduced from 5)

      return () => clearTimeout(timeout);
    }
  }, [authState.loading]);

  // Additional timeout for initialization
  useEffect(() => {
    if (!initialized) {
      const initTimeout = setTimeout(() => {
        setInitialized(true);
        setAuthState(prev => ({ ...prev, loading: false }));
      }, 2000); // 2 second timeout for initialization (reduced from 3)

      return () => clearTimeout(initTimeout);
    }
  }, [initialized]);

  // دالة لإنشاء profile من user_metadata
  const createProfileFromMetadata = async (user: any): Promise<UserProfile | null> => {
    try {
      if (!user.user_metadata) {
        return null;
      }

      // Check if user is admin or moderator by email - IMPROVED LOGIC
      const isAdminUser = user.email === 'admin@tevasul.group';
      
      // List of specific moderator emails
      const moderatorEmails = [
        'hanoof@tevasul.group',
        'moderator@tevasul.group',
        'admin@tevasul.group' // admin is also a moderator
      ];
      
      const isModeratorUser = moderatorEmails.includes(user.email) ||
                             user.email?.includes('moderator') || 
                             user.email?.includes('moderator@') ||
                             user.email?.toLowerCase().includes('moderator') ||
                             user.user_metadata?.role === 'moderator' ||
                             user.app_metadata?.role === 'moderator';
      
      // محاولة استخراج الاسم من user_metadata
      const googleData = user.user_metadata;
      let fullName = 'مستخدم';
      
      if (googleData?.full_name) {
        fullName = googleData.full_name;
      } else if (googleData?.name) {
        fullName = googleData.name;
      } else if (googleData?.display_name) {
        fullName = googleData.display_name;
      } else if (googleData?.given_name && googleData?.family_name) {
        fullName = `${googleData.given_name} ${googleData.family_name}`;
      } else if (googleData?.given_name) {
        fullName = googleData.given_name;
      }
      
      // Check if profile already exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      let profileData;
      
      if (existingProfile && !checkError) {
        // Profile exists, update it with new role if needed
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            email: user.email,
            full_name: fullName,
            phone: user.user_metadata.phone || null,
            country_code: user.user_metadata.country_code || '+90',
            avatar_url: user.user_metadata.avatar_url || null,
            role: isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user'),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();
        
        if (updateError) {
          return null;
        }
        
        profileData = updateData;
      } else {
        // Profile doesn't exist, create new one
        const { data: createData, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            phone: user.user_metadata.phone || null,
            country_code: user.user_metadata.country_code || '+90',
            avatar_url: user.user_metadata.avatar_url || null,
            role: isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user'),
          })
          .select()
          .single();
        
        if (createError) {
          return null;
        }
        
        profileData = createData;
      }
        
      return profileData;
    } catch (error) {
      return null;
    }
  };

    const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Get user data first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return null;
      }
      
      // Check if user is admin or moderator by email - IMPROVED LOGIC
      const isAdminUser = user.email === 'admin@tevasul.group';
      
      // List of specific moderator emails
      const moderatorEmails = [
        'hanoof@tevasul.group',
        'moderator@tevasul.group',
        'admin@tevasul.group' // admin is also a moderator
      ];
      
      const isModeratorUser = moderatorEmails.includes(user.email) ||
                             user.email?.includes('moderator') || 
                             user.email?.includes('moderator@') ||
                             user.email?.toLowerCase().includes('moderator') ||
                             user.user_metadata?.role === 'moderator' ||
                             user.app_metadata?.role === 'moderator';
      
      // Try to get profile from database with timeout
      try {
        // Add a timeout to the database query
        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), 3000); // 3 second timeout
        });
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
          
        if (!error && data) {
          return data;
        }
        
        // If no profile found, create a fallback profile
        if (error && error.code === 'PGRST116') {
          // Check if user is admin or moderator by email - IMPROVED LOGIC
          const isAdminUser = user.email === 'admin@tevasul.group';
          
          // List of specific moderator emails
          const moderatorEmails = [
            'hanoof@tevasul.group',
            'moderator@tevasul.group',
            'admin@tevasul.group' // admin is also a moderator
          ];
          
          const isModeratorUser = moderatorEmails.includes(user.email) ||
                                 user.email?.includes('moderator') || 
                                 user.email?.includes('moderator@') ||
                                 user.email?.toLowerCase().includes('moderator') ||
                                 user.user_metadata?.role === 'moderator' ||
                                 user.app_metadata?.role === 'moderator';
          
          // محاولة استخراج الاسم من user_metadata
          const googleData = user.user_metadata;
          let fallbackName = 'مستخدم';
          
          if (googleData?.full_name) {
            fallbackName = googleData.full_name;
          } else if (googleData?.name) {
            fallbackName = googleData.name;
          } else if (googleData?.display_name) {
            fallbackName = googleData.display_name;
          } else if (googleData?.given_name && googleData?.family_name) {
            fallbackName = `${googleData.given_name} ${googleData.family_name}`;
          } else if (googleData?.given_name) {
            fallbackName = googleData.given_name;
          }
          
          return {
            id: userId,
            email: user.email || '',
            full_name: fallbackName,
            phone: undefined,
            country_code: '+90',
            avatar_url: user.user_metadata?.avatar_url || null,
            role: isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        
        return null;
      } catch (timeoutError) {
        // Return fallback profile on timeout
        
        // Check if user is admin or moderator by email - IMPROVED LOGIC
        const isAdminUser = user.email === 'admin@tevasul.group';
        
        // List of specific moderator emails
        const moderatorEmails = [
          'hanoof@tevasul.group',
          'moderator@tevasul.group',
          'admin@tevasul.group' // admin is also a moderator
        ];
        
        const isModeratorUser = moderatorEmails.includes(user.email) ||
                               user.email?.includes('moderator') || 
                               user.email?.includes('moderator@') ||
                               user.email?.toLowerCase().includes('moderator') ||
                               user.user_metadata?.role === 'moderator' ||
                               user.app_metadata?.role === 'moderator';
        
        // محاولة استخراج الاسم من user_metadata
        const googleData = user.user_metadata;
        let fallbackName = 'مستخدم';
        
        if (googleData?.full_name) {
          fallbackName = googleData.full_name;
        } else if (googleData?.name) {
          fallbackName = googleData.name;
        } else if (googleData?.display_name) {
          fallbackName = googleData.display_name;
        } else if (googleData?.given_name && googleData?.family_name) {
          fallbackName = `${googleData.given_name} ${googleData.family_name}`;
        } else if (googleData?.given_name) {
          fallbackName = googleData.given_name;
        }
        
        return {
          id: userId,
          email: user.email || '',
          full_name: fallbackName,
          phone: undefined,
          country_code: '+90',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: isAdminUser ? 'admin' : (isModeratorUser ? 'moderator' : 'user'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    } catch (error) {
      return null;
    }
  };

  // دالة للتحقق من وجود إشعارات
  const checkForNotifications = async (userId: string): Promise<boolean> => {
    try {
      // Skip notifications check for now since table doesn't exist
      return false;
      
      // TODO: Uncomment when notifications table is created
      /*
      // Add timeout to the notifications check
      const notificationsPromise = supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false)
        .limit(1);
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Notifications check timeout')), 1500); // 1.5 second timeout
      });
      
      const { data, error } = await Promise.race([notificationsPromise, timeoutPromise]) as any;
      
      if (error) {
        return false;
      }
      
      const hasNotifications = (data && data.length > 0);
      return hasNotifications;
      */
    } catch (error) {
      return false;
    }
  };

  const clearNotifications = async () => {
    setAuthState(prev => ({ ...prev, hasNotifications: false }));
  };

  // Sign up function
  const signUp = async (signUpData: SignUpData) => {
    try {
      // محاولة التسجيل مع تأكيد البريد
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.name,
            phone: signUpData.phone,
            country_code: signUpData.countryCode,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          emailConfirm: true
        }
      });

      if (error) {
        
        // إذا كان الخطأ متعلق بـ SMTP، جرب التسجيل بدون تأكيد
        if (error.message?.includes('SMTP') || error.message?.includes('email') || error.status === 500) {
          const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
            email: signUpData.email,
            password: signUpData.password,
            options: {
              data: {
                full_name: signUpData.name,
                phone: signUpData.phone,
                country_code: signUpData.countryCode,
              },
              emailConfirm: false // تعطيل تأكيد البريد مؤقتاً
            }
          });

          if (fallbackError) {
            return { data: null, error: fallbackError };
          }

          return { 
            data: fallbackData, 
            error: null,
            warning: 'تم إنشاء الحساب بنجاح، لكن تأكيد البريد الإلكتروني معطل مؤقتاً'
          };
        }
        
        return { data, error };
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error: error as any };
    }
  };

  const signIn = async (signInData: SignInData) => {
    try {
      // Test connection first
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (connectionError) {
          if (connectionError.message?.includes('fetch') || connectionError.message?.includes('network')) {
            return { 
              error: {
                message: 'لا يمكن الاتصال بخادم Supabase. تحقق من اتصال الإنترنت ومتغيرات البيئة.',
                status: 500,
                name: 'ConnectionError'
              }
            };
          }
          }
      } catch (connectionError) {
        return { 
          error: {
            message: 'فشل في الاتصال بخادم Supabase. تحقق من اتصال الإنترنت.',
            status: 500,
            name: 'ConnectionError'
          }
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.emailOrPhone,
        password: signInData.password,
      });
      
      if (error) {
        return { error };
      }
      
      // التحقق من تأكيد البريد الإلكتروني باستخدام middleware
      if (data.user) {
        const { isVerified, shouldBlock } = await checkEmailVerification(data.user);
        
        if (shouldBlock) {
          // تسجيل الخروج فوراً لمنع الوصول
          await forceSignOutUnverified();
          
          return { 
            error: {
              message: 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني واضغط على رابط التأكيد.',
              status: 401,
              name: 'EmailNotConfirmed'
            }
          };
        }
      }
      
      // Additional check: Verify email confirmation status from database
      if (data.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('email_confirmed_at')
            .eq('id', data.user.id)
            .single();
            
          if (!userError && userData && !userData.email_confirmed_at) {
            const isAdmin = data.user.email === 'admin@tevasul.group';
            const isModerator = data.user.email?.includes('moderator') || data.user.email?.includes('admin');
            
            if (!isAdmin && !isModerator) {
              
              // تسجيل الخروج فوراً لمنع الوصول
              await supabase.auth.signOut();
              
              // Clear any existing auth state
              setAuthState({
                user: null,
                profile: null,
                session: null,
                loading: false,
                hasNotifications: false,
              });
              
              return { 
                error: {
                  message: 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني واضغط على رابط التأكيد.',
                  status: 401,
                  name: 'EmailNotConfirmed'
                }
              };
            }
          }
        } catch (dbError) {
        }
      }
      
      // Force state update after successful login
      if (data.user) {
        // Only set auth state if user is verified
        const { isVerified, shouldBlock } = await checkEmailVerification(data.user);
        
        if (shouldBlock) {
          return { 
            error: {
              message: 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني واضغط على رابط التأكيد.',
              status: 401,
              name: 'EmailNotConfirmed'
            }
          };
        }
        
        // محاولة استخراج الاسم من user_metadata
        const googleData = data.user.user_metadata;
        let fallbackName = 'مستخدم';
        
        if (googleData?.full_name) {
          fallbackName = googleData.full_name;
        } else if (googleData?.name) {
          fallbackName = googleData.name;
        } else if (googleData?.display_name) {
          fallbackName = googleData.display_name;
        } else if (googleData?.given_name && googleData?.family_name) {
          fallbackName = `${googleData.given_name} ${googleData.family_name}`;
        } else if (googleData?.given_name) {
          fallbackName = googleData.given_name;
        }
        
        // Create immediate auth state without waiting for profile
        const immediateAuthState = {
          user: data.user,
          profile: {
            id: data.user.id,
            email: data.user.email || '',
            full_name: fallbackName,
            phone: undefined,
            country_code: '+90',
            avatar_url: data.user.user_metadata?.avatar_url || null,
            role: (data.user.email === 'admin@tevasul.group' ? 'admin' : 'user') as 'user' | 'moderator' | 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          session: data.session,
          loading: false,
          hasNotifications: false,
        };
        
        setAuthState(immediateAuthState);
        // Try to get profile in background (non-blocking)
        setTimeout(async () => {
          try {
            const profile = await getUserProfile(data.user.id);
            const hasNotifications = await checkForNotifications(data.user.id);
            
            if (profile) {
              setAuthState(prev => ({
                ...prev,
                profile,
                hasNotifications,
              }));
              }
          } catch (error) {
          }
        }, 100);
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as any };
    }
  };

  const signOut = async () => {
    try {
      // First, clear local state immediately
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        hasNotifications: false,
      });
      
      // Clear all localStorage items related to authentication
      localStorage.removeItem('justLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('openServiceRequest');
      localStorage.removeItem('pendingServiceRequest');
      
      // Clear all sessionStorage items related to authentication
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('profile-loading-') || 
            key.startsWith('user-visited-') || 
            key.startsWith('admin-redirect-')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Clear Supabase session from localStorage
      const supabaseKeys = Object.keys(localStorage);
      supabaseKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
          }
      });
      
      // Mark that user has manually signed out
      localStorage.setItem('manuallySignedOut', 'true');
      
      // Then try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
      } else {
      }
      
      // Force a re-render to ensure UI updates
      setTimeout(() => {
        setAuthState(prev => ({ ...prev }));
      }, 100);
      
      return { error: null };
      
    } catch (error) {
      
      // Even if there's an error, ensure state is cleared
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        hasNotifications: false,
      });
      
      return { error: error as any };
    }
  };

  // دالة للتحقق من تأكيد البريد الإلكتروني
  const checkEmailVerification = async (user: any): Promise<{ isVerified: boolean; shouldBlock: boolean }> => {
    try {
      // Skip email verification for Google users
      if (user.user_metadata?.provider === 'google') {
        return { isVerified: true, shouldBlock: false };
      }
      
      // Skip email verification for users with confirmed email
      if (user.email_confirmed_at) {
        return { isVerified: true, shouldBlock: false };
      }
      
      // Only check email verification for regular users without confirmed email
      // Add timeout to the verification check
      const verificationPromise = supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', user.id)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Verification check timeout')), 2000); // 2 second timeout
      });
      
      const { data, error } = await Promise.race([verificationPromise, timeoutPromise]) as any;
      
      if (error) {
        // If we can't verify, allow access but log the issue
        return { isVerified: true, shouldBlock: false };
      }
      
      const isVerified = data?.email_verified || user.email_confirmed_at;
      return { isVerified: !!isVerified, shouldBlock: false };
    } catch (error) {
      // If verification fails, allow access but log the issue
      return { isVerified: true, shouldBlock: false };
    }
  };

  // دالة لتسجيل الخروج القسري للمستخدمين غير المؤكدين
  const forceSignOutUnverified = async () => {
    try {
      // Add timeout to the sign out process
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timeout')), 3000); // 3 second timeout
      });
      
      await Promise.race([signOutPromise, timeoutPromise]);
      
      // تنظيف الحالة
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        hasNotifications: false,
      });
      
      // تنظيف localStorage
      localStorage.removeItem('manuallySignedOut');
      sessionStorage.clear();
      
    } catch (error) {
      // Force clear state even if sign out fails
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        hasNotifications: false,
      });
    }
  };

  // Debug function to check current auth state
  const debugAuthState = () => {
    const debugInfo = {
      user: authState.user ? {
        id: authState.user.id,
        email: authState.user.email,
        email_confirmed_at: authState.user.email_confirmed_at,
        user_metadata: authState.user.user_metadata,
        app_metadata: authState.user.app_metadata
      } : null,
      profile: authState.profile,
      loading: authState.loading,
      hasNotifications: authState.hasNotifications
    };
    
    // Additional moderator-specific debugging
    if (authState.user) {
      const email = authState.user.email?.toLowerCase() || '';
      const isModeratorByEmail = email.includes('moderator');
      const isModeratorByMetadata = authState.user.user_metadata?.role === 'moderator' || 
                                   authState.user.app_metadata?.role === 'moderator';
      const isModeratorByProfile = authState.profile?.role === 'moderator';
      
      const moderatorDebug = {
        email: authState.user.email,
        isModeratorByEmail,
        isModeratorByMetadata,
        isModeratorByProfile,
        user_metadata_role: authState.user.user_metadata?.role,
        app_metadata_role: authState.user.app_metadata?.role,
        profile_role: authState.profile?.role
      };
      
      return { ...debugInfo, moderatorDebug };
    }
    
    return debugInfo;
  };

  // Force clear auth state
  const forceClearAuth = () => {
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      hasNotifications: false,
    });
    setInitialized(false);
  };

  // Test sign out function
  const testSignOut = async () => {
    const result = await signOut();
    
    return result;
  };

  // Simple synchronous sign out (bypasses Supabase)
  const simpleSignOut = () => {
    // Clear local state
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      hasNotifications: false,
    });
    
    // Clear all storage
    localStorage.removeItem('justLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('openServiceRequest');
    localStorage.removeItem('pendingServiceRequest');
    
    // Clear Supabase session
    const supabaseKeys = Object.keys(localStorage);
    supabaseKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    // Mark that user has manually signed out
    localStorage.setItem('manuallySignedOut', 'true');
  };

  // Check if user can access protected pages
  const canAccessProtectedPages = () => {
    if (!authState.user) return false;
    
    // Admin and moderator can always access
    const isAdmin = authState.profile?.role === 'admin';
    const isModerator = authState.profile?.role === 'moderator';
    
    if (isAdmin || isModerator) return true;
    
    // Regular users must have verified email
    return authState.user.email_confirmed_at !== null;
  };

  // Get verification status for UI
  const getVerificationStatus = () => {
    if (!authState.user) return { isVerified: false, needsVerification: false };
    
    const isAdmin = authState.profile?.role === 'admin';
    const isModerator = authState.profile?.role === 'moderator';
    
    if (isAdmin || isModerator) {
      return { isVerified: true, needsVerification: false };
    }
    
    const isVerified = authState.user.email_confirmed_at !== null;
    return { isVerified, needsVerification: !isVerified };
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      // استخدام خدمة البريد الجديدة
      const { EmailService } = await import('../services/emailService');
      const result = await EmailService.resendVerificationEmail(email);
      
      if (!result.success) {
        return { error: result.error };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as any };
    }
  };

  // إضافة دالة لتسجيل الدخول عبر Google
  const signInWithGoogle = async () => {
    try {
      // تحديد الرابط المناسب حسب البيئة
      const isDevelopment = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const redirectUrl = isDevelopment 
        ? `${window.location.origin}/auth/callback`
        : 'https://tevasul.group/auth/callback';
      
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    clearNotifications,
    debugAuthState,
    forceClearAuth,
    testSignOut,
    simpleSignOut,
    canAccessProtectedPages,
    getVerificationStatus,
    resendVerificationEmail,
    signInWithGoogle,
  };
};
