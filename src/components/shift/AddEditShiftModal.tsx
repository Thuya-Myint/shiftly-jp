import { useState, useMemo, useEffect } from 'react';
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
import type { Shift, Lang, ShiftFormState } from '@/types/shift';

const TIME_STEP_SECONDS = 15 * 60; // 15 minutes

export function AddEditShiftModal({
  isOpen,
  onClose,
  onSubmit,
  initialShift,
  lang,
  primaryColors,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: {
    id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    wage?: number;
  }) => void;
  initialShift: Shift | null;
  lang: Lang;
  primaryColors: ReturnType<typeof getPrimaryColorClasses>;
  theme: "light" | "dark";
}) {
  const strings = LANG_STRINGS[lang];

  const initialFormState = useMemo<ShiftFormState>(() => ({
    date: initialShift ? parseISO(initialShift.shift_date) : new Date(),
    fromTime: initialShift ? initialShift.start_time : '09:00',
    toTime: initialShift ? initialShift.end_time : '17:00',
    wage: initialShift ? initialShift.wage.toString() : '1000',
    id: initialShift ? initialShift.id : null,
  }), [initialShift]);

  const [form, setForm] = useState<ShiftFormState>(initialFormState);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(initialFormState);
  }, [isOpen, initialFormState]);

  if (!isOpen) return null;

  const hours = calculateHours(form.fromTime, form.toTime);
  const pay = Math.round(hours * (parseFloat(form.wage) || 0));

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Scroll the input into view when focused, with a slight delay to allow the keyboard to appear
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      id: form.id || crypto.randomUUID(),
      shift_date: format(form.date, 'yyyy-MM-dd'),
      start_time: form.fromTime,
      end_time: form.toTime,
      wage: parseFloat(form.wage) || 0,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-auto rounded-3xl p-6 relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cn("text-2xl font-bold tracking-tight mb-6 uppercase", primaryColors.text)}>
          {initialShift ? strings.editShift : strings.addShift}
        </h2>

        <button
          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-white/5"
          onClick={onClose}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              {lang === 'en' ? 'DATE' : '日付'}
            </label>

            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-bold h-12 rounded-xl border-2 items-center flex px-4 shadow-sm",
                    "text-gray-900 dark:text-white bg-white dark:bg-slate-900",
                    primaryColors.border
                  )}
                >
                  <CalendarIcon className={cn("mr-3 h-4 w-4", primaryColors.text)} strokeWidth={2} />
                  <span className="tracking-tight text-sm">
                    {format(form.date, lang === 'en' ? 'PPP' : 'yyyy年M月d日(EEE)')}
                  </span>
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-full md:w-auto p-0 z-[10001] rounded-xl shadow-2xl border-gray-100 dark:border-white/5">
                <Calendar
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => d && setForm(p => ({ ...p, date: d }))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Pickers (NATIVE HTML) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              {strings.start.toUpperCase()} – {strings.end.toUpperCase()}
            </label>

            <div className="flex gap-3">
              <Input
                type="time"
                step={TIME_STEP_SECONDS}
                value={form.fromTime}
                onFocus={handleFocus}
                onChange={(e) =>
                  setForm(p => ({ ...p, fromTime: e.target.value }))
                }
                className={cn("h-12 rounded-xl border-2 font-bold text-base", primaryColors.border)}
              />

              <Input
                type="time"
                step={TIME_STEP_SECONDS}
                value={form.toTime}
                onFocus={handleFocus}
                onChange={(e) =>
                  setForm(p => ({ ...p, toTime: e.target.value }))
                }
                className={cn("h-12 rounded-xl border-2 font-bold text-base", primaryColors.border)}
              />
            </div>
          </div>

          {/* Wage */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              <span className="flex items-center">
                <Zap size={14} className="inline mr-1.5" strokeWidth={2} />
                {strings.hourlyRate.toUpperCase()}
              </span>
            </label>

            <div className="relative">
              <Input
                type="number"
                step="100"
                value={form.wage}
                onFocus={handleFocus}
                onChange={(e) =>
                  setForm(p => ({ ...p, wage: e.target.value }))
                }
                className={cn("h-12 pl-10 rounded-xl border-2 font-bold text-base", primaryColors.border)}
              />
              <span
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg",
                  primaryColors.text
                )}
              >
                ¥
              </span>
            </div>
          </div>

          {/* Summary */}
          <div
            className={cn(
              "p-5 rounded-2xl flex justify-between items-center shadow-lg border",
              theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/5'
            )}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                {strings.totalHours.toUpperCase()}
              </p>
              <p className={cn("text-2xl font-bold tracking-tight", primaryColors.text)}>
                {hours}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                {strings.totalPay.toUpperCase()}
              </p>
              <p className={cn("text-2xl font-bold tracking-tight", primaryColors.text)}>
                {yen.format(pay)}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full h-14 rounded-xl text-lg font-bold text-white shadow-xl active:scale-[0.98] border-t border-white/10",
              primaryColors.bgGradient
            )}
          >
            {(initialShift ? strings.save : strings.addShift).toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
}
