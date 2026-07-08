import { useId, useState } from "react";
import type { TeachingNote as TeachingNoteData } from "../types";
import styles from "./TeachingNote.module.css";

interface TeachingNoteProps {
  teaching: TeachingNoteData;
}

export function TeachingNote({ teaching }: TeachingNoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  const toggle = () => setIsOpen((open) => !open);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        Why does this matter? {isOpen ? "↑" : "→"}
      </button>

      <div
        id={panelId}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.panelInner}>
          <p className={styles.eyebrow}>The principle</p>
          <p className={styles.why}>{teaching.why}</p>
          <blockquote className={styles.principle}>{teaching.principle}</blockquote>
          <div className={styles.example}>
            <p className={styles.exampleLine}>
              <span className={styles.exampleLabel}>Before</span>
              <span className={styles.exampleText}>{teaching.example.before}</span>
            </p>
            <p className={styles.exampleLine}>
              <span className={styles.exampleLabel}>After</span>
              <span className={styles.exampleText}>{teaching.example.after}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
