import { useState, useMemo, useEffect } from 'react';
import { X, CalendarIcon, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import * as Slider from '@radix-ui/react-slider';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses } from '@/constants/themes';
import { LANG_STRINGS } from '@/constants/strings';
import { yen } from '@/constants';
import { calculateHours } from '@/utils/time';
import type { Shift, Lang, ShiftFormState } from '@/types/shift';

/* =========================
   Time helpers (added only)
========================= */

const STEP = 15;
const DAY_MINUTES = 24 * 60;

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (m: number) => {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${h}:${mm}`;
};

/* =========================
   Component
========================= */

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
  onSubmit: (shift: { id: string; shift_date: string; start_time: string; end_time: string; wage?: number }) => void;
  initialShift: Shift | null;
  lang: Lang;
  primaryColors: ReturnType<typeof getPrimaryColorClasses>
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

  const startMin = toMinutes(form.fromTime);
  const endMin = toMinutes(form.toTime);

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
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={cn(
          "w-full max-w-md rounded-3xl p-6 relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 shadow-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cn("text-2xl font-extrabold mb-6", primaryColors.text)}>
          {initialShift ? strings.editShift : strings.addShift}
        </h2>

        <button
          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Date Picker (UNCHANGED) */}
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
                  {format(form.date, lang === 'en' ? 'PPP' : 'yyyy年M月d日(EEE)')}
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-full md:w-auto p-0 z-[10001]">
                <Calendar
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => d && setForm(p => ({ ...p, date: d }))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* =========================
              Time Range Slider (NEW)
          ========================= */}

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
              {strings.start} – {strings.end}
            </label>

            <Slider.Root
              value={[startMin, endMin]}
              min={0}
              max={DAY_MINUTES}
              step={STEP}
              minStepsBetweenThumbs={1}
              onValueChange={([s, e]) =>
                setForm(p => ({
                  ...p,
                  fromTime: toTime(s),
                  toTime: toTime(e),
                }))
              }
              className="relative flex items-center h-8"
            >
              <Slider.Track
                className={cn(
                  "relative grow h-2 rounded-full",
                  primaryColors.bgLight + "/40"
                )}
              >
                <Slider.Range
                  className={cn(
                    "absolute h-full rounded-full",
                    primaryColors.bgGradient
                  )}
                />
              </Slider.Track>

              <Slider.Thumb
                className={cn(
                  "block w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 shadow-md",
                  primaryColors.border
                )}
              />
              <Slider.Thumb
                className={cn(
                  "block w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 shadow-md",
                  primaryColors.border
                )}
              />
            </Slider.Root>

            {/* Manual time inputs (kept for precision) */}
            <div className="flex gap-2 mt-4">
              <Input
                type="time"
                step={STEP * 60}
                value={form.fromTime}
                onChange={(e) => setForm(p => ({ ...p, fromTime: e.target.value }))}
              />
              <Input
                type="time"
                step={STEP * 60}
                value={form.toTime}
                onChange={(e) => setForm(p => ({ ...p, toTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Wage (UNCHANGED) */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
              <span className="flex items-center">
                <Zap size={14} className="inline mr-1" />
                {strings.hourlyRate}
              </span>
            </label>

            <div className="relative">
              <Input
                type="number"
                step="100"
                value={form.wage}
                onChange={(e) => setForm(p => ({ ...p, wage: e.target.value }))}
                className={cn("pl-10", primaryColors.border)}
              />
              <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 font-bold", primaryColors.text)}>
                ¥
              </span>
            </div>
          </div>

          {/* Summary (UNCHANGED) */}
          <div className={cn(
            "p-4 rounded-xl flex justify-between items-center shadow-md",
            primaryColors.bgLight + "/50 dark:" + primaryColors.bgDark
          )}>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">{strings.totalHours}</p>
              <p className={cn("text-2xl font-black", primaryColors.text)}>{hours}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">{strings.totalPay}</p>
              <p className={cn("text-2xl font-black", primaryColors.text)}>
                {yen.format(pay)}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full h-12 rounded-xl text-lg font-bold text-white shadow-lg",
              primaryColors.bgGradient
            )}
          >
            {initialShift ? strings.save : strings.addShift}
          </button>
        </form>
      </div>
    </div>
  );
}