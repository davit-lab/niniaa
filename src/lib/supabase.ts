import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wiladtlmwztcqhsaycxx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbGFkdGxtd3p0Y3Foc2F5Y3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzkyMDMsImV4cCI6MjA5MjYxNTIwM30.My0Cei9LHq--BFbJFvqbOymVfD0jUtnZQSNWvGeNmfE";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings > Values.");
}

// Initialize Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
