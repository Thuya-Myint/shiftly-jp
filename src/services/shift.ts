import { supabase } from "@/lib/supabase";
import { Shift } from "@/types/shift";

export const fetchUserShifts = async (userId: string): Promise<Shift[]> => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        const { data, error } = await supabase
            .from("user_shift")
            .select("*")
            .eq('user_id', userId)
            .order('shift_date', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch user shifts: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Database error in fetchUserShifts:', error);
        throw error;
    }
};

export const deleteUserShift = async (userId: string, shiftId: string): Promise<void> => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (!shiftId) {
        throw new Error('Shift ID is required');
    }

    try {
        const { error } = await supabase
            .from("user_shift")
            .delete()
            .eq('id', shiftId)
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Failed to delete user shift: ${error.message}`);
        }
    } catch (error) {
        console.error('Database error in deleteUserShift:', error);
        throw error;
    }
};

export const addUserShift = async (userId: string, payload: Shift) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (!payload) {
        throw new Error('Shift data is required');
    }

    try {
        const shiftData = {
            ...payload,
            user_id: userId
        };

        const { data, error } = await supabase
            .from("user_shift")
            .insert(shiftData)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to add user shift: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Database error in addUserShift:', error);
        throw error;
    }
};

export const updateUserShift = async (userId: string, shiftId: string, payload: Shift) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (!shiftId) {
        throw new Error('Shift ID is required');
    }

    if (!payload) {
        throw new Error('Shift data is required');
    }

    try {
        const { data, error } = await supabase
            .from("user_shift")
            .update(payload)
            .eq('id', shiftId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update user shift: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Database error in updateUserShift:', error);
        throw error;
    }
};