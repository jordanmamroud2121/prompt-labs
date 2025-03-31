import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Supabase URL or Anonymous Key not found. Authentication will not work.",
    );
  } else {
    throw new Error(
      "Supabase URL or Anonymous Key not found. Authentication will not work.",
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
