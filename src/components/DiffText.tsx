import { useMemo } from "react";
import { wordDiff } from "../lib/wordDiff";
import styles from "./DiffText.module.css";

interface DiffTextProps {
  original: string;
  rewritten: string;
  tier: "simple" | "intermediate" | "advanced";
}

export function DiffText({ original, rewritten, tier }: DiffTextProps) {
  const segments = useMemo(() => wordDiff(original, rewritten), [original, rewritten]);

  return (
    <span className={styles.diffText}>
      {segments.map((segment, index) =>
        segment.type === "changed" ? (
          <mark key={`${segment.type}-${index}`} className={`${styles.changed} ${styles[tier]}`}>
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.type}-${index}`} className={styles.unchanged}>
            {segment.text}
          </span>
        ),
      )}
    </span>
  );
}
