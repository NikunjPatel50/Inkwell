import { type FormEvent, useEffect, useState } from "react";
import "../app/login/login.css";
import { useTheme } from "../hooks/useTheme";
import type { SignUpResult } from "../hooks/useAuth";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
  validatePassword,
} from "../lib/passwordPolicy";
import { AppBrand } from "./AppBrand";
import { ThemeToggle } from "./ThemeToggle";

export type AuthMode = "signin" | "signup";
type VerificationStep = "form" | "verify-code";

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name?: string) => Promise<SignUpResult>;
  onVerifyEmail: (email: string, otp: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
  onSuccess: () => void;
  onContinueAsGuest: () => void;
  onDismissVerification?: () => void;
  initialMode?: AuthMode;
  initialVerificationEmail?: string;
  initialVerificationStep?: VerificationStep;
  redirecting?: boolean;
  statusMessage?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="loginPage-passwordToggleIcon">
      <path
        d="M2.25 12s4-6.75 9.75-6.75S21.75 12 21.75 12s-4 6.75-9.75 6.75S2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.85" stroke="currentColor" strokeWidth="1.75" />
      {!open && (
        <path
          d="M5.5 5.5 18.5 18.5"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function PasswordRuleIcon({ met }: { met: boolean }) {
  if (met) {
    return (
      <span className="loginPage-passwordRuleIcon loginPage-passwordRuleIconMet" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="8" fill="currentColor" />
          <path
            d="M5 8.25 6.75 10 11 6"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="loginPage-passwordRuleIcon loginPage-passwordRuleIconUnmet" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.35" />
      </svg>
    </span>
  );
}

export function LoginPage({
  onSignIn,
  onSignUp,
  onVerifyEmail,
  onResendVerification,
  onSuccess,
  onContinueAsGuest,
  onDismissVerification,
  initialMode = "signin",
  initialVerificationEmail,
  initialVerificationStep,
  redirecting = false,
  statusMessage,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [verificationStep, setVerificationStep] = useState<VerificationStep>(
    initialVerificationStep ?? "form",
  );
  const [pendingEmail, setPendingEmail] = useState(initialVerificationEmail ?? "");
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (initialVerificationEmail) {
      setPendingEmail(initialVerificationEmail);
    }
    if (initialVerificationStep) {
      setVerificationStep(initialVerificationStep);
    }
  }, [initialVerificationEmail, initialVerificationStep]);

  const switchMode = (nextMode: AuthMode) => {
    if (verificationStep !== "form") {
      onDismissVerification?.();
    }
    setMode(nextMode);
    setVerificationStep("form");
    setPendingEmail("");
    setVerificationCode("");
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
    setShowPassword(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "signup") {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await onSignIn(email.trim(), password);
        onSuccess();
      } else {
        const result = await onSignUp(email.trim(), password, name.trim() || undefined);
        if (result.verificationRequired) {
          setPendingEmail(result.email);
          setVerificationStep("verify-code");
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setError("Enter the 6-digit passcode from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerifyEmail(pendingEmail, verificationCode.trim());
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onResendVerification(pendingEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || redirecting;
  const displayError = error;
  const showingVerification = verificationStep !== "form";

  return (
    <div className="loginPage">
      <div className="loginPage-backdrop" aria-hidden="true">
        <div className="loginPage-backdropMesh" />
        <div className="loginPage-backdropGrid" />
        <div className="loginPage-backdropOrbTop" />
        <div className="loginPage-backdropOrbBottom" />
      </div>

      <div className="loginPage-themeToggleWrap">
        <ThemeToggle theme={theme} onToggle={toggleTheme} variant="toolbar" />
      </div>

      <main className="loginPage-layout">
        <div className="loginPage-authColumn">
          <div className="loginPage-shell">
            <div className="loginPage-formCard">
            <div className="loginPage-brandBlock">
              <AppBrand size="header" href={false} className="loginPage-brandLogo" />
            </div>

            <header className="loginPage-formIntro">
              <h1 className="loginPage-formTitle">
                {showingVerification
                  ? "Enter your passcode"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </h1>
              <p className="loginPage-formSubtitle">
                {showingVerification
                  ? `We sent a 6-digit passcode to ${pendingEmail}. Enter it below to finish creating your account.`
                  : mode === "signin"
                    ? "Access your practice history, skill patterns, and saved progress."
                    : "Start building foundational writing skills with a personal workspace."}
              </p>
            </header>

            {statusMessage && (
              <div className="loginPage-statusBanner" role="status" aria-live="polite">
                {statusMessage}
              </div>
            )}

            {!showingVerification && (
              <div className="loginPage-modeSwitch" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signin"}
                  className={`loginPage-modeButton ${mode === "signin" ? "loginPage-modeActive" : ""}`}
                  onClick={() => switchMode("signin")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup"}
                  className={`loginPage-modeButton ${mode === "signup" ? "loginPage-modeActive" : ""}`}
                  onClick={() => switchMode("signup")}
                >
                  Create account
                </button>
              </div>
            )}

            {verificationStep === "verify-code" ? (
              <form className="loginPage-form" onSubmit={handleVerifyCode} noValidate>
                <div className="loginPage-field">
                  <label className="loginPage-label" htmlFor="auth-verification-code">
                    6-digit passcode
                  </label>
                  <input
                    id="auth-verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="loginPage-input loginPage-passcodeInput"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    pattern="\d{6}"
                    disabled={busy}
                  />
                </div>
                {displayError && (
                  <div className="loginPage-errorBanner" role="alert">
                    {displayError}
                  </div>
                )}
                <button type="submit" className="loginPage-submit" disabled={busy}>
                  {busy ? "Please wait…" : "Verify and continue"}
                </button>
                <button
                  type="button"
                  className="loginPage-secondaryButton"
                  onClick={() => void handleResendVerification()}
                  disabled={busy}
                >
                  Resend passcode
                </button>
                <button
                  type="button"
                  className="loginPage-textButton"
                  onClick={() => switchMode("signin")}
                  disabled={busy}
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <form key={mode} className="loginPage-form" onSubmit={handleSubmit} noValidate>
                {mode === "signup" && (
                  <div className="loginPage-field">
                    <label className="loginPage-label" htmlFor="auth-name">
                      Full name
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      className="loginPage-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Alex Morgan"
                      disabled={busy}
                    />
                  </div>
                )}

                <div className="loginPage-field">
                  <label className="loginPage-label" htmlFor="auth-email">
                    Work email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    className="loginPage-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    disabled={busy}
                  />
                </div>

                <div className="loginPage-field">
                  <label className="loginPage-label" htmlFor="auth-password">
                    Password
                  </label>
                  <div className="loginPage-passwordField">
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      className="loginPage-input loginPage-passwordInput"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={mode === "signup" ? PASSWORD_MIN_LENGTH : 1}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      placeholder={
                        mode === "signin"
                          ? "Enter your password"
                          : "Create a strong password"
                      }
                      disabled={busy}
                      aria-describedby={mode === "signup" ? "auth-password-rules" : undefined}
                    />
                    <button
                      type="button"
                      className="loginPage-passwordToggle"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      disabled={busy}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>

                  {mode === "signup" && (
                    <div className="loginPage-passwordRulesPanel">
                      <p className="loginPage-passwordRulesTitle" id="auth-password-rules-label">
                        Password requirements
                      </p>
                      <ul
                        id="auth-password-rules"
                        className="loginPage-passwordRules"
                        aria-labelledby="auth-password-rules-label"
                        aria-live="polite"
                      >
                        {PASSWORD_RULES.map((rule) => {
                          const met = rule.test(password);
                          return (
                            <li
                              key={rule.id}
                              className={met ? "loginPage-passwordRuleMet" : "loginPage-passwordRuleUnmet"}
                            >
                              <PasswordRuleIcon met={met} />
                              <span className="loginPage-passwordRuleLabel">{rule.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {displayError && (
                  <div className="loginPage-errorBanner" role="alert">
                    {displayError}
                  </div>
                )}

                <button type="submit" className="loginPage-submit" disabled={busy}>
                  {busy
                    ? "Please wait…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>
            )}

            <p className="loginPage-trustNote">
              Your writing data is stored securely and tied to your account only.
            </p>
          </div>

          <button type="button" className="loginPage-guestLink" onClick={onContinueAsGuest}>
            Continue without signing in
          </button>
        </div>
        </div>
      </main>
    </div>
  );
}
