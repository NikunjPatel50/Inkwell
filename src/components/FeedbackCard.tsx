import { useEffect, useRef } from "react";
import type { WritingError } from "../types";
import styles from "./FeedbackCard.module.css";

interface FeedbackCardProps {
  errors: WritingError[];
  activeErrorIndex: number | null;
  onErrorHover: (errorIndex: number | null) => void;
}

export function FeedbackCard({ errors, activeErrorIndex, onErrorHover }: FeedbackCardProps) {
  const hasErrors = errors.length > 0;
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (activeErrorIndex === null) return;

    const item = itemRefs.current[activeErrorIndex];
    if (item) {
      item.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeErrorIndex]);

  return (
    <section
      className={`${styles.card} ${hasErrors ? styles.cardIssues : styles.cardClean}`}
      aria-labelledby="feedback-heading"
    >
      <h2 id="feedback-heading" className={styles.title}>
        Grammar &amp; wording
      </h2>

      {hasErrors ? (
        <ul className={styles.list}>
          {errors.map((error, index) => {
            const isActive = activeErrorIndex === index;

            return (
              <li
                key={`${error.issue}-${index}`}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                id={`feedback-error-${index}`}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                onMouseEnter={() => onErrorHover(index)}
                onMouseLeave={() => onErrorHover(null)}
              >
                <span className={styles.issue}>
                  <span className={styles.issueBadge} aria-hidden="true">
                    {index + 1}
                  </span>
                  {error.issue}
                </span>
                <span className={styles.explanation}>{error.explanation}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.cleanState}>
          <span className={styles.cleanIcon} aria-hidden="true">
            ✓
          </span>
          <p className={styles.cleanText}>No issues found — your text looks clean.</p>
        </div>
      )}
    </section>
  );
}
