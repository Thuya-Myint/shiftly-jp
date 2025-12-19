import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { THEME_VARIANTS } from '@/constants/themes';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('light');
    const [variantIndex, setVariantIndexState] = useState(0);
    const [lang, setLangState] = useState('jp');
    useEffect(() => {
        const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS);
        if (data) {
            if (data.theme) {
                setThemeState(data.theme);
                document.documentElement.classList.toggle('dark', data.theme === 'dark');
            }
            if (data.variantIndex !== undefined)
                setVariantIndexState(data.variantIndex);
            if (data.lang)
                setLangState(data.lang);
        }
    }, []);
    const setTheme = (newTheme) => {
        try {
            setThemeState(newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            saveToStorage({ theme: newTheme, variantIndex, lang });
        }
        catch (error) {
            console.error('Failed to set theme:', error);
        }
    };
    const setVariantIndex = (index) => {
        try {
            if (index < 0 || index >= THEME_VARIANTS.length) {
                console.error('Invalid variant index:', index);
                return;
            }
            setVariantIndexState(index);
            saveToStorage({ theme, variantIndex: index, lang });
        }
        catch (error) {
            console.error('Failed to set variant index:', error);
        }
    };
    const setLang = (newLang) => {
        try {
            setLangState(newLang);
            saveToStorage({ theme, variantIndex, lang: newLang });
        }
        catch (error) {
            console.error('Failed to set language:', error);
        }
    };
    const saveToStorage = (themeData) => {
        try {
            const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS) || {};
            setItemToLocalStorage(STORAGE_KEYS.SHIFTS, { ...data, ...themeData });
        }
        catch (error) {
            console.error('Failed to save theme data to storage:', error);
        }
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
