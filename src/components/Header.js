import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/login';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import { fetchUserData } from '@/services/user';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
import { STORAGE_KEYS } from '@/constants';
export const Header = ({ theme, lang, primaryColors }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
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
        }
        catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };
    useEffect(() => {
        if (user) {
            handleFetchUserData();
        }
    }, [user]);
    useEffect(() => {
        const userData = getItemFromLocalStorage(STORAGE_KEYS.USER_DATA);
        if (userData?.balance !== undefined) {
            setUserBalance(userData.balance);
        }
    }, []);
    const handleFetchUserData = async () => {
        if (!user?.id)
            return;
        try {
            const data = await fetchUserData(user.id);
            if (data) {
                setItemToLocalStorage(STORAGE_KEYS.USER_DATA, data);
                setUserBalance(data?.balance || 0);
            }
        }
        catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };
    return (_jsx("header", { className: "w-full max-w-4xl sticky p-4 top-0 z-40 backdrop-blur-md bg-transparent/80", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: cn("text-2xl sm:text-3xl font-extrabold tracking-tight", primaryColors.text), children: "Shomyn" }), _jsxs("div", { className: "flex items-center gap-2", children: [user && (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: cn("flex items-center p-1 pl-4 gap-2 rounded-full transition-all cursor-pointer", " shadow-sm", isDropdownOpen
                                        ? theme === 'light'
                                            ? 'bg-gray-100 ring-2 ring-blue-500/20'
                                            : 'bg-slate-700 ring-2 ring-blue-400/20'
                                        : theme === 'light'
                                            ? 'bg-white/80 hover:bg-gray-50'
                                            : 'bg-slate-800/80 hover:bg-slate-700'), children: [_jsxs("span", { className: "text-sm font-bold text-green-600 dark:text-green-400", children: ["\u00A5", userBalance.toLocaleString()] }), userAvatar ? (_jsx("img", { src: userAvatar, alt: userName, className: "w-10 h-10  rounded-full border-2 border-white dark:border-slate-600" })) : (_jsx("div", { className: cn("w-10 h-10 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold", "text-sm sm:text-xs", primaryColors.bgGradient), children: userName.charAt(0).toUpperCase() }))] }), isDropdownOpen && (_jsxs("div", { className: cn("absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50", theme === 'light'
                                        ? 'bg-white border-gray-200'
                                        : 'bg-slate-800 border-slate-700'), children: [_jsxs("div", { className: cn("px-4 py-3 border-b flex items-center gap-3 min-w-0", theme === 'light' ? 'border-gray-200' : 'border-slate-700'), children: [userAvatar ? (_jsx("img", { src: userAvatar, alt: userName, className: "w-8 h-8 rounded-full border border-gray-300 dark:border-slate-600 flex-shrink-0" })) : (_jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0", primaryColors.bgGradient), children: userName.charAt(0).toUpperCase() })), _jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100 truncate text-sm leading-tight", children: userName })] }), _jsxs("button", { onClick: () => {
                                                setIsDropdownOpen(false);
                                                navigate('/settings');
                                            }, className: cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors", theme === 'light'
                                                ? 'hover:bg-gray-100 text-gray-700'
                                                : 'hover:bg-slate-700 text-gray-200'), children: [_jsx(Settings, { size: 18 }), _jsx("span", { className: "font-medium", children: lang === 'en' ? 'Settings' : '設定' })] }), _jsx("div", { className: cn("h-px", theme === 'light' ? 'bg-gray-200' : 'bg-slate-700') }), _jsxs("button", { onClick: handleLogout, disabled: isLoggingOut, className: cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors", "text-red-600 dark:text-red-400", theme === 'light'
                                                ? 'hover:bg-red-50'
                                                : 'hover:bg-red-900/20', isLoggingOut && 'opacity-70 cursor-not-allowed'), children: [isLoggingOut ? (_jsx(Loader2, { size: 18, className: "animate-spin" })) : (_jsx(LogOut, { size: 18 })), _jsx("span", { className: "font-medium", children: isLoggingOut
                                                        ? (lang === 'en' ? 'Signing out...' : 'ログアウト中...')
                                                        : (lang === 'en' ? 'Logout' : 'ログアウト') })] })] }))] })), user && (_jsx("button", { onClick: handleLogout, disabled: isLoggingOut, className: cn("sm:hidden p-2 rounded-xl border-2 transition-colors", "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400", theme === 'light' ? 'bg-white hover:bg-red-50' : 'bg-slate-800 hover:bg-red-900/20', isLoggingOut && 'opacity-70 cursor-not-allowed'), children: isLoggingOut ? (_jsx(Loader2, { size: 20, className: "animate-spin" })) : (_jsx(LogOut, { size: 20 })) }))] })] }) }));
};
