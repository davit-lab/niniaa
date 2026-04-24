import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      checkAdmin(u);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      checkAdmin(u);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(u: User | null) {
    if (!u) {
      setIsAdmin(false);
      return;
    }

    // Admin emails are always admin (bootstrapped)
    if (u.email === 'academy@codezero.ge' || u.email === 'admin@nino.studio') {
      setIsAdmin(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("id", u.id)
        .single();
      
      setIsAdmin(!!data && !error);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  }

  return { user, isAdmin, loading };
}
