import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { X, CalendarIcon, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { calculateHours } from '@/utils/time';
import { ScrollTimePicker } from './ScrollTimePicker';
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
        if (isOpen) {
            setForm(initialFormState);
        }
    }, [isOpen, initialFormState]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleTimeChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleDateSelect = (date) => {
        if (date) {
            setForm(prev => ({ ...prev, date }));
            setIsDatePopoverOpen(false);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.date || !form.fromTime || !form.toTime || !form.wage)
            return;
        onSubmit({
            id: form.id || crypto.randomUUID(),
            shift_date: format(form.date, 'yyyy-MM-dd'),
            start_time: form.fromTime,
            end_time: form.toTime,
            wage: parseFloat(form.wage) || 0,
        });
        onClose();
    };
    const hours = calculateHours(form.fromTime, form.toTime);
    const pay = Math.round(hours * (parseFloat(form.wage) || 0));
    const title = initialShift ? strings.editShift : strings.addShift;
    const submitText = initialShift ? strings.save : strings.addShift;
    const modalBgClasses = "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 shadow-2xl";
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs("div", { className: cn("w-full max-w-md rounded-3xl p-6 relative", modalBgClasses), onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { className: cn("text-2xl font-extrabold mb-6", primaryColors.text), children: title }), _jsx("button", { className: "absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { size: 20 }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2", children: lang === 'en' ? 'Date' : '日付' }), _jsxs(Popover, { open: isDatePopoverOpen, onOpenChange: setIsDatePopoverOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs("button", { type: "button", className: cn("w-full justify-start text-left font-normal h-12 rounded-xl border-2 items-center flex px-3", "text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-900", primaryColors.border), children: [_jsx(CalendarIcon, { className: cn("mr-2 h-4 w-4", primaryColors.text) }), form.date ? format(form.date, lang === 'en' ? 'PPP' : 'yyyy年M月d日(EEE)') : _jsx("span", { children: "Pick a date" })] }) }), _jsx(PopoverContent, { className: "w-full md:w-auto p-0 z-[10001]", children: _jsx(Calendar, { mode: "single", selected: form.date, onSelect: handleDateSelect, initialFocus: true, locale: lang === 'jp' ? undefined : undefined, className: "max-w-full" }) })] })] }), _jsxs("div", { className: "flex justify-between items-center gap-1 sm:gap-2 py-2", children: [_jsx(ScrollTimePicker, { value: form.fromTime, onChange: (v) => handleTimeChange('fromTime', v), label: strings.start, primaryColors: primaryColors }), _jsx("span", { className: cn("font-bold", primaryColors.text, "text-xl sm:text-2xl"), children: strings.to }), _jsx(ScrollTimePicker, { value: form.toTime, onChange: (v) => handleTimeChange('toTime', v), label: strings.end, primaryColors: primaryColors })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "wage", className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Zap, { size: 14, className: "inline mr-1" }), " ", strings.hourlyRate, " (", lang === 'en' ? 'JPY' : '円', ")"] }) }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "wage", name: "wage", type: "number", step: "100", placeholder: "1000", value: form.wage, onChange: handleChange, className: cn("w-full h-12 rounded-xl text-lg font-semibold pl-10 border-2 text-gray-900 dark:text-white", primaryColors.border) }), _jsx("span", { className: cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold", primaryColors.text), children: "\u00A5" })] })] }), _jsxs("div", { className: cn("p-4 rounded-xl flex justify-between items-center shadow-md", primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark), children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-400", children: strings.totalHours }), _jsxs("p", { className: cn("text-2xl font-black", primaryColors.text), children: [hours, " ", strings.hours] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-400", children: strings.totalPay }), _jsx("p", { className: cn("text-2xl font-black", primaryColors.text), children: yen.format(pay) })] })] }), _jsx("button", { type: "submit", className: cn("w-full h-12 rounded-xl text-lg font-bold text-white transition-all shadow-lg hover:shadow-xl", primaryColors.bgGradient), children: submitText })] })] }) }));
}
