import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { THEME_VARIANTS } from '@/constants/themes';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
import type { Lang } from '@/types/shift';

export type ChartRange = 'weekly' | 'monthly';
export type ChartStyle = 'line' | 'bar' | 'pie';

interface ThemeContextType {
  theme: 'light' | 'dark';
  variantIndex: number;
  lang: Lang;

  chartRange: ChartRange;
  chartStyle: ChartStyle;
  setChartRange: (range: ChartRange) => void;
  setChartStyle: (style: ChartStyle) => void;

  setTheme: (theme: 'light' | 'dark') => void;
  setVariantIndex: (index: number) => void;
  setLang: (lang: Lang) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [variantIndex, setVariantIndexState] = useState(0);
  const [lang, setLangState] = useState<Lang>('jp');

  const [chartRange, setChartRangeState] = useState<ChartRange>('weekly');
  const [chartStyle, setChartStyleState] = useState<ChartStyle>('line');

  useEffect(() => {
    const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS);
    if (data) {
      if (data.theme) {
        setThemeState(data.theme);
        document.documentElement.classList.toggle('dark', data.theme === 'dark');
      }
      if (data.variantIndex !== undefined) setVariantIndexState(data.variantIndex);
      if (data.lang) setLangState(data.lang);

      if (data.chartRange === 'weekly' || data.chartRange === 'monthly') {
        setChartRangeState(data.chartRange);
      }
      if (data.chartStyle === 'line' || data.chartStyle === 'bar' || data.chartStyle === 'pie') {
        setChartStyleState(data.chartStyle);
      }
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    try {
      setThemeState(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      saveToStorage({ theme: newTheme, variantIndex, lang, chartRange, chartStyle });
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
      saveToStorage({ theme, variantIndex: index, lang, chartRange, chartStyle });
    } catch (error) {
      console.error('Failed to set variant index:', error);
    }
  };

  const setLang = (newLang: Lang) => {
    try {
      setLangState(newLang);
      saveToStorage({ theme, variantIndex, lang: newLang, chartRange, chartStyle });
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  };

  const saveToStorage = (themeData: {
    theme: 'light' | 'dark';
    variantIndex: number;
    lang: Lang;
    chartRange: ChartRange;
    chartStyle: ChartStyle;
  }) => {
    try {
      const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS) || {};
      setItemToLocalStorage(STORAGE_KEYS.SHIFTS, { ...data, ...themeData });
    } catch (error) {
      console.error('Failed to save theme data to storage:', error);
    }
  };

  const setChartRange = (range: ChartRange) => {
    setChartRangeState(range);
    saveToStorage({ theme, variantIndex, lang, chartRange: range, chartStyle });
  };

  const setChartStyle = (style: ChartStyle) => {
    setChartStyleState(style);
    saveToStorage({ theme, variantIndex, lang, chartRange, chartStyle: style });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      variantIndex,
      lang,

      chartRange,
      chartStyle,
      setChartRange,
      setChartStyle,

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
