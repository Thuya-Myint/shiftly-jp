import { useMemo, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses } from '@/constants/themes';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { ShiftItem } from './ShiftItem';
import type { Shift, Lang } from '@/types/shift';

export const MonthlyGroup = memo(function MonthlyGroup({ monthKey, totalPay, totalHours, shifts, theme, baseLang, onDelete, onUpdate, primaryColors }: {
  monthKey: string;
  totalPay: number;
  totalHours: number;
  shifts: Shift[];
  theme: 'light' | 'dark';
  baseLang: Lang;
  onDelete: (id: string) => void;
  onUpdate: (shift: Shift) => void;
  primaryColors: ReturnType<typeof getPrimaryColorClasses>;
}) {
  const strings = LANG_STRINGS[baseLang];
  const monthName = useMemo(() => format(parseISO(`${monthKey}-01`), baseLang === 'en' ? 'MMM yyyy' : 'yyyy年M月'), [monthKey, baseLang]);

  const groupClasses = useMemo(() => theme === 'light'
    ? `${primaryColors.bgLight} border-l-4 ${primaryColors.border}`
    : `bg-slate-800/80 border-l-4 ${primaryColors.border}`, [theme, primaryColors]);

  return (
    <div className="mb-10">
      <div className={cn(
        "flex justify-between items-center mb-5 p-5 sm:p-6 rounded-3xl z-10 shadow-xl border",
        theme === 'light'
          ? "bg-white border-gray-100"
          : "bg-slate-900/40 border-white/5 backdrop-blur-2xl"
      )}>
        <div className="flex flex-col">
          <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", primaryColors.text)}>
            {monthName.toUpperCase()}
          </h2>
          <div className={cn("h-1 w-10 rounded-full mt-1.5", primaryColors.bg)} />
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", primaryColors.bg)} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{totalHours} {strings.hours.toUpperCase()}</p>
          </div>
          <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", primaryColors.text)}>{yen.format(totalPay)}</p>
        </div>
      </div>
      <div className="space-y-4">
        {shifts.map((s: Shift) => (
          <ShiftItem
            key={s.id}
            shift={s}
            theme={theme}
            baseLang={baseLang}
            onDelete={onDelete}
            onUpdate={onUpdate}
            primaryColors={primaryColors}
          />
        ))}
      </div>
    </div>
  );
});
