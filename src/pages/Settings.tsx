import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Sun, Moon, ChevronDown, Languages, Monitor, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, variantIndex, lang, setTheme, setVariantIndex, setLang } = useTheme();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [userBalance, setUserBalance] = useState(0);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const data = JSON.parse(userData);
            setUserBalance(data?.balance || 0);
        }
    }, []);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    const primaryColors = getPrimaryColorClasses(variantIndex, theme);
    const themeVariant = THEME_VARIANTS[variantIndex];
    const appClasses = theme === 'light' ? themeVariant.light : themeVariant.dark;

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className={cn("min-h-screen", appClasses)}>
            <div className="max-w-2xl mx-auto p-4">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/shifts')}
                        className={cn(
                            "p-2 rounded-xl border-2 transition-colors",
                            primaryColors.border,
                            theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-slate-800 hover:bg-slate-700'
                        )}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className={cn("text-2xl font-bold", primaryColors.text)}>
                        {lang === 'en' ? 'Settings' : '設定'}
                    </h1>
                </div>

                <div className="space-y-4">
                    {/* User Information */}
                    <div className={cn(
                        "rounded-xl border overflow-hidden",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <button
                            onClick={() => toggleSection('user')}
                            className={cn(
                                "w-full flex items-center justify-between p-4 text-left transition-colors",
                                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-slate-700'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <User size={20} className={primaryColors.text} />
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {lang === 'en' ? 'User Information' : 'ユーザー情報'}
                                </span>
                            </div>
                            <ChevronDown 
                                size={20} 
                                className={cn(
                                    "transition-transform text-gray-500",
                                    expandedSection === 'user' && 'rotate-180'
                                )} 
                            />
                        </button>
                        {expandedSection === 'user' && (
                            <div className={cn(
                                "p-4 border-t",
                                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                            )}>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt={userName}
                                                className="w-16 h-16 rounded-full border-2 border-white dark:border-slate-600"
                                            />
                                        ) : (
                                            <div className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl",
                                                primaryColors.bgGradient
                                            )}>
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg",
                                            theme === 'light' ? 'bg-white' : 'bg-slate-600'
                                        )}>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {lang === 'en' ? 'Login Method' : 'ログイン方法'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                                <span className="font-medium text-gray-900 dark:text-white">Google</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-lg",
                                            theme === 'light' ? 'bg-white' : 'bg-slate-600'
                                        )}>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {lang === 'en' ? 'Balance' : '残高'}
                                            </p>
                                            <p className="font-bold text-green-600 dark:text-green-400">
                                                ¥{userBalance.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Language */}
                    <div className={cn(
                        "rounded-xl border overflow-hidden",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <button
                            onClick={() => toggleSection('language')}
                            className={cn(
                                "w-full flex items-center justify-between p-4 text-left transition-colors",
                                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-slate-700'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Languages size={20} className={primaryColors.text} />
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {lang === 'en' ? 'Language' : '言語'}
                                </span>
                            </div>
                            <ChevronDown 
                                size={20} 
                                className={cn(
                                    "transition-transform text-gray-500",
                                    expandedSection === 'language' && 'rotate-180'
                                )} 
                            />
                        </button>
                        {expandedSection === 'language' && (
                            <div className={cn(
                                "p-4 border-t",
                                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                            )}>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setLang('en')}
                                        className={cn(
                                            "px-4 py-2 rounded-lg font-medium transition-colors",
                                            lang === 'en'
                                                ? cn(primaryColors.bgGradient, "text-white")
                                                : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLang('jp')}
                                        className={cn(
                                            "px-4 py-2 rounded-lg font-medium transition-colors",
                                            lang === 'jp'
                                                ? cn(primaryColors.bgGradient, "text-white")
                                                : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        日本語
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theme Mode */}
                    <div className={cn(
                        "rounded-xl border overflow-hidden",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <button
                            onClick={() => toggleSection('theme')}
                            className={cn(
                                "w-full flex items-center justify-between p-4 text-left transition-colors",
                                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-slate-700'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Monitor size={20} className={primaryColors.text} />
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {lang === 'en' ? 'Appearance' : 'テーマ'}
                                </span>
                            </div>
                            <ChevronDown 
                                size={20} 
                                className={cn(
                                    "transition-transform text-gray-500",
                                    expandedSection === 'theme' && 'rotate-180'
                                )} 
                            />
                        </button>
                        {expandedSection === 'theme' && (
                            <div className={cn(
                                "p-4 border-t",
                                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                            )}>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                            theme === 'light'
                                                ? cn(primaryColors.bgGradient, "text-white")
                                                : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <Sun size={16} />
                                        {lang === 'en' ? 'Light' : 'ライト'}
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                            theme === 'dark'
                                                ? cn(primaryColors.bgGradient, "text-white")
                                                : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <Moon size={16} />
                                        {lang === 'en' ? 'Dark' : 'ダーク'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Color Palette */}
                    <div className={cn(
                        "rounded-xl border overflow-hidden",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <button
                            onClick={() => toggleSection('colors')}
                            className={cn(
                                "w-full flex items-center justify-between p-4 text-left transition-colors",
                                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-slate-700'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Palette size={20} className={primaryColors.text} />
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {lang === 'en' ? 'Color Palette' : 'カラーパレット'}
                                </span>
                            </div>
                            <ChevronDown 
                                size={20} 
                                className={cn(
                                    "transition-transform text-gray-500",
                                    expandedSection === 'colors' && 'rotate-180'
                                )} 
                            />
                        </button>
                        {expandedSection === 'colors' && (
                            <div className={cn(
                                "p-4 border-t",
                                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
                            )}>
                                <div className="grid grid-cols-2 gap-3">
                                    {THEME_VARIANTS.map((variant, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setVariantIndex(index)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg transition-colors border-2",
                                                index === variantIndex
                                                    ? cn(primaryColors.border, primaryColors.bgLight + '/20 dark:' + primaryColors.bgDark + '/20')
                                                    : "border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                                            )}
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {variant.name}
                                            </span>
                                            <div className="flex gap-1">
                                                <div className={cn("w-4 h-4 rounded-full", variant.lightPreview)} />
                                                <div className={cn("w-4 h-4 rounded-full", variant.darkPreview)} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}