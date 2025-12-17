import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Zap, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Types
import type { Shift, Lang, ViewMode, AlertConfig } from '@/types/shift';

// Constants
import { yen, LOCAL_STORAGE_KEY } from '@/constants';
import { LANG_STRINGS } from '@/constants/strings';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';

// Utils
import { calculateHours, getDayOfWeek } from '@/utils/time';
import { saveToIndexedDB, loadFromIndexedDB } from '@/utils/storage';

// Components
import { GlobalStyles } from '@/components/GlobalStyles';
import { ThemeDropdown } from '@/components/shift/ThemeDropdown';
import { MonthFilter } from '@/components/shift/MonthFilter';

import { MonthlyGroup } from '@/components/shift/MonthlyGroup';
import { AddEditShiftModal } from '@/components/shift/AddEditShiftModal';
import { CustomAlert } from '@/components/modals/CustomAlert';
import { PWAInstallPrompt } from '@/components/modals/PWAInstallPrompt';

export default function ShiftTracker() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [hourlyRate, setHourlyRate] = useState(1000);
    const [lang, setLang] = useState<Lang>('jp');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [variantIndex, setVariantIndex] = useState(3); // Violet Horizon
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [filterMonth, setFilterMonth] = useState<Date | undefined>(new Date());
    const [alertConfig, setAlertConfig] = useState<AlertConfig>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLaunchScreen, setShowLaunchScreen] = useState(true);

    // Block overscroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
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

    // Apply theme immediately to prevent flash
    useEffect(() => {
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedTheme) {
            try {
                const data = JSON.parse(savedTheme);
                if (data.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
    }, []);

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
            } catch (e) {
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
                        } catch (e) {
                            console.warn("Failed to migrate to IndexedDB:", e);
                        }
                    }
                } catch (e) {
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
            } else {
                setIsLoading(false);
                setTimeout(() => setShowLaunchScreen(false), 300);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (isLoading) return; // Don't save during initial load

        const saveData = async () => {
            const data = { shifts, hourlyRate, lang, theme, variantIndex };

            // Always save to localStorage as backup
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

            // Try to save to IndexedDB
            try {
                await saveToIndexedDB('appData', data);
            } catch (e) {
                console.warn("Failed to save to IndexedDB:", e);
            }
        };
        saveData();

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
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
            const colorSet = colors[variantIndex as keyof typeof colors] || colors[3];
            themeColorMeta.setAttribute('content', theme === 'dark' ? colorSet.dark : colorSet.light);
        }

    }, [shifts, hourlyRate, lang, theme, variantIndex, isLoading]);

    const processShiftData = useCallback((rawShift: Omit<Shift, 'hours' | 'pay' | 'dayOfWeek' | 'wage'> & { wage: number }) => {
        const hours = calculateHours(rawShift.fromTime, rawShift.toTime);
        const pay = Math.round(hours * rawShift.wage);
        const dayOfWeek = getDayOfWeek(rawShift.date, lang);

        return {
            ...rawShift,
            hours,
            pay,
            dayOfWeek,
        } as Shift;
    }, [lang]);

    const addOrUpdateShift = (newShiftData: Omit<Shift, 'hours' | 'pay' | 'dayOfWeek'>) => {
        const processedShift = processShiftData({ ...newShiftData, wage: newShiftData.wage || hourlyRate });

        if (editingShift) {
            // Update existing
            setShifts(prev => prev.map(s => s.id === processedShift.id ? processedShift : s));
        } else {
            // New shift
            setShifts(prev => [processedShift, ...prev]);
        }
        setEditingShift(null);
        setIsModalOpen(false);
    };

    const deleteShift = (id: string) => {
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

    const openEditModal = (shift: Shift) => {
        setEditingShift(shift);
        setIsModalOpen(true);
    };

    const toggleLang = () => setLang(prev => prev === 'en' ? 'jp' : 'en');

    // Data Aggregation and Filtering
    const sortedAndFilteredShifts = useMemo(() => {
        let filtered = shifts.filter(shift => {
            if (!filterMonth) return true;

            const start = startOfMonth(filterMonth);
            const end = endOfMonth(filterMonth);

            try {
                const shiftDate = parseISO(shift.date);
                return isWithinInterval(shiftDate, { start, end });
            } catch (e) {
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
        }, {} as Record<string, { totalPay: number; totalHours: number; shifts: Shift[] }>);

        const sortedMonths = Object.keys(monthlyGroups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        return {
            grandTotal: total,
            monthlyGroups,
            sortedMonths
        };
    }, [sortedAndFilteredShifts]);

    const renderMonthlyView = () => {
        const currentMonthKey = filterMonth ? format(filterMonth, 'yyyy-MM') : format(new Date(), 'yyyy-MM');
        const monthData = aggregatedData.monthlyGroups[currentMonthKey];

        return (
            <div className="pt-4">
                {monthData ? (
                    <MonthlyGroup
                        key={currentMonthKey}
                        monthKey={currentMonthKey}
                        totalPay={monthData.totalPay}
                        totalHours={monthData.totalHours}
                        shifts={monthData.shifts}
                        theme={theme}
                        baseLang={lang}
                        onDelete={deleteShift}
                        onUpdate={openEditModal}
                        primaryColors={PRIMARY_COLOR_CLASSES}
                    />
                ) : (
                    <EmptyState
                        lang={lang}
                        hasFilter={!!filterMonth}
                        onClearFilter={() => setFilterMonth(new Date())}
                    />
                )}
            </div>
        );
    };

    // Empty State Component
    function EmptyState({ lang, hasFilter, onClearFilter }: { lang: Lang, hasFilter: boolean, onClearFilter: () => void }) {
        const strings = LANG_STRINGS[lang];

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "p-8 rounded-3xl text-center backdrop-blur-md transition-colors border",
                    theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-900/60 border-slate-700'
                )}
            >
                {hasFilter ? (
                    <>
                        <Filter size={40} className={cn("mx-auto mb-4", PRIMARY_COLOR_CLASSES.text)} />
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{strings.noShiftsMonth}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{strings.tryDifferentMonth}</p>
                        <Button
                            onClick={onClearFilter}
                            variant="outline"
                            className={cn(
                                PRIMARY_COLOR_CLASSES.border,
                                PRIMARY_COLOR_CLASSES.text,
                                "hover:bg-indigo-50/20 dark:hover:bg-violet-900/30"
                            )}
                        >
                            <X size={16} className="mr-2" /> {lang === 'en' ? 'Current Month' : '今月'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Zap size={40} className={cn("mx-auto mb-4", PRIMARY_COLOR_CLASSES.text)} />
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{strings.noShiftsYet}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{strings.startTracking}</p>
                        <Button
                            onClick={openAddModal}
                            className={cn("text-white font-bold", PRIMARY_COLOR_CLASSES.bgGradient)}
                        >
                            <Plus size={16} className="mr-2" /> {strings.addShift}
                        </Button>
                    </>
                )}
            </motion.div>
        );
    }

    const appClasses = theme === 'light'
        ? themeVariant.light
        : themeVariant.dark;

    if (showLaunchScreen) {
        return (
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={cn("min-h-screen flex flex-col items-center justify-center hw-accelerate transition-all duration-500 ease-in-out relative overflow-hidden", appClasses)}
            >
                {/* Animated wave background */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        className={cn("absolute inset-0 opacity-10", PRIMARY_COLOR_CLASSES.bgGradient)}
                        animate={{
                            background: [
                                "radial-gradient(circle at 20% 50%, currentColor 0%, transparent 50%)",
                                "radial-gradient(circle at 80% 50%, currentColor 0%, transparent 50%)",
                                "radial-gradient(circle at 40% 50%, currentColor 0%, transparent 50%)"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Floating orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={cn("absolute rounded-full blur-sm", PRIMARY_COLOR_CLASSES.bgLight)}
                            style={{
                                width: `${20 + i * 5}px`,
                                height: `${20 + i * 5}px`,
                                left: `${15 + i * 10}%`,
                                top: `${10 + (i % 4) * 20}%`
                            }}
                            animate={{
                                x: [0, 100, -50, 0],
                                y: [0, -80, 60, 0],
                                scale: [1, 1.2, 0.8, 1],
                                opacity: [0.1, 0.3, 0.1, 0.2]
                            }}
                            transition={{
                                duration: 6 + i * 0.8,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.3, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "backOut" }}
                    className="text-center relative z-10 backdrop-blur-sm bg-white/5 dark:bg-black/5 rounded-3xl p-8 border border-white/10"
                >
                    {/* Fluid loading animation */}
                    <div className="relative w-24 h-24 mx-auto mb-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className={cn("absolute inset-0 border-4 border-transparent rounded-full", PRIMARY_COLOR_CLASSES.bgGradient)}
                            style={{ borderTopColor: 'transparent' }}
                        />
                        <motion.div
                            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className={cn("absolute inset-3 border-2 border-transparent rounded-full opacity-70", PRIMARY_COLOR_CLASSES.bgGradient)}
                            style={{ borderRightColor: 'transparent' }}
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.8, 0.3],
                                rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className={cn("absolute inset-7 rounded-full", PRIMARY_COLOR_CLASSES.bgGradient)}
                        />
                        {/* Flowing fluid particles inside */}
                        <div className="absolute inset-4 rounded-full overflow-hidden">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1.5 h-1.5 bg-white/70 rounded-full"
                                    animate={{
                                        x: [8, 40, 20, 50, 8],
                                        y: [10, 45, 25, 15, 10],
                                        scale: [0.3, 1, 0.6, 1.2, 0.3],
                                        opacity: [0.2, 0.9, 0.4, 1, 0.2]
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <motion.h1
                        initial={{ y: 50, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "backOut" }}
                        className={cn("text-5xl font-black mb-4 tracking-tight", PRIMARY_COLOR_CLASSES.text)}
                    >
                        <motion.span
                            animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className={cn("bg-clip-text text-transparent bg-gradient-to-r", PRIMARY_COLOR_CLASSES.bgGradient)}
                            style={{ backgroundSize: "200% 200%" }}
                        >
                            Shomyn
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                        className="text-gray-600 dark:text-gray-300 text-xl font-medium mb-2"
                    >
                        <motion.span
                            animate={{
                                opacity: [0.6, 1, 0.6],
                                y: [0, -2, 0]
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {lang === 'en' ? 'Loading your shifts...' : 'シフトを読み込み中...'}
                        </motion.span>
                    </motion.p>

                    {/* Progress dots */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex justify-center gap-2 mt-6"
                    >
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={cn("w-2 h-2 rounded-full", PRIMARY_COLOR_CLASSES.bgLight)}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <>
            <GlobalStyles />
            <div className={cn("min-h-screen transition-all duration-300 ease-in-out", appClasses)}>
                <div className={cn("min-h-screen flex flex-col items-center sm:p-6 transition-all duration-300 ease-in-out")}>

                    {/* Header/Controls */}
                    <header className="w-full max-w-4xl sticky p-4 top-0 z-40 mb-6 py-4 backdrop-blur-md bg-transparent/80">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", PRIMARY_COLOR_CLASSES.text)}>
                                Shomyn
                            </h1>
                            <div className="flex gap-2">
                                <ThemeDropdown
                                    theme={theme}
                                    setTheme={setTheme}
                                    variantIndex={variantIndex}
                                    setVariantIndex={setVariantIndex}
                                    toggleLang={toggleLang}
                                    primaryColors={PRIMARY_COLOR_CLASSES}
                                    lang={lang}
                                />
                                <button
                                    onClick={openAddModal}
                                    className={cn("h-10 w-10 p-0 flex items-center justify-center rounded-full cursor-pointer backdrop-blur-md border shadow-sm transition-all active:scale-95", PRIMARY_COLOR_CLASSES.bgGradient, "text-white")}
                                    aria-label="Add new shift"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Totals & Filters Section */}
                        <div className={cn(
                            "p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 border",
                            theme === 'light'
                                ? 'bg-white/80 border-gray-200'
                                : 'bg-slate-900/70 border-slate-700'
                        )}>
                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 text-center sm:text-left">{strings.grandTotal}</p>
                                <p className={cn("text-3xl font-black text-center sm:text-left", PRIMARY_COLOR_CLASSES.text)}>{yen.format(aggregatedData.grandTotal.totalPay)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">{aggregatedData.grandTotal.totalHours} {strings.hours}</p>
                            </div>

                            <div className="flex gap-3 w-full sm:w-auto flex-1 sm:flex-none min-w-0">
                                <MonthFilter
                                    selectedMonth={filterMonth}
                                    onMonthSelect={setFilterMonth}
                                    lang={lang}
                                    primaryColors={PRIMARY_COLOR_CLASSES}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="w-full max-w-4xl pb-16 px-4">
                        {renderMonthlyView()}
                    </main>

                    {/* Enhanced Footer */}
                    <footer className="w-full max-w-4xl mt-8 pt-6 pb-safe">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={cn(
                                "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border shadow-xl",
                                theme === 'light'
                                    ? 'bg-white/80 border-gray-200/50'
                                    : 'bg-slate-900/60 border-slate-700/50'
                            )}
                        >
                            {/* Animated background gradient */}
                            <div className={cn(
                                "absolute inset-0 opacity-20 animate-gradient-x",
                                PRIMARY_COLOR_CLASSES.bgGradient
                            )} />

                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Left side - Clear Data Button */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "group relative overflow-hidden px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                                            "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400",
                                            "bg-white/60 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        )}
                                        onClick={() => {
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
                                                    } catch (e) {
                                                        console.warn('Failed to clear IndexedDB:', e);
                                                    }
                                                    setAlertConfig(null);
                                                }
                                            });
                                        }}
                                    >
                                        <motion.div
                                            className="flex items-center gap-2"
                                            whileHover={{ x: 2 }}
                                        >
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <Trash2 size={16} />
                                            </motion.div>
                                            <span className="font-semibold">{strings.clearData}</span>
                                        </motion.div>
                                    </Button>
                                </motion.div>

                                {/* Right side - Copyright & Branding */}
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    {/* Animated logo/icon */}
                                    <motion.div
                                        animate={{
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className={cn(
                                            "p-2 rounded-full shadow-lg",
                                            PRIMARY_COLOR_CLASSES.bgGradient
                                        )}
                                    >
                                        <Zap size={20} className="text-white" />
                                    </motion.div>

                                    {/* Copyright text */}
                                    <div className="text-center sm:text-right">
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className={cn(
                                                "text-sm font-bold tracking-wide",
                                                PRIMARY_COLOR_CLASSES.text
                                            )}
                                        >
                                            © 2024 Shomyn
                                        </motion.p>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-xs text-gray-500 dark:text-gray-400 font-medium"
                                        >
                                            {lang === 'en' ? 'Made with' : '愛を込めて'}
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="inline-block mx-1 text-red-500"
                                            >
                                                ♥
                                            </motion.span>
                                            {lang === 'en' ? 'by Shomyn Team' : 'Shomynチーム'}
                                        </motion.p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating particles animation */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={cn(
                                            "absolute w-2 h-2 rounded-full opacity-30",
                                            PRIMARY_COLOR_CLASSES.bgLight
                                        )}
                                        animate={{
                                            x: [0, 100, 0],
                                            y: [0, -50, 0],
                                            opacity: [0.3, 0.7, 0.3]
                                        }}
                                        transition={{
                                            duration: 4 + i,
                                            repeat: Infinity,
                                            delay: i * 0.5
                                        }}
                                        style={{
                                            left: `${20 + i * 30}%`,
                                            top: `${50 + i * 10}%`
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </footer>
                </div>

                <AddEditShiftModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={addOrUpdateShift}
                    initialShift={editingShift}
                    lang={lang}
                    primaryColors={PRIMARY_COLOR_CLASSES}
                />

                {alertConfig && (
                    <CustomAlert
                        isOpen={alertConfig.isOpen}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        onConfirm={alertConfig.onConfirm}
                        onCancel={() => setAlertConfig(null)}
                    />
                )}

                <PWAInstallPrompt
                    isOpen={showInstallPrompt}
                    onClose={handleCloseInstallPrompt}
                    lang={lang}
                />
            </div>
        </>
    );
}