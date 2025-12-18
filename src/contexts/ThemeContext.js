import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from '@/constants';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('light');
    const [variantIndex, setVariantIndexState] = useState(0);
    const [lang, setLangState] = useState('jp');
    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.theme) {
                    setThemeState(data.theme);
                    document.documentElement.classList.toggle('dark', data.theme === 'dark');
                }
                if (data.variantIndex !== undefined)
                    setVariantIndexState(data.variantIndex);
                if (data.lang)
                    setLangState(data.lang);
            }
            catch (e) {
                console.warn('Failed to parse theme data');
            }
        }
    }, []);
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        saveToStorage({ theme: newTheme, variantIndex, lang });
    };
    const setVariantIndex = (index) => {
        setVariantIndexState(index);
        saveToStorage({ theme, variantIndex: index, lang });
    };
    const setLang = (newLang) => {
        setLangState(newLang);
        saveToStorage({ theme, variantIndex, lang: newLang });
    };
    const saveToStorage = (themeData) => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const data = saved ? JSON.parse(saved) : {};
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...data, ...themeData }));
    };
    return (_jsx(ThemeContext.Provider, { value: {
            theme,
            variantIndex,
            lang,
            setTheme,
            setVariantIndex,
            setLang
        }, children: children }));
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
