import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses } from '@/constants/themes';
import { ITEM_HEIGHT_SM, ITEM_HEIGHT_LG, CONTAINER_HEIGHT_MULTIPLIER_SM, CONTAINER_HEIGHT_MULTIPLIER_LG } from '@/constants';

function ScrollColumn({ options, selected, onSelect, isSmallDevice, primaryColors }: { 
    options: string[]; 
    selected: number; 
    onSelect: (v: number) => void; 
    isSmallDevice: boolean; 
    primaryColors: ReturnType<typeof getPrimaryColorClasses> 
}) {
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
        <div className="relative group ">
            <div
                style={{ height: `${ITEM_HEIGHT}px`, top: `${ITEM_HEIGHT * (isSmallDevice ? 2 : 1)}px` }}
                className={cn("absolute left-0 right-0 rounded-lg pointer-events-none z-0", primaryColors.bgLight + '/50 dark:' + primaryColors.bgDark)}
            />
            <div
                ref={containerRef}
                onScroll={handleScroll}
                style={{ height: `${CONTAINER_HEIGHT}px` }}
                className="overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 w-10 sm:w-12 text-center flex-shrink-0"
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

export function ScrollTimePicker({ value, onChange, label, primaryColors }: { 
    value: string; 
    onChange: (v: string) => void; 
    label?: string; 
    primaryColors: ReturnType<typeof getPrimaryColorClasses> 
}) {
    const [hour, minute] = (value || '00:00').split(':').map(v => parseInt(v, 10));
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const updateTime = (newH: number, newM: number) => onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);

    const [isSmallDevice, setIsSmallDevice] = useState(false);
    useEffect(() => {
        const checkSize = () => setIsSmallDevice(window.innerWidth < 640);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
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