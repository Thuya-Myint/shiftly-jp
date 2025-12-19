import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Trash2, Zap, Filter, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Types
import type { Shift, Lang, ViewMode, AlertConfig } from '@/types/shift';

// Constants
import { yen, STORAGE_KEYS } from '@/constants';
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

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export default function ShiftTracker() {
    const { theme, variantIndex, lang } = useTheme();
    const { user } = useAuth();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [hourlyRate, setHourlyRate] = useState(1000);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [filterMonth, setFilterMonth] = useState<Date | undefined>(new Date());
    const [alertConfig, setAlertConfig] = useState<AlertConfig>(null);
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
                setIsLoading(true)
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
        if (!id || !user?.id) return;

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
    };

    const openAddModal = () => {
        setEditingShift(null);
        setIsModalOpen(true);
    };

    const openEditModal = (shift: Shift) => {
        setEditingShift(shift);
        setIsModalOpen(true);
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
            <div
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
            </div>
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
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 size={40} className={cn("animate-spin", PRIMARY_COLOR_CLASSES.text)} />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {lang === 'en' ? 'Loading shifts...' : 'シフトを読み込み中...'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            renderMonthlyView()
                        )}
                    </main>

                    {/* Enhanced Footer */}
                    <footer className="w-full max-w-4xl mt-8 pt-6 pb-safe">
                        <div
                            className={cn(
                                "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border shadow-xl",
                                theme === 'light'
                                    ? 'bg-white/80 border-gray-200/50'
                                    : 'bg-slate-900/60 border-slate-700/50'
                            )}
                        >
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Left side - Clear Data Button */}
                                <div>
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
                                                    setAlertConfig(null);
                                                }
                                            });
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Trash2 size={16} />
                                            <span className="font-semibold">{strings.clearData}</span>
                                        </div>
                                    </Button>
                                </div>

                                {/* Right side - Copyright & Branding */}
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    {/* Logo/icon */}
                                    <div
                                        className={cn(
                                            "p-2 rounded-full shadow-lg",
                                            PRIMARY_COLOR_CLASSES.bgGradient
                                        )}
                                    >
                                        <Zap size={20} className="text-white" />
                                    </div>

                                    {/* Copyright text */}
                                    <div className="text-center sm:text-right">
                                        <p
                                            className={cn(
                                                "text-sm font-bold tracking-wide",
                                                PRIMARY_COLOR_CLASSES.text
                                            )}
                                        >
                                            © {new Date().getFullYear()} Shomyn
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {lang === 'en' ? 'Made with' : '愛を込めて'}
                                            <span className="inline-block mx-1 text-red-500">♥</span>
                                            {lang === 'en' ? 'by Shomyn Team' : 'Shomynチーム'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
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


            </div>
        </>
    );
}