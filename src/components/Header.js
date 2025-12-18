import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/login';
import { Settings, LogOut, Loader2 } from 'lucide-react';
export const Header = ({ theme, lang, primaryColors }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef(null);
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
        }
        catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };
    return (_jsx("header", { className: "w-full max-w-4xl sticky p-4 top-0 z-40 backdrop-blur-md bg-transparent/80", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: cn("text-2xl sm:text-3xl font-extrabold tracking-tight", primaryColors.text), children: "Shomyn" }), _jsx("div", { className: "flex items-center gap-2", children: user && (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: cn("flex items-center gap-2 rounded-full transition-all cursor-pointer", "sm:px-3 sm:py-1.5 sm:border sm:shadow-sm", theme === 'light'
                                    ? 'sm:bg-white/80 sm:border-gray-200 hover:bg-gray-50'
                                    : 'sm:bg-slate-800/80 sm:border-slate-700 hover:bg-slate-700'), children: [_jsx("span", { className: "hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200", children: userName }), userAvatar ? (_jsx("img", { src: userAvatar, alt: userName, className: "w-10 h-10 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-600" })) : (_jsx("div", { className: cn("w-10 h-10 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold", "text-sm sm:text-xs", primaryColors.bgGradient), children: userName.charAt(0).toUpperCase() }))] }), isDropdownOpen && (_jsxs("div", { className: cn("absolute right-0 top-full mt-2 min-w-[160px] rounded-xl shadow-xl border overflow-hidden z-50", theme === 'light'
                                    ? 'bg-white border-gray-200'
                                    : 'bg-slate-800 border-slate-700'), children: [_jsxs("button", { onClick: () => {
                                            setIsDropdownOpen(false);
                                            navigate('/settings');
                                        }, className: cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors", theme === 'light'
                                            ? 'hover:bg-gray-100 text-gray-700'
                                            : 'hover:bg-slate-700 text-gray-200'), children: [_jsx(Settings, { size: 18 }), _jsx("span", { className: "font-medium", children: lang === 'en' ? 'Settings' : '設定' })] }), _jsx("div", { className: cn("h-px", theme === 'light' ? 'bg-gray-200' : 'bg-slate-700') }), _jsxs("button", { onClick: handleLogout, disabled: isLoggingOut, className: cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors", "text-red-600 dark:text-red-400", theme === 'light'
                                            ? 'hover:bg-red-50'
                                            : 'hover:bg-red-900/20', isLoggingOut && 'opacity-70 cursor-not-allowed'), children: [isLoggingOut ? (_jsx(Loader2, { size: 18, className: "animate-spin" })) : (_jsx(LogOut, { size: 18 })), _jsx("span", { className: "font-medium", children: isLoggingOut
                                                    ? (lang === 'en' ? 'Signing out...' : 'ログアウト中...')
                                                    : (lang === 'en' ? 'Logout' : 'ログアウト') })] })] }))] })) })] }) }));
};
