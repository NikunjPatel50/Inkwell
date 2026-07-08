import { type FormEvent, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
  validatePassword,
} from "../lib/passwordPolicy";
import { AppBrand } from "./AppBrand";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./LoginPage.module.css";

export type AuthMode = "signin" | "signup";

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name?: string) => Promise<void>;
  onSuccess: () => void;
  onContinueAsGuest: () => void;
  initialMode?: AuthMode;
  redirecting?: boolean;
  statusMessage?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.passwordToggleIcon}>
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
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.passwordToggleIcon}>
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
  onSuccess,
  onContinueAsGuest,
  initialMode = "signin",
  redirecting = false,
  statusMessage,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
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
      } else {
        await onSignUp(email.trim(), password, name.trim() || undefined);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || redirecting;

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropMesh} />
        <div className={styles.backdropGrid} />
        <div className={styles.backdropOrbTop} />
        <div className={styles.backdropOrbBottom} />
      </div>

      <div className={styles.themeToggleWrap}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} variant="toolbar" />
      </div>

      <main className={styles.center}>
        <div className={styles.loginShell}>
          <div className={styles.brandBlock}>
            <AppBrand size="header" href={false} />
          </div>

          <div className={styles.formCard}>
            <header className={styles.formIntro}>
              <h1 className={styles.formTitle}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className={styles.formSubtitle}>
                {mode === "signin"
                  ? "Access your practice history, skill patterns, and saved progress."
                  : "Start building foundational writing skills with a personal workspace."}
              </p>
            </header>

            {statusMessage && (
              <div className={styles.statusBanner} role="status" aria-live="polite">
                {statusMessage}
              </div>
            )}

            <div className={styles.modeSwitch} role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                className={`${styles.modeButton} ${mode === "signin" ? styles.modeActive : ""}`}
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={`${styles.modeButton} ${mode === "signup" ? styles.modeActive : ""}`}
                onClick={() => switchMode("signup")}
              >
                Create account
              </button>
            </div>

            <form key={mode} className={styles.form} onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="auth-name">
                    Full name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    disabled={busy}
                  />
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="auth-email">
                  Work email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  disabled={busy}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="auth-password">
                  Password
                </label>
                <div className={styles.passwordField}>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.passwordInput}`}
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
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={busy}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {mode === "signup" && (
                  <ul id="auth-password-rules" className={styles.passwordRules} aria-live="polite">
                    {PASSWORD_RULES.map((rule) => {
                      const met = rule.test(password);
                      return (
                        <li
                          key={rule.id}
                          className={met ? styles.passwordRuleMet : styles.passwordRuleUnmet}
                        >
                          <span className={styles.passwordRuleMarker} aria-hidden="true">
                            {met ? "✓" : "○"}
                          </span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {error && (
                <div className={styles.errorBanner} role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className={styles.submit} disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <p className={styles.trustNote}>
              Your writing data is stored securely and tied to your account only.
            </p>
          </div>

          <button type="button" className={styles.guestLink} onClick={onContinueAsGuest}>
            Continue without signing in
          </button>
        </div>
      </main>
    </div>
  );
}
