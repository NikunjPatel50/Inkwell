"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AuthUser } from "../hooks/useAuth";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import styles from "./UserMenu.module.css";

interface UserMenuProps {
  user: AuthUser;
  onSignOut: () => void;
  onPasswordChanged?: () => void;
  variant?: "default" | "toolbar";
}

function getInitials(name: string | undefined, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }

  const local = email.split("@")[0] ?? email;
  return local.slice(0, 2).toUpperCase();
}

function getDisplayName(user: AuthUser): string {
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed;
  const local = user.email.split("@")[0] ?? user.email;
  return local.replace(/[._-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function KeyIcon() {
  return (
    <svg
      className={styles.signOutIcon}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 10h6.5M14.25 8.25 16.5 10l-2.25 1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg
      className={styles.signOutIcon}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.5 17.5h-2a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.5 13.5 15 10l-3.5-3.5M15 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserMenu({
  user,
  onSignOut,
  onPasswordChanged,
  variant = "default",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const displayName = getDisplayName(user);
  const initials = getInitials(user.name, user.email);
  const subtitle = user.name?.trim() ? user.email : "Active session";

  const close = useCallback(() => setOpen(false), []);

  const handleSignOut = useCallback(() => {
    close();
    void onSignOut();
  }, [close, onSignOut]);

  const handleOpenChangePassword = useCallback(() => {
    close();
    setChangePasswordOpen(true);
  }, [close]);

  const handlePasswordChanged = useCallback(() => {
    setChangePasswordOpen(false);
    onPasswordChanged?.();
  }, [onPasswordChanged]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${variant === "toolbar" ? styles.triggerToolbar : ""} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`Account menu for ${displayName}`}
        title={displayName}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initials}
          <span className={styles.statusDot} title="Signed in" />
        </span>
      </button>

      {open && (
        <div id={menuId} className={styles.dropdown} role="menu" aria-label="Account">
          <div className={styles.profile} role="presentation">
            <span className={styles.avatarLarge} aria-hidden="true">
              {initials}
              <span className={styles.statusDot} title="Signed in" />
            </span>
            <div className={styles.identity}>
              <span className={styles.name}>{displayName}</span>
              <span className={styles.subtitle} title={user.email}>
                {subtitle}
              </span>
            </div>
          </div>

          <div className={styles.divider} aria-hidden="true" />

          <button
            type="button"
            className={styles.menuAction}
            role="menuitem"
            onClick={handleOpenChangePassword}
          >
            <KeyIcon />
            <span className={styles.signOutLabel}>Change password</span>
          </button>

          <button
            type="button"
            className={styles.signOut}
            role="menuitem"
            onClick={handleSignOut}
          >
            <SignOutIcon />
            <span className={styles.signOutLabel}>Sign out</span>
          </button>
        </div>
      )}

      <ChangePasswordDialog
        email={user.email}
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSuccess={handlePasswordChanged}
      />
    </div>
  );
}

export function SignInButton({
  onClick,
  variant = "default",
}: {
  onClick: () => void;
  variant?: "default" | "toolbar";
}) {
  return (
    <button
      type="button"
      className={`${styles.signIn} ${variant === "toolbar" ? styles.signInToolbar : ""}`}
      onClick={onClick}
    >
      Sign in
    </button>
  );
}
