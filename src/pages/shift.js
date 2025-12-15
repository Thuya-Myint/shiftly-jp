import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Reverting back to the standard Calendar component implementation
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sun, Moon, Globe, Calendar as CalendarIcon, Clock, Trash2, RotateCcw, List, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
// Importing date-fns locale
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
// --- Constants ---
const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_JP = ['日', '月', '火', '水', '木', '金', '土'];
const LOCAL_STORAGE_KEY = 'shiftTrackerShifts';
// --- Primary Color Class Definitions (Indigo/Violet) ---
const PRIMARY_COLOR_CLASSES = {
    text: 'text-indigo-600 dark:text-violet-400',
    bgLight: 'bg-indigo-100',
    // INCREASED CONTRAST FOR DARK MODE BACKGROUNDS
    bgDark: 'bg-violet-900/60',
    border: 'border-indigo-500 dark:border-violet-400',
    bgGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600',
    hover: 'hover:bg-indigo-500/10',
    ring: 'ring-indigo-500 dark:ring-violet-400',
};
// --- Language Strings (UNCHANGED) ---
const LANG_STRINGS = {
    en: {
        to: 'to',
        hours: 'hours',
        hourlyRate: 'Hourly Rate',
        clearData: 'Clear All Data',
        delete: 'Delete',
        update: 'Update',
        areYouSure: 'Are you sure?',
        totalPay: 'Total Pay',
        totalHours: 'Total Hours',
        view: 'View',
        list: 'Shift List',
        monthly: 'By Month',
        grandTotal: 'Grand Total',
        editShift: 'Edit Shift',
        save: 'Save Changes',
        addShift: 'Add Shift',
        start: 'Start',
        end: 'End',
        filterByMonth: 'Filter by Month',
        clearFilter: 'Clear Filter',
    },
    jp: {
        to: 'から',
        hours: '時間',
        hourlyRate: '時給',
        clearData: '全データ削除',
        delete: '削除',
        update: '更新',
        areYouSure: '本当によろしいですか？',
        totalPay: '合計給与',
        totalHours: '合計時間',
        view: '表示',
        list: 'シフト一覧',
        monthly: '月別集計',
        grandTotal: '総計',
        editShift: 'シフト編集',
        save: '変更を保存',
        addShift: 'シフト追加',
        start: '開始',
        end: '終了',
        filterByMonth: '月別フィルタ',
        clearFilter: 'フィルタ解除',
    }
};
// --- GLOBAL STYLES (UNCHANGED) ---
const GlobalStyles = () => (_jsx("style", {
    children: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease infinite;
        }
    ` }));
// --- THEME VARIANTS (UNCHANGED) ---
const THEME_VARIANTS = [
    {
        name: 'Aqua Mist',
        light: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-white animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-cyan-300 to-sky-300',
        dark: 'bg-gradient-to-br from-cyan-800 via-sky-700 to-blue-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-cyan-600 to-sky-600'
    },
    {
        name: 'Coral Glow',
        light: 'bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-rose-300 to-orange-300',
        dark: 'bg-gradient-to-br from-rose-800 via-orange-700 to-yellow-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-rose-600 to-orange-600'
    },
    {
        name: 'Emerald Breeze',
        light: 'bg-gradient-to-br from-emerald-50 via-lime-50 to-green-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-emerald-300 to-lime-300',
        dark: 'bg-gradient-to-br from-emerald-800 via-lime-700 to-green-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-emerald-600 to-lime-600'
    },
    {
        name: 'Violet Horizon',
        light: 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-violet-300 to-fuchsia-300',
        dark: 'bg-gradient-to-br from-violet-800 via-fuchsia-700 to-pink-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
    },
    {
        name: 'Midnight Ocean',
        light: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-blue-300 to-indigo-300',
        dark: 'bg-gradient-to-br from-blue-800 via-indigo-700 to-sky-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-blue-600 to-indigo-600'
    },
];
// --- TIME LOGIC (UNCHANGED) ---
function calculateHours(from, to) {
    if (!from || !to)
        return 0;
    const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(v => parseInt(v, 10));
        return h * 60 + m;
    };
    const startMinutes = parseTime(from);
    let endMinutes = parseTime(to);
    if (endMinutes <= startMinutes)
        endMinutes += 24 * 60;
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes <= 0 ? 0 : Math.round((durationMinutes / 60) * 100) / 100;
}
// --- UTILITY FUNCTIONS (UNCHANGED) ---
const getDayOfWeek = (dateString, language) => {
    try {
        const d = parseISO(dateString);
        const dayIndex = d.getDay();
        const dayNames = language === 'en' ? DAY_NAMES_EN : DAY_NAMES_JP;
        return dayNames[dayIndex];
    }
    catch (e) {
        return language === 'en' ? 'ERR' : 'エラー';
    }
};
// --- SCROLL PICKER (UNCHANGED) ---
const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = ITEM_HEIGHT * 3;
function ScrollColumn({ options, selected, onSelect }) {
    const containerRef = useRef(null);
    const isScrolling = useRef(false);
    const timeoutRef = useRef(null);
    useEffect(() => {
        if (containerRef.current && !isScrolling.current) {
            const index = options.findIndex(o => Number(o) === selected);
            if (index !== -1)
                containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
    }, [selected, options]);
    const handleScroll = () => {
        isScrolling.current = true;
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (containerRef.current) {
                const scrollTop = containerRef.current.scrollTop;
                const rawIndex = scrollTop / ITEM_HEIGHT;
                const roundedIndex = Math.round(rawIndex);
                const safeIndex = Math.max(0, Math.min(roundedIndex, options.length - 1));
                const value = Number(options[safeIndex]);
                containerRef.current.scrollTo({ top: safeIndex * ITEM_HEIGHT, behavior: 'smooth' });
                if (value !== selected)
                    onSelect(value);
                setTimeout(() => { isScrolling.current = false; }, 300);
            }
        }, 100);
    };
    return (_jsxs("div", {
        className: "relative group", children: [_jsx("div", { className: cn("absolute top-[40px] left-0 right-0 h-[40px] rounded-lg pointer-events-none z-0", PRIMARY_COLOR_CLASSES.bgLight + '/50 dark:' + PRIMARY_COLOR_CLASSES.bgDark) }), _jsxs("div", {
            ref: containerRef, onScroll: handleScroll, style: { height: `${CONTAINER_HEIGHT}px` }, className: "overflow-y-auto no-scrollbar relative z-10 w-14", children: [_jsx("div", { style: { height: `${ITEM_HEIGHT}px` } }), options.map((o, idx) => {
                const isSelected = Number(o) === selected;
                return (_jsx("div", {
                    style: { height: `${ITEM_HEIGHT}px` }, onClick: () => {
                        if (containerRef.current) {
                            containerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
                            onSelect(Number(o));
                        }
                    }, className: cn("flex items-center justify-center snap-center cursor-pointer transition-all duration-200", isSelected
                        ? cn("font-bold text-xl scale-110", PRIMARY_COLOR_CLASSES.text) // Updated text color
                        : "text-gray-400 dark:text-gray-600 text-base scale-100"), children: o
                }, idx));
            }), _jsx("div", { style: { height: `${ITEM_HEIGHT}px` } })]
        })]
    }));
}
function ScrollTimePicker({ value, onChange, label }) {
    const [hour, minute] = (value || '00:00').split(':').map(v => parseInt(v, 10));
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const updateTime = (newH, newM) => onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    return (_jsxs("div", { className: "flex flex-col items-center", children: [label && _jsx("p", { className: "mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400", children: label }), _jsxs("div", { className: "flex items-center justify-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800", children: [_jsx(ScrollColumn, { options: hours, selected: hour, onSelect: (h) => updateTime(h, minute) }), _jsx("span", { className: "text-gray-300 dark:text-gray-600 pb-1 text-xl", children: ":" }), _jsx(ScrollColumn, { options: minutes, selected: minute, onSelect: (m) => updateTime(hour, m) })] })] }));
}
// --- THEME DROPDOWN (UNCHANGED) ---
function ThemeDropdown({ theme, setTheme, variantIndex, setVariantIndex, toggleLang }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const isLight = theme === 'light';
    const frostedGlassClasses = "backdrop-blur-md border shadow-sm transition-colors bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700";
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);
    const handleSelectVariant = (index) => setVariantIndex(index);
    const handleToggleTheme = (newTheme) => {
        setTheme(newTheme);
        setIsOpen(!isOpen);
    };
    const handleThemeIconClick = () => setIsOpen(prev => !prev);
    return (_jsxs("div", {
        className: "relative flex gap-2 ", ref: dropdownRef, children: [_jsx(motion.button, { onClick: handleThemeIconClick, whileTap: { scale: 0.95 }, className: cn("p-3 rounded-full cursor-pointer", frostedGlassClasses), "aria-label": "Change theme", children: isOpen || isLight ? _jsx(Sun, { size: 18, className: "text-orange-500" }) : _jsx(Moon, { size: 18, className: "text-indigo-400" }) }), _jsx(motion.button, { onClick: toggleLang, whileTap: { scale: 0.95 }, className: cn("p-3 rounded-full cursor-pointer", frostedGlassClasses), "aria-label": "Toggle language", children: _jsx(Globe, { size: 18, className: PRIMARY_COLOR_CLASSES.text }) }), _jsx(AnimatePresence, {
            children: isOpen && (_jsxs(motion.div, {
                initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { type: "spring", stiffness: 300, damping: 30 }, className: `absolute right-0 top-full mt-2 w-80 rounded-xl p-4 z-50 origin-top-right ${isLight ? 'bg-white/70' : 'bg-slate-900/70'} 
                                     backdrop-blur-xl  shadow-xl border border-gray-200 dark:border-slate-800`, children: [_jsxs("div", { className: `flex justify-between items-center mb-3 p-1 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`, children: [_jsxs(motion.button, { onClick: () => handleToggleTheme('light'), className: cn("flex-1 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors", isLight ? 'bg-white shadow-md text-slate-800' : 'text-gray-500 dark:text-gray-400'), children: [_jsx(Sun, { size: 16, className: "inline mr-1" }), " Light"] }), _jsxs(motion.button, { onClick: () => handleToggleTheme('dark'), className: cn("flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer font-medium transition-colors", !isLight ? 'bg-slate-700 shadow-md text-white' : 'text-gray-500 dark:text-gray-400'), children: [_jsx(Moon, { size: 16, className: "inline mr-1" }), " Dark"] })] }), _jsx("h3", { className: "text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2 px-1", children: "Color Palette" }), _jsx("div", {
                    className: `space-y-0 flex flex-col p-2 overflow-y-auto no-scrollbar`, children: THEME_VARIANTS.map((variant, index) => (_jsxs(motion.div, {
                        onClick: () => handleSelectVariant(index), className: cn("flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all", index === variantIndex
                            ? cn(PRIMARY_COLOR_CLASSES.bgLight + '/50 dark:' + PRIMARY_COLOR_CLASSES.bgDark, PRIMARY_COLOR_CLASSES.ring)
                            : 'hover:bg-gray-100 dark:hover:bg-slate-800'), whileTap: { scale: 0.98 }, children: [_jsx("span", { className: "text-sm font-medium", children: variant.name }), _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.lightPreview) }), _jsx("div", { className: cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.darkPreview) })] })]
                    }, index)))
                })]
            }))
        })]
    }));
}
// --- SHIFT ITEM COMPONENT (UNCHANGED) ---
function ShiftItem({ shift, theme, baseLang, onDelete, onUpdate }) {
    const [shiftLang, setShiftLang] = useState(baseLang);
    const itemRef = useRef(null);
    const isLight = theme === 'light';
    // List Item Background/Border adjusted for consistency
    const shiftItemClasses = isLight
        ? 'bg-white border border-gray-100 text-black'
        : 'bg-slate-800/60 border border-slate-700/50 text-white';
    const strings = LANG_STRINGS[shiftLang];
    useEffect(() => {
        setShiftLang(baseLang);
    }, [baseLang]);
    const displayDayOfWeek = useMemo(() => getDayOfWeek(shift.date, shiftLang), [shift.date, shiftLang]);
    const handleDelete = () => {
        if (window.confirm(`${strings.areYouSure} (${strings.delete})?`)) {
            onDelete(shift.id);
        }
    };
    return (_jsx(motion.div, { layout: true, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: cn("group relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-md transition-all", shiftItemClasses), ref: itemRef, children: _jsxs("div", { className: "flex justify-between items-start relative z-10", children: [_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: cn("text-xs font-bold px-2 py-1 rounded-md", PRIMARY_COLOR_CLASSES.bgLight, PRIMARY_COLOR_CLASSES.text), children: displayDayOfWeek }), _jsx("span", { className: cn("text-xs font-bold px-2 py-1 rounded-md", isLight ? 'bg-gray-100 text-gray-600' : 'bg-slate-700 text-gray-300'), children: shift.date }), _jsxs(motion.button, { onClick: () => setShiftLang(shiftLang === 'en' ? 'jp' : 'en'), whileTap: { scale: 0.9 }, className: cn("text-xs font-medium px-2 py-1 rounded-md bg-transparent border", PRIMARY_COLOR_CLASSES.border, PRIMARY_COLOR_CLASSES.text, PRIMARY_COLOR_CLASSES.hover, "transition-colors"), "aria-label": "Translate shift details", children: [_jsx(Globe, { size: 12, className: "inline mr-1" }), shiftLang === 'en' ? 'JP' : 'EN'] })] }), _jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: cn("text-xl font-medium", isLight ? 'text-slate-900' : 'text-white'), children: shift.fromTime }), _jsx("span", { className: "text-gray-400 text-sm", children: strings.to }), _jsx("span", { className: cn("text-xl font-medium", isLight ? 'text-slate-900' : 'text-white'), children: shift.toTime })] }), _jsxs("p", { className: cn("text-xs mt-1", isLight ? 'text-gray-400' : 'text-gray-300'), children: [shift.hours, " ", strings.hours, " @ \u00A5", shift.wage, "/", strings.hours === 'hours' ? 'h' : '時間'] })] }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("p", { className: cn("text-2xl font-black mb-2", PRIMARY_COLOR_CLASSES.text), children: yen.format(shift.pay) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: cn("h-8 px-3 text-xs font-medium", isLight ? 'border-gray-300' : 'border-slate-600', PRIMARY_COLOR_CLASSES.text, cn(isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10')), onClick: () => onUpdate(shift), children: [_jsx(RotateCcw, { size: 14, className: "mr-1" }), " ", strings.update] }), _jsxs(Button, { variant: "outline", size: "sm", className: cn("h-8 px-3 text-xs font-medium text-red-600", isLight ? 'border-red-300 text-red-600' : 'border-red-700 text-red-400', 'hover:bg-red-500/10'), onClick: handleDelete, children: [_jsx(Trash2, { size: 14, className: "mr-1" }), " ", strings.delete] })] })] })] }) }, shift.id));
}
// --- MONTHLY GROUP COMPONENT (UNCHANGED) ---
function MonthlyGroup({ monthKey, totalPay, totalHours, shifts, theme, baseLang, onDelete, onUpdate }) {
    const strings = LANG_STRINGS[baseLang];
    const isLight = theme === 'light';
    // Use full month and year name
    const locale = baseLang === 'en' ? enUS : ja;
    const monthName = format(parseISO(`${monthKey}-01`), baseLang === 'en' ? 'MMMM yyyy' : 'yyyy年M月', { locale });
    // Explicit classes for group header
    const groupClasses = isLight
        ? 'bg-indigo-50 border-l-4 border-indigo-500'
        : 'bg-slate-800/80 border-l-4 border-violet-400';
    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mb-8", children: [_jsxs("div", { className: cn("flex justify-between items-end mb-3 p-3 rounded-xl", groupClasses), children: [_jsx("h2", { className: cn("text-xl font-extrabold", isLight ? 'text-indigo-700' : 'text-violet-300'), children: monthName }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsxs("p", { className: cn("text-sm font-medium", isLight ? 'text-gray-500' : 'text-gray-400'), children: [totalHours, " ", strings.hours] }), _jsx("p", { className: cn("text-2xl font-black", PRIMARY_COLOR_CLASSES.text), children: yen.format(totalPay) })] })] }), _jsx("div", { className: "space-y-3", children: shifts.map((s) => (_jsx(ShiftItem, { shift: s, theme: theme, baseLang: baseLang, onDelete: onDelete, onUpdate: onUpdate }, s.id))) })] }));
}
// --- SHIFT MODAL (FIXED MISSING PROP) ---
function ShiftModal({ shift, lang, isUpdate, onSave, onClose, theme }) {
    const initialShift = shift || { date: format(new Date(), 'yyyy-MM-dd'), fromTime: '09:00', toTime: '17:00', wage: 1500 };
    const [date, setDate] = useState(initialShift.date);
    const [fromTime, setFromTime] = useState(initialShift.fromTime);
    const [toTime, setToTime] = useState(initialShift.toTime);
    const [wage, setWage] = useState(initialShift.wage);
    const isLight = theme === 'light';
    const hours = useMemo(() => calculateHours(fromTime, toTime), [fromTime, toTime]);
    const pay = useMemo(() => Math.floor(hours * wage), [hours, wage]);
    const strings = LANG_STRINGS[lang];
    const handleDateSelect = (d) => d && setDate(format(d, 'yyyy-MM-dd'));
    const handleSubmit = () => {
        if (hours <= 0 || wage <= 0)
            return;
        const finalShift = {
            date,
            fromTime,
            toTime,
            wage,
            hours,
            pay,
            dayOfWeek: getDayOfWeek(date, lang),
        };
        onSave(isUpdate ? { ...shift, ...finalShift } : finalShift);
    };
    // Explicit modal background and text classes
    const modalContentClasses = isLight
        ? 'bg-white text-slate-900 ring-gray-950/5'
        : 'bg-slate-950 text-white ring-white/10';
    const inputClasses = cn("h-14 pl-10 text-xl font-bold border-none rounded-2xl shadow-inner focus-visible:ring-2", isLight ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800', PRIMARY_COLOR_CLASSES.ring);
    const saveButtonClasses = isLight
        ? 'bg-slate-900 text-white'
        : 'bg-white text-slate-900';
    return (_jsx(motion.div, {
        initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 backdrop-blur-sm sm:p-4", children: _jsxs(motion.div, {
            initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: 'spring', damping: 25, stiffness: 300 }, onClick: (e) => e.stopPropagation(), className: cn("w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl ring-1", modalContentClasses), children: [_jsx("div", { className: cn("w-12 h-1 rounded-full mx-auto mb-6 sm:hidden", isLight ? 'bg-gray-200' : 'bg-slate-800') }), _jsx("h2", { className: "text-xl font-bold mb-4 text-center", children: isUpdate ? strings.editShift : strings.addShift }), _jsxs("div", {
                className: "space-y-6", children: [_jsxs(Popover, {
                    children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-between h-14 text-lg font-medium border-none rounded-2xl transition-colors", isLight ? 'bg-gray-100 text-slate-900 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'), children: [_jsx("span", { className: "text-inherit", children: date }), _jsx(CalendarIcon, { className: cn(PRIMARY_COLOR_CLASSES.text, "opacity-80") })] }) }), _jsx(PopoverContent, {
                        className: "w-auto p-0 border-none shadow-xl rounded-2xl overflow-hidden", align: "center", children: _jsx(Calendar, {
                            mode: "single", selected: new Date(date.replace(/-/g, '/')), onSelect: handleDateSelect,
                            // Explicit Calendar background color
                            className: cn(isLight ? 'bg-white' : 'bg-slate-900')
                        })
                    })]
                }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(ScrollTimePicker, { label: strings.start, value: fromTime, onChange: setFromTime }), _jsx(ScrollTimePicker, { label: strings.end, value: toTime, onChange: setToTime })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block", children: strings.hourlyRate }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", min: 0, value: wage, onChange: (e) => setWage(Number(e.target.value)), className: inputClasses }), _jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium", children: "\u00A5" })] })] }), _jsxs("div", { className: cn("rounded-2xl p-4 flex justify-between items-center text-white shadow-lg shadow-indigo-500/20", PRIMARY_COLOR_CLASSES.bgGradient), children: [_jsx("div", { className: "text-indigo-50", children: _jsxs("p", { className: "text-sm font-medium opacity-80", children: [hours, " ", strings.hours] }) }), _jsx("p", { className: "text-2xl font-black", children: yen.format(pay) })] }), _jsx(Button, { onClick: handleSubmit, className: cn("w-full h-14 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity", saveButtonClasses), children: isUpdate ? strings.save : strings.addShift })]
            })]
        })
    }));
}
// --- MAIN COMPONENT (COMPLETED BODY) ---
export default function ShiftTracker() {
    const [shifts, setShifts] = useState([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [variantIndex, setVariantIndex] = useState(0);
    const [lang, setLang] = useState('en');
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedMonth, setSelectedMonth] = useState(undefined);
    const currentVariant = useMemo(() => THEME_VARIANTS[variantIndex], [variantIndex]);
    const strings = LANG_STRINGS[lang];
    const isLight = theme === 'light';
    // Filtered Shifts
    const filteredShifts = useMemo(() => {
        if (!selectedMonth)
            return shifts;
        const start = startOfMonth(selectedMonth);
        const end = endOfMonth(selectedMonth);
        return shifts.filter(shift => {
            try {
                const shiftDate = parseISO(shift.date);
                return isWithinInterval(shiftDate, { start, end });
            }
            catch (e) {
                console.error("Error parsing date for filter:", JSON.stringify(shift.date), String(e));
                return false;
            }
        });
    }, [shifts, selectedMonth]);
    const totalPay = useMemo(() => filteredShifts.reduce((s, v) => s + v.pay, 0), [filteredShifts]);
    const totalHours = useMemo(() => filteredShifts.reduce((s, v) => s + v.hours, 0), [filteredShifts]);
    // --- Data Grouping Logic (COMPLETED) ---
    const monthlyGroups = useMemo(() => {
        const groups = {};
        // Sort filtered shifts
        const sortedShifts = [...filteredShifts].sort((a, b) => {
            const dateA = new Date(a.date.replace(/-/g, '/')).getTime();
            const dateB = new Date(b.date.replace(/-/g, '/')).getTime();
            return dateB - dateA;
        });
        for (const shift of sortedShifts) {
            const monthKey = shift.date.substring(0, 7);
            if (!groups[monthKey]) {
                groups[monthKey] = { totalPay: 0, totalHours: 0, shifts: [] };
            }
            groups[monthKey].totalPay += shift.pay;
            groups[monthKey].totalHours += shift.hours;
            groups[monthKey].shifts.push(shift);
        }
        // Return groups sorted by monthKey descending
        return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(key => ({
            monthKey: key,
            ...groups[key]
        }));
    }, [filteredShifts]);
    // --- Local Storage and Data Management (RESTORED) ---
    useEffect(() => {
        try {
            const savedShifts = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedShifts) {
                setShifts(JSON.parse(savedShifts));
            }
        }
        catch (e) {
            console.error("Could not load data from local storage", e);
        }
    }, []);
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shifts));
    }, [shifts]);
    // Apply theme class to document body
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    const handleSaveShift = (newShift) => {
        if (newShift.id) {
            // Update existing shift
            setShifts(shifts.map(s => s.id === newShift.id ? newShift : s));
            setEditingShift(null);
        }
        else {
            // Add new shift
            const shiftToAdd = {
                ...newShift,
                id: Date.now().toString(),
            };
            setShifts([shiftToAdd, ...shifts]);
            setAddModalOpen(false);
        }
    };
    const handleDeleteShift = (id) => {
        setShifts(shifts.filter(s => s.id !== id));
    };
    const handleClearAllData = () => {
        setShifts([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setConfirmClearOpen(false);
    };
    const toggleLang = useCallback(() => {
        setLang(prev => prev === 'en' ? 'jp' : 'en');
    }, []);
    // --- Filter Handlers ---
    const handleMonthSelect = (date) => {
        setSelectedMonth(date ? startOfMonth(date) : undefined);
    };
    const handleClearFilter = () => {
        setSelectedMonth(undefined);
    };
    const filteredDateDisplay = useMemo(() => {
        if (!selectedMonth)
            return strings.filterByMonth;
        const locale = lang === 'en' ? enUS : ja;
        return format(selectedMonth, lang === 'en' ? 'MMMM yyyy' : 'yyyy年M月', { locale });
    }, [selectedMonth, lang, strings]);
    // --- Rendering ---
    const mainBackground = theme === 'light' ? currentVariant.light : currentVariant.dark;
    return (_jsxs(_Fragment, {
        children: [_jsx(GlobalStyles, {}), _jsx("div", {
            className: cn("min-h-screen transition-all", mainBackground), children: _jsxs("div", {
                className: "max-w-xl mx-auto p-4 pt-8", children: [_jsxs("header", { className: "flex justify-between items-start mb-8 z-30 relative", children: [_jsxs("div", { children: [_jsx("h1", { className: cn("text-3xl font-extrabold tracking-tight mb-1", isLight ? 'text-slate-900' : 'text-white'), children: "Shift Tracker" }), _jsxs("p", { className: cn("text-sm font-medium", isLight ? 'text-gray-500' : 'text-gray-400'), children: [strings.grandTotal, ": ", _jsx("span", { className: cn("font-bold", PRIMARY_COLOR_CLASSES.text), children: yen.format(totalPay) })] })] }), _jsx(ThemeDropdown, { theme: theme, setTheme: setTheme, variantIndex: variantIndex, setVariantIndex: setVariantIndex, toggleLang: toggleLang })] }), _jsxs(motion.div, { layout: true, className: cn("mb-6 p-4 rounded-2xl shadow-lg flex justify-between items-center transition-all", isLight ? 'bg-white/80 border border-gray-100 backdrop-blur-sm' : 'bg-slate-900/50 border border-slate-800 backdrop-blur-sm'), children: [_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("flex-1 justify-center mr-3 h-10 font-semibold transition-colors", PRIMARY_COLOR_CLASSES.border, PRIMARY_COLOR_CLASSES.text, cn(isLight ? 'bg-white' : 'bg-slate-700/50'), cn(isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10')), children: [_jsx(Filter, { size: 16, className: "mr-2" }), filteredDateDisplay] }) }), _jsxs(PopoverContent, { className: cn("w-auto p-0 border-none shadow-xl rounded-2xl overflow-hidden", isLight ? 'bg-white' : 'bg-slate-900'), align: "start", children: [_jsx(Calendar, { mode: "single", selected: selectedMonth, onSelect: handleMonthSelect, initialFocus: true, locale: lang === 'en' ? enUS : ja, className: cn(isLight ? 'bg-white' : 'bg-slate-900') }), selectedMonth && (_jsx("div", { className: cn("flex justify-end p-2 border-t", isLight ? 'border-gray-100' : 'border-slate-800'), children: _jsxs(Button, { variant: "ghost", onClick: handleClearFilter, className: cn("text-xs h-8 px-3", PRIMARY_COLOR_CLASSES.text, cn(isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10')), children: [_jsx(X, { size: 14, className: "mr-1" }), strings.clearFilter] }) }))] })] }), _jsxs(motion.button, { onClick: () => setAddModalOpen(true), whileTap: { scale: 0.95 }, className: cn("h-10 px-4 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md transition-shadow", PRIMARY_COLOR_CLASSES.bgGradient, "shadow-indigo-500/50"), children: [_jsx(Plus, { size: 18, className: "mr-1" }), strings.addShift] })] }), _jsxs("div", {
                    className: "flex justify-between items-center mb-6", children: [_jsxs("div", {
                        className: cn("inline-flex rounded-full p-1 shadow-inner", isLight ? 'bg-gray-200' : 'bg-slate-800'), children: [_jsxs(Button, {
                            onClick: () => setViewMode('list'), variant: "ghost", size: "sm", className: cn("rounded-full px-4 py-1 h-auto text-sm font-medium", viewMode === 'list'
                                ? cn(PRIMARY_COLOR_CLASSES.bgLight, PRIMARY_COLOR_CLASSES.text, "shadow-sm")
                                : cn(isLight ? 'text-gray-500 hover:bg-transparent' : 'text-gray-400 hover:bg-slate-700')), children: [_jsx(List, { size: 16, className: "mr-1" }), " ", strings.list]
                        }), _jsxs(Button, {
                            onClick: () => setViewMode('monthly'), variant: "ghost", size: "sm", className: cn("rounded-full px-4 py-1 h-auto text-sm font-medium", viewMode === 'monthly'
                                ? cn(PRIMARY_COLOR_CLASSES.bgLight, PRIMARY_COLOR_CLASSES.text, "shadow-sm")
                                : cn(isLight ? 'text-gray-500 hover:bg-transparent' : 'text-gray-400 hover:bg-slate-700')), children: [_jsx(Clock, { size: 16, className: "mr-1" }), " ", strings.monthly]
                        })]
                    }), _jsxs("p", { className: cn("text-sm font-semibold", isLight ? 'text-gray-600' : 'text-gray-400'), children: [strings.totalHours, ": ", _jsx("span", { className: cn("font-bold", PRIMARY_COLOR_CLASSES.text), children: totalHours.toFixed(2) })] })]
                }), _jsx(AnimatePresence, { mode: "wait", children: shifts.length === 0 ? (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: cn("p-8 text-center rounded-xl", isLight ? 'bg-white/70' : 'bg-slate-800/70'), children: _jsx("p", { className: cn("text-lg font-medium", isLight ? 'text-gray-600' : 'text-gray-400'), children: lang === 'en' ? 'No shifts added yet. Click the + button to start tracking!' : 'まだシフトがありません。「+」ボタンをクリックして記録を開始してください！' }) }, "empty")) : filteredShifts.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: cn("p-8 text-center rounded-xl", isLight ? 'bg-white/70' : 'bg-slate-800/70'), children: [_jsx("p", { className: cn("text-lg font-medium", isLight ? 'text-gray-600' : 'text-gray-400'), children: lang === 'en' ? `No shifts found for ${filteredDateDisplay}.` : `${filteredDateDisplay}のシフトは見つかりませんでした。` }), _jsx(Button, { variant: "link", onClick: handleClearFilter, className: cn(PRIMARY_COLOR_CLASSES.text, isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10'), children: strings.clearFilter })] }, "no-results")) : viewMode === 'list' ? (_jsx(motion.div, { layout: true, className: "space-y-4", children: filteredShifts.map(shift => (_jsx(ShiftItem, { shift: shift, theme: theme, baseLang: lang, onDelete: handleDeleteShift, onUpdate: setEditingShift }, shift.id))) }, "list-view")) : (_jsx(motion.div, { layout: true, children: monthlyGroups.map(group => (_jsx(MonthlyGroup, { monthKey: group.monthKey, totalPay: group.totalPay, totalHours: group.totalHours, shifts: group.shifts, theme: theme, baseLang: lang, onDelete: handleDeleteShift, onUpdate: setEditingShift }, group.monthKey))) }, "monthly-view")) })]
            })
        }), _jsx(AnimatePresence, {
            children: (addModalOpen || editingShift) && (_jsx(ShiftModal, {
                shift: editingShift, lang: lang, isUpdate: !!editingShift, onSave: handleSaveShift, onClose: () => {
                    setAddModalOpen(false);
                    setEditingShift(null);
                }, theme: theme
            }))
        }), _jsx("div", { className: "absolute bottom-4 right-4 z-40", children: _jsxs(Button, { onClick: () => setConfirmClearOpen(true), variant: "outline", className: cn("text-xs h-8 px-3 transition-colors", isLight ? 'border-gray-300 text-gray-500 hover:bg-red-50' : 'border-slate-600 text-gray-400 hover:bg-slate-700/50'), children: [_jsx(Trash2, { size: 14, className: "mr-1 text-red-500" }), strings.clearData] }) }), _jsx(AnimatePresence, { children: confirmClearOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setConfirmClearOpen(false), className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4", children: _jsxs(motion.div, { initial: { scale: 0.8 }, animate: { scale: 1 }, exit: { scale: 0.8 }, onClick: (e) => e.stopPropagation(), className: cn("w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center", isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'), children: [_jsx(Trash2, { size: 32, className: "mx-auto text-red-500 mb-4" }), _jsx("h3", { className: "text-lg font-bold mb-2", children: strings.areYouSure }), _jsx("p", { className: cn("text-sm mb-6", isLight ? 'text-gray-600' : 'text-gray-400'), children: lang === 'en' ? 'This action cannot be undone.' : 'この操作は元に戻せません。' }), _jsxs("div", { className: "flex justify-between gap-3", children: [_jsx(Button, { onClick: () => setConfirmClearOpen(false), variant: "outline", className: cn("flex-1", isLight ? 'border-gray-300' : 'border-slate-600'), children: lang === 'en' ? 'Cancel' : 'キャンセル' }), _jsx(Button, { onClick: handleClearAllData, className: "flex-1 bg-red-600 hover:bg-red-700 text-white", children: strings.clearData })] })] }) })) })]
    }));
}
