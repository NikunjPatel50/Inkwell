"use client";

import type { PTEEssaySession } from "../../types/writingMode";
import { PTEEssayScorePanel } from "../PTEEssayScorePanel";
import styles from "./PTESessionDetail.module.css";

interface PTESessionDetailProps {
  session: PTEEssaySession;
  onClose: () => void;
}

export function PTESessionDetail({ session, onClose }: PTESessionDetailProps) {
  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pte-session-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h3 id="pte-session-detail-title" className={styles.title}>
              Session breakdown
            </h3>
            <p className={styles.meta}>
              {new Date(session.createdAt).toLocaleString()} · {session.score.totalScore}/
              {session.score.maxTotalScore}
            </p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <p className={styles.prompt}>{session.prompt}</p>
        <PTEEssayScorePanel result={session.score} />
      </div>
    </div>
  );
}
