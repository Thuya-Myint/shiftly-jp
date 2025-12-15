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

// --- Type Definitions ---
type Shift = {
    id: string;
    date: string;
    dayOfWeek: string;
    fromTime: string;
    toTime: string;
    hours: number;
    wage: number;
    pay: number;
};

type Lang = 'en' | 'jp';
type ViewMode = 'list' | 'monthly';

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
const GlobalStyles = () => (
    <style>{`
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
    `}</style>
);

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
function calculateHours(from: string, to: string) {
    if (!from || !to) return 0;
    const parseTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(v => parseInt(v, 10));
        return h * 60 + m;
    };
    const startMinutes = parseTime(from);
    let endMinutes = parseTime(to);
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes <= 0 ? 0 : Math.round((durationMinutes / 60) * 100) / 100;
}

// --- UTILITY FUNCTIONS (UNCHANGED) ---
const getDayOfWeek = (dateString: string, language: Lang): string => {
    try {
        const d = parseISO(dateString);
        const dayIndex = d.getDay();
        const dayNames = language === 'en' ? DAY_NAMES_EN : DAY_NAMES_JP;
        return dayNames[dayIndex];
    } catch (e) {
        return language === 'en' ? 'ERR' : 'エラー';
    }
};


// --- SCROLL PICKER (UNCHANGED) ---
const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = ITEM_HEIGHT * 3;

function ScrollColumn({ options, selected, onSelect }: { options: string[]; selected: number; onSelect: (v: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (containerRef.current && !isScrolling.current) {
            const index = options.findIndex(o => Number(o) === selected);
            if (index !== -1) containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
    }, [selected, options]);

    const handleScroll = () => {
        isScrolling.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (containerRef.current) {
                const scrollTop = containerRef.current.scrollTop;
                const rawIndex = scrollTop / ITEM_HEIGHT;
                const roundedIndex = Math.round(rawIndex);
                const safeIndex = Math.max(0, Math.min(roundedIndex, options.length - 1));
                const value = Number(options[safeIndex]);
                containerRef.current.scrollTo({ top: safeIndex * ITEM_HEIGHT, behavior: 'smooth' });
                if (value !== selected) onSelect(value);
                setTimeout(() => { isScrolling.current = false; }, 300);
            }
        }, 100);
    };

    return (
        <div className="relative group">
            {/* Highlight updated to Indigo/Violet */}
            <div className={cn("absolute top-[40px] left-0 right-0 h-[40px] rounded-lg pointer-events-none z-0", PRIMARY_COLOR_CLASSES.bgLight + '/50 dark:' + PRIMARY_COLOR_CLASSES.bgDark)} />
            <div
                ref={containerRef}
                onScroll={handleScroll}
                style={{ height: `${CONTAINER_HEIGHT}px` }}
                className="overflow-y-auto no-scrollbar relative z-10 w-14"
            >
                <div style={{ height: `${ITEM_HEIGHT}px` }} />
                {options.map((o, idx) => {
                    const isSelected = Number(o) === selected;
                    return (
                        <div
                            key={idx}
                            style={{ height: `${ITEM_HEIGHT}px` }}
                            onClick={() => {
                                if (containerRef.current) {
                                    containerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
                                    onSelect(Number(o));
                                }
                            }}
                            className={cn(
                                "flex items-center justify-center snap-center cursor-pointer transition-all duration-200",
                                isSelected
                                    ? cn("font-bold text-xl scale-110", PRIMARY_COLOR_CLASSES.text) // Updated text color
                                    : "text-gray-400 dark:text-gray-600 text-base scale-100"
                            )}
                        >
                            {o}
                        </div>
                    );
                })}
                <div style={{ height: `${ITEM_HEIGHT}px` }} />
            </div>
        </div>
    );
}

function ScrollTimePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
    const [hour, minute] = (value || '00:00').split(':').map(v => parseInt(v, 10));
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const updateTime = (newH: number, newM: number) => onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);

    return (
        <div className="flex flex-col items-center">
            {label && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>}
            <div className="flex items-center justify-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <ScrollColumn options={hours} selected={hour} onSelect={(h) => updateTime(h, minute)} />
                <span className="text-gray-300 dark:text-gray-600 pb-1 text-xl">:</span>
                <ScrollColumn options={minutes} selected={minute} onSelect={(m) => updateTime(hour, m)} />
            </div>
        </div>
    );
}

// --- THEME DROPDOWN (UNCHANGED) ---
function ThemeDropdown({ theme, setTheme, variantIndex, setVariantIndex, toggleLang }: {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    variantIndex: number;
    setVariantIndex: (index: number) => void;
    toggleLang: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isLight = theme === 'light';
    const frostedGlassClasses = "backdrop-blur-md border shadow-sm transition-colors bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleSelectVariant = (index: number) => setVariantIndex(index);
    const handleToggleTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        setIsOpen(!isOpen);
    };
    const handleThemeIconClick = () => setIsOpen(prev => !prev);

    return (
        <div className="relative flex gap-2 " ref={dropdownRef}>
            <motion.button
                onClick={handleThemeIconClick}
                whileTap={{ scale: 0.95 }}
                className={cn("p-3 rounded-full cursor-pointer", frostedGlassClasses)}
                aria-label="Change theme"
            >
                {isOpen || isLight ? <Sun size={18} className="text-orange-500" /> : <Moon size={18} className="text-indigo-400" />}
            </motion.button>

            <motion.button
                onClick={toggleLang}
                whileTap={{ scale: 0.95 }}
                className={cn("p-3 rounded-full cursor-pointer", frostedGlassClasses)}
                aria-label="Toggle language"
            >
                {/* Updated icon color */}
                <Globe size={18} className={PRIMARY_COLOR_CLASSES.text} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`absolute right-0 top-full mt-2 w-80 rounded-xl p-4 z-50 origin-top-right ${isLight ? 'bg-white/70' : 'bg-slate-900/70'} 
                                     backdrop-blur-xl  shadow-xl border border-gray-200 dark:border-slate-800`}
                    >
                        <div className={`flex justify-between items-center mb-3 p-1 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}>
                            <motion.button
                                onClick={() => handleToggleTheme('light')}
                                className={cn("flex-1 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors",
                                    isLight ? 'bg-white shadow-md text-slate-800' : 'text-gray-500 dark:text-gray-400')}
                            >
                                <Sun size={16} className="inline mr-1" /> Light
                            </motion.button>
                            <motion.button
                                onClick={() => handleToggleTheme('dark')}
                                className={cn("flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer font-medium transition-colors",
                                    !isLight ? 'bg-slate-700 shadow-md text-white' : 'text-gray-500 dark:text-gray-400')}
                            >
                                <Moon size={16} className="inline mr-1" /> Dark
                            </motion.button>
                        </div>

                        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2 px-1">Color Palette</h3>
                        <div className={`space-y-0 flex flex-col p-2 overflow-y-auto no-scrollbar`}>
                            {THEME_VARIANTS.map((variant, index) => (
                                <motion.div
                                    key={index}
                                    onClick={() => handleSelectVariant(index)}
                                    className={cn("flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                                        index === variantIndex
                                            ? cn(PRIMARY_COLOR_CLASSES.bgLight + '/50 dark:' + PRIMARY_COLOR_CLASSES.bgDark, PRIMARY_COLOR_CLASSES.ring)
                                            : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                                    )}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="text-sm font-medium">{variant.name}</span>
                                    <div className="flex gap-1">
                                        <div className={cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.lightPreview)} />
                                        <div className={cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.darkPreview)} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- SHIFT ITEM COMPONENT (UNCHANGED) ---
function ShiftItem({ shift, theme, baseLang, onDelete, onUpdate }: { shift: Shift, theme: 'light' | 'dark', baseLang: Lang, onDelete: (id: string) => void, onUpdate: (shift: Shift) => void }) {
    const [shiftLang, setShiftLang] = useState<Lang>(baseLang);
    const itemRef = useRef<HTMLDivElement>(null);
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

    return (
        <motion.div
            key={shift.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-md transition-all",
                shiftItemClasses
            )}
            ref={itemRef}
        >
            <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Day of the Week (Updated Color) */}
                        <span className={cn("text-xs font-bold px-2 py-1 rounded-md", PRIMARY_COLOR_CLASSES.bgLight, PRIMARY_COLOR_CLASSES.text)}>
                            {displayDayOfWeek}
                        </span>
                        {/* Date */}
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md",
                            isLight ? 'bg-gray-100 text-gray-600' : 'bg-slate-700 text-gray-300'
                        )}>
                            {shift.date}
                        </span>
                        {/* Language Toggle */}
                        <motion.button
                            onClick={() => setShiftLang(shiftLang === 'en' ? 'jp' : 'en')}
                            whileTap={{ scale: 0.9 }}
                            className={cn("text-xs font-medium px-2 py-1 rounded-md bg-transparent border", PRIMARY_COLOR_CLASSES.border, PRIMARY_COLOR_CLASSES.text, PRIMARY_COLOR_CLASSES.hover, "transition-colors")}
                            aria-label="Translate shift details"
                        >
                            <Globe size={12} className="inline mr-1" />
                            {shiftLang === 'en' ? 'JP' : 'EN'}
                        </motion.button>
                    </div>

                    <div className="flex items-baseline gap-2">
                        {/* Time - Explicit text classes */}
                        <span className={cn("text-xl font-medium", isLight ? 'text-slate-900' : 'text-white')}>{shift.fromTime}</span>
                        <span className="text-gray-400 text-sm">{strings.to}</span>
                        <span className={cn("text-xl font-medium", isLight ? 'text-slate-900' : 'text-white')}>{shift.toTime}</span>
                    </div>
                    {/* Secondary Text - Explicit text classes */}
                    <p className={cn("text-xs mt-1", isLight ? 'text-gray-400' : 'text-gray-300')}>
                        {shift.hours} {strings.hours} @ ¥{shift.wage}/{strings.hours === 'hours' ? 'h' : '時間'}
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    {/* Pay Color Updated */}
                    <p className={cn("text-2xl font-black mb-2", PRIMARY_COLOR_CLASSES.text)}>{yen.format(shift.pay)}</p>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8 px-3 text-xs font-medium",
                                isLight ? 'border-gray-300' : 'border-slate-600',
                                PRIMARY_COLOR_CLASSES.text,
                                cn(isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10')
                            )}
                            onClick={() => onUpdate(shift)}
                        >
                            <RotateCcw size={14} className="mr-1" /> {strings.update}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8 px-3 text-xs font-medium text-red-600",
                                isLight ? 'border-red-300 text-red-600' : 'border-red-700 text-red-400',
                                'hover:bg-red-500/10'
                            )}
                            onClick={handleDelete}
                        >
                            <Trash2 size={14} className="mr-1" /> {strings.delete}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- MONTHLY GROUP COMPONENT (UNCHANGED) ---
function MonthlyGroup({ monthKey, totalPay, totalHours, shifts, theme, baseLang, onDelete, onUpdate }: {
    monthKey: string;
    totalPay: number;
    totalHours: number;
    shifts: Shift[];
    theme: 'light' | 'dark';
    baseLang: Lang;
    onDelete: (id: string) => void;
    onUpdate: (shift: Shift) => void;
}) {
    const strings = LANG_STRINGS[baseLang];
    const isLight = theme === 'light';
    // Use full month and year name
    const locale = baseLang === 'en' ? enUS : ja;
    const monthName = format(parseISO(`${monthKey}-01`), baseLang === 'en' ? 'MMMM yyyy' : 'yyyy年M月', { locale });

    // Explicit classes for group header
    const groupClasses = isLight
        ? 'bg-indigo-50 border-l-4 border-indigo-500'
        : 'bg-slate-800/80 border-l-4 border-violet-400';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className={cn("flex justify-between items-end mb-3 p-3 rounded-xl", groupClasses)}>
                {/* Explicit text color for title */}
                <h2 className={cn("text-xl font-extrabold", isLight ? 'text-indigo-700' : 'text-violet-300')}>{monthName}</h2>
                <div className="flex flex-col items-end">
                    {/* Explicit text color for hours */}
                    <p className={cn("text-sm font-medium", isLight ? 'text-gray-500' : 'text-gray-400')}>{totalHours} {strings.hours}</p>
                    {/* Pay Color Updated */}
                    <p className={cn("text-2xl font-black", PRIMARY_COLOR_CLASSES.text)}>{yen.format(totalPay)}</p>
                </div>
            </div>
            <div className="space-y-3">
                {shifts.map((s) => (
                    <ShiftItem
                        key={s.id}
                        shift={s}
                        theme={theme}
                        baseLang={baseLang}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// --- SHIFT MODAL (FIXED MISSING PROP) ---
function ShiftModal({ shift, lang, isUpdate, onSave, onClose, theme }: {
    shift: Shift | null;
    lang: Lang;
    isUpdate: boolean;
    onSave: (shift: Partial<Shift> | Shift) => void;
    onClose: () => void;
    // <<< ADDED MISSING THEME PROP
    theme: 'light' | 'dark';
}) {
    const initialShift = shift || { date: format(new Date(), 'yyyy-MM-dd'), fromTime: '09:00', toTime: '17:00', wage: 1500 };
    const [date, setDate] = useState(initialShift.date);
    const [fromTime, setFromTime] = useState(initialShift.fromTime);
    const [toTime, setToTime] = useState(initialShift.toTime);
    const [wage, setWage] = useState(initialShift.wage);
    const isLight = theme === 'light';

    const hours = useMemo(() => calculateHours(fromTime, toTime), [fromTime, toTime]);
    const pay = useMemo(() => Math.floor(hours * wage), [hours, wage]);
    const strings = LANG_STRINGS[lang];

    const handleDateSelect = (d: Date | undefined) => d && setDate(format(d, 'yyyy-MM-dd'));

    const handleSubmit = () => {
        if (hours <= 0 || wage <= 0) return;

        const finalShift: Partial<Shift> = {
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

    const inputClasses = cn(
        "h-14 pl-10 text-xl font-bold border-none rounded-2xl shadow-inner focus-visible:ring-2",
        isLight ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800',
        PRIMARY_COLOR_CLASSES.ring
    );

    const saveButtonClasses = isLight
        ? 'bg-slate-900 text-white'
        : 'bg-white text-slate-900';


    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 backdrop-blur-sm sm:p-4"
        >
            <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl ring-1",
                    modalContentClasses
                )}
            >
                {/* Explicit classes for modal drag handle */}
                <div className={cn("w-12 h-1 rounded-full mx-auto mb-6 sm:hidden", isLight ? 'bg-gray-200' : 'bg-slate-800')} />

                <h2 className="text-xl font-bold mb-4 text-center">
                    {isUpdate ? strings.editShift : strings.addShift}
                </h2>

                <div className="space-y-6">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-between h-14 text-lg font-medium border-none rounded-2xl transition-colors",
                                    isLight ? 'bg-gray-100 text-slate-900 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                                )}
                            >
                                <span className="text-inherit">{date}</span>
                                {/* Icon color updated */}
                                <CalendarIcon className={cn(PRIMARY_COLOR_CLASSES.text, "opacity-80")} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-2xl overflow-hidden" align="center">
                            <Calendar
                                mode="single"
                                selected={new Date(date.replace(/-/g, '/'))}
                                onSelect={handleDateSelect}
                                // Explicit Calendar background color
                                className={cn(isLight ? 'bg-white' : 'bg-slate-900')}
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="grid grid-cols-2 gap-4">
                        <ScrollTimePicker label={strings.start} value={fromTime} onChange={setFromTime} />
                        <ScrollTimePicker label={strings.end} value={toTime} onChange={setToTime} />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{strings.hourlyRate}</label>
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                value={wage}
                                onChange={(e) => setWage(Number(e.target.value))}
                                className={inputClasses}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
                        </div>
                    </div>

                    {/* Gradient updated */}
                    <div className={cn("rounded-2xl p-4 flex justify-between items-center text-white shadow-lg shadow-indigo-500/20", PRIMARY_COLOR_CLASSES.bgGradient)}>
                        <div className="text-indigo-50">
                            <p className="text-sm font-medium opacity-80">{hours} {strings.hours}</p>
                        </div>
                        <p className="text-2xl font-black">{yen.format(pay)}</p>
                    </div>

                    <Button onClick={handleSubmit} className={cn("w-full h-14 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity", saveButtonClasses)}>
                        {isUpdate ? strings.save : strings.addShift}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- MAIN COMPONENT (COMPLETED BODY) ---
export default function ShiftTracker() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [variantIndex, setVariantIndex] = useState(0);
    const [lang, setLang] = useState<Lang>('en');
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);

    const currentVariant = useMemo(() => THEME_VARIANTS[variantIndex], [variantIndex]);
    const strings = LANG_STRINGS[lang];
    const isLight = theme === 'light';

    // Filtered Shifts
    const filteredShifts = useMemo(() => {
        if (!selectedMonth) return shifts;

        const start = startOfMonth(selectedMonth);
        const end = endOfMonth(selectedMonth);

        return shifts.filter(shift => {
            try {
                const shiftDate = parseISO(shift.date);
                return isWithinInterval(shiftDate, { start, end });
            } catch (e) {
                console.error("Error parsing date for filter:", JSON.stringify(shift.date), String(e));
                return false;
            }
        });
    }, [shifts, selectedMonth]);

    const totalPay = useMemo(() => filteredShifts.reduce((s, v) => s + v.pay, 0), [filteredShifts]);
    const totalHours = useMemo(() => filteredShifts.reduce((s, v) => s + v.hours, 0), [filteredShifts]);


    // --- Data Grouping Logic (COMPLETED) ---
    const monthlyGroups = useMemo(() => {
        const groups: { [key: string]: { totalPay: number, totalHours: number, shifts: Shift[] } } = {};
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
        } catch (e) {
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

    const handleSaveShift = (newShift: Partial<Shift>) => {
        if (newShift.id) {
            // Update existing shift
            setShifts(shifts.map(s => s.id === newShift.id ? (newShift as Shift) : s));
            setEditingShift(null);
        } else {
            // Add new shift
            const shiftToAdd: Shift = {
                ...(newShift as Omit<Shift, 'id'>),
                id: Date.now().toString(),
            };
            setShifts([shiftToAdd, ...shifts]);
            setAddModalOpen(false);
        }
    };

    const handleDeleteShift = (id: string) => {
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
    const handleMonthSelect = (date: Date | undefined) => {
        setSelectedMonth(date ? startOfMonth(date) : undefined);
    };

    const handleClearFilter = () => {
        setSelectedMonth(undefined);
    };

    const filteredDateDisplay = useMemo(() => {
        if (!selectedMonth) return strings.filterByMonth;
        const locale = lang === 'en' ? enUS : ja;
        return format(selectedMonth, lang === 'en' ? 'MMMM yyyy' : 'yyyy年M月', { locale });
    }, [selectedMonth, lang, strings]);


    // --- Rendering ---
    const mainBackground = theme === 'light' ? currentVariant.light : currentVariant.dark;

    return (
        <>
            <GlobalStyles />
            <div className={cn("min-h-screen transition-all", mainBackground)}>
                {/* Main Content Area */}
                <div className="max-w-xl mx-auto p-4 pt-8">
                    {/* Header */}
                    <header className="flex justify-between items-start mb-8 z-30 relative">
                        <div>
                            {/* Explicit text color for title */}
                            <h1 className={cn("text-3xl font-extrabold tracking-tight mb-1", isLight ? 'text-slate-900' : 'text-white')}>
                                Shift Tracker
                            </h1>
                            {/* Explicit text color for subtitle */}
                            <p className={cn("text-sm font-medium", isLight ? 'text-gray-500' : 'text-gray-400')}>
                                {strings.grandTotal}: <span className={cn("font-bold", PRIMARY_COLOR_CLASSES.text)}>{yen.format(totalPay)}</span>
                            </p>
                        </div>
                        <ThemeDropdown
                            theme={theme}
                            setTheme={setTheme}
                            variantIndex={variantIndex}
                            setVariantIndex={setVariantIndex}
                            toggleLang={toggleLang}
                        />
                    </header>

                    {/* Controls */}
                    <motion.div
                        layout
                        className={cn("mb-6 p-4 rounded-2xl shadow-lg flex justify-between items-center transition-all",
                            isLight ? 'bg-white/80 border border-gray-100 backdrop-blur-sm' : 'bg-slate-900/50 border border-slate-800 backdrop-blur-sm'
                        )}
                    >
                        {/* Filter by Month Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "flex-1 justify-center mr-3 h-10 font-semibold transition-colors",
                                        PRIMARY_COLOR_CLASSES.border,
                                        PRIMARY_COLOR_CLASSES.text,
                                        cn(isLight ? 'bg-white' : 'bg-slate-700/50'),
                                        cn(isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10')
                                    )}
                                >
                                    <Filter size={16} className="mr-2" />
                                    {filteredDateDisplay}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className={cn("w-auto p-0 border-none shadow-xl rounded-2xl overflow-hidden", isLight ? 'bg-white' : 'bg-slate-900')} align="start">
                                {/* Calendar for Month Selection */}
                                <Calendar
                                    mode="single"
                                    selected={selectedMonth}
                                    onSelect={handleMonthSelect}
                                    initialFocus
                                    locale={lang === 'en' ? enUS : ja}
                                    className={cn(isLight ? 'bg-white' : 'bg-slate-900')}
                                />
                                {selectedMonth && (
                                    <div className={cn("flex justify-end p-2 border-t", isLight ? 'border-gray-100' : 'border-slate-800')}>
                                        <Button
                                            variant="ghost"
                                            onClick={handleClearFilter}
                                            className={cn("text-xs h-8 px-3", PRIMARY_COLOR_CLASSES.text, cn(isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10'))}
                                        >
                                            <X size={14} className="mr-1" />
                                            {strings.clearFilter}
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* Add Shift Button */}
                        <motion.button
                            onClick={() => setAddModalOpen(true)}
                            whileTap={{ scale: 0.95 }}
                            className={cn("h-10 px-4 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md transition-shadow", PRIMARY_COLOR_CLASSES.bgGradient, "shadow-indigo-500/50")}
                        >
                            <Plus size={18} className="mr-1" />
                            {strings.addShift}
                        </motion.button>
                    </motion.div>


                    {/* View Mode Toggle & Stats */}
                    <div className="flex justify-between items-center mb-6">
                        <div className={cn("inline-flex rounded-full p-1 shadow-inner", isLight ? 'bg-gray-200' : 'bg-slate-800')}>
                            <Button
                                onClick={() => setViewMode('list')}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-full px-4 py-1 h-auto text-sm font-medium",
                                    viewMode === 'list'
                                        ? cn(PRIMARY_COLOR_CLASSES.bgLight, PRIMARY_COLOR_CLASSES.text, "shadow-sm")
                                        : cn(isLight ? 'text-gray-500 hover:bg-transparent' : 'text-gray-400 hover:bg-slate-700'),
                                )}
                            >
                                <List size={16} className="mr-1" /> {strings.list}
                            </Button>
                            <Button
                                onClick={() => setViewMode('monthly')}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-full px-4 py-1 h-auto text-sm font-medium",
                                    viewMode === 'monthly'
                                        ? cn(PRIMARY_COLOR_CLASSES.bgLight, PRIMARY_COLOR_CLASSES.text, "shadow-sm")
                                        : cn(isLight ? 'text-gray-500 hover:bg-transparent' : 'text-gray-400 hover:bg-slate-700'),
                                )}
                            >
                                <Clock size={16} className="mr-1" /> {strings.monthly}
                            </Button>
                        </div>
                        <p className={cn("text-sm font-semibold", isLight ? 'text-gray-600' : 'text-gray-400')}>
                            {strings.totalHours}: <span className={cn("font-bold", PRIMARY_COLOR_CLASSES.text)}>{totalHours.toFixed(2)}</span>
                        </p>
                    </div>

                    {/* Shift List/Monthly View */}
                    <AnimatePresence mode="wait">
                        {shifts.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn("p-8 text-center rounded-xl", isLight ? 'bg-white/70' : 'bg-slate-800/70')}
                            >
                                <p className={cn("text-lg font-medium", isLight ? 'text-gray-600' : 'text-gray-400')}>
                                    {lang === 'en' ? 'No shifts added yet. Click the + button to start tracking!' : 'まだシフトがありません。「+」ボタンをクリックして記録を開始してください！'}
                                </p>
                            </motion.div>
                        ) : filteredShifts.length === 0 ? (
                            <motion.div
                                key="no-results"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn("p-8 text-center rounded-xl", isLight ? 'bg-white/70' : 'bg-slate-800/70')}
                            >
                                <p className={cn("text-lg font-medium", isLight ? 'text-gray-600' : 'text-gray-400')}>
                                    {lang === 'en' ? `No shifts found for ${filteredDateDisplay}.` : `${filteredDateDisplay}のシフトは見つかりませんでした。`}
                                </p>
                                <Button variant="link" onClick={handleClearFilter} className={cn(PRIMARY_COLOR_CLASSES.text, isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-violet-900/10')}>
                                    {strings.clearFilter}
                                </Button>
                            </motion.div>
                        ) : viewMode === 'list' ? (
                            <motion.div key="list-view" layout className="space-y-4">
                                {filteredShifts.map(shift => (
                                    <ShiftItem
                                        key={shift.id}
                                        shift={shift}
                                        theme={theme}
                                        baseLang={lang}
                                        onDelete={handleDeleteShift}
                                        onUpdate={setEditingShift}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div key="monthly-view" layout>
                                {monthlyGroups.map(group => (
                                    <MonthlyGroup
                                        key={group.monthKey}
                                        monthKey={group.monthKey}
                                        totalPay={group.totalPay}
                                        totalHours={group.totalHours}
                                        shifts={group.shifts}
                                        theme={theme}
                                        baseLang={lang}
                                        onDelete={handleDeleteShift}
                                        onUpdate={setEditingShift}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(addModalOpen || editingShift) && (
                    <ShiftModal
                        shift={editingShift}
                        lang={lang}
                        isUpdate={!!editingShift}
                        onSave={handleSaveShift}
                        onClose={() => {
                            setAddModalOpen(false);
                            setEditingShift(null);
                        }}
                        theme={theme}
                    />
                )}
            </AnimatePresence>

            {/* Clear All Data Button (Absolute Positioning) */}
            <div className="absolute bottom-4 right-4 z-40">
                <Button
                    onClick={() => setConfirmClearOpen(true)}
                    variant="outline"
                    className={cn(
                        "text-xs h-8 px-3 transition-colors",
                        isLight ? 'border-gray-300 text-gray-500 hover:bg-red-50' : 'border-slate-600 text-gray-400 hover:bg-slate-700/50'
                    )}
                >
                    <Trash2 size={14} className="mr-1 text-red-500" />
                    {strings.clearData}
                </Button>
            </div>

            {/* Clear All Data Confirmation Modal */}
            <AnimatePresence>
                {confirmClearOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setConfirmClearOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center",
                                isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            )}
                        >
                            <Trash2 size={32} className="mx-auto text-red-500 mb-4" />
                            <h3 className="text-lg font-bold mb-2">{strings.areYouSure}</h3>
                            <p className={cn("text-sm mb-6", isLight ? 'text-gray-600' : 'text-gray-400')}>
                                {lang === 'en' ? 'This action cannot be undone.' : 'この操作は元に戻せません。'}
                            </p>
                            <div className="flex justify-between gap-3">
                                <Button onClick={() => setConfirmClearOpen(false)} variant="outline" className={cn("flex-1", isLight ? 'border-gray-300' : 'border-slate-600')}>
                                    {lang === 'en' ? 'Cancel' : 'キャンセル'}
                                </Button>
                                <Button onClick={handleClearAllData} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                                    {strings.clearData}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}