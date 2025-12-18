import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Lang } from '@/types/shift';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/login';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import { fetchUserData } from '@/services/user';

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
            window.location.href = '/login';
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

    const handleFetchUserData = async () => {
        if (!user?.id) return console.log("no user id");
        try {
            const data = await fetchUserData(user.id);
            if (data) {
                localStorage.setItem('userData', JSON.stringify(data));
                setUserBalance(data?.balance)
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <header className="w-full max-w-4xl sticky p-4 top-0 z-40 backdrop-blur-md bg-transparent/80">
            <div className="flex justify-between items-center">
                <h1 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", primaryColors.text)}>
                    Shomyn
                </h1>
                <div className="flex items-center gap-2">
                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={cn(
                                    "flex items-center p-1 pl-4 gap-2 rounded-full transition-all cursor-pointer",
                                    " shadow-sm",
                                    theme === 'light'
                                        ? 'bg-white/80  hover:bg-gray-50'
                                        : 'bg-slate-800/80  hover:bg-slate-700'
                                )}
                            >
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    ¥{userBalance.toLocaleString()}
                                </span>
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="w-10 h-10  rounded-full border-2 border-white dark:border-slate-600"
                                    />
                                ) : (
                                    <div className={cn(
                                        "w-10 h-10 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold",
                                        "text-sm sm:text-xs",
                                        primaryColors.bgGradient
                                    )}>
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {isDropdownOpen && (
                                <div className={cn(
                                    "absolute right-0 top-full mt-2 min-w-40 rounded-xl shadow-xl border overflow-hidden z-50",
                                    theme === 'light'
                                        ? 'bg-white border-gray-200'
                                        : 'bg-slate-800 border-slate-700'
                                )}>
                                    <div className={cn(
                                        "px-4 py-3 border-b",
                                        theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                                    )}>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
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
                </div>
            </div>
        </header>
    );
};
