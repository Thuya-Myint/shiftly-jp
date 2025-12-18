import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, startOfMonth, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LANG_STRINGS } from '@/constants/strings';
export function MonthFilter({ selectedMonth, onMonthSelect, lang, primaryColors }) {
    const [isOpen, setIsOpen] = useState(false);
    const strings = LANG_STRINGS[lang];
    const allShiftMonths = useMemo(() => {
        const months = new Set();
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 12; i++) {
            months.add(format(new Date(currentYear, i, 1), 'yyyy-MM'));
        }
        return Array.from(months)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, []);
    const handleSelectMonth = (monthStr) => {
        onMonthSelect(monthStr ? startOfMonth(parseISO(monthStr + '-01')) : undefined);
        setIsOpen(false);
    };
    return (_jsxs("div", { className: "relative flex-1 min-w-0", children: [_jsxs(Button, { onClick: () => setIsOpen(!isOpen), variant: "outline", className: cn("w-full h-10 sm:h-12 px-3 sm:px-4 flex items-center justify-between rounded-xl border-2 font-medium transition-all text-sm", selectedMonth
                    ? cn(primaryColors.border, primaryColors.text, "bg-white dark:bg-slate-900/80")
                    : "border-gray-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/60 text-gray-800 dark:text-gray-400"), children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CalendarIcon, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: selectedMonth ? format(selectedMonth, lang === 'en' ? 'MMM yyyy' : 'yyyy年M月') : strings.filterByMonth })] }), selectedMonth && _jsx(X, { size: 16, className: "opacity-50 flex-shrink-0 ml-2", onClick: (e) => { e.stopPropagation(); onMonthSelect(undefined); } })] }), isOpen && (_jsx("div", { style: { zIndex: 9999 }, className: "absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 max-h-60 overflow-y-auto", children: _jsx("div", { className: "p-2", children: allShiftMonths.map((monthStr) => (_jsx(motion.button, { onClick: () => handleSelectMonth(monthStr), whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors", selectedMonth && format(selectedMonth, 'yyyy-MM') === monthStr
                            ? cn(primaryColors.bgLight, primaryColors.text, "font-bold")
                            : "text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"), children: format(parseISO(monthStr + '-01'), lang === 'en' ? 'MMM yyyy' : 'yyyy年M月') }, monthStr))) }) }))] }));
}
