export type Shift = {
    id: string;
    shift_date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    hours: number;
    wage: number;
    pay: number;
};

export type Lang = 'en' | 'jp';
export type ViewMode = 'list' | 'monthly';

export type ShiftFormState = {
    date: Date;
    fromTime: string;
    toTime: string;
    wage: string;
    id: string | null;
};

export type AlertConfig = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
} | null;