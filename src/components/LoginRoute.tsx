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
  tryCompletePendingSignup,
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
  const [awaitingVerificationEmail, setAwaitingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    const pending = readPendingSignup();
    if (pending) {
      setAwaitingVerificationEmail(pending.email);
    }
  }, []);

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

      const signedIn = await tryCompletePendingSignup(signIn);
      if (signedIn) {
        setAwaitingVerificationEmail(null);
        return;
      }

      const pending = readPendingSignup();
      if (pending) {
        setAwaitingVerificationEmail(pending.email);
        setStatusMessage(
          "Your email is verified. Keep this page open — we'll sign you in automatically in a moment.",
        );
        return;
      }

      setVerificationError(
        "Your email is verified. Sign in with the email and password you used to create your account.",
      );
    }

    void completeVerificationSignIn();
  }, [loading, refreshUser, signIn]);

  useEffect(() => {
    if (loading || user || !awaitingVerificationEmail) return;

    let cancelled = false;
    setStatusMessage(
      "Waiting for email verification… We'll sign you in automatically on this device.",
    );

    const attemptSignIn = async () => {
      if (cancelled || user) return;
      const signedIn = await tryCompletePendingSignup(signIn);
      if (signedIn) {
        setAwaitingVerificationEmail(null);
        setStatusMessage("Email verified. Opening your workspace…");
      }
    };

    void attemptSignIn();
    const interval = window.setInterval(() => {
      void attemptSignIn();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [loading, user, awaitingVerificationEmail, signIn]);

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
        setAwaitingVerificationEmail(email);
        return result;
      }
      setAwaitingVerificationEmail(null);
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

  const handleDismissVerification = useCallback(() => {
    clearPendingSignup();
    setAwaitingVerificationEmail(null);
    setStatusMessage(undefined);
    setVerificationError(null);
  }, []);

  return (
    <LoginPage
      onSignIn={signIn}
      onSignUp={handleSignUp}
      onVerifyEmail={verifyEmail}
      onResendVerification={resendVerificationEmail}
      onSuccess={handleAuthSuccess}
      onContinueAsGuest={handleContinueAsGuest}
      onDismissVerification={handleDismissVerification}
      verifyEmailMethod={verifyEmailMethod}
      initialVerificationEmail={awaitingVerificationEmail ?? undefined}
      initialVerificationStep={awaitingVerificationEmail ? "verify-link" : undefined}
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
