import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeDropdown } from '@/components/shift/ThemeDropdown';
import type { Lang } from '@/types/shift';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/login';
import { Settings, LogOut } from 'lucide-react';
interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    variantIndex: number;
    setVariantIndex: (index: number) => void;
    lang: Lang;
    toggleLang: () => void;
    primaryColors: any;
}

export const Header = ({
    theme,
    setTheme,
    variantIndex,
    setVariantIndex,
    lang,
    toggleLang,
    primaryColors
}: HeaderProps) => {
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="w-full max-w-4xl sticky p-4 top-0 z-40 backdrop-blur-md bg-transparent/80">
            <div className="flex justify-between items-center">
                <h1 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", primaryColors.text)}>
                    Shomyn
                </h1>
                <div className="flex items-center gap-2">
                    <ThemeDropdown
                        theme={theme}
                        setTheme={setTheme}
                        variantIndex={variantIndex}
                        setVariantIndex={setVariantIndex}
                        toggleLang={toggleLang}
                        primaryColors={primaryColors}
                        lang={lang}
                    />
                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={cn(
                                    "flex items-center gap-2 rounded-full transition-all cursor-pointer",
                                    "sm:px-3 sm:py-1.5 sm:border sm:shadow-sm",
                                    theme === 'light'
                                        ? 'sm:bg-white/80 sm:border-gray-200 hover:bg-gray-50'
                                        : 'sm:bg-slate-800/80 sm:border-slate-700 hover:bg-slate-700'
                                )}
                            >
                                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {userName}
                                </span>
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="w-10 h-10 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-600"
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
                                    "absolute right-0 top-full mt-2  rounded-xl shadow-xl border overflow-hidden z-50",
                                    theme === 'light'
                                        ? 'bg-white border-gray-200'
                                        : 'bg-slate-800 border-slate-700'
                                )}>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            // Add settings navigation here
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-1 px-4 py-2 text-left transition-colors",
                                            theme === 'light'
                                                ? 'hover:bg-gray-100 text-gray-700'
                                                : 'hover:bg-slate-700 text-gray-200'
                                        )}
                                    >
                                        <Settings size={18} />
                                        <span className="font-medium">Settings</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className={cn(
                                            "w-full flex items-center gap-1 px-4 py-2 text-left transition-colors",
                                            "text-red-600 dark:text-red-400",
                                            theme === 'light'
                                                ? 'hover:bg-red-50'
                                                : 'hover:bg-red-900/20'
                                        )}
                                    >
                                        <LogOut size={18} />
                                        <span className="font-medium">Logout</span>
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
