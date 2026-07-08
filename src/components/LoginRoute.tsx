"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../hooks/useAuth";
import { clearLoginSession, enableGuestSession } from "../lib/sessionBridge";

export function LoginRoute() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const redirectingRef = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!user || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace("/");
  }, [user, router]);

  const handleAuthSuccess = useCallback(() => {
    // Redirect is handled once user state updates in the effect above.
  }, []);

  const handleContinueAsGuest = useCallback(() => {
    clearLoginSession();
    enableGuestSession();
    router.replace("/");
  }, [router]);

  return (
    <LoginPage
      onSignIn={signIn}
      onSignUp={signUp}
      onSuccess={handleAuthSuccess}
      onContinueAsGuest={handleContinueAsGuest}
      redirecting={Boolean(user)}
      statusMessage={user ? "Signing you in…" : undefined}
    />
  );
}
