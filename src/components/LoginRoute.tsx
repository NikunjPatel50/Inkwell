"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../hooks/useAuth";
import { clearPendingVerification, readPendingVerification, savePendingVerification } from "../lib/pendingAuth";

export function LoginRoute() {
  const router = useRouter();
  const {
    user,
    signIn,
    signInWithGoogle,
    signUp,
    verifyEmail,
    resendVerificationEmail,
  } = useAuth();
  const redirectingRef = useRef(false);
  const [awaitingVerificationEmail, setAwaitingVerificationEmail] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    const pendingEmail = readPendingVerification();
    if (pendingEmail) {
      setAwaitingVerificationEmail(pendingEmail);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;

    setOauthError(decodeURIComponent(error));
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
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
    router.replace("/app");
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

  const handleDismissVerification = useCallback(() => {
    clearPendingVerification();
    setAwaitingVerificationEmail(null);
  }, []);

  return (
    <LoginPage
      onSignIn={signIn}
      onSignInWithGoogle={signInWithGoogle}
      onSignUp={handleSignUp}
      onVerifyEmail={handleVerifyEmail}
      onResendVerification={resendVerificationEmail}
      onSuccess={handleAuthSuccess}
      onDismissVerification={handleDismissVerification}
      initialVerificationEmail={awaitingVerificationEmail ?? undefined}
      initialVerificationStep={awaitingVerificationEmail ? "verify-code" : undefined}
      redirecting={Boolean(user)}
      oauthError={oauthError}
      statusMessage={user ? "Signing you in…" : undefined}
    />
  );
}
