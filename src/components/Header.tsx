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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userBalance, setUserBalance] = useState(0)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;


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
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Balance pill (no dropdown) */}
              <div
                className={cn(
                  "flex items-center px-3 sm:px-4 py-2 rounded-xl",
                  "shadow-lg border",
                  theme === 'light'
                    ? 'bg-white border-gray-100'
                    : 'bg-slate-900 border-white/5'
                )}
              >
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                    BALANCE
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 leading-none">
                    ¥{userBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* User avatar -> go Settings */}
              <button
                onClick={() => navigate('/settings')}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 shadow-sm",
                  theme === 'light' ? 'border-white' : 'border-white/10'
                )}
                aria-label="Open settings"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center text-white font-bold",
                    primaryColors.bgGradient
                  )}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Desktop logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "hidden sm:flex items-center justify-center",
                  "p-2 rounded-xl border-2 transition-colors",
                  "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400",
                  theme === 'light' ? 'bg-white hover:bg-red-50' : 'bg-slate-800 hover:bg-red-900/20',
                  isLoggingOut && 'opacity-70 cursor-not-allowed'
                )}
                aria-label={lang === 'en' ? 'Logout' : 'ログアウト'}
              >
                {isLoggingOut ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}
              </button>
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
