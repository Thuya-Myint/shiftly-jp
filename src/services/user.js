import { supabase } from "@/lib/supabase";
export const fetchUserData = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch user data: ${error.message}`);
    }
    return data;
};
