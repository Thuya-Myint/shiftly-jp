"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { getPrimaryColorClasses } from "@/constants/themes";
import { LANG_STRINGS } from "@/constants/strings";
import type { Lang } from "@/types/shift";

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_JP = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function MonthFilter({
  selectedMonth,
  onMonthSelect,
  lang,
  primaryColors,
}: {
  selectedMonth: Date | undefined;
  onMonthSelect: (date: Date | undefined) => void;
  lang: Lang;
  primaryColors: ReturnType<typeof getPrimaryColorClasses>;
}) {
  const strings = LANG_STRINGS[lang];

  const [year, setYear] = useState(
    selectedMonth?.getFullYear() ?? new Date().getFullYear()
  );

  const [open, setOpen] = useState(false);

  const months = lang === "en" ? MONTHS_EN : MONTHS_JP;

  return (
    <div className="flex-1 min-w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-10 sm:h-12 px-3 sm:px-4 flex items-center justify-between rounded-xl border-2 font-medium text-sm",
              selectedMonth
                ? cn(primaryColors.border, primaryColors.text)
                : "border-gray-300 dark:border-slate-600 text-gray-500"
            )}
          >
            <div className="flex items-center truncate">
              <CalendarIcon size={16} className="mr-2" />
              {selectedMonth
                ? format(selectedMonth, lang === "en" ? "MMM yyyy" : "yyyy年M月")
                : strings.filterByMonth}
            </div>

            {selectedMonth && (
              <X
                size={16}
                className="opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onMonthSelect(undefined);
                }}
              />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4 rounded-xl shadow-xl">
          {/* Year Controls */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setYear((y) => y - 1)}
            >
              <ChevronLeft size={18} />
            </Button>

            <span className="font-semibold text-sm">{year}</span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setYear((y) => y + 1)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((label, index) => {
              const date = new Date(year, index, 1);
              const isSelected =
                selectedMonth &&
                selectedMonth.getFullYear() === year &&
                selectedMonth.getMonth() === index;

              return (
                <Button
                  key={label}
                  variant="ghost"
                  onClick={() => {
                    onMonthSelect(date);
                    setOpen(false); // ✅ CLOSE ON SELECT
                  }}
                  className={cn(
                    "h-9 text-sm rounded-lg",
                    isSelected
                      ? cn(primaryColors.bgLight, primaryColors.text, "font-semibold")
                      : "hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}