import { parseISO } from 'date-fns';
import { DAY_NAMES_EN, DAY_NAMES_JP } from '@/constants';
import type { Lang } from '@/types/shift';

export function calculateHours(from: string, to: string) {
    if (!from || !to) return 0;
    const parseTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(v => parseInt(v, 10));
        return h * 60 + m;
    };
    const startMinutes = parseTime(from);
    let endMinutes = parseTime(to);
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes <= 0 ? 0 : Math.round((durationMinutes / 60) * 100) / 100;
}

export const getDayOfWeek = (dateString: string, language: Lang): string => {
    try {
        const d = parseISO(dateString);
        const dayIndex = d.getDay();
        const dayNames = language === 'en' ? DAY_NAMES_EN : DAY_NAMES_JP;
        return dayNames[dayIndex];
    } catch (e) {
        return language === 'en' ? 'ERR' : 'エラー';
    }
};