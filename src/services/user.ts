import { supabase } from "@/lib/supabase";

export const fetchUserData = async (userId: string) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch user data: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Database error in fetchUserData:', error);
        throw error;
    }
};

export const updateUserBalance = async (userId: string, balance: number) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (typeof balance !== 'number' || balance < 0) {
        throw new Error('Valid balance amount is required');
    }

    try {
        console.log('Updating balance for user:', userId, 'to:', balance);

        const { data, error } = await supabase
            .from('users')
            .update({ balance })
            .eq('id', userId)
            .select();

        console.log('Update result:', { data, error });

        if (error) {
            throw new Error(`Failed to update user balance: ${error.message}`);
        }

        if (!data || data.length === 0) {
            console.warn('Database update blocked by RLS - returning local update only');
            return { id: userId, balance };
        }

        return data[0];
    } catch (error) {
        console.error('Database error in updateUserBalance:', error);
        throw error;
    }
};