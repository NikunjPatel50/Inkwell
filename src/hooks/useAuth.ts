import { useCallback, useEffect, useState } from "react";
import { insforge } from "../lib/insforge";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

function userDisplayName(user: {
  email: string;
  profile?: { name?: string } | null;
}): string | undefined {
  return user.profile?.name;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) {
      setUser(null);
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email ?? "",
      name: userDisplayName(data.user),
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    refreshUser().finally(() => {
      if (!cancelled) {
        window.clearTimeout(timeout);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message ?? "Sign in failed.");
    }
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        name: userDisplayName(data.user),
      });
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      redirectTo: window.location.origin,
    });

    if (error) {
      throw new Error(error.message ?? "Sign up failed.");
    }

    if (data?.requireEmailVerification) {
      throw new Error("Check your email to verify your account, then sign in.");
    }

    if (data?.accessToken && data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        name: userDisplayName(data.user) ?? name,
      });
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    await insforge.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signOut, refreshUser };
}
