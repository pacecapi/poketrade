import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  // Starts true only when there is a session to restore; otherwise the app
  // renders immediately in its signed-out state.
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured || !userId) {
      setProfile(null);
      return;
    }

    let active = true;

    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? null);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo(() => {
    const unconfigured = {
      error: new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      ),
    };

    return {
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,

      // The `username` lands in raw_user_meta_data, which the
      // on_auth_user_created trigger copies into public.profiles.
      async signUp({ email, password, username }) {
        if (!isSupabaseConfigured) return unconfigured;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        return { data, error };
      },

      async signIn({ email, password }) {
        if (!isSupabaseConfigured) return unconfigured;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
      },

      async signOut() {
        if (!isSupabaseConfigured) return unconfigured;
        const { error } = await supabase.auth.signOut();
        return { error };
      },
    };
  }, [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
