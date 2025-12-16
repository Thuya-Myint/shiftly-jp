import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sun, Moon, Globe, Calendar as CalendarIcon, Trash2, RotateCcw, Filter, X, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
// --- Constants ---
const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_JP = ['日', '月', '火', '水', '木', '金', '土'];
const LOCAL_STORAGE_KEY = 'shiftTrackerShifts';
// --- Dynamic Primary Color Classes ---
const getPrimaryColorClasses = (variantIndex, theme) => {
    const variants = [
        {
            text: theme === 'light' ? 'text-cyan-600' : 'text-cyan-400',
            bgLight: 'bg-cyan-100',
            bgDark: 'bg-cyan-900/60',
            border: theme === 'light' ? 'border-cyan-500' : 'border-cyan-400',
            bgGradient: 'bg-gradient-to-r from-cyan-500 to-sky-600',
            hover: 'hover:bg-cyan-500/10',
            ring: theme === 'light' ? 'ring-cyan-500' : 'ring-cyan-400',
        },
        {
            text: theme === 'light' ? 'text-orange-600' : 'text-orange-400',
            bgLight: 'bg-orange-100',
            bgDark: 'bg-orange-900/60',
            border: theme === 'light' ? 'border-orange-500' : 'border-orange-400',
            bgGradient: 'bg-gradient-to-r from-rose-500 to-orange-600',
            hover: 'hover:bg-orange-500/10',
            ring: theme === 'light' ? 'ring-orange-500' : 'ring-orange-400',
        },
        {
            text: theme === 'light' ? 'text-emerald-600' : 'text-emerald-400',
            bgLight: 'bg-emerald-100',
            bgDark: 'bg-emerald-900/60',
            border: theme === 'light' ? 'border-emerald-500' : 'border-emerald-400',
            bgGradient: 'bg-gradient-to-r from-emerald-500 to-green-600',
            hover: 'hover:bg-emerald-500/10',
            ring: theme === 'light' ? 'ring-emerald-500' : 'ring-emerald-400',
        },
        {
            text: theme === 'light' ? 'text-violet-600' : 'text-violet-400',
            bgLight: 'bg-violet-100',
            bgDark: 'bg-violet-900/60',
            border: theme === 'light' ? 'border-violet-500' : 'border-violet-400',
            bgGradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
            hover: 'hover:bg-violet-500/10',
            ring: theme === 'light' ? 'ring-violet-500' : 'ring-violet-400',
        },
        {
            text: theme === 'light' ? 'text-blue-600' : 'text-blue-400',
            bgLight: 'bg-blue-100',
            bgDark: 'bg-blue-900/60',
            border: theme === 'light' ? 'border-blue-500' : 'border-blue-400',
            bgGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            hover: 'hover:bg-blue-500/10',
            ring: theme === 'light' ? 'ring-blue-500' : 'ring-blue-400',
        },
        {
            text: theme === 'light' ? 'text-red-600' : 'text-red-400',
            bgLight: 'bg-red-100',
            bgDark: 'bg-red-900/60',
            border: theme === 'light' ? 'border-red-500' : 'border-red-400',
            bgGradient: 'bg-gradient-to-r from-red-500 to-pink-600',
            hover: 'hover:bg-red-500/10',
            ring: theme === 'light' ? 'ring-red-500' : 'ring-red-400',
        },
        {
            text: theme === 'light' ? 'text-lime-600' : 'text-lime-400',
            bgLight: 'bg-lime-100',
            bgDark: 'bg-lime-900/60',
            border: theme === 'light' ? 'border-lime-500' : 'border-lime-400',
            bgGradient: 'bg-gradient-to-r from-lime-500 to-yellow-500',
            hover: 'hover:bg-lime-500/10',
            ring: theme === 'light' ? 'ring-lime-500' : 'ring-lime-400',
        },
        {
            text: theme === 'light' ? 'text-purple-600' : 'text-purple-400',
            bgLight: 'bg-purple-100',
            bgDark: 'bg-purple-900/60',
            border: theme === 'light' ? 'border-purple-500' : 'border-purple-400',
            bgGradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
            hover: 'hover:bg-purple-500/10',
            ring: theme === 'light' ? 'ring-purple-500' : 'ring-purple-400',
        },
    ];
    return variants[variantIndex] || variants[3];
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
        allMonths: 'All Months',
        noShiftsMonth: 'No shifts this month',
        noShiftsYet: 'Ready to track shifts?',
        startTracking: 'Start by adding your first shift to begin tracking your work hours and earnings.',
        tryDifferentMonth: 'Try selecting a different month or clear the filter.',
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
        allMonths: '全ての月',
        noShiftsMonth: 'この月にシフトはありません',
        noShiftsYet: 'シフト追跡を始めましょう',
        startTracking: '最初のシフトを追加して、勤務時間と収入の追跡を開始してください。',
        tryDifferentMonth: '別の月を選択するか、フィルタをクリアしてください。',
    }
};
// --- GLOBAL STYLES WITH PERFORMANCE OPTIMIZATIONS ---
const GlobalStyles = () => (_jsx("style", { children: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        /* Prevent FOUC and blinking */
        html {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          opacity: 1;
          visibility: visible;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        
        body.dark {
          background: linear-gradient(135deg, #0f172a, #1e293b);
        }
        
        

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 20s ease infinite;
        }
        
       
    ` }));
// --- THEME VARIANTS ---
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
    {
        name: 'Sunset Fire',
        light: 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-red-400 to-pink-400',
        dark: 'bg-gradient-to-br from-red-900 via-pink-800 to-rose-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-red-600 to-pink-600'
    },
    {
        name: 'Electric Lime',
        light: 'bg-gradient-to-br from-lime-50 via-yellow-50 to-green-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-lime-400 to-yellow-400',
        dark: 'bg-gradient-to-br from-lime-900 via-yellow-800 to-green-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-lime-600 to-yellow-600'
    },
    {
        name: 'Royal Purple',
        light: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-purple-400 to-indigo-400',
        dark: 'bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-purple-600 to-indigo-600'
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
// --- PWA INSTALL PROMPT COMPONENT ---
function PWAInstallPrompt({ isOpen, onClose, lang }) {
    const strings = LANG_STRINGS[lang];
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);
    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
        onClose();
    };
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone)
        return null;
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 }, transition: { type: "tween", duration: 0.2, ease: "easeOut" }, className: "fixed bottom-4 left-4 right-4 z-[99999] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-slate-700 gpu-accelerated", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: cn("p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40"), children: _jsx(Plus, { className: "text-violet-600 dark:text-violet-400", size: 20 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-gray-900 dark:text-white mb-1", children: lang === 'en' ? 'Add to Home Screen' : 'ホーム画面に追加' }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-3", children: lang === 'en'
                                    ? 'Install this app for quick access and better experience'
                                    : 'より良い体験のためにこのアプリをインストールしてください' }), _jsxs("div", { className: "flex gap-2", children: [isIOS ? (_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: lang === 'en'
                                            ? 'Tap Share → Add to Home Screen'
                                            : 'シェア → ホーム画面に追加をタップ' })) : (_jsx(Button, { onClick: handleInstall, className: cn("text-white font-semibold text-sm h-8 px-3 bg-gradient-to-r from-violet-500 to-purple-600"), children: lang === 'en' ? 'Install' : 'インストール' })), _jsx(Button, { onClick: onClose, variant: "outline", className: "text-sm h-8 px-3 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100", children: lang === 'en' ? 'Later' : '後で' })] })] }), _jsx(Button, { onClick: onClose, variant: "ghost", size: "sm", className: "p-1 h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300", children: _jsx(X, { size: 14 }) })] }) })) }));
}
// --- CUSTOM ALERT COMPONENT ---
function CustomAlert({ isOpen, onConfirm, onCancel, title, message }) {
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", onClick: onCancel, children: _jsxs(motion.div, { initial: { scale: 0.95, y: 10 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.95, y: 10 }, transition: { type: "tween", duration: 0.15, ease: "easeOut" }, className: "bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-slate-700 gpu-accelerated", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(AlertTriangle, { className: "text-red-500 flex-shrink-0", size: 24 }), _jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white", children: title })] }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-6", children: message }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: onCancel, variant: "outline", className: "flex-1 h-10 rounded-xl border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400", children: "Cancel" }), _jsx(Button, { onClick: onConfirm, className: cn("flex-1 h-10 rounded-xl text-white font-semibold", "bg-red-500 hover:bg-red-600"), children: "Delete" })] })] }) })) }));
}
// --- INDEXEDDB UTILITIES ---
const DB_NAME = 'ShiftTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'shifts';
const openDB = () => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB not supported'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        const timeout = setTimeout(() => {
            reject(new Error('IndexedDB timeout'));
        }, 5000);
        request.onerror = () => {
            clearTimeout(timeout);
            reject(request.error || new Error('IndexedDB open failed'));
        };
        request.onsuccess = () => {
            clearTimeout(timeout);
            resolve(request.result);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};
const saveToIndexedDB = async (key, data) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(data, key);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Save timeout'));
            }, 3000);
            transaction.oncomplete = () => {
                clearTimeout(timeout);
                resolve();
            };
            transaction.onerror = () => {
                clearTimeout(timeout);
                reject(transaction.error || new Error('Save failed'));
            };
        });
    }
    catch (e) {
        throw new Error(`IndexedDB save failed: ${e}`);
    }
};
const loadFromIndexedDB = async (key) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Load timeout'));
            }, 3000);
            request.onsuccess = () => {
                clearTimeout(timeout);
                resolve(request.result);
            };
            request.onerror = () => {
                clearTimeout(timeout);
                reject(request.error || new Error('Load failed'));
            };
        });
    }
    catch (e) {
        throw new Error(`IndexedDB load failed: ${e}`);
    }
};
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
// --- SCROLL PICKER (FIXED ALIGNMENT & RESPONSIVENESS) ---
// Define responsive constants for Item Height and Container Height
const ITEM_HEIGHT_SM = 32;
const ITEM_HEIGHT_LG = 40;
const CONTAINER_HEIGHT_MULTIPLIER_SM = 5;
const CONTAINER_HEIGHT_MULTIPLIER_LG = 3;
function ScrollColumn({ options, selected, onSelect, isSmallDevice, primaryColors }) {
    const containerRef = useRef(null);
    const isScrolling = useRef(false);
    const timeoutRef = useRef(null);
    // Determine heights based on screen size
    const ITEM_HEIGHT = isSmallDevice ? ITEM_HEIGHT_SM : ITEM_HEIGHT_LG;
    const CONTAINER_HEIGHT = ITEM_HEIGHT * (isSmallDevice ? CONTAINER_HEIGHT_MULTIPLIER_SM : CONTAINER_HEIGHT_MULTIPLIER_LG);
    useEffect(() => {
        if (containerRef.current && !isScrolling.current) {
            const index = options.findIndex(o => Number(o) === selected);
            if (index !== -1)
                containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
    }, [selected, options, ITEM_HEIGHT]);
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
    return (_jsxs("div", { className: "relative group ", children: [_jsx("div", { style: { height: `${ITEM_HEIGHT}px`, top: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` }, className: cn("absolute left-0 right-0 rounded-lg pointer-events-none z-0", primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark) }), _jsxs("div", { ref: containerRef, onScroll: handleScroll, style: { height: `${CONTAINER_HEIGHT}px` }, className: "overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 w-10 sm:w-12 text-center flex-shrink-0", children: [_jsx("div", { style: { height: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` } }), options.map((o, idx) => {
                        const isSelected = Number(o) === selected;
                        return (_jsx("div", { style: { height: `${ITEM_HEIGHT}px` }, onClick: () => {
                                if (containerRef.current) {
                                    containerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
                                    onSelect(Number(o));
                                }
                            }, className: cn("flex items-center justify-center snap-center cursor-pointer transition-all duration-200", isSelected
                                ? cn("font-bold scale-110", isSmallDevice ? 'text-lg' : 'text-xl', primaryColors.text) // **FIX**: Smaller text for selected item
                                : cn("text-gray-800 dark:text-gray-300 scale-100", isSmallDevice ? 'text-sm' : 'text-base') // **FIX**: Smaller text for non-selected items
                            ), children: o }, idx));
                    }), _jsx("div", { style: { height: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` } })] })] }));
}
function ScrollTimePicker({ value, onChange, label, primaryColors }) {
    const [hour, minute] = (value || '00:00').split(':').map(v => parseInt(v, 10));
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const updateTime = (newH, newM) => onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    // Simple check for small device (can be replaced by a more robust custom hook if needed)
    const [isSmallDevice, setIsSmallDevice] = useState(false);
    useEffect(() => {
        const checkSize = () => setIsSmallDevice(window.innerWidth < 640);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);
    return (_jsxs("div", { className: "flex flex-col items-center flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-center gap-1 p-1 sm:p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 min-w-0", children: [_jsx(ScrollColumn, { options: hours, selected: hour, onSelect: (h) => updateTime(h, minute), isSmallDevice: isSmallDevice, primaryColors: primaryColors }), _jsx("span", { className: cn("text-gray-600 dark:text-gray-400 font-bold px-0.5", isSmallDevice ? 'text-base' : 'text-lg'), children: ":" }), _jsx(ScrollColumn, { options: minutes, selected: minute, onSelect: (m) => updateTime(hour, m), isSmallDevice: isSmallDevice, primaryColors: primaryColors })] }), _jsx("p", { className: cn("mt-1 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400", isSmallDevice ? 'text-[10px] mt-1' : 'text-xs mt-2'), children: label })] }));
}
// --- THEME DROPDOWN ---
function ThemeDropdown({ theme, setTheme, variantIndex, setVariantIndex, toggleLang, primaryColors }) {
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
    const handleSelectVariant = useCallback((index) => {
        setVariantIndex(index);
        setIsOpen(false);
    }, [setVariantIndex]);
    const handleToggleTheme = useCallback((newTheme) => {
        setTheme(newTheme);
        setIsOpen(false);
    }, [setTheme]);
    const handleThemeIconClick = () => setIsOpen(prev => !prev);
    return (_jsxs("div", { className: "relative flex gap-2", ref: dropdownRef, children: [_jsx(motion.button, { onClick: handleThemeIconClick, whileTap: { scale: 0.95 }, className: cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer", frostedGlassClasses), "aria-label": "Change theme", children: isOpen || isLight ? _jsx(Sun, { size: 18, className: "text-orange-500" }) : _jsx(Moon, { size: 18, className: "text-indigo-400" }) }), _jsx(motion.button, { onClick: toggleLang, whileTap: { scale: 0.95 }, className: cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer", frostedGlassClasses), "aria-label": "Toggle language", children: _jsx(Globe, { size: 18, className: primaryColors.text }) }), _jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { initial: { opacity: 0, y: -10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.95 }, transition: { type: "tween", duration: 0.15, ease: "easeOut" }, className: cn(`absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-xl p-3 sm:p-4 origin-top-right shadow-xl ring-1 ring-gray-950/5 dark:ring-white/10`, isLight ? 'bg-white' : 'bg-slate-950', 'z-[9999]'), children: [_jsxs("div", { className: `flex justify-between items-center mb-3 p-1 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}  `, children: [_jsxs(motion.button, { onClick: () => handleToggleTheme('light'), className: cn("flex-1 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors", isLight
                                        ? 'bg-white shadow-md text-slate-800'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-100'), children: [_jsx(Sun, { size: 16, className: "inline mr-1" }), " Light"] }), _jsxs(motion.button, { onClick: () => handleToggleTheme('dark'), className: cn("flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer font-medium transition-colors", !isLight
                                        ? 'bg-slate-700 shadow-md text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'), children: [_jsx(Moon, { size: 16, className: "inline mr-1" }), " Dark"] })] }), _jsx("h3", { className: "text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2 px-1", children: "Color Palette" }), _jsx("div", { className: `space-y-0 flex flex-col p-2 overflow-y-auto no-scrollbar`, children: THEME_VARIANTS.map((variant, index) => (_jsxs(motion.div, { onClick: () => handleSelectVariant(index), className: cn("flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all", index === variantIndex
                                    ? cn(primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark, "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900", primaryColors.ring)
                                    : 'hover:bg-gray-100 dark:hover:bg-slate-800'), whileTap: { scale: 0.98 }, children: [_jsx("span", { className: cn("text-sm font-medium", isLight ? 'text-gray-900' : 'text-white'), children: variant.name }), _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.lightPreview) }), _jsx("div", { className: cn("w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-700", variant.darkPreview) })] })] }, index))) })] })) })] }));
}
// --- SHIFT ITEM COMPONENT ---
const ShiftItem = React.memo(function ShiftItem({ shift, theme, baseLang, onDelete, onUpdate, primaryColors }) {
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
            : 'bg-slate-900/60 border-slate-700/50 hover:bg-slate-900/80'), ref: itemRef, children: [_jsx("div", { className: cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", "bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5") }), _jsxs("div", { className: "flex justify-between items-start relative z-10 gap-2", children: [_jsxs("div", { className: "flex flex-col gap-2 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1 sm:gap-2", children: [_jsx("span", { className: cn("text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl shadow-sm", primaryColors.bgLight, "dark:bg-violet-900/40", primaryColors.text), children: displayDayOfWeek }), _jsx("span", { className: "text-xs sm:text-sm font-semibold px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100/80 dark:bg-slate-700/60 text-gray-900 dark:text-gray-100 shadow-sm backdrop-blur-sm", children: shift.date }), _jsxs("button", { onClick: () => setShiftLang(shiftLang === 'en' ? 'jp' : 'en'), className: cn("text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border-2 backdrop-blur-sm transition-all duration-300", primaryColors.border, primaryColors.text, "hover:shadow-md", theme === 'light' ? 'bg-white/60' : 'bg-slate-800/60'), "aria-label": "Translate shift details", children: [_jsx(Globe, { size: 12, className: "inline mr-1" }), shiftLang === 'en' ? 'JP' : 'EN'] })] }), _jsxs("div", { className: "flex items-baseline gap-2 sm:gap-3", children: [_jsx("span", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: shift.fromTime }), _jsx("span", { className: cn("text-base sm:text-lg font-medium", primaryColors.text), children: "\u2192" }), _jsx("span", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white", children: shift.toTime })] }), _jsxs("p", { className: "text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium", children: [shift.hours, " ", strings.hours, " @ \u00A5", shift.wage.toLocaleString(), "/", strings.hours === 'hours' ? 'h' : '時間'] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2 flex-shrink-0", children: [_jsx("div", { className: cn("px-3 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm", primaryColors.bgGradient), children: _jsx("p", { className: "text-lg sm:text-2xl font-black text-white", children: yen.format(shift.pay) }) }), _jsxs("div", { className: "flex flex-col gap-1 sm:gap-2", children: [_jsxs("button", { className: cn("h-8 px-2 sm:h-9 sm:px-3 text-xs font-semibold rounded-lg border transition-all", primaryColors.border, primaryColors.text, theme === 'light' ? 'bg-white/60' : 'bg-slate-800/60'), onClick: () => onUpdate(shift), children: [_jsx(RotateCcw, { size: 12, className: "mr-1" }), " ", strings.update] }), _jsxs("button", { className: "h-8 px-2 sm:h-9 sm:px-3 text-xs font-semibold rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 bg-white/60 dark:bg-slate-800/60 transition-all", onClick: handleDelete, children: [_jsx(Trash2, { size: 12, className: "mr-1" }), " ", strings.delete] })] })] })] })] }, shift.id));
});
// --- MONTHLY GROUP COMPONENT ---
const MonthlyGroup = React.memo(function MonthlyGroup({ monthKey, totalPay, totalHours, shifts, theme, baseLang, onDelete, onUpdate, primaryColors }) {
    const strings = LANG_STRINGS[baseLang];
    const monthName = useMemo(() => format(parseISO(`${monthKey}-01`), baseLang === 'en' ? 'MMM yyyy' : 'yyyy年M月'), [monthKey, baseLang]);
    const groupClasses = useMemo(() => theme === 'light'
        ? `${primaryColors.bgLight} border-l-4 ${primaryColors.border}`
        : `bg-slate-800/80 border-l-4 ${primaryColors.border}`, [theme, primaryColors]);
    return (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: cn("flex justify-between items-end mb-3 p-3 rounded-xl z-10", groupClasses), children: [_jsx("h2", { className: cn("text-xl font-extrabold", primaryColors.text), children: monthName }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsxs("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: [totalHours, " ", strings.hours] }), _jsx("p", { className: cn("text-2xl font-black", primaryColors.text), children: yen.format(totalPay) })] })] }), shifts.length > 5 ? (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: shifts.map((s) => (_jsx(ShiftItem, { shift: s, theme: theme, baseLang: baseLang, onDelete: onDelete, onUpdate: onUpdate, primaryColors: primaryColors }, s.id))) })) : (_jsx("div", { className: "space-y-3", children: shifts.map((s) => (_jsx(ShiftItem, { shift: s, theme: theme, baseLang: baseLang, onDelete: onDelete, onUpdate: onUpdate, primaryColors: primaryColors }, s.id))) }))] }));
});
// --- MONTH FILTER COMPONENT (UNCHANGED) ---
function MonthFilter({ selectedMonth, onMonthSelect, lang, primaryColors }) {
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
                    : "border-gray-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/60 text-gray-800 dark:text-gray-400"), children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CalendarIcon, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: selectedMonth ? format(selectedMonth, lang === 'en' ? 'MMM yyyy' : 'yyyy年M月') : strings.filterByMonth })] }), selectedMonth && _jsx(X, { size: 16, className: "opacity-50 flex-shrink-0 ml-2", onClick: (e) => { e.stopPropagation(); onMonthSelect(undefined); } })] }), _jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { type: "tween", duration: 0.12, ease: "easeOut" }, style: { zIndex: 9999 }, className: "absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 max-h-60 overflow-y-auto", children: _jsx("div", { className: "p-2", children: allShiftMonths.map((monthStr) => (_jsx(motion.button, { onClick: () => handleSelectMonth(monthStr), whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors", selectedMonth && format(selectedMonth, 'yyyy-MM') === monthStr
                                ? cn(primaryColors.bgLight, primaryColors.text, "font-bold")
                                : "text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"), children: format(parseISO(monthStr + '-01'), lang === 'en' ? 'MMM yyyy' : 'yyyy年M月') }, monthStr))) }) })) })] }));
}
function AddEditShiftModal({ isOpen, onClose, onSubmit, initialShift, lang, primaryColors }) {
    const strings = LANG_STRINGS[lang];
    const initialFormState = useMemo(() => ({
        date: initialShift ? parseISO(initialShift.date) : new Date(),
        fromTime: initialShift ? initialShift.fromTime : '09:00',
        toTime: initialShift ? initialShift.toTime : '17:00',
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
            id: form.id || Date.now().toString(),
            date: format(form.date, 'yyyy-MM-dd'),
            fromTime: form.fromTime,
            toTime: form.toTime,
            wage: parseFloat(form.wage) || 0,
        });
        onClose();
    };
    const hours = calculateHours(form.fromTime, form.toTime);
    const pay = Math.round(hours * (parseFloat(form.wage) || 0));
    const title = initialShift ? strings.editShift : strings.addShift;
    const submitText = initialShift ? strings.save : strings.addShift;
    const modalBgClasses = "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 shadow-2xl";
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 hw-accelerate", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.95, y: 20 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.95, y: 20 }, transition: { type: "tween", duration: 0.2, ease: "easeOut" }, className: cn("w-full max-w-md rounded-3xl p-6 relative hw-accelerate", modalBgClasses), onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { className: cn("text-2xl font-extrabold mb-6", primaryColors.text), children: title }), _jsx(Button, { variant: "ghost", size: "icon", className: "absolute top-4 right-4 h-10 w-10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { size: 20 }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2", children: lang === 'en' ? 'Date' : '日付' }), _jsxs(Popover, { open: isDatePopoverOpen, onOpenChange: setIsDatePopoverOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal h-12 rounded-xl border-2 items-center", "text-gray-800 dark:text-gray-200", primaryColors.border), children: [_jsx(CalendarIcon, { className: cn("mr-2 h-4 w-4", primaryColors.text) }), form.date ? format(form.date, lang === 'en' ? 'PPP' : 'yyyy年M月d日(EEE)') : _jsx("span", { children: "Pick a date" })] }) }), _jsx(PopoverContent, { className: "w-full md:w-auto p-0 z-[10001]", children: _jsx(Calendar, { mode: "single", selected: form.date, onSelect: handleDateSelect, initialFocus: true, locale: lang === 'jp' ? undefined : undefined, className: "max-w-full" }) })] })] }), _jsxs("div", { className: "flex justify-between items-center gap-1 sm:gap-2 py-2", children: [" ", _jsx(ScrollTimePicker, { value: form.fromTime, onChange: (v) => handleTimeChange('fromTime', v), label: strings.start, primaryColors: primaryColors }), _jsx("span", { className: cn("font-bold", primaryColors.text, "text-xl sm:text-2xl"), children: strings.to }), _jsx(ScrollTimePicker, { value: form.toTime, onChange: (v) => handleTimeChange('toTime', v), label: strings.end, primaryColors: primaryColors })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "wage", className: "block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2", children: _jsxs("span", { className: "flex items-center", children: [_jsx(Zap, { size: 14, className: "inline mr-1" }), " ", strings.hourlyRate, " (", lang === 'en' ? 'JPY' : '円', ")"] }) }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "wage", name: "wage", type: "number", step: "100", placeholder: "1000", value: form.wage, onChange: handleChange, className: cn("w-full h-12 rounded-xl text-lg font-semibold pl-10 border-2 text-gray-900 dark:text-white", primaryColors.border) }), _jsx("span", { className: cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold", primaryColors.text), children: "\u00A5" })] })] }), _jsxs("div", { className: cn("p-4 rounded-xl flex justify-between items-center shadow-md", primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark), children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-400", children: strings.totalHours }), _jsxs("p", { className: cn("text-2xl font-black", primaryColors.text), children: [hours, " ", strings.hours] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-400", children: strings.totalPay }), _jsx("p", { className: cn("text-2xl font-black", primaryColors.text), children: yen.format(pay) })] })] }), _jsx("button", { type: "submit", className: cn("w-full h-12 rounded-xl text-lg font-bold text-white transition-all shadow-lg hover:shadow-xl", primaryColors.bgGradient), children: submitText })] })] }) })) }));
}
// --- MAIN APP COMPONENT (UNCHANGED) ---
export default function ShiftTracker() {
    const [shifts, setShifts] = useState([]);
    const [hourlyRate, setHourlyRate] = useState(1000);
    const [lang, setLang] = useState('jp');
    const [theme, setTheme] = useState('light');
    const [variantIndex, setVariantIndex] = useState(3); // Violet Horizon
    const [viewMode, setViewMode] = useState('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date());
    const [alertConfig, setAlertConfig] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLaunchScreen, setShowLaunchScreen] = useState(true);
    // Block overscroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
        else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isModalOpen]);
    const strings = LANG_STRINGS[lang];
    const themeVariant = THEME_VARIANTS[variantIndex];
    const PRIMARY_COLOR_CLASSES = useMemo(() => getPrimaryColorClasses(variantIndex, theme), [variantIndex, theme]);
    // --- Local Storage Hooks (UNCHANGED) ---
    // Show install prompt after 3 seconds if not installed
    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
        if (!isStandalone && !hasSeenPrompt) {
            const timer = setTimeout(() => {
                setShowInstallPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);
    const handleCloseInstallPrompt = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-prompt-seen', 'true');
    };
    useEffect(() => {
        const loadData = async () => {
            const startTime = Date.now();
            try {
                // Try IndexedDB first
                const data = await loadFromIndexedDB('appData');
                if (data && typeof data === 'object') {
                    setShifts(data.shifts || []);
                    setHourlyRate(data.hourlyRate || 1000);
                    setLang(data.lang || 'jp');
                    setTheme(data.theme || 'light');
                    setVariantIndex(data.variantIndex || 3);
                }
            }
            catch (e) {
                console.warn("IndexedDB failed, trying localStorage:", e);
                // Fallback to localStorage
                try {
                    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (savedData) {
                        const parsedData = JSON.parse(savedData);
                        setShifts(parsedData.shifts || []);
                        setHourlyRate(parsedData.hourlyRate || 1000);
                        setLang(parsedData.lang || 'jp');
                        setTheme(parsedData.theme || 'light');
                        setVariantIndex(parsedData.variantIndex || 3);
                        // Try to migrate to IndexedDB
                        try {
                            await saveToIndexedDB('appData', parsedData);
                        }
                        catch (e) {
                            console.warn("Failed to migrate to IndexedDB:", e);
                        }
                    }
                }
                catch (e) {
                    console.error("Failed to load from localStorage:", e);
                }
            }
            // Ensure minimum launch screen duration
            const elapsed = Date.now() - startTime;
            const minDuration = 1200;
            if (elapsed < minDuration) {
                setTimeout(() => {
                    setIsLoading(false);
                    setTimeout(() => setShowLaunchScreen(false), 300);
                }, minDuration - elapsed);
            }
            else {
                setIsLoading(false);
                setTimeout(() => setShowLaunchScreen(false), 300);
            }
        };
        loadData();
    }, []);
    useEffect(() => {
        if (isLoading)
            return; // Don't save during initial load
        const saveData = async () => {
            const data = { shifts, hourlyRate, lang, theme, variantIndex };
            // Always save to localStorage as backup
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            // Try to save to IndexedDB
            try {
                await saveToIndexedDB('appData', data);
            }
            catch (e) {
                console.warn("Failed to save to IndexedDB:", e);
            }
        };
        saveData();
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
        // Update theme color for status bar
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            const colors = {
                0: { light: '#0891b2', dark: '#0e7490' }, // cyan
                1: { light: '#ea580c', dark: '#c2410c' }, // orange
                2: { light: '#059669', dark: '#047857' }, // emerald
                3: { light: '#7c3aed', dark: '#6d28d9' }, // violet
                4: { light: '#2563eb', dark: '#1d4ed8' }, // blue
                5: { light: '#dc2626', dark: '#b91c1c' }, // red
                6: { light: '#65a30d', dark: '#4d7c0f' }, // lime
                7: { light: '#9333ea', dark: '#7c2d12' }, // purple
            };
            const colorSet = colors[variantIndex] || colors[3];
            themeColorMeta.setAttribute('content', theme === 'dark' ? colorSet.dark : colorSet.light);
        }
    }, [shifts, hourlyRate, lang, theme, variantIndex, isLoading]);
    // --- Core Logic (UNCHANGED) ---
    const processShiftData = useCallback((rawShift) => {
        const hours = calculateHours(rawShift.fromTime, rawShift.toTime);
        const pay = Math.round(hours * rawShift.wage);
        const dayOfWeek = getDayOfWeek(rawShift.date, lang);
        return {
            ...rawShift,
            hours,
            pay,
            dayOfWeek,
        };
    }, [lang]);
    const addOrUpdateShift = (newShiftData) => {
        const processedShift = processShiftData({ ...newShiftData, wage: newShiftData.wage || hourlyRate });
        if (editingShift) {
            // Update existing
            setShifts(prev => prev.map(s => s.id === processedShift.id ? processedShift : s));
        }
        else {
            // New shift
            setShifts(prev => [processedShift, ...prev]);
        }
        setEditingShift(null);
        setIsModalOpen(false);
    };
    const deleteShift = (id) => {
        setAlertConfig({
            isOpen: true,
            title: strings.areYouSure,
            message: strings.delete,
            onConfirm: () => {
                setShifts(prev => prev.filter(s => s.id !== id));
                setAlertConfig(null);
            }
        });
    };
    const openAddModal = () => {
        setEditingShift(null);
        setIsModalOpen(true);
    };
    const openEditModal = (shift) => {
        setEditingShift(shift);
        setIsModalOpen(true);
    };
    const toggleLang = () => setLang(prev => prev === 'en' ? 'jp' : 'en');
    // --- Data Aggregation and Filtering (UNCHANGED) ---
    const sortedAndFilteredShifts = useMemo(() => {
        let filtered = shifts.filter(shift => {
            if (!filterMonth)
                return true;
            const start = startOfMonth(filterMonth);
            const end = endOfMonth(filterMonth);
            try {
                const shiftDate = parseISO(shift.date);
                return isWithinInterval(shiftDate, { start, end });
            }
            catch (e) {
                return false;
            }
        });
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [shifts, filterMonth]);
    const aggregatedData = useMemo(() => {
        const total = sortedAndFilteredShifts.reduce((acc, shift) => ({
            totalHours: acc.totalHours + shift.hours,
            totalPay: acc.totalPay + shift.pay
        }), { totalHours: 0, totalPay: 0 });
        const monthlyGroups = sortedAndFilteredShifts.reduce((acc, shift) => {
            const monthKey = shift.date.substring(0, 7);
            if (!acc[monthKey]) {
                acc[monthKey] = { totalPay: 0, totalHours: 0, shifts: [] };
            }
            acc[monthKey].totalPay += shift.pay;
            acc[monthKey].totalHours += shift.hours;
            acc[monthKey].shifts.push(shift);
            return acc;
        }, {});
        const sortedMonths = Object.keys(monthlyGroups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        return {
            grandTotal: total,
            monthlyGroups,
            sortedMonths
        };
    }, [sortedAndFilteredShifts]);
    // --- Render Components (UNCHANGED) ---
    const renderShiftList = () => (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: window.innerWidth < 768 ? 0 : 0.15 }, className: "space-y-4 pt-4", children: sortedAndFilteredShifts.length > 0 ? (sortedAndFilteredShifts.map(shift => (_jsx(ShiftItem, { shift: shift, theme: theme, baseLang: lang, onDelete: deleteShift, onUpdate: openEditModal, primaryColors: PRIMARY_COLOR_CLASSES }, shift.id)))) : (_jsx(EmptyState, { lang: lang, hasFilter: !!filterMonth, onClearFilter: () => setFilterMonth(undefined) })) }, "list"));
    const renderMonthlyView = () => {
        const currentMonthKey = filterMonth ? format(filterMonth, 'yyyy-MM') : format(new Date(), 'yyyy-MM');
        const monthData = aggregatedData.monthlyGroups[currentMonthKey];
        return (_jsx("div", { className: "pt-4", children: monthData ? (_jsx(MonthlyGroup, { monthKey: currentMonthKey, totalPay: monthData.totalPay, totalHours: monthData.totalHours, shifts: monthData.shifts, theme: theme, baseLang: lang, onDelete: deleteShift, onUpdate: openEditModal, primaryColors: PRIMARY_COLOR_CLASSES }, currentMonthKey)) : (_jsx(EmptyState, { lang: lang, hasFilter: !!filterMonth, onClearFilter: () => setFilterMonth(new Date()) })) }));
    };
    // --- Empty State Component (UNCHANGED) ---
    function EmptyState({ lang, hasFilter, onClearFilter }) {
        const strings = LANG_STRINGS[lang];
        return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: cn("p-8 rounded-3xl text-center backdrop-blur-md transition-colors border", theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-900/60 border-slate-700'), children: hasFilter ? (_jsxs(_Fragment, { children: [_jsx(Filter, { size: 40, className: cn("mx-auto mb-4", PRIMARY_COLOR_CLASSES.text) }), _jsx("h3", { className: "text-xl font-bold mb-2 text-gray-800 dark:text-gray-200", children: strings.noShiftsMonth }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: strings.tryDifferentMonth }), _jsxs(Button, { onClick: onClearFilter, variant: "outline", className: cn(PRIMARY_COLOR_CLASSES.border, PRIMARY_COLOR_CLASSES.text, "hover:bg-indigo-50/20 dark:hover:bg-violet-900/30"), children: [_jsx(X, { size: 16, className: "mr-2" }), " ", lang === 'en' ? 'Current Month' : '今月'] })] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { size: 40, className: cn("mx-auto mb-4", PRIMARY_COLOR_CLASSES.text) }), _jsx("h3", { className: "text-xl font-bold mb-2 text-gray-800 dark:text-gray-200", children: strings.noShiftsYet }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: strings.startTracking }), _jsxs(Button, { onClick: openAddModal, className: cn("text-white font-bold", PRIMARY_COLOR_CLASSES.bgGradient), children: [_jsx(Plus, { size: 16, className: "mr-2" }), " ", strings.addShift] })] })) }));
    }
    // --- Main Layout (UNCHANGED) ---
    const appClasses = theme === 'light'
        ? themeVariant.light
        : themeVariant.dark;
    if (showLaunchScreen) {
        return (_jsx(motion.div, { initial: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, className: cn("min-h-screen flex flex-col items-center justify-center hw-accelerate", appClasses), children: _jsxs(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5, ease: "easeOut" }, className: "text-center", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: "linear" }, className: cn("w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-6", PRIMARY_COLOR_CLASSES.border) }), _jsx(motion.h1, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.2, duration: 0.5 }, className: cn("text-3xl font-extrabold mb-2", PRIMARY_COLOR_CLASSES.text), children: "Shomyn" }), _jsx(motion.p, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.4, duration: 0.5 }, className: "text-gray-600 dark:text-gray-400", children: lang === 'en' ? 'Loading your shifts...' : 'シフトを読み込み中...' })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(GlobalStyles, {}), _jsxs("div", { className: cn("min-h-screen", appClasses), children: [_jsxs("div", { className: cn("min-h-screen flex flex-col items-center sm:p-6 transition-colors duration-200"), children: [_jsxs("header", { className: "w-full max-w-4xl sticky p-4 top-0 z-40 mb-6 py-4 backdrop-blur-md bg-transparent/80", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: cn("text-2xl sm:text-3xl font-extrabold tracking-tight", PRIMARY_COLOR_CLASSES.text), children: "Shomyn" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(ThemeDropdown, { theme: theme, setTheme: setTheme, variantIndex: variantIndex, setVariantIndex: setVariantIndex, toggleLang: toggleLang, primaryColors: PRIMARY_COLOR_CLASSES }), _jsx("button", { onClick: openAddModal, className: cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer backdrop-blur-md border shadow-sm transition-all active:scale-95", PRIMARY_COLOR_CLASSES.bgGradient, "text-white"), "aria-label": "Add new shift", children: _jsx(Plus, { size: 18 }) })] })] }), _jsxs("div", { className: cn("p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 border", theme === 'light'
                                            ? 'bg-white/80 border-gray-200'
                                            : 'bg-slate-900/70 border-slate-700'), children: [_jsxs("div", { className: "flex flex-col items-center sm:items-start", children: [_jsx("p", { className: "text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 text-center sm:text-left", children: strings.grandTotal }), _jsx("p", { className: cn("text-3xl font-black text-center sm:text-left", PRIMARY_COLOR_CLASSES.text), children: yen.format(aggregatedData.grandTotal.totalPay) }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left", children: [aggregatedData.grandTotal.totalHours, " ", strings.hours] })] }), _jsx("div", { className: "flex gap-3 w-full sm:w-auto flex-1 sm:flex-none min-w-0", children: _jsx(MonthFilter, { selectedMonth: filterMonth, onMonthSelect: setFilterMonth, lang: lang, primaryColors: PRIMARY_COLOR_CLASSES }) })] })] }), _jsx("main", { className: "w-full max-w-4xl pb-16 px-4", children: renderMonthlyView() }), _jsx("footer", { className: "w-full max-w-4xl mt-8 pt-6 pb-safe", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: cn("relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border shadow-xl", theme === 'light'
                                        ? 'bg-white/80 border-gray-200/50'
                                        : 'bg-slate-900/60 border-slate-700/50'), children: [_jsx("div", { className: cn("absolute inset-0 opacity-20 animate-gradient-x", PRIMARY_COLOR_CLASSES.bgGradient) }), _jsxs("div", { className: "relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Button, { variant: "outline", size: "sm", className: cn("group relative overflow-hidden px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-lg", "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400", "bg-white/60 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-900/20"), onClick: () => {
                                                            setAlertConfig({
                                                                isOpen: true,
                                                                title: strings.areYouSure,
                                                                message: strings.clearData,
                                                                onConfirm: async () => {
                                                                    setShifts([]);
                                                                    setHourlyRate(1000);
                                                                    const emptyData = { shifts: [], hourlyRate: 1000, lang, theme, variantIndex };
                                                                    // Clear localStorage
                                                                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyData));
                                                                    // Try to clear IndexedDB
                                                                    try {
                                                                        await saveToIndexedDB('appData', emptyData);
                                                                    }
                                                                    catch (e) {
                                                                        console.warn('Failed to clear IndexedDB:', e);
                                                                    }
                                                                    setAlertConfig(null);
                                                                }
                                                            });
                                                        }, children: _jsxs(motion.div, { className: "flex items-center gap-2", whileHover: { x: 2 }, children: [_jsx(motion.div, { animate: { rotate: [0, 10, -10, 0] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }, children: _jsx(Trash2, { size: 16 }) }), _jsx("span", { className: "font-semibold", children: strings.clearData })] }) }) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3", children: [_jsx(motion.div, { animate: {
                                                                rotate: [0, 5, -5, 0],
                                                                scale: [1, 1.05, 1]
                                                            }, transition: {
                                                                duration: 3,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }, className: cn("p-2 rounded-full shadow-lg", PRIMARY_COLOR_CLASSES.bgGradient), children: _jsx(Zap, { size: 20, className: "text-white" }) }), _jsxs("div", { className: "text-center sm:text-right", children: [_jsx(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: cn("text-sm font-bold tracking-wide", PRIMARY_COLOR_CLASSES.text), children: "\u00A9 2024 Shomyn" }), _jsxs(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.7 }, className: "text-xs text-gray-500 dark:text-gray-400 font-medium", children: [lang === 'en' ? 'Made with' : '愛を込めて', _jsx(motion.span, { animate: { scale: [1, 1.2, 1] }, transition: { duration: 1.5, repeat: Infinity }, className: "inline-block mx-1 text-red-500", children: "\u2665" }), lang === 'en' ? 'by Shomyn Team' : 'Shomynチーム'] })] })] })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [...Array(3)].map((_, i) => (_jsx(motion.div, { className: cn("absolute w-2 h-2 rounded-full opacity-30", PRIMARY_COLOR_CLASSES.bgLight), animate: {
                                                    x: [0, 100, 0],
                                                    y: [0, -50, 0],
                                                    opacity: [0.3, 0.7, 0.3]
                                                }, transition: {
                                                    duration: 4 + i,
                                                    repeat: Infinity,
                                                    delay: i * 0.5
                                                }, style: {
                                                    left: `${20 + i * 30}%`,
                                                    top: `${50 + i * 10}%`
                                                } }, i))) })] }) })] }), _jsx(AddEditShiftModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSubmit: addOrUpdateShift, initialShift: editingShift, lang: lang, primaryColors: PRIMARY_COLOR_CLASSES }), alertConfig && (_jsx(CustomAlert, { isOpen: alertConfig.isOpen, title: alertConfig.title, message: alertConfig.message, onConfirm: alertConfig.onConfirm, onCancel: () => setAlertConfig(null) })), _jsx(PWAInstallPrompt, { isOpen: showInstallPrompt, onClose: handleCloseInstallPrompt, lang: lang })] })] }));
}
