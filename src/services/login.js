import { supabase } from "@/lib/supabase";
export const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                prompt: 'select_account'
            }
        }
    });
    if (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
};
export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(`Logout failed: ${error.message}`);
    }
    // Clear all localStorage data
    localStorage.clear();
};
