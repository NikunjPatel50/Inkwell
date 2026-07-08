"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../hooks/useAuth";
import {
  clearEmailVerificationCallbackParams,
  parseEmailVerificationCallback,
} from "../lib/authRedirect";
import {
  clearPendingSignup,
  readPendingSignup,
  savePendingSignup,
} from "../lib/pendingAuth";
import { clearLoginSession, enableGuestSession } from "../lib/sessionBridge";

export function LoginRoute() {
  const router = useRouter();
  const {
    user,
    loading,
    verifyEmailMethod,
    signIn,
    signUp,
    verifyEmail,
    resendVerificationEmail,
    refreshUser,
  } = useAuth();
  const redirectingRef = useRef(false);
  const verificationHandledRef = useRef(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (loading || verificationHandledRef.current) return;

    const callback = parseEmailVerificationCallback(window.location.search);
    if (!callback) return;

    verificationHandledRef.current = true;
    clearEmailVerificationCallbackParams();

    if (callback.status === "error") {
      setVerificationError(
        callback.error ?? "Email verification failed. Request a new link and try again.",
      );
      return;
    }

    async function completeVerificationSignIn() {
      setStatusMessage("Email verified. Signing you in…");

      const currentUser = await refreshUser();
      if (currentUser) {
        return;
      }

      const pending = readPendingSignup();
      if (pending) {
        try {
          await signIn(pending.email, pending.password);
          clearPendingSignup();
          return;
        } catch {
          setVerificationError(
            "Your email is verified. Sign in with the email and password you used to create your account.",
          );
          clearPendingSignup();
          return;
        }
      }

      setVerificationError(
        "Your email is verified. Sign in with the email and password you used to create your account.",
      );
    }

    void completeVerificationSignIn();
  }, [loading, refreshUser, signIn]);

  useEffect(() => {
    if (!user || redirectingRef.current) return;
    redirectingRef.current = true;
    clearPendingSignup();
    router.replace("/");
  }, [user, router]);

  const handleAuthSuccess = useCallback(() => {
    // Redirect is handled once user state updates in the effect above.
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await signUp(email, password, name);
      if (result.verificationRequired) {
        savePendingSignup(email, password);
        return result;
      }
      clearPendingSignup();
      return result;
    },
    [signUp],
  );

  const handleContinueAsGuest = useCallback(() => {
    clearLoginSession();
    enableGuestSession();
    router.replace("/");
  }, [router]);

  return (
    <LoginPage
      onSignIn={signIn}
      onSignUp={handleSignUp}
      onVerifyEmail={verifyEmail}
      onResendVerification={resendVerificationEmail}
      onSuccess={handleAuthSuccess}
      onContinueAsGuest={handleContinueAsGuest}
      verifyEmailMethod={verifyEmailMethod}
      redirecting={Boolean(user)}
      statusMessage={
        user
          ? "Signing you in…"
          : statusMessage
      }
      verificationError={verificationError}
    />
  );
}
