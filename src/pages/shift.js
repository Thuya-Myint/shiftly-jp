import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Zap, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
// Constants
import { yen, LOCAL_STORAGE_KEY } from '@/constants';
import { LANG_STRINGS } from '@/constants/strings';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
// Utils
import { calculateHours, getDayOfWeek } from '@/utils/time';
import { saveToIndexedDB, loadFromIndexedDB } from '@/utils/storage';
// Components
import { GlobalStyles } from '@/components/GlobalStyles';
import { Header } from '@/components/Header';
import { MonthFilter } from '@/components/shift/MonthFilter';
import { MonthlyGroup } from '@/components/shift/MonthlyGroup';
import { AddEditShiftModal } from '@/components/shift/AddEditShiftModal';
import { CustomAlert } from '@/components/modals/CustomAlert';
import { PWAInstallPrompt } from '@/components/modals/PWAInstallPrompt';
import { useTheme } from '@/contexts/ThemeContext';
export default function ShiftTracker() {
    const { theme, variantIndex, lang } = useTheme();
    const [shifts, setShifts] = useState([]);
    const [hourlyRate, setHourlyRate] = useState(1000);
    const [viewMode, setViewMode] = useState('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date());
    const [alertConfig, setAlertConfig] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
            try {
                const data = await loadFromIndexedDB('appData');
                if (data && typeof data === 'object') {
                    setShifts(data.shifts || []);
                    setHourlyRate(data.hourlyRate || 1000);
                    setIsLoading(false);
                    return;
                }
            }
            catch (e) {
                console.warn("IndexedDB failed, trying localStorage:", e);
            }
            // Fallback to localStorage
            try {
                const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setShifts(parsedData.shifts || []);
                    setHourlyRate(parsedData.hourlyRate || 1000);
                    // Migrate to IndexedDB in background
                    saveToIndexedDB('appData', parsedData).catch(e => console.warn("Failed to migrate to IndexedDB:", e));
                }
            }
            catch (e) {
                console.error("Failed to load from localStorage:", e);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);
    // Save data when state changes
    useEffect(() => {
        if (isLoading)
            return;
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existingData = saved ? JSON.parse(saved) : {};
        const data = { ...existingData, shifts, hourlyRate };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        saveToIndexedDB('appData', data).catch(e => console.warn("Failed to save to IndexedDB:", e));
    }, [shifts, hourlyRate, isLoading]);
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
    // Data Aggregation and Filtering
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
    const renderMonthlyView = () => {
        const currentMonthKey = filterMonth ? format(filterMonth, 'yyyy-MM') : format(new Date(), 'yyyy-MM');
        const monthData = aggregatedData.monthlyGroups[currentMonthKey];
        return (_jsx("div", { className: "pt-4", children: monthData ? (_jsx(MonthlyGroup, { monthKey: currentMonthKey, totalPay: monthData.totalPay, totalHours: monthData.totalHours, shifts: monthData.shifts, theme: theme, baseLang: lang, onDelete: deleteShift, onUpdate: openEditModal, primaryColors: PRIMARY_COLOR_CLASSES }, currentMonthKey)) : (_jsx(EmptyState, { lang: lang, hasFilter: !!filterMonth, onClearFilter: () => setFilterMonth(new Date()) })) }));
    };
    // Empty State Component
    function EmptyState({ lang, hasFilter, onClearFilter }) {
        const strings = LANG_STRINGS[lang];
        return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: cn("p-8 rounded-3xl text-center backdrop-blur-md transition-colors border", theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-900/60 border-slate-700'), children: hasFilter ? (_jsxs(_Fragment, { children: [_jsx(Filter, { size: 40, className: cn("mx-auto mb-4", PRIMARY_COLOR_CLASSES.text) }), _jsx("h3", { className: "text-xl font-bold mb-2 text-gray-800 dark:text-gray-200", children: strings.noShiftsMonth }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: strings.tryDifferentMonth }), _jsxs(Button, { onClick: onClearFilter, variant: "outline", className: cn(PRIMARY_COLOR_CLASSES.border, PRIMARY_COLOR_CLASSES.text, "hover:bg-indigo-50/20 dark:hover:bg-violet-900/30"), children: [_jsx(X, { size: 16, className: "mr-2" }), " ", lang === 'en' ? 'Current Month' : '今月'] })] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { size: 40, className: cn("mx-auto mb-4", PRIMARY_COLOR_CLASSES.text) }), _jsx("h3", { className: "text-xl font-bold mb-2 text-gray-800 dark:text-gray-200", children: strings.noShiftsYet }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: strings.startTracking }), _jsxs(Button, { onClick: openAddModal, className: cn("text-white font-bold", PRIMARY_COLOR_CLASSES.bgGradient), children: [_jsx(Plus, { size: 16, className: "mr-2" }), " ", strings.addShift] })] })) }));
    }
    const appClasses = theme === 'light'
        ? themeVariant.light
        : themeVariant.dark;
    return (_jsxs(_Fragment, { children: [_jsx(GlobalStyles, {}), _jsxs("div", { className: cn("min-h-screen transition-all duration-300 ease-in-out", appClasses), children: [_jsxs("div", { className: cn("min-h-screen flex flex-col items-center sm:p-6 transition-all duration-300 ease-in-out"), children: [_jsx(Header, { theme: theme, lang: lang, primaryColors: PRIMARY_COLOR_CLASSES }), _jsxs("div", { className: "w-full max-w-4xl px-4 mb-6", children: [_jsxs("div", { className: cn("p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 border", theme === 'light'
                                            ? 'bg-white/80 border-gray-200'
                                            : 'bg-slate-900/70 border-slate-700'), children: [_jsxs("div", { className: "flex flex-col items-center sm:items-start", children: [_jsx("p", { className: "text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 text-center sm:text-left", children: strings.grandTotal }), _jsx("p", { className: cn("text-3xl font-black text-center sm:text-left", PRIMARY_COLOR_CLASSES.text), children: yen.format(aggregatedData.grandTotal.totalPay) }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left", children: [aggregatedData.grandTotal.totalHours, " ", strings.hours] })] }), _jsx("div", { className: "flex gap-3 w-full sm:w-auto flex-1 sm:flex-none min-w-0", children: _jsx(MonthFilter, { selectedMonth: filterMonth, onMonthSelect: setFilterMonth, lang: lang, primaryColors: PRIMARY_COLOR_CLASSES }) })] }), _jsxs("button", { onClick: openAddModal, className: cn("mt-4 w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2", PRIMARY_COLOR_CLASSES.bgGradient, "text-white hover:shadow-lg hover:-translate-y-0.5"), children: [_jsx(Plus, { size: 20 }), strings.addShift] })] }), _jsx("main", { className: "w-full max-w-4xl pb-16 px-4", children: renderMonthlyView() }), _jsx("footer", { className: "w-full max-w-4xl mt-8 pt-6 pb-safe", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: cn("relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border shadow-xl", theme === 'light'
                                        ? 'bg-white/80 border-gray-200/50'
                                        : 'bg-slate-900/60 border-slate-700/50'), children: [_jsx("div", { className: cn("absolute inset-0 opacity-20 animate-gradient-x", PRIMARY_COLOR_CLASSES.bgGradient) }), _jsxs("div", { className: "relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Button, { variant: "outline", size: "sm", className: cn("group relative overflow-hidden px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-lg", "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400", "bg-white/60 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-900/20"), onClick: () => {
                                                            setAlertConfig({
                                                                isOpen: true,
                                                                title: strings.areYouSure,
                                                                message: strings.clearData,
                                                                onConfirm: () => {
                                                                    setShifts([]);
                                                                    setHourlyRate(1000);
                                                                    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                                                                    const existingData = saved ? JSON.parse(saved) : {};
                                                                    const emptyData = { ...existingData, shifts: [], hourlyRate: 1000 };
                                                                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyData));
                                                                    saveToIndexedDB('appData', emptyData).catch(e => console.warn('Failed to clear IndexedDB:', e));
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
                                                            }, className: cn("p-2 rounded-full shadow-lg", PRIMARY_COLOR_CLASSES.bgGradient), children: _jsx(Zap, { size: 20, className: "text-white" }) }), _jsxs("div", { className: "text-center sm:text-right", children: [_jsxs(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: cn("text-sm font-bold tracking-wide", PRIMARY_COLOR_CLASSES.text), children: ["\u00A9 ", new Date().getFullYear(), " Shomyn"] }), _jsxs(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.7 }, className: "text-xs text-gray-500 dark:text-gray-400 font-medium", children: [lang === 'en' ? 'Made with' : '愛を込めて', _jsx(motion.span, { animate: { scale: [1, 1.2, 1] }, transition: { duration: 1.5, repeat: Infinity }, className: "inline-block mx-1 text-red-500", children: "\u2665" }), lang === 'en' ? 'by Shomyn Team' : 'Shomynチーム'] })] })] })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [...Array(3)].map((_, i) => (_jsx(motion.div, { className: cn("absolute w-2 h-2 rounded-full opacity-30", PRIMARY_COLOR_CLASSES.bgLight), animate: {
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
