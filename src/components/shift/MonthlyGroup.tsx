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
        <div className="mb-8">
            <div className={cn("flex justify-between items-end mb-3 p-3 rounded-xl z-10", groupClasses)}>
                <h2 className={cn("text-xl font-extrabold", primaryColors.text)}>
                    {monthName}
                </h2>
                <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{totalHours} {strings.hours}</p>
                    <p className={cn("text-2xl font-black", primaryColors.text)}>{yen.format(totalPay)}</p>
                </div>
            </div>
            <div className="space-y-3">
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