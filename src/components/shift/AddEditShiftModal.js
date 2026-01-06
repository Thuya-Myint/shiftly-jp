import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { X, CalendarIcon, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import * as Slider from '@radix-ui/react-slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { calculateHours } from '@/utils/time';
/* =========================
   Time helpers (added only)
========================= */
const STEP = 15;
const DAY_MINUTES = 24 * 60;
const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};
const toTime = (m) => {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    return `${h}:${mm}`;
};
/* =========================
   Component
========================= */
export function AddEditShiftModal({ isOpen, onClose, onSubmit, initialShift, lang, primaryColors }) {
    const strings = LANG_STRINGS[lang];
    const initialFormState = useMemo(() => ({
        date: initialShift ? parseISO(initialShift.shift_date) : new Date(),
        fromTime: initialShift ? initialShift.start_time : '09:00',
        toTime: initialShift ? initialShift.end_time : '17:00',
        wage: initialShift ? initialShift.wage.toString() : '1000',
        id: initialShift ? initialShift.id : null,
    }), [initialShift]);
    const [form, setForm] = useState(initialFormState);
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    useEffect(() => {
        if (isOpen)
            setForm(initialFormState);
    }, [isOpen, initialFormState]);
    if (!isOpen)
        return null;
    const hours = calculateHours(form.fromTime, form.toTime);
    const pay = Math.round(hours * (parseFloat(form.wage) || 0));
    const startMin = toMinutes(form.fromTime);
    const endMin = toMinutes(form.toTime);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            id: form.id || crypto.randomUUID(),
            shift_date: format(form.date, 'yyyy-MM-dd'),
            start_time: form.fromTime,
            end_time: form.toTime,
            wage: parseFloat(form.wage) || 0,
        });
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs("div", { className: cn("w-full max-w-md rounded-3xl p-6 relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 shadow-2xl"), onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { className: cn("text-2xl font-extrabold mb-6", primaryColors.text), children: initialShift ? strings.editShift : strings.addShift }), _jsx("button", { className: "absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors", onClick: onClose, children: _jsx(X, { size: 20 }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2", children: lang === 'en' ? 'Date' : '日付' }), _jsxs(Popover, { open: isDatePopoverOpen, onOpenChange: setIsDatePopoverOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs("button", { type: "button", className: cn("w-full justify-start text-left font-normal h-12 rounded-xl border-2 items-center flex px-3", "text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-900", primaryColors.border), children: [_jsx(CalendarIcon, { className: cn("mr-2 h-4 w-4", primaryColors.text) }), format(form.date, lang === 'en' ? 'PPP' : 'yyyy年M月d日(EEE)')] }) }), _jsx(PopoverContent, { className: "w-full md:w-auto p-0 z-[10001]", children: _jsx(Calendar, { mode: "single", selected: form.date, onSelect: (d) => d && setForm(p => ({ ...p, date: d })) }) })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3", children: [strings.start, " \u2013 ", strings.end] }), _jsxs(Slider.Root, { value: [startMin, endMin], min: 0, max: DAY_MINUTES, step: STEP, minStepsBetweenThumbs: 1, onValueChange: ([s, e]) => setForm(p => ({
                                        ...p,
                                        fromTime: toTime(s),
                                        toTime: toTime(e),
                                    })), className: "relative flex items-center h-8", children: [_jsx(Slider.Track, { className: cn("relative grow h-2 rounded-full", primaryColors.bgLight + "/40"), children: _jsx(Slider.Range, { className: cn("absolute h-full rounded-full", primaryColors.bgGradient) }) }), _jsx(Slider.Thumb, { className: cn("block w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 shadow-md", primaryColors.border) }), _jsx(Slider.Thumb, { className: cn("block w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 shadow-md", primaryColors.border) })] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx(Input, { type: "time", step: STEP * 60, value: form.fromTime, onChange: (e) => setForm(p => ({ ...p, fromTime: e.target.value })) }), _jsx(Input, { type: "time", step: STEP * 60, value: form.toTime, onChange: (e) => setForm(p => ({ ...p, toTime: e.target.value })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Zap, { size: 14, className: "inline mr-1" }), strings.hourlyRate] }) }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", step: "100", value: form.wage, onChange: (e) => setForm(p => ({ ...p, wage: e.target.value })), className: cn("pl-10", primaryColors.border) }), _jsx("span", { className: cn("absolute left-3 top-1/2 -translate-y-1/2 font-bold", primaryColors.text), children: "\u00A5" })] })] }), _jsxs("div", { className: cn("p-4 rounded-xl flex justify-between items-center shadow-md", primaryColors.bgLight + "/50 dark:" + primaryColors.bgDark), children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: strings.totalHours }), _jsx("p", { className: cn("text-2xl font-black", primaryColors.text), children: hours })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: strings.totalPay }), _jsx("p", { className: cn("text-2xl font-black", primaryColors.text), children: yen.format(pay) })] })] }), _jsx("button", { type: "submit", className: cn("w-full h-12 rounded-xl text-lg font-bold text-white shadow-lg", primaryColors.bgGradient), children: initialShift ? strings.save : strings.addShift })] })] }) }));
}
