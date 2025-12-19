import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { THEME_VARIANTS } from '@/constants/themes';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
import type { Lang } from '@/types/shift';

interface ThemeContextType {
  theme: 'light' | 'dark';
  variantIndex: number;
  lang: Lang;
  setTheme: (theme: 'light' | 'dark') => void;
  setVariantIndex: (index: number) => void;
  setLang: (lang: Lang) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [variantIndex, setVariantIndexState] = useState(0);
  const [lang, setLangState] = useState<Lang>('jp');

  useEffect(() => {
    const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS);
    if (data) {
      if (data.theme) {
        setThemeState(data.theme);
        document.documentElement.classList.toggle('dark', data.theme === 'dark');
      }
      if (data.variantIndex !== undefined) setVariantIndexState(data.variantIndex);
      if (data.lang) setLangState(data.lang);
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    try {
      setThemeState(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      saveToStorage({ theme: newTheme, variantIndex, lang });
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  const setVariantIndex = (index: number) => {
    try {
      if (index < 0 || index >= THEME_VARIANTS.length) {
        console.error('Invalid variant index:', index);
        return;
      }
      setVariantIndexState(index);
      saveToStorage({ theme, variantIndex: index, lang });
    } catch (error) {
      console.error('Failed to set variant index:', error);
    }
  };

  const setLang = (newLang: Lang) => {
    try {
      setLangState(newLang);
      saveToStorage({ theme, variantIndex, lang: newLang });
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  };

  const saveToStorage = (themeData: { theme: 'light' | 'dark'; variantIndex: number; lang: Lang }) => {
    try {
      const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS) || {};
      setItemToLocalStorage(STORAGE_KEYS.SHIFTS, { ...data, ...themeData });
    } catch (error) {
      console.error('Failed to save theme data to storage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      variantIndex,
      lang,
      setTheme,
      setVariantIndex,
      setLang
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}