import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Zap, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Types
import type { Shift, Lang, ViewMode, AlertConfig } from '@/types/shift';

// Constants
import { yen, LOCAL_STORAGE_KEY, STORAGE_KEYS } from '@/constants';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
import { LANG_STRINGS } from '@/constants/strings';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';

// Utils
import { calculateHours, getDayOfWeek } from '@/utils/time';
import { addUserShift, updateUserShift, fetchUserShifts, deleteUserShift } from '@/services/shift';
import { fetchUserData } from '@/services/user';

// Components
import { GlobalStyles } from '@/components/GlobalStyles';
import { Header } from '@/components/Header';
import { MonthFilter } from '@/components/shift/MonthFilter';
import { MonthlyGroup } from '@/components/shift/MonthlyGroup';
import { AddEditShiftModal } from '@/components/shift/AddEditShiftModal';
import { CustomAlert } from '@/components/modals/CustomAlert';
import { PWAInstallPrompt } from '@/components/modals/PWAInstallPrompt';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export default function ShiftTracker() {
    const { theme, variantIndex, lang } = useTheme();
    const { user } = useAuth();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [hourlyRate, setHourlyRate] = useState(1000);
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [filterMonth, setFilterMonth] = useState<Date | undefined>(new Date());
    const [alertConfig, setAlertConfig] = useState<AlertConfig>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    // console.log("user ---- ", user?.id)
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
        const hasSeenPrompt = getItemFromLocalStorage(STORAGE_KEYS.PWA_INSTALL_PROMPT);

        if (!isStandalone && !hasSeenPrompt) {
            const timer = setTimeout(() => {
                setShowInstallPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleCloseInstallPrompt = () => {
        try {
            setShowInstallPrompt(false);
            setItemToLocalStorage(STORAGE_KEYS.PWA_INSTALL_PROMPT, true);
        } catch (error) {
            console.error('Failed to close install prompt:', error);
        }
    };



    const processShiftData = useCallback((rawShift: { id: string; shift_date: string; start_time: string; end_time: string; wage: number }) => {
        const hours = calculateHours(rawShift.start_time, rawShift.end_time);
        const pay = Math.round(hours * rawShift.wage);
        const day_of_week = getDayOfWeek(rawShift.shift_date, lang);

        return {
            id: rawShift.id,
            shift_date: rawShift.shift_date,
            start_time: rawShift.start_time,
            end_time: rawShift.end_time,
            day_of_week,
            hours,
            wage: rawShift.wage,
            pay,
        } as Shift;
    }, [lang]);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                // Always fetch fresh user data (balance) from Supabase
                const userData = await fetchUserData(user.id);
                if (userData) {
                    setItemToLocalStorage(STORAGE_KEYS.USER_DATA, userData);
                }

                // Load shifts from Supabase
                const shiftsData = await fetchUserShifts(user.id);
                const processedShifts = shiftsData.map(processShiftData);
                setShifts(processedShifts);
            } catch (e) {
                console.error("Failed to load data:", e);
            }

            setIsLoading(false);
        };
        loadData();
    }, [user, processShiftData]);



    const addOrUpdateShift = async (newShiftData: { id: string; shift_date: string; start_time: string; end_time: string; wage?: number }) => {
        if (!user?.id) {
            console.error('User ID is required');
            return;
        }

        try {
            const shiftData = {
                id: editingShift ? newShiftData.id : crypto.randomUUID(),
                shift_date: newShiftData.shift_date,
                start_time: newShiftData.start_time,
                end_time: newShiftData.end_time,
                wage: newShiftData.wage || hourlyRate
            };

            const processedShift = processShiftData(shiftData);

            if (editingShift) {
                // Update existing
                const updatedShift = await updateUserShift(user.id, editingShift.id, processedShift);
                setShifts(prev => prev.map(s => s.id === processedShift.id ? updatedShift : s));
            } else {
                // New shift
                const newShift = await addUserShift(user?.id, processedShift);
                setShifts(prev => [newShift, ...prev]);
            }
            setEditingShift(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add/update shift:', error);
        }
    };

    const deleteShift = (id: string) => {
        try {
            if (!id || !user?.id) {
                console.error('Shift ID and User ID are required for deletion');
                return;
            }

            setAlertConfig({
                isOpen: true,
                title: strings.areYouSure,
                message: strings.delete,
                onConfirm: async () => {
                    try {
                        await deleteUserShift(user.id, id);
                        setShifts(prev => prev.filter(s => s.id !== id));
                        setAlertConfig(null);
                    } catch (error) {
                        console.error('Failed to delete shift:', error);
                        setAlertConfig(null);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to show delete confirmation:', error);
        }
    };

    const openAddModal = () => {
        try {
            setEditingShift(null);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to open add modal:', error);
        }
    };

    const openEditModal = (shift: Shift) => {
        try {
            if (!shift) {
                console.error('Shift data is required for editing');
                return;
            }
            setEditingShift(shift);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to open edit modal:', error);
        }
    };



    // Data Aggregation and Filtering
    const sortedAndFilteredShifts = useMemo(() => {
        let filtered = shifts.filter(shift => {
            if (!filterMonth) return true;

            const start = startOfMonth(filterMonth);
            const end = endOfMonth(filterMonth);

            try {
                const shiftDate = parseISO(shift.shift_date);
                return isWithinInterval(shiftDate, { start, end });
            } catch (e) {
                return false;
            }
        });

        return filtered.sort((a, b) => new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime());
    }, [shifts, filterMonth]);

    const aggregatedData = useMemo(() => {
        const total = sortedAndFilteredShifts.reduce((acc, shift) => ({
            totalHours: acc.totalHours + shift.hours,
            totalPay: acc.totalPay + shift.pay
        }), { totalHours: 0, totalPay: 0 });

        const monthlyGroups = sortedAndFilteredShifts.reduce((acc, shift) => {
            const monthKey = shift.shift_date.substring(0, 7);
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



    return (
        <>
            <GlobalStyles />
            <div className={cn("min-h-screen transition-all duration-300 ease-in-out", appClasses)}>
                <div className={cn("min-h-screen flex flex-col items-center sm:p-6 transition-all duration-300 ease-in-out")}>

                    {/* Header */}
                    <Header
                        theme={theme}
                        lang={lang}
                        primaryColors={PRIMARY_COLOR_CLASSES}
                    />

                    {/* Controls */}
                    <div className="w-full max-w-4xl px-4 mb-6">

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

                        {/* Add Shift Button */}
                        <button
                            onClick={openAddModal}
                            className={cn(
                                "mt-4 w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2",
                                PRIMARY_COLOR_CLASSES.bgGradient,
                                "text-white hover:shadow-lg hover:-translate-y-0.5"
                            )}
                        >
                            <Plus size={20} />
                            {strings.addShift}
                        </button>
                    </div>

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
                                                onConfirm: () => {
                                                    setShifts([]);
                                                    setHourlyRate(1000);
                                                    const existingData = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS) || {};
                                                    const emptyData = { ...existingData, hourlyRate: 1000 };

                                                    setItemToLocalStorage(STORAGE_KEYS.SHIFTS, emptyData);
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
                                            © {new Date().getFullYear()} Shomyn
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
                                        } as React.CSSProperties}
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