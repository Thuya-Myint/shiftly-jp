import React, { useState, useMemo, useEffect } from 'react';
import { X, CalendarIcon, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses } from '@/constants/themes';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { calculateHours } from '@/utils/time';
import { ScrollTimePicker } from './ScrollTimePicker';
import type { Shift, Lang, ShiftFormState } from '@/types/shift';

export function AddEditShiftModal({
    isOpen,
    onClose,
    onSubmit,
    initialShift,
    lang,
    primaryColors
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (shift: Omit<Shift, 'hours' | 'pay' | 'dayOfWeek'>) => void;
    initialShift: Shift | null;
    lang: Lang;
    primaryColors: ReturnType<typeof getPrimaryColorClasses>;
}) {
    const strings = LANG_STRINGS[lang];
    const initialFormState = useMemo<ShiftFormState>(() => ({
        date: initialShift ? parseISO(initialShift.date) : new Date(),
        fromTime: initialShift ? initialShift.fromTime : '09:00',
        toTime: initialShift ? initialShift.toTime : '17:00',
        wage: initialShift ? initialShift.wage.toString() : '1000',
        id: initialShift ? initialShift.id : null,
    }), [initialShift]);

    const [form, setForm] = useState<ShiftFormState>(initialFormState);
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(initialFormState);
        }
    }, [isOpen, initialFormState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (name: 'fromTime' | 'toTime', value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setForm(prev => ({ ...prev, date }));
            setIsDatePopoverOpen(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.date || !form.fromTime || !form.toTime || !form.wage) return;

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className={cn("w-full max-w-md rounded-3xl p-6 relative", modalBgClasses)}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={cn("text-2xl font-extrabold mb-6", primaryColors.text)}>{title}</h2>
                <button
                    className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date Picker */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                            {lang === 'en' ? 'Date' : '日付'}
                        </label>
                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-12 rounded-xl border-2 items-center flex px-3",
                                        "text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-900",
                                        primaryColors.border
                                    )}
                                >
                                    <CalendarIcon className={cn("mr-2 h-4 w-4", primaryColors.text)} />
                                    {form.date ? format(form.date, lang === 'en' ? 'PPP' : 'yyyy年M月d日(EEE)') : <span>Pick a date</span>}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full md:w-auto p-0 z-[10001]">
                                <Calendar
                                    mode="single"
                                    selected={form.date}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                    locale={lang === 'jp' ? undefined : undefined}
                                    className="max-w-full"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Time Pickers */}
                    <div className="flex justify-between items-center gap-1 sm:gap-2 py-2">
                        <ScrollTimePicker
                            value={form.fromTime}
                            onChange={(v) => handleTimeChange('fromTime', v)}
                            label={strings.start}
                            primaryColors={primaryColors}
                        />
                        <span className={cn("font-bold", primaryColors.text, "text-xl sm:text-2xl")}>{strings.to}</span>
                        <ScrollTimePicker
                            value={form.toTime}
                            onChange={(v) => handleTimeChange('toTime', v)}
                            label={strings.end}
                            primaryColors={primaryColors}
                        />
                    </div>

                    {/* Hourly Rate Input */}
                    <div>
                        <label htmlFor="wage" className="block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                            <span className="flex items-center"><Zap size={14} className="inline mr-1" /> {strings.hourlyRate} ({lang === 'en' ? 'JPY' : '円'})</span>
                        </label>
                        <div className="relative">
                            <Input
                                id="wage"
                                name="wage"
                                type="number"
                                step="100"
                                placeholder="1000"
                                value={form.wage}
                                onChange={handleChange}
                                className={cn("w-full h-12 rounded-xl text-lg font-semibold pl-10 border-2 text-gray-900 dark:text-white", primaryColors.border)}
                            />
                            <span className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold", primaryColors.text)}>¥</span>
                        </div>
                    </div>

                    {/* Summary */}
                    <div
                        className={cn("p-4 rounded-xl flex justify-between items-center shadow-md", primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark)}
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-400">{strings.totalHours}</p>
                            <p className={cn("text-2xl font-black", primaryColors.text)}>{hours} {strings.hours}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-400">{strings.totalPay}</p>
                            <p className={cn("text-2xl font-black", primaryColors.text)}>{yen.format(pay)}</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={cn("w-full h-12 rounded-xl text-lg font-bold text-white transition-all shadow-lg hover:shadow-xl", primaryColors.bgGradient)}
                    >
                        {submitText}
                    </button>
                </form>
            </div>
        </div>
    );
}