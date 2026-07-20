"use client";

import { useEffect, useState } from "react";
import { WordDetailView } from "./WordDetail";
import styles from "./WordDetailExpandCard.module.css";

interface WordDetailExpandCardProps {
  word: string;
  open: boolean;
  onClose: () => void;
}

export function WordDetailExpandCard({ word, open, onClose }: WordDetailExpandCardProps) {
  const [animatedOpen, setAnimatedOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setAnimatedOpen(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => setAnimatedOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open, word]);

  return (
    <div
      className={`${styles.shell} ${animatedOpen ? styles.shellOpen : styles.shellClosing}`}
    >
      <article className={styles.panel} aria-live="polite">
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderText}>
            <h2 className={styles.panelWord}>{word}</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={`Close details for ${word}`}
          >
            ×
          </button>
        </header>
        <div className={styles.panelBody}>
          <WordDetailView word={word} variant="panel" />
        </div>
      </article>
    </div>
  );
}
