export type Shift = {
    id: string;
    date: string;
    dayOfWeek: string;
    fromTime: string;
    toTime: string;
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