"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "./BetaProNotice.module.css";

interface BetaProNoticeButtonProps {
  className?: string;
  label?: string;
}

export function BetaProNoticeButton({
  className,
  label = "Upgrade to Pro",
}: BetaProNoticeButtonProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>

      {open ? (
        <div className={styles.overlay} role="presentation" onClick={close}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="beta-pro-notice-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className={styles.eyebrow}>Beta access</p>
            <h3 id="beta-pro-notice-title" className={styles.title}>
              No payment needed right now
            </h3>
            <p className={styles.body}>
              Wrytesmart is in beta — you don&apos;t have to pay for Pro yet. Sign in and use all
              features for free while we&apos;re testing, including full essay scoring, unlimited
              analysis, and progress tracking.
            </p>
            <div className={styles.actions}>
              <Link href="/login" className={styles.primaryAction} onClick={close}>
                Get started free
              </Link>
              <button type="button" className={styles.secondaryAction} onClick={close}>
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
