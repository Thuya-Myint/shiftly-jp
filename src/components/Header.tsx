import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Lang } from '@/types/shift';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/login';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import { fetchUserData } from '@/services/user';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
import { STORAGE_KEYS } from '@/constants';

interface HeaderProps {
  theme: 'light' | 'dark';
  lang: Lang;
  primaryColors: any;
}

export const Header = ({
  theme,
  lang,
  primaryColors
}: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userBalance, setUserBalance] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (user) {
      handleFetchUserData();
    }
  }, [user])

  useEffect(() => {
    const userData = getItemFromLocalStorage(STORAGE_KEYS.USER_DATA);
    if (userData?.balance !== undefined) {
      setUserBalance(userData.balance);
    }
  }, []);

  const handleFetchUserData = async () => {
    if (!user?.id) return;

    try {
      const data = await fetchUserData(user.id);
      if (data) {
        setItemToLocalStorage(STORAGE_KEYS.USER_DATA, data);
        setUserBalance(data?.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }

  return (
    <header className="w-full max-w-4xl sticky p-3 sm:p-6 top-0 z-40 backdrop-blur-xl bg-transparent/60">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className={cn("text-xl sm:text-3xl font-bold tracking-tight leading-none", primaryColors.text)}>
            SHOMYN
          </h1>
          <div className={cn("h-1 w-8 rounded-full mt-1.5", primaryColors.bg)} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "flex items-center p-1 sm:p-1.5 pl-3 sm:pl-4 gap-2 sm:gap-3 rounded-xl cursor-pointer",
                  "shadow-lg border",
                  isDropdownOpen
                    ? theme === 'light'
                      ? 'bg-white border-gray-200 ring-4 ring-gray-50'
                      : 'bg-slate-900 border-white/10 ring-4 ring-white/5'
                    : theme === 'light'
                      ? 'bg-white border-gray-100'
                      : 'bg-slate-900 border-white/5'
                )}
              >
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-0.5">BALANCE</span>
                  <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 leading-none">
                    ¥{userBalance.toLocaleString()}
                  </span>
                </div>
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 border-white dark:border-white/10 shadow-sm object-cover"
                  />
                ) : (
                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white font-bold",
                    "text-sm sm:text-base",
                    primaryColors.bgGradient
                  )}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className={cn(
                  "absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50",
                  theme === 'light'
                    ? 'bg-white border-gray-200'
                    : 'bg-slate-800 border-slate-700'
                )}>
                  <div className={cn(
                    "px-4 py-3 border-b flex items-center gap-3 min-w-0",
                    theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                  )}>
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-slate-600 flex-shrink-0"
                      />
                    ) : (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                        primaryColors.bgGradient
                      )}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm leading-tight">
                      {userName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      theme === 'light'
                        ? 'hover:bg-gray-100 text-gray-700'
                        : 'hover:bg-slate-700 text-gray-200'
                    )}
                  >
                    <Settings size={18} />
                    <span className="font-medium">{lang === 'en' ? 'Settings' : '設定'}</span>
                  </button>
                  <div className={cn(
                    "h-px",
                    theme === 'light' ? 'bg-gray-200' : 'bg-slate-700'
                  )} />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      "text-red-600 dark:text-red-400",
                      theme === 'light'
                        ? 'hover:bg-red-50'
                        : 'hover:bg-red-900/20',
                      isLoggingOut && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {isLoggingOut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogOut size={18} />
                    )}
                    <span className="font-medium">
                      {isLoggingOut
                        ? (lang === 'en' ? 'Signing out...' : 'ログアウト中...')
                        : (lang === 'en' ? 'Logout' : 'ログアウト')
                      }
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile-friendly logout button for PWA */}
          {user && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "sm:hidden p-2 rounded-xl border-2 transition-colors",
                "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400",
                theme === 'light' ? 'bg-white hover:bg-red-50' : 'bg-slate-800 hover:bg-red-900/20',
                isLoggingOut && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoggingOut ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogOut size={20} />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
