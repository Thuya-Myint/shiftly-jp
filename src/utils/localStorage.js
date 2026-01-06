import { StorageKey } from '../configs/localStorage';
export const setItemToLocalStorage = (key, value) => {
    if (!key) {
        console.error('Key is required for localStorage operation');
        return;
    }
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    }
    catch (error) {
        console.error(`Failed to set localStorage item '${key}':`, error);
    }
};
export const getItemFromLocalStorage = (key) => {
    if (!key) {
        console.error('Key is required for localStorage operation');
        return null;
    }
    try {
        const item = localStorage.getItem(key);
        if (!item)
            return null;
        return JSON.parse(item);
    }
    catch (error) {
        console.error(`Failed to get localStorage item '${key}':`, error);
        return null;
    }
};
export const removeItemFromLocalStorage = (key) => {
    if (!key) {
        console.error('Key is required for localStorage operation');
        return;
    }
    try {
        localStorage.removeItem(key);
    }
    catch (error) {
        console.error(`Failed to remove localStorage item '${key}':`, error);
    }
};
export const clearAllLocalStorage = () => {
    try {
        localStorage.clear();
    }
    catch (error) {
        console.error('Failed to clear localStorage:', error);
    }
};
export const getLastShiftDefaults = () => {
    try {
        const raw = localStorage.getItem(StorageKey.LAST_SHIFT_DEFAULTS);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
export const setLastShiftDefaults = (data) => {
    try {
        localStorage.setItem(StorageKey.LAST_SHIFT_DEFAULTS, JSON.stringify(data));
    }
    catch {
        // ignore
    }
};
