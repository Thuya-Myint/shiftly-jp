import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { LOCAL_STORAGE_KEY } from '@/constants';
import { saveToIndexedDB } from '@/utils/storage';
import type { Lang } from '@/types/shift';

export default function Settings() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [variantIndex, setVariantIndex] = useState(0);
    const [lang, setLang] = useState<Lang>('jp');

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            setTheme(data.theme || 'light');
            setVariantIndex(data.variantIndex || 0);
            setLang(data.lang || 'jp');
        }
    }, []);

    const saveSettings = async (newTheme: 'light' | 'dark', newVariantIndex: number, newLang: Lang) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const data = saved ? JSON.parse(saved) : {};
        const updatedData = { ...data, theme: newTheme, variantIndex: newVariantIndex, lang: newLang };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
        saveToIndexedDB('appData', updatedData).catch(console.warn);
        
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        saveSettings(newTheme, variantIndex, lang);
    };

    const handleVariantChange = (index: number) => {
        setVariantIndex(index);
        saveSettings(theme, index, lang);
    };

    const handleLangChange = (newLang: Lang) => {
        setLang(newLang);
        saveSettings(theme, variantIndex, newLang);
    };

    const primaryColors = getPrimaryColorClasses(variantIndex, theme);
    const themeVariant = THEME_VARIANTS[variantIndex];
    const appClasses = theme === 'light' ? themeVariant.light : themeVariant.dark;

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

                <div className="space-y-6">
                    {/* Language */}
                    <div className={cn(
                        "p-4 rounded-xl border",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                            {lang === 'en' ? 'Language' : '言語'}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleLangChange('en')}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-colors",
                                    lang === 'en'
                                        ? cn(primaryColors.bgGradient, "text-white")
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                English
                            </button>
                            <button
                                onClick={() => handleLangChange('jp')}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-colors",
                                    lang === 'jp'
                                        ? cn(primaryColors.bgGradient, "text-white")
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                日本語
                            </button>
                        </div>
                    </div>

                    {/* Theme Mode */}
                    <div className={cn(
                        "p-4 rounded-xl border",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                            {lang === 'en' ? 'Theme Mode' : 'テーマモード'}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                    theme === 'light'
                                        ? cn(primaryColors.bgGradient, "text-white")
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                <Sun size={16} />
                                {lang === 'en' ? 'Light' : 'ライト'}
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                    theme === 'dark'
                                        ? cn(primaryColors.bgGradient, "text-white")
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                <Moon size={16} />
                                {lang === 'en' ? 'Dark' : 'ダーク'}
                            </button>
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div className={cn(
                        "p-4 rounded-xl border",
                        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
                    )}>
                        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                            <Palette size={20} />
                            {lang === 'en' ? 'Color Palette' : 'カラーパレット'}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {THEME_VARIANTS.map((variant, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleVariantChange(index)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg transition-colors border-2",
                                        index === variantIndex
                                            ? cn(primaryColors.border, primaryColors.bgLight + '/20 dark:' + primaryColors.bgDark + '/20')
                                            : "border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
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
                </div>
            </div>
        </div>
    );
}