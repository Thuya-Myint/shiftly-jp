import { createContext, useContext, useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from '@/constants';
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
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.theme) {
          setThemeState(data.theme);
          document.documentElement.classList.toggle('dark', data.theme === 'dark');
        }
        if (data.variantIndex !== undefined) setVariantIndexState(data.variantIndex);
        if (data.lang) setLangState(data.lang);
      } catch (e) {
        console.warn('Failed to parse theme data');
      }
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    saveToStorage({ theme: newTheme, variantIndex, lang });
  };

  const setVariantIndex = (index: number) => {
    setVariantIndexState(index);
    saveToStorage({ theme, variantIndex: index, lang });
  };

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    saveToStorage({ theme, variantIndex, lang: newLang });
  };

  const saveToStorage = (themeData: { theme: 'light' | 'dark'; variantIndex: number; lang: Lang }) => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : {};
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...data, ...themeData }));
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