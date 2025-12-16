import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Ensure you have these components or replace them with standard HTML inputs if needed
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sun, Moon, Globe, Calendar as CalendarIcon, Clock, Trash2, RotateCcw, List, Filter, X, Zap, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths } from 'date-fns';

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

// --- Dynamic Primary Color Classes ---
const getPrimaryColorClasses = (variantIndex: number, theme: 'light' | 'dark') => {
    const variants = [
        { // Aqua Mist
            text: theme === 'light' ? 'text-cyan-600' : 'text-cyan-400',
            bgLight: 'bg-cyan-100',
            bgDark: 'bg-cyan-900/60',
            border: theme === 'light' ? 'border-cyan-500' : 'border-cyan-400',
            bgGradient: 'bg-gradient-to-r from-cyan-500 to-sky-600',
            hover: 'hover:bg-cyan-500/10',
            ring: theme === 'light' ? 'ring-cyan-500' : 'ring-cyan-400',
        },
        { // Coral Glow
            text: theme === 'light' ? 'text-orange-600' : 'text-orange-400',
            bgLight: 'bg-orange-100',
            bgDark: 'bg-orange-900/60',
            border: theme === 'light' ? 'border-orange-500' : 'border-orange-400',
            bgGradient: 'bg-gradient-to-r from-rose-500 to-orange-600',
            hover: 'hover:bg-orange-500/10',
            ring: theme === 'light' ? 'ring-orange-500' : 'ring-orange-400',
        },
        { // Emerald Breeze
            text: theme === 'light' ? 'text-emerald-600' : 'text-emerald-400',
            bgLight: 'bg-emerald-100',
            bgDark: 'bg-emerald-900/60',
            border: theme === 'light' ? 'border-emerald-500' : 'border-emerald-400',
            bgGradient: 'bg-gradient-to-r from-emerald-500 to-green-600',
            hover: 'hover:bg-emerald-500/10',
            ring: theme === 'light' ? 'ring-emerald-500' : 'ring-emerald-400',
        },
        { // Violet Horizon
            text: theme === 'light' ? 'text-violet-600' : 'text-violet-400',
            bgLight: 'bg-violet-100',
            bgDark: 'bg-violet-900/60',
            border: theme === 'light' ? 'border-violet-500' : 'border-violet-400',
            bgGradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
            hover: 'hover:bg-violet-500/10',
            ring: theme === 'light' ? 'ring-violet-500' : 'ring-violet-400',
        },
        { // Midnight Ocean
            text: theme === 'light' ? 'text-blue-600' : 'text-blue-400',
            bgLight: 'bg-blue-100',
            bgDark: 'bg-blue-900/60',
            border: theme === 'light' ? 'border-blue-500' : 'border-blue-400',
            bgGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            hover: 'hover:bg-blue-500/10',
            ring: theme === 'light' ? 'ring-blue-500' : 'ring-blue-400',
        },
        { // Sunset Fire
            text: theme === 'light' ? 'text-red-600' : 'text-red-400',
            bgLight: 'bg-red-100',
            bgDark: 'bg-red-900/60',
            border: theme === 'light' ? 'border-red-500' : 'border-red-400',
            bgGradient: 'bg-gradient-to-r from-red-500 to-pink-600',
            hover: 'hover:bg-red-500/10',
            ring: theme === 'light' ? 'ring-red-500' : 'ring-red-400',
        },
        { // Electric Lime
            text: theme === 'light' ? 'text-lime-600' : 'text-lime-400',
            bgLight: 'bg-lime-100',
            bgDark: 'bg-lime-900/60',
            border: theme === 'light' ? 'border-lime-500' : 'border-lime-400',
            bgGradient: 'bg-gradient-to-r from-lime-500 to-yellow-500',
            hover: 'hover:bg-lime-500/10',
            ring: theme === 'light' ? 'ring-lime-500' : 'ring-lime-400',
        },
        { // Royal Purple
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


// --- Language Strings ---
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

// --- GLOBAL STYLES (FIXED: REMOVED WILDCARD TRANSITION) ---
const GlobalStyles = () => (
    <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        /* Prevent FOUC and blinking */
        html {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          opacity: 1;
          visibility: visible;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          overscroll-behavior-y: none; /* Prevents rubber banding on mobile */
        }
        
        body.dark {
          background: linear-gradient(135deg, #0f172a, #1e293b);
        }
        
        /* Performance optimizations */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-family: inherit;
        }
        
        .gpu-accelerated {
          transform: translateZ(0);
          will-change: transform;
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
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
        
        /* Mobile performance optimizations */
        @media (max-width: 768px) {
          .animate-gradient-x {
            animation: none;
            background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to));
          }
          /* --- FIXED: Removed the wildcard transition here that caused blinking --- */
        }
        
        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-x {
            animation: none;
            background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to));
          }
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        .hw-accelerate {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
    `}</style>
);

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

// --- TIME LOGIC ---
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

// --- PWA INSTALL PROMPT ---
function PWAInstallPrompt({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: Lang }) {
    const strings = LANG_STRINGS[lang];
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
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

    if (isStandalone) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className="fixed bottom-4 left-4 right-4 z-[99999] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-slate-700 gpu-accelerated"
                >
                    <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40")}>
                            <Plus className="text-violet-600 dark:text-violet-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                {lang === 'en' ? 'Add to Home Screen' : 'ホーム画面に追加'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {lang === 'en'
                                    ? 'Install this app for quick access and better experience'
                                    : 'より良い体験のためにこのアプリをインストールしてください'
                                }
                            </p>
                            <div className="flex gap-2">
                                {isIOS ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {lang === 'en'
                                            ? 'Tap Share → Add to Home Screen'
                                            : 'シェア → ホーム画面に追加をタップ'
                                        }
                                    </p>
                                ) : (
                                    <Button
                                        onClick={handleInstall}
                                        className={cn("text-white font-semibold text-sm h-8 px-3 bg-gradient-to-r from-violet-500 to-purple-600")}
                                    >
                                        {lang === 'en' ? 'Install' : 'インストール'}
                                    </Button>
                                )}
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="text-sm h-8 px-3 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
                                >
                                    {lang === 'en' ? 'Later' : '後で'}
                                </Button>
                            </div>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// --- CUSTOM ALERT COMPONENT ---
function CustomAlert({ isOpen, onConfirm, onCancel, title, message }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 10 }}
                        transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-slate-700 gpu-accelerated"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                onClick={onCancel}
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className={cn("flex-1 h-10 rounded-xl text-white font-semibold", "bg-red-500 hover:bg-red-600")}
                            >
                                Delete
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// --- INDEXEDDB UTILITIES ---
const DB_NAME = 'ShiftTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'shifts';

const openDB = (): Promise<IDBDatabase> => {
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

const saveToIndexedDB = async (key: string, data: any): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(data, key);
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('Save failed'));
        });
    } catch (e) {
        throw new Error(`IndexedDB save failed: ${e}`);
    }
};

const loadFromIndexedDB = async (key: string): Promise<any> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Load failed'));
        });
    } catch (e) {
        throw new Error(`IndexedDB load failed: ${e}`);
    }
};

// --- UTILITY FUNCTIONS ---
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


// --- SCROLL PICKER (FIXED ALIGNMENT & RESPONSIVENESS) ---
const ITEM_HEIGHT_SM = 32;
const ITEM_HEIGHT_LG = 40;
const CONTAINER_HEIGHT_MULTIPLIER_SM = 5;
const CONTAINER_HEIGHT_MULTIPLIER_LG = 3;

function ScrollColumn({ options, selected, onSelect, isSmallDevice, primaryColors }: { options: string[]; selected: number; onSelect: (v: number) => void; isSmallDevice: boolean; primaryColors: ReturnType<typeof getPrimaryColorClasses> }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const ITEM_HEIGHT = isSmallDevice ? ITEM_HEIGHT_SM : ITEM_HEIGHT_LG;
    const CONTAINER_HEIGHT = ITEM_HEIGHT * (isSmallDevice ? CONTAINER_HEIGHT_MULTIPLIER_SM : CONTAINER_HEIGHT_MULTIPLIER_LG);

    useEffect(() => {
        if (containerRef.current && !isScrolling.current) {
            const index = options.findIndex(o => Number(o) === selected);
            if (index !== -1) containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
    }, [selected, options, ITEM_HEIGHT]);

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
        <div className="relative group touch-none">
            <div
                style={{ height: `${ITEM_HEIGHT}px`, top: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` }}
                className={cn("absolute left-0 right-0 rounded-lg pointer-events-none z-0", primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark)}
            />
            <div
                ref={containerRef}
                onScroll={handleScroll}
                style={{ height: `${CONTAINER_HEIGHT}px` }}
                className="overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 w-10 sm:w-12 text-center flex-shrink-0 touch-pan-y"
            >
                <div style={{ height: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` }} />
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
                                    ? cn("font-bold scale-110", isSmallDevice ? 'text-lg' : 'text-xl', primaryColors.text)
                                    : cn("text-gray-800 dark:text-gray-300 scale-100", isSmallDevice ? 'text-sm' : 'text-base')
                            )}
                        >
                            {o}
                        </div>
                    );
                })}
                <div style={{ height: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` }} />
            </div>
        </div>
    );
}

// --- FIXED SCROLL TIME PICKER (Uses matchMedia instead of resize listener) ---
function ScrollTimePicker({ value, onChange, label, primaryColors }: { value: string; onChange: (v: string) => void; label?: string; primaryColors: ReturnType<typeof getPrimaryColorClasses> }) {
    const [hour, minute] = (value || '00:00').split(':').map(v => parseInt(v, 10));
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

    const updateTime = useCallback((newH: number, newM: number) => {
        onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    }, [onChange]);

    const [isSmallDevice, setIsSmallDevice] = useState(false);

    useEffect(() => {
        // FIXED: Using matchMedia is much more performant and doesn't trigger on vertical scroll/address bar change
        const mediaQuery = window.matchMedia('(max-width: 640px)');
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => setIsSmallDevice(e.matches);

        handleChange(mediaQuery);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center justify-center gap-1 p-1 sm:p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 min-w-0">
                <ScrollColumn options={hours} selected={hour} onSelect={(h) => updateTime(h, minute)} isSmallDevice={isSmallDevice} primaryColors={primaryColors} />
                <span className={cn("text-gray-600 dark:text-gray-400 font-bold px-0.5", isSmallDevice ? 'text-base' : 'text-lg')}>:</span>
                <ScrollColumn options={minutes} selected={minute} onSelect={(m) => updateTime(hour, m)} isSmallDevice={isSmallDevice} primaryColors={primaryColors} />
            </div>
            <p className={cn("mt-1 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400", isSmallDevice ? 'text-[10px] mt-1' : 'text-xs mt-2')}>{label}</p>
        </div>
    );
}

// --- THEME DROPDOWN ---
function ThemeDropdown({ theme, setTheme, variantIndex, setVariantIndex, toggleLang, primaryColors }: {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    variantIndex: number;
    setVariantIndex: (index: number) => void;
    toggleLang: () => void;
    primaryColors: ReturnType<typeof getPrimaryColorClasses>;
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

    const handleSelectVariant = (index: number) => {
        setVariantIndex(index);
        setIsOpen(false);
    };
    const handleToggleTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        setIsOpen(false);
    };
    const handleThemeIconClick = () => setIsOpen(prev => !prev);

    return (
        <div className="relative flex gap-2" ref={dropdownRef}>
            <motion.button
                onClick={handleThemeIconClick}
                whileTap={{ scale: 0.95 }}
                className={cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer", frostedGlassClasses)}
                aria-label="Change theme"
            >
                {isOpen || isLight ? <Sun size={18} className="text-orange-500" /> : <Moon size={18} className="text-indigo-400" />}
            </motion.button>

            <motion.button
                onClick={toggleLang}
                whileTap={{ scale: 0.95 }}
                className={cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer", frostedGlassClasses)}
                aria-label="Toggle language"
            >
                <Globe size={18} className={primaryColors.text} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-12 right-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 w-64 z-50 origin-top-right"
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Mode</h4>
                                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                                    {['light', 'dark'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => handleToggleTheme(t as 'light' | 'dark')}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-all",
                                                theme === t
                                                    ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                            )}
                                        >
                                            {t === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                                            <span className="capitalize">{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Theme Color</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {THEME_VARIANTS.map((v, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectVariant(i)}
                                            className={cn(
                                                "w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                                                v.lightPreview,
                                                variantIndex === i
                                                    ? "border-gray-900 dark:border-white scale-110 shadow-md"
                                                    : "border-transparent"
                                            )}
                                            title={v.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function ShiftTracker() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [lang, setLang] = useState<Lang>('en');
    const [variantIndex, setVariantIndex] = useState(3);
    const [isPWAOpen, setIsPWAOpen] = useState(true);

    const strings = LANG_STRINGS[lang];
    const primaryColors = getPrimaryColorClasses(variantIndex, theme);
    const themeVariant = THEME_VARIANTS[variantIndex];

    // Initialize logic
    useEffect(() => {
        loadFromIndexedDB(LOCAL_STORAGE_KEY).then(data => {
            if (data) setShifts(data);
        }).catch(() => { });

        // Check system preference for theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark' : '';
        saveToIndexedDB(LOCAL_STORAGE_KEY, shifts);
    }, [shifts, theme]);

    // View state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filterMonth, setFilterMonth] = useState<Date | null>(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editShift, setEditShift] = useState<Shift | null>(null);

    // Form state
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [fromTime, setFromTime] = useState('09:00');
    const [toTime, setToTime] = useState('17:00');
    const [wage, setWage] = useState(1000);

    const handleSaveShift = () => {
        const hours = calculateHours(fromTime, toTime);
        const pay = hours * wage;

        const newShift: Shift = {
            id: editShift ? editShift.id : crypto.randomUUID(),
            date,
            dayOfWeek: getDayOfWeek(date, lang),
            fromTime,
            toTime,
            hours,
            wage,
            pay
        };

        if (editShift) {
            setShifts(prev => prev.map(s => s.id === editShift.id ? newShift : s));
        } else {
            setShifts(prev => [...prev, newShift]);
        }

        setIsAddModalOpen(false);
        setEditShift(null);
        // Reset defaults
        setFromTime('09:00');
        setToTime('17:00');
    };

    const handleDeleteShift = (id: string) => {
        setShifts(prev => prev.filter(s => s.id !== id));
    };

    // Filter logic
    const filteredShifts = useMemo(() => {
        let sorted = [...shifts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (filterMonth) {
            const start = startOfMonth(filterMonth);
            const end = endOfMonth(filterMonth);
            return sorted.filter(s => isWithinInterval(parseISO(s.date), { start, end }));
        }
        return sorted;
    }, [shifts, filterMonth]);

    const totalPay = filteredShifts.reduce((acc, s) => acc + s.pay, 0);
    const totalHours = filteredShifts.reduce((acc, s) => acc + s.hours, 0);

    return (
        <div className={cn("min-h-screen transition-colors duration-300", themeVariant[theme === 'light' ? 'light' : 'dark'])}>
            <GlobalStyles />

            <div className="max-w-md mx-auto min-h-screen bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col relative">

                {/* Header */}
                <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50">
                    <div>
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            ShiftTracker
                        </h1>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {format(new Date(), 'EEEE, MMMM do')}
                        </p>
                    </div>
                    <ThemeDropdown
                        theme={theme}
                        setTheme={setTheme}
                        variantIndex={variantIndex}
                        setVariantIndex={setVariantIndex}
                        toggleLang={() => setLang(l => l === 'en' ? 'jp' : 'en')}
                        primaryColors={primaryColors}
                    />
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar pb-24 p-4 space-y-4">

                    {/* Stats Card */}
                    <div className={cn("rounded-3xl p-6 text-white shadow-lg relative overflow-hidden", primaryColors.bgGradient)}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-white/80 text-sm font-medium mb-1">{filterMonth ? format(filterMonth, 'MMMM yyyy') : strings.grandTotal}</p>
                                    <h2 className="text-4xl font-bold tracking-tight">{yen.format(totalPay)}</h2>
                                </div>
                            </div>
                            <div className="flex gap-4 bg-black/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-white/80" />
                                    <span className="font-semibold">{totalHours} {strings.hours}</span>
                                </div>
                                <div className="w-px bg-white/20 h-5" />
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-white/80" />
                                    <span className="font-semibold">{filteredShifts.length} Shifts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("rounded-full border-gray-200 dark:border-slate-700", !filterMonth && primaryColors.bgLight)}
                            onClick={() => setFilterMonth(null)}
                        >
                            {strings.allMonths}
                        </Button>
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setFilterMonth(prev => prev ? subMonths(prev, 1) : new Date())}>
                                <ChevronLeft size={14} />
                            </Button>
                            <span className="text-xs font-bold px-2 min-w-[80px] text-center">
                                {filterMonth ? format(filterMonth, 'MMM yyyy') : 'All'}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setFilterMonth(prev => prev ? addMonths(prev, 1) : new Date())}>
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>

                    {/* Shift List */}
                    <div className="space-y-3">
                        {filteredShifts.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <CalendarIcon size={48} className="mx-auto mb-3" />
                                <p>{strings.noShiftsMonth}</p>
                            </div>
                        ) : (
                            filteredShifts.map((shift) => (
                                <motion.div
                                    key={shift.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center group"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className={cn("w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold", primaryColors.bgLight, primaryColors.text)}>
                                            <span className="text-xs uppercase">{format(parseISO(shift.date), 'MMM')}</span>
                                            <span className="text-lg leading-none">{format(parseISO(shift.date), 'd')}</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {yen.format(shift.pay)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {shift.fromTime} - {shift.toTime} ({shift.hours}h)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-gray-400 hover:text-blue-500"
                                            onClick={() => {
                                                setEditShift(shift);
                                                setDate(shift.date);
                                                setFromTime(shift.fromTime);
                                                setToTime(shift.toTime);
                                                setWage(shift.wage);
                                                setIsAddModalOpen(true);
                                            }}
                                        >
                                            <List size={16} />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </main>

                {/* Floating Action Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setEditShift(null);
                        setFromTime('09:00');
                        setToTime('17:00');
                        setDate(format(new Date(), 'yyyy-MM-dd'));
                        setIsAddModalOpen(true);
                    }}
                    className={cn("fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white z-50", primaryColors.bgGradient)}
                >
                    <Plus size={28} />
                </motion.button>

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {isAddModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                                onClick={() => setIsAddModalOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl z-[61] p-6 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                                    {editShift ? strings.editShift : strings.addShift}
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="h-12 text-lg bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <ScrollTimePicker value={fromTime} onChange={setFromTime} label={strings.start} primaryColors={primaryColors} />
                                        <ScrollTimePicker value={toTime} onChange={setToTime} label={strings.end} primaryColors={primaryColors} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{strings.hourlyRate}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                                            <Input
                                                type="number"
                                                value={wage}
                                                onChange={(e) => setWage(Number(e.target.value))}
                                                className="h-12 pl-8 text-lg bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        {editShift && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    handleDeleteShift(editShift.id);
                                                    setIsAddModalOpen(false);
                                                }}
                                                className="h-12 px-6 rounded-xl"
                                            >
                                                <Trash2 size={20} />
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleSaveShift}
                                            className={cn("flex-1 h-12 text-lg font-semibold rounded-xl", primaryColors.bgGradient)}
                                        >
                                            {strings.save}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <PWAInstallPrompt isOpen={isPWAOpen} onClose={() => setIsPWAOpen(false)} lang={lang} />
            </div>
        </div>
    );
}