import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { ShiftItem } from './ShiftItem';
export const MonthlyGroup = memo(function MonthlyGroup({ monthKey, totalPay, totalHours, shifts, theme, baseLang, onDelete, onUpdate, primaryColors }) {
    const strings = LANG_STRINGS[baseLang];
    const monthName = useMemo(() => format(parseISO(`${monthKey}-01`), baseLang === 'en' ? 'MMM yyyy' : 'yyyy年M月'), [monthKey, baseLang]);
    const groupClasses = useMemo(() => theme === 'light'
        ? `${primaryColors.bgLight} border-l-4 ${primaryColors.border}`
        : `bg-slate-800/80 border-l-4 ${primaryColors.border}`, [theme, primaryColors]);
    return (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: cn("flex justify-between items-end mb-3 p-3 rounded-xl z-10", groupClasses), children: [_jsx("h2", { className: cn("text-xl font-extrabold", primaryColors.text), children: monthName }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsxs("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: [totalHours, " ", strings.hours] }), _jsx("p", { className: cn("text-2xl font-black", primaryColors.text), children: yen.format(totalPay) })] })] }), _jsx("div", { className: "space-y-3", children: shifts.map((s) => (_jsx(ShiftItem, { shift: s, theme: theme, baseLang: baseLang, onDelete: onDelete, onUpdate: onUpdate, primaryColors: primaryColors }, s.id))) })] }));
});
