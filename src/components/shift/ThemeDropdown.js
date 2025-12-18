import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_VARIANTS } from '@/constants/themes';
export function ThemeDropdown({ theme, setTheme, variantIndex, setVariantIndex, toggleLang, primaryColors, lang }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const isLight = theme === 'light';
    const frostedGlassClasses = "backdrop-blur-md border shadow-sm transition-colors bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700";
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);
    const handleSelectVariant = useCallback((index) => {
        setVariantIndex(index);
        setIsOpen(false);
    }, [setVariantIndex]);
    const [isThemeChanging, setIsThemeChanging] = useState(false);
    const handleToggleTheme = useCallback(async (newTheme) => {
        setIsThemeChanging(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setTheme(newTheme);
        setIsOpen(false);
        setIsThemeChanging(false);
    }, [setTheme]);
    const handleThemeIconClick = () => setIsOpen(prev => !prev);
    return (_jsxs("div", { className: "relative flex gap-2", ref: dropdownRef, children: [_jsx(motion.button, { onClick: handleThemeIconClick, whileTap: { scale: 0.95 }, className: cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200", frostedGlassClasses), "aria-label": "Change theme", children: isThemeChanging ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 0.5, ease: "linear", repeat: Infinity }, className: "w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" })) : (_jsx(motion.div, { initial: { scale: 0, rotate: -180 }, animate: { scale: 1, rotate: 0 }, transition: { duration: 0.2, ease: "easeInOut" }, children: isLight ? _jsx(Sun, { size: 18, className: "text-orange-500" }) : _jsx(Moon, { size: 18, className: "text-indigo-400" }) }, isLight ? 'sun' : 'moon')) }), _jsx(motion.button, { onClick: toggleLang, whileTap: { scale: 0.95 }, className: cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer", frostedGlassClasses), "aria-label": "Toggle language", children: _jsx("span", { className: cn("text-sm font-bold", primaryColors.text), children: lang.toUpperCase() }) }), isOpen && (_jsxs("div", { className: cn(`absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-xl p-3 sm:p-4 origin-top-right shadow-xl ring-1 ring-gray-950/5 dark:ring-white/10`, isLight ? 'bg-white' : 'bg-slate-950', 'z-[9999]'), children: [_jsxs("div", { className: `flex justify-between items-center mb-3 p-1 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}  `, children: [_jsxs(motion.button, { onClick: () => handleToggleTheme('light'), disabled: isThemeChanging, className: cn("flex-1 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors", isLight
                                    ? 'bg-white shadow-md text-slate-800'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-100', isThemeChanging && 'opacity-50 cursor-not-allowed'), children: [isThemeChanging ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 0.5, ease: "linear", repeat: Infinity }, className: "inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-1" })) : (_jsx(Sun, { size: 16, className: "inline mr-1" })), " Light"] }), _jsxs(motion.button, { onClick: () => handleToggleTheme('dark'), disabled: isThemeChanging, className: cn("flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer font-medium transition-colors", !isLight
                                    ? 'bg-slate-700 shadow-md text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800', isThemeChanging && 'opacity-50 cursor-not-allowed'), children: [isThemeChanging ? (_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 0.5, ease: "linear", repeat: Infinity }, className: "inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-1" })) : (_jsx(Moon, { size: 16, className: "inline mr-1" })), " Dark"] })] }), _jsx("h3", { className: "text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2 px-1", children: "Color Palette" }), _jsx("div", { className: "space-y-0 flex flex-col p-2 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent", children: THEME_VARIANTS.map((variant, index) => (_jsxs("div", { onClick: () => handleSelectVariant(index), className: cn("flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all", index === variantIndex
                                ? cn(primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark, "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900", primaryColors.ring)
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800'), children: [_jsx("span", { className: cn("text-sm font-medium", isLight ? 'text-gray-900' : 'text-white'), children: variant.name }), _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.lightPreview) }), _jsx("div", { className: cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.darkPreview) })] })] }, index))) })] }))] }));
}
