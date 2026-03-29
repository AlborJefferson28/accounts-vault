import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";

export type AuthScreen = "login" | "register" | "vault";

export interface UseAuthReturn {
  user: User | null;
  screen: AuthScreen;
  loading: boolean;
  authError: string;
  /** The plaintext password kept in memory for crypto operations */
  masterPw: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setScreen: (s: AuthScreen) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [masterPw, setMasterPw] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [screen, setScreen] = useState<AuthScreen>("login");

  // Subscribe to Supabase auth changes on mount
  useEffect(() => {
    let mounted = true;

    // Check initial session
    authService.getSession().then((session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setScreen(session?.user ? "vault" : "login");
      setLoading(false);
    });

    // Listen for future changes
    const unsubscribe = authService.onAuthChange((newUser) => {
      if (!mounted) return;
      setUser(newUser);
      if (!newUser) {
        setMasterPw(null);
        setScreen("login");
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await authService.signIn(email, password);
      // masterPw = the password used to login (same for crypto)
      setMasterPw(password);
      setScreen("vault");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      setAuthError(msg);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await authService.signUp(email, password);
      setMasterPw(password);
      setScreen("vault");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrarse";
      setAuthError(msg);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError("");
    try {
      await authService.signOut();
      setMasterPw(null);
      setScreen("login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cerrar sesión";
      setAuthError(msg);
    }
  }, []);

  return { user, screen, loading, authError, masterPw, signIn, signUp, signOut, setScreen };
}
