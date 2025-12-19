import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect, memo } from 'react';
import { Globe, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { getDayOfWeek } from '@/utils/time';
export const ShiftItem = memo(function ShiftItem({ shift, theme, baseLang, onDelete, onUpdate, primaryColors }) {
    const [shiftLang, setShiftLang] = useState(baseLang);
    const itemRef = useRef(null);
    const strings = LANG_STRINGS[shiftLang];
    useEffect(() => {
        setShiftLang(baseLang);
    }, [baseLang]);
    const displayDayOfWeek = useMemo(() => getDayOfWeek(shift.date, shiftLang), [shift.date, shiftLang]);
    const handleDelete = () => {
        onDelete(shift.id);
    };
    return (_jsxs("div", { className: cn("group relative overflow-hidden rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer backdrop-blur-xl border", theme === 'light'
            ? 'bg-white/80 border-gray-200/50 hover:bg-white/90'
            : 'bg-slate-900/60 border-slate-700/50 hover:bg-slate-900/80'), ref: itemRef, children: [_jsx("div", { className: cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", "bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5") }), _jsxs("div", { className: "flex justify-between items-start relative z-10 gap-2", children: [_jsxs("div", { className: "flex flex-col gap-2 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1 sm:gap-2", children: [_jsx("span", { className: cn("text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl shadow-sm", primaryColors.bgLight, "dark:bg-violet-900/40", primaryColors.text), children: displayDayOfWeek }), _jsx("span", { className: "text-xs sm:text-sm font-semibold px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100/80 dark:bg-slate-700/60 text-gray-900 dark:text-gray-100 shadow-sm backdrop-blur-sm", children: shift.date }), _jsxs("button", { onClick: () => setShiftLang(shiftLang === 'en' ? 'jp' : 'en'), className: cn("text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border-2 backdrop-blur-sm transition-all duration-300", primaryColors.border, primaryColors.text, "hover:shadow-md", theme === 'light' ? 'bg-white/60' : 'bg-slate-800/60'), "aria-label": "Translate shift details", children: [_jsx(Globe, { size: 12, className: "inline mr-1" }), shiftLang === 'en' ? 'JP' : 'EN'] })] }), _jsxs("div", { className: "flex items-baseline gap-2 sm:gap-3", children: [_jsx("span", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: shift.fromTime }), _jsx("span", { className: cn("text-base sm:text-lg font-medium", primaryColors.text), children: "\u2192" }), _jsx("span", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: shift.toTime })] }), _jsxs("p", { className: "text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium", children: [shift.hours, " ", strings.hours, " @ \u00A5", shift.wage.toLocaleString(), "/", strings.hours === 'hours' ? 'h' : '時間'] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2 flex-shrink-0", children: [_jsx("div", { className: cn("px-3 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm", primaryColors.bgGradient), children: _jsx("p", { className: "text-lg sm:text-2xl font-black text-white", children: yen.format(shift.pay) }) }), _jsxs("div", { className: "flex flex-col gap-1 sm:gap-2", children: [_jsxs("button", { className: cn("h-8 px-2 sm:h-9 sm:px-3 text-xs font-semibold rounded-lg border transition-all flex items-center", primaryColors.border, primaryColors.text, theme === 'light' ? 'bg-white/60' : 'bg-slate-800/60'), onClick: () => onUpdate(shift), children: [_jsx(RotateCcw, { size: 12, className: "mr-1" }), " ", strings.update] }), _jsxs("button", { className: "h-8 px-2 sm:h-9 sm:px-3 text-xs font-semibold rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 bg-white/60 dark:bg-slate-800/60 transition-all flex items-center", onClick: handleDelete, children: [_jsx(Trash2, { size: 12, className: "mr-1" }), " ", strings.delete] })] })] })] })] }, shift.id));
});
