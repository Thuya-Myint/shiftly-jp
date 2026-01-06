"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LANG_STRINGS } from "@/constants/strings";
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_JP = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
export function MonthFilter({ selectedMonth, onMonthSelect, lang, primaryColors, }) {
    const strings = LANG_STRINGS[lang];
    const [year, setYear] = useState(selectedMonth?.getFullYear() ?? new Date().getFullYear());
    const months = lang === "en" ? MONTHS_EN : MONTHS_JP;
    return (_jsx("div", { className: "flex-1 min-w-0", children: _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full h-10 sm:h-12 px-3 sm:px-4 flex items-center justify-between rounded-xl border-2 font-medium text-sm", selectedMonth
                            ? cn(primaryColors.border, primaryColors.text)
                            : "border-gray-300 dark:border-slate-600 text-gray-500"), children: [_jsxs("div", { className: "flex items-center truncate", children: [_jsx(CalendarIcon, { size: 16, className: "mr-2" }), selectedMonth
                                        ? format(selectedMonth, lang === "en" ? "MMM yyyy" : "yyyy年M月")
                                        : strings.filterByMonth] }), selectedMonth && (_jsx(X, { size: 16, className: "opacity-50", onClick: (e) => {
                                    e.stopPropagation();
                                    onMonthSelect(undefined);
                                } }))] }) }), _jsxs(PopoverContent, { className: "w-72 p-4 rounded-xl shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setYear((y) => y - 1), children: _jsx(ChevronLeft, { size: 18 }) }), _jsx("span", { className: "font-semibold text-sm", children: year }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setYear((y) => y + 1), children: _jsx(ChevronRight, { size: 18 }) })] }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: months.map((label, index) => {
                                const date = new Date(year, index, 1);
                                const isSelected = selectedMonth &&
                                    selectedMonth.getFullYear() === year &&
                                    selectedMonth.getMonth() === index;
                                return (_jsx(Button, { variant: "ghost", onClick: () => onMonthSelect(date), className: cn("h-9 text-sm rounded-lg", isSelected
                                        ? cn(primaryColors.bgLight, primaryColors.text, "font-semibold")
                                        : "hover:bg-gray-100 dark:hover:bg-slate-800"), children: label }, label));
                            }) })] })] }) }));
}
