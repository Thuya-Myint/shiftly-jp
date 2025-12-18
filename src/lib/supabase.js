import { config } from "@/configs/config";
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(config.SUPABASE_PROJECT_URL, config.SUPABASE_ANON_KEY);
