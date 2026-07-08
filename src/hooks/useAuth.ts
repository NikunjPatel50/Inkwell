import { useCallback, useEffect, useState } from "react";
import { getLoginRedirectUrl } from "../lib/authRedirect";
import { insforge } from "../lib/insforge";

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

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyEmailMethod, setVerifyEmailMethod] = useState<VerifyEmailMethod>("link");

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) {
      setUser(null);
      return null;
    }

    const nextUser = {
      id: data.user.id,
      email: data.user.email ?? "",
      name: userDisplayName(data.user),
    };
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
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
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        name: userDisplayName(data.user),
      });
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

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
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        name: userDisplayName(data.user) ?? name,
      });
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
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        name: userDisplayName(data.user),
      });
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
    setUser(null);
  }, []);

  return {
    user,
    loading,
    verifyEmailMethod,
    signIn,
    signUp,
    verifyEmail,
    resendVerificationEmail,
    signOut,
    refreshUser,
  };
}
