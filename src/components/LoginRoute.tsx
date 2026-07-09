"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../hooks/useAuth";
import {
  clearPendingVerification,
  readPendingVerification,
  savePendingVerification,
} from "../lib/pendingAuth";
import { clearLoginSession, enableGuestSession } from "../lib/sessionBridge";

export function LoginRoute() {
  const router = useRouter();
  const {
    user,
    signIn,
    signUp,
    verifyEmail,
    resendVerificationEmail,
  } = useAuth();
  const redirectingRef = useRef(false);
  const [awaitingVerificationEmail, setAwaitingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    const pendingEmail = readPendingVerification();
    if (pendingEmail) {
      setAwaitingVerificationEmail(pendingEmail);
    }
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.documentElement.classList.add("login-route-active");
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.classList.remove("login-route-active");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!user || redirectingRef.current) return;
    redirectingRef.current = true;
    clearPendingVerification();
    router.replace("/");
  }, [user, router]);

  const handleAuthSuccess = useCallback(() => {
    // Redirect is handled once user state updates in the effect above.
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await signUp(email, password, name);
      if (result.verificationRequired) {
        savePendingVerification(email);
        setAwaitingVerificationEmail(email);
        return result;
      }
      setAwaitingVerificationEmail(null);
      clearPendingVerification();
      return result;
    },
    [signUp],
  );

  const handleVerifyEmail = useCallback(
    async (email: string, otp: string) => {
      await verifyEmail(email, otp);
      clearPendingVerification();
      setAwaitingVerificationEmail(null);
    },
    [verifyEmail],
  );

  const handleContinueAsGuest = useCallback(() => {
    clearLoginSession();
    enableGuestSession();
    router.replace("/");
  }, [router]);

  const handleDismissVerification = useCallback(() => {
    clearPendingVerification();
    setAwaitingVerificationEmail(null);
  }, []);

  return (
    <LoginPage
      onSignIn={signIn}
      onSignUp={handleSignUp}
      onVerifyEmail={handleVerifyEmail}
      onResendVerification={resendVerificationEmail}
      onSuccess={handleAuthSuccess}
      onContinueAsGuest={handleContinueAsGuest}
      onDismissVerification={handleDismissVerification}
      initialVerificationEmail={awaitingVerificationEmail ?? undefined}
      initialVerificationStep={awaitingVerificationEmail ? "verify-code" : undefined}
      redirecting={Boolean(user)}
      statusMessage={user ? "Signing you in…" : undefined}
    />
  );
}
