import { useState, useMemo, useRef, useEffect, memo } from 'react';
import { Globe, RotateCcw, Trash2, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses } from '@/constants/themes';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { getDayOfWeek } from '@/utils/time';
import type { Shift, Lang } from '@/types/shift';

export const ShiftItem = memo(function ShiftItem({ shift, theme, baseLang, onDelete, onUpdate, primaryColors }: {
  shift: Shift,
  theme: 'light' | 'dark',
  baseLang: Lang,
  onDelete: (id: string) => void,
  onUpdate: (shift: Shift) => void,
  primaryColors: ReturnType<typeof getPrimaryColorClasses>
}) {
  const [shiftLang, setShiftLang] = useState<Lang>(baseLang);
  const itemRef = useRef<HTMLDivElement>(null);

  const strings = LANG_STRINGS[shiftLang];

  useEffect(() => {
    setShiftLang(baseLang);
  }, [baseLang]);

  const displayDayOfWeek = useMemo(() => getDayOfWeek(shift.shift_date, shiftLang), [shift.shift_date, shiftLang]);

  return (
    <div
      key={shift.id}
      className={cn(
        "group relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl cursor-pointer border",
        theme === 'light'
          ? 'bg-white border-gray-100'
          : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
      )}
      ref={itemRef}
    >
      {/* Subtle accent glow */}
      <div className={cn("absolute -left-24 -top-24 w-48 h-48 blur-[100px] opacity-10 rounded-full pointer-events-none", primaryColors.bg)} />

      <div className="flex justify-between items-start relative z-10 gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm",
                theme === 'light' ? 'bg-gray-50' : 'bg-white/5',
                primaryColors.text
              )}
            >
              {displayDayOfWeek}
            </span>

            <span
              className="text-[10px] font-bold tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gray-100/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200/30 dark:border-white/5"
            >
              {shift.shift_date}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShiftLang(shiftLang === 'en' ? 'jp' : 'en');
              }}
              className={cn(
                "text-[10px] font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 active:scale-95",
                primaryColors.border,
                primaryColors.text,
                theme === 'light' ? 'bg-white' : 'bg-slate-900'
              )}
              aria-label="Translate shift details"
            >
              <Globe size={12} className="inline mr-1.5" />
              {shiftLang === 'en' ? 'JP' : 'EN'}
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn("p-1.5 sm:p-2 rounded-lg flex-shrink-0", theme === 'light' ? 'bg-gray-100' : 'bg-white/5', primaryColors.text)}>
              <Clock size={18} className="sm:w-5 sm:h-5" strokeWidth={2} />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2 overflow-hidden">
              <span className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{shift.start_time}</span>
              <span className={cn("text-base sm:text-lg font-medium opacity-30", primaryColors.text)}>
                →
              </span>
              <span className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{shift.end_time}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
            <Zap size={16} className={primaryColors.text} strokeWidth={3} />
            <span>{shift.hours} {strings.hours}</span>
            <span className="opacity-20">•</span>
            <span>¥{shift.wage.toLocaleString()}/{strings.hours === 'hours' ? 'H' : '時間'}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
          <div
            className={cn(
              "px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border-t border-white/10",
              primaryColors.bgGradient
            )}
          >
            <p className="text-lg sm:text-2xl font-bold text-white tracking-tight">{yen.format(shift.pay)}</p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center transition-colors active:scale-95",
                primaryColors.border,
                primaryColors.text,
                theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-slate-900 hover:bg-slate-800'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(shift);
              }}
            >
              <RotateCcw size={18} strokeWidth={2} />
            </button>

            <button
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center transition-colors active:scale-95",
                "border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400",
                theme === 'light' ? 'bg-white hover:bg-red-50' : 'bg-slate-900 hover:bg-red-900/20'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(shift.id);
              }}
            >
              <Trash2 size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
