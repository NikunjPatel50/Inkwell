import { useCallback, useEffect, useState } from "react";
import {
  captureAuthSessionFromClient,
  clearPersistedAuthSession,
  persistAuthSession,
  readPersistedAuthSession,
  restoreAuthSession,
} from "../lib/authPersistence";
import { getLoginRedirectUrl } from "../lib/authRedirect";
import { insforge } from "../lib/insforge";
import { clearGuestSession } from "../lib/sessionBridge";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export type VerifyEmailMethod = "code" | "link";

export interface SignUpResult {
  verificationRequired: boolean;
  verifyEmailMethod?: VerifyEmailMethod;
  email: string;
}

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  verifyEmailMethod: VerifyEmailMethod;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<SignUpResult>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

function userDisplayName(user: {
  email: string;
  profile?: { name?: string } | null;
}): string | undefined {
  return user.profile?.name;
}

function mapAuthUser(user: {
  id: string;
  email?: string;
  profile?: { name?: string } | null;
}): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: userDisplayName({ email: user.email ?? "", profile: user.profile }),
  };
}

function syncPersistedSession(): void {
  const session = captureAuthSessionFromClient();
  if (session) {
    persistAuthSession(session);
  }
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyEmailMethod, setVerifyEmailMethod] = useState<VerifyEmailMethod>("code");

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    restoreAuthSession();

    const { data, error } = await insforge.auth.getCurrentUser();
    if (!error && data?.user) {
      const nextUser = mapAuthUser(data.user);
      setUser(nextUser);
      syncPersistedSession();
      return nextUser;
    }

    const persisted = readPersistedAuthSession();
    if (persisted?.refreshToken) {
      const { data: refreshed, error: refreshError } = await insforge.auth.refreshSession({
        refreshToken: persisted.refreshToken,
      });
      if (!refreshError && refreshed?.user) {
        const nextUser = mapAuthUser(refreshed.user);
        setUser(nextUser);
        syncPersistedSession();
        return nextUser;
      }
    }

    setUser(null);
    return null;
  }, []);

  useEffect(() => {
    restoreAuthSession();

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    Promise.all([
      refreshUser(),
      insforge.auth.getPublicAuthConfig().then(({ data }) => {
        if (data?.verifyEmailMethod === "code" || data?.verifyEmailMethod === "link") {
          setVerifyEmailMethod(data.verifyEmailMethod);
        }
      }),
    ]).finally(() => {
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
      clearGuestSession();
      setUser(mapAuthUser(data.user));
      syncPersistedSession();
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

  const signInWithGoogle = useCallback(async () => {
    window.location.assign("/api/auth/google");
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string): Promise<SignUpResult> => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      redirectTo: getLoginRedirectUrl(),
    });

    if (error) {
      throw new Error(error.message ?? "Sign up failed.");
    }

    if (data?.requireEmailVerification) {
      return {
        verificationRequired: true,
        verifyEmailMethod,
        email,
      };
    }

    if (data?.accessToken && data.user) {
      setUser(mapAuthUser(data.user));
      syncPersistedSession();
    } else {
      await refreshUser();
    }

    return {
      verificationRequired: false,
      email,
    };
  }, [refreshUser, verifyEmailMethod]);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) {
      throw new Error(error.message ?? "Verification failed.");
    }

    if (data?.user) {
      setUser(mapAuthUser(data.user));
      syncPersistedSession();
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

  const resendVerificationEmail = useCallback(async (email: string) => {
    const { error } = await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: getLoginRedirectUrl(),
    });
    if (error) {
      throw new Error(error.message ?? "Failed to resend verification email.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await insforge.auth.signOut();
    clearPersistedAuthSession();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    verifyEmailMethod,
    signIn,
    signInWithGoogle,
    signUp,
    verifyEmail,
    resendVerificationEmail,
    signOut,
    refreshUser,
  };
}
