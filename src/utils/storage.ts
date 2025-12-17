import { DB_NAME, DB_VERSION, STORE_NAME } from '@/constants';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB not supported'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);
        const timeout = setTimeout(() => {
            reject(new Error('IndexedDB timeout'));
        }, 5000);

        request.onerror = () => {
            clearTimeout(timeout);
            reject(request.error || new Error('IndexedDB open failed'));
        };

        request.onsuccess = () => {
            clearTimeout(timeout);
            resolve(request.result);
        };

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

export const saveToIndexedDB = async (key: string, data: any): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(data, key);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Save timeout'));
            }, 3000);

            transaction.oncomplete = () => {
                clearTimeout(timeout);
                resolve();
            };
            transaction.onerror = () => {
                clearTimeout(timeout);
                reject(transaction.error || new Error('Save failed'));
            };
        });
    } catch (e) {
        throw new Error(`IndexedDB save failed: ${e}`);
    }
};

export const loadFromIndexedDB = async (key: string): Promise<any> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Load timeout'));
            }, 3000);

            request.onsuccess = () => {
                clearTimeout(timeout);
                resolve(request.result);
            };
            request.onerror = () => {
                clearTimeout(timeout);
                reject(request.error || new Error('Load failed'));
            };
        });
    } catch (e) {
        throw new Error(`IndexedDB load failed: ${e}`);
    }
};