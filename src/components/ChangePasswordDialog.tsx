"use client";

import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import {
  completePasswordChange,
  sendPasswordChangeCode,
  verifyCurrentPassword,
} from "../lib/changePassword";
import { PASSWORD_RULES, validatePassword } from "../lib/passwordPolicy";
import styles from "./ChangePasswordDialog.module.css";

interface ChangePasswordDialogProps {
  email: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "form" | "verify" | "success";

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

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.passwordField}>
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${styles.input} ${styles.passwordInput}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          disabled={disabled}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordDialog({
  email,
  open,
  onClose,
  onSuccess,
}: ChangePasswordDialogProps) {
  const titleId = useId();
  const [step, setStep] = useState<Step>("form");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = useCallback(() => {
    setStep("form");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetState();
    onClose();
  }, [isSubmitting, onClose, resetState]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyCurrentPassword(email, currentPassword);
      await sendPasswordChangeCode(email);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start password change.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError("Enter the verification code from your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      await completePasswordChange(email, verificationCode, newPassword);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await sendPasswordChangeCode(email);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              Change password
            </h2>
            <p className={styles.subtitle}>
              {step === "form" && "Enter your current password and choose a new one."}
              {step === "verify" && `Enter the 6-digit code sent to ${email}.`}
              {step === "success" && "Your password has been updated."}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {step === "form" && (
          <form className={styles.form} onSubmit={handleFormSubmit} noValidate>
            <PasswordField
              id="change-current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((value) => !value)}
              autoComplete="current-password"
              placeholder="Enter current password"
              disabled={isSubmitting}
            />

            <PasswordField
              id="change-new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword((value) => !value)}
              autoComplete="new-password"
              placeholder="Create a strong password"
              disabled={isSubmitting}
            />

            <ul className={styles.passwordRules} aria-live="polite">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(newPassword);
                return (
                  <li key={rule.id} className={met ? styles.passwordRuleMet : styles.passwordRuleUnmet}>
                    <span className={styles.passwordRuleMarker} aria-hidden="true">
                      {met ? "✓" : "○"}
                    </span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>

            <PasswordField
              id="change-confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              autoComplete="new-password"
              placeholder="Re-enter new password"
              disabled={isSubmitting}
            />

            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? "Please wait…" : "Continue"}
              </button>
            </div>
          </form>
        )}

        {step === "verify" && (
          <form className={styles.form} onSubmit={handleVerifySubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="change-verification-code">
                Verification code
              </label>
              <input
                id="change-verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className={styles.input}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="6-digit code"
                minLength={6}
                maxLength={6}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleResendCode}
                disabled={isSubmitting}
              >
                Resend code
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className={styles.form}>
            <div className={styles.successBanner} role="status">
              Password updated successfully. Sign in again with your new password.
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  handleClose();
                  onSuccess();
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
