import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export type AuthChangeCallback = (user: User | null, session: Session | null) => void;

export const authService = {
  /** Register a new user with email+password */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign in an existing user */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /** Sign out the current user */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get the current session (null if not authenticated) */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** Subscribe to auth state changes. Returns unsubscribe fn. */
  onAuthChange(callback: AuthChangeCallback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null, session);
    });
    return () => data.subscription.unsubscribe();
  },
};
