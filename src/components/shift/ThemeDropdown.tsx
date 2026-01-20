import { useState, useRef, useEffect, useCallback } from 'react';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import type { Lang } from '@/types/shift';

export function ThemeDropdown({ theme, setTheme, variantIndex, setVariantIndex, toggleLang, primaryColors, lang }: {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  variantIndex: number;
  setVariantIndex: (index: number) => void;
  toggleLang: () => void;
  primaryColors: ReturnType<typeof getPrimaryColorClasses>;
  lang: Lang;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';
  const frostedGlassClasses = "backdrop-blur-2xl border shadow-2xl bg-white/10 dark:bg-slate-900/40 border-white/10";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelectVariant = useCallback((index: number) => {
    setVariantIndex(index);
    setIsOpen(false);
  }, [setVariantIndex]);

  const [isThemeChanging, setIsThemeChanging] = useState(false);

  const handleToggleTheme = useCallback(async (newTheme: 'light' | 'dark') => {
    setIsThemeChanging(true);
    // Small delay for snappiness without long animation
    await new Promise(resolve => setTimeout(resolve, 100));
    setTheme(newTheme);
    setIsOpen(false);
    setIsThemeChanging(false);
  }, [setTheme]);

  const handleThemeIconClick = () => setIsOpen(prev => !prev);

  return (
    <div className="relative flex gap-2" ref={dropdownRef}>
      <button
        onClick={handleThemeIconClick}
        className={cn("h-10 w-10 p-0 flex items-center justify-center rounded-xl cursor-pointer active:scale-95", frostedGlassClasses)}
        aria-label="Change theme"
      >
        {isThemeChanging ? (
          <Loader2 size={18} className="animate-spin text-gray-400" />
        ) : (
          <div>
            {isLight ? <Sun size={20} className="text-orange-500" strokeWidth={2} /> : <Moon size={20} className="text-indigo-400" strokeWidth={2} />}
          </div>
        )}
      </button>

      <button
        onClick={toggleLang}
        className={cn("h-10 w-10 p-0 flex items-center justify-center rounded-xl cursor-pointer active:scale-95", frostedGlassClasses)}
        aria-label="Toggle language"
      >
        <span className={cn("text-[10px] font-bold tracking-widest", primaryColors.text)}>{lang.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div
          className={cn(
            `absolute right-0 top-full mt-4 w-72 rounded-[2rem] p-4 sm:p-6 shadow-2xl border z-[9999]`,
            isLight ? 'bg-white border-gray-100' : 'bg-slate-900 border-white/5 backdrop-blur-2xl'
          )}
        >
          <div className={`flex justify-between items-center mb-4 sm:mb-6 p-1.5 rounded-2xl ${isLight ? 'bg-gray-50' : 'bg-white/5'}  `}>
            <button
              onClick={() => handleToggleTheme('light')}
              disabled={isThemeChanging}
              className={cn("flex-1 px-4 py-2.5 rounded-xl cursor-pointer text-xs font-bold uppercase tracking-widest",
                isLight
                  ? 'bg-white shadow-lg text-gray-900'
                  : 'text-gray-500 hover:text-gray-300',
                isThemeChanging && 'opacity-50 cursor-not-allowed'
              )}
            >
              LIGHT
            </button>
            <button
              onClick={() => handleToggleTheme('dark')}
              disabled={isThemeChanging}
              className={cn("flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer font-bold uppercase tracking-widest",
                !isLight
                  ? 'bg-slate-800 shadow-lg text-white'
                  : 'text-gray-500 hover:text-gray-900',
                isThemeChanging && 'opacity-50 cursor-not-allowed'
              )}
            >
              DARK
            </button>
          </div>

          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 sm:mb-4 px-1">Color Palette</h3>
          <div className="space-y-2 flex flex-col overflow-y-auto max-h-[50vh] pr-2 -mr-2">
            {THEME_VARIANTS.map((variant, index) => (
              <div
                key={index}
                onClick={() => handleSelectVariant(index)}
                className={cn("flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer border-2",
                  index === variantIndex
                    ? cn(primaryColors.border, isLight ? 'bg-gray-50' : 'bg-white/5')
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                )}
              >
                <span className={cn("text-sm font-bold tracking-tight", isLight ? 'text-gray-900' : 'text-white')}>{variant.name.toUpperCase()}</span>
                <div className="flex gap-1.5">
                  <div className={cn("w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm", variant.lightPreview)} />
                  <div className={cn("w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm", variant.darkPreview)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
