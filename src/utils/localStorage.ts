export const setItemToLocalStorage = (key: string, value: any): void => {
    if (!key) {
        console.error('Key is required for localStorage operation');
        return;
    }
    
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Failed to set localStorage item '${key}':`, error);
    }
};

export const getItemFromLocalStorage = <T = any>(key: string): T | null => {
    if (!key) {
        console.error('Key is required for localStorage operation');
        return null;
    }
    
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        return JSON.parse(item);
    } catch (error) {
        console.error(`Failed to get localStorage item '${key}':`, error);
        return null;
    }
};

export const removeItemFromLocalStorage = (key: string): void => {
    if (!key) {
        console.error('Key is required for localStorage operation');
        return;
    }
    
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove localStorage item '${key}':`, error);
    }
};

export const clearAllLocalStorage = (): void => {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Failed to clear localStorage:', error);
    }
};