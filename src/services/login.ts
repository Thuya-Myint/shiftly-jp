import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/constants";

export const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                prompt: 'select_account'
            }
        }
    })

    if (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
}

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(`Logout failed: ${error.message}`);
    }

    // Clear specific localStorage items
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.PWA_INSTALL_PROMPT);
    
    // Clear all Supabase auth tokens
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
        }
    });
    
    // Force complete reload for mobile PWA
    window.location.replace('/login');
}