import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ Supabase environment variables are missing! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : {
    from: () => ({
      insert: () => ({ error: { message: "Supabase not configured" } }),
      select: () => ({ data: [], error: { message: "Supabase not configured" } })
    })
  };
