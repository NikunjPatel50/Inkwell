import { type FormEvent, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import type { SignUpResult, VerifyEmailMethod } from "../hooks/useAuth";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
  validatePassword,
} from "../lib/passwordPolicy";
import { AppBrand } from "./AppBrand";
import { ThemeToggle } from "./ThemeToggle";

export type AuthMode = "signin" | "signup";
type VerificationStep = "form" | "verify-link" | "verify-code";

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name?: string) => Promise<SignUpResult>;
  onVerifyEmail: (email: string, otp: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
  onSuccess: () => void;
  onContinueAsGuest: () => void;
  verifyEmailMethod: VerifyEmailMethod;
  initialMode?: AuthMode;
  redirecting?: boolean;
  statusMessage?: string;
  verificationError?: string | null;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="loginPage-passwordToggleIcon">
        <path
          d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="loginPage-passwordToggleIcon">
      <path
        d="M2.5 10s2.8-5 7.5-5c1.5 0 2.8.45 3.85 1.15M17.5 10s-2.8 5-7.5 5c-1.45 0-2.75-.4-3.85-1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="m3.5 3.5 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LoginPage({
  onSignIn,
  onSignUp,
  onVerifyEmail,
  onResendVerification,
  onSuccess,
  onContinueAsGuest,
  verifyEmailMethod,
  initialMode = "signin",
  redirecting = false,
  statusMessage,
  verificationError,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [verificationStep, setVerificationStep] = useState<VerificationStep>("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const switchMode = (nextMode: AuthMode) => {
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
          setVerificationStep(
            (result.verifyEmailMethod ?? verifyEmailMethod) === "code"
              ? "verify-code"
              : "verify-link",
          );
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

    if (!verificationCode.trim()) {
      setError("Enter the 6-digit verification code from your email.");
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
  const displayError = error ?? verificationError ?? null;
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

      <main className="loginPage-center">
        <div className="loginPage-shell">
          <div className="loginPage-formCard">
            <div className="loginPage-brandBlock">
              <AppBrand size="header" href={false} />
            </div>

            <header className="loginPage-formIntro">
              <h1 className="loginPage-formTitle">
                {showingVerification
                  ? "Verify your email"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </h1>
              <p className="loginPage-formSubtitle">
                {showingVerification
                  ? verificationStep === "verify-link"
                    ? `We sent a verification link to ${pendingEmail}. Open the email and click the link to finish creating your account.`
                    : `Enter the 6-digit code sent to ${pendingEmail}.`
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

            {verificationStep === "verify-link" ? (
              <div className="loginPage-verificationPanel">
                <p className="loginPage-verificationHint">
                  After you click the link, this page will sign you in automatically and open your workspace.
                </p>
                {displayError && (
                  <div className="loginPage-errorBanner" role="alert">
                    {displayError}
                  </div>
                )}
                <button
                  type="button"
                  className="loginPage-secondaryButton"
                  onClick={() => void handleResendVerification()}
                  disabled={busy}
                >
                  Resend verification email
                </button>
                <button
                  type="button"
                  className="loginPage-textButton"
                  onClick={() => switchMode("signin")}
                  disabled={busy}
                >
                  Back to sign in
                </button>
              </div>
            ) : verificationStep === "verify-code" ? (
              <form className="loginPage-form" onSubmit={handleVerifyCode} noValidate>
                <div className="loginPage-field">
                  <label className="loginPage-label" htmlFor="auth-verification-code">
                    Verification code
                  </label>
                  <input
                    id="auth-verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="loginPage-input"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
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
                  Resend verification email
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
                    <ul id="auth-password-rules" className="loginPage-passwordRules" aria-live="polite">
                      {PASSWORD_RULES.map((rule) => {
                        const met = rule.test(password);
                        return (
                          <li
                            key={rule.id}
                            className={met ? "loginPage-passwordRuleMet" : "loginPage-passwordRuleUnmet"}
                          >
                            <span className="loginPage-passwordRuleMarker" aria-hidden="true">
                              {met ? "✓" : "○"}
                            </span>
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
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
      </main>
    </div>
  );
}
