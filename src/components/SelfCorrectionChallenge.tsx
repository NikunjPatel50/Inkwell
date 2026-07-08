import type { CorrectionResult, Verdict, WritingError } from "../types";
import styles from "./SelfCorrectionChallenge.module.css";

interface SelfCorrectionChallengeProps {
  knownErrors: WritingError[];
  attempt: string;
  isChecking: boolean;
  checkError: string | null;
  result: CorrectionResult | null;
  collapsed: boolean;
  onAttemptChange: (attempt: string) => void;
  onCheck: () => void;
  onSkip: () => void;
  onToggleCollapse: () => void;
}

function countFixed(result: CorrectionResult): { fixed: number; total: number } {
  const total = result.corrected.length;
  const fixed = result.corrected.filter((item) => item.verdict === "fixed").length;
  return { fixed, total };
}

function verdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case "fixed":
      return "Fixed";
    case "partial":
      return "Partial";
    case "missed":
      return "Missed";
  }
}

export function SelfCorrectionChallenge({
  knownErrors,
  attempt,
  isChecking,
  checkError,
  result,
  collapsed,
  onAttemptChange,
  onCheck,
  onSkip,
  onToggleCollapse,
}: SelfCorrectionChallengeProps) {
  if (knownErrors.length === 0) {
    return null;
  }

  const canCheck = attempt.trim().length > 0 && !isChecking;
  const isCompleted = result !== null;

  if (isCompleted && collapsed) {
    const { fixed, total } = countFixed(result);
    const allFixed = fixed === total;

    return (
      <section className={styles.collapsed} aria-label="Self-correction summary">
        <p className={styles.collapsedText}>
          Self-correction: {fixed}/{total} fixed{allFixed ? " ✓" : ""}
        </p>
        <button type="button" className={styles.reviewLink} onClick={onToggleCollapse}>
          Review
        </button>
      </section>
    );
  }

  return (
    <section
      className={`${styles.card} ${isCompleted ? styles.cardCompleted : ""}`}
      aria-labelledby="self-correction-heading"
    >
      <header className={styles.header}>
        <h2 id="self-correction-heading" className={styles.title}>
          Try fixing it yourself first
        </h2>
        {!isCompleted && (
          <p className={styles.description}>
            Correct the errors below before seeing the full feedback. You&apos;ll remember it
            better.
          </p>
        )}
      </header>

      {!isCompleted && (
        <>
          <textarea
            id="self-correction-attempt"
            className={styles.textarea}
            value={attempt}
            onChange={(e) => onAttemptChange(e.target.value)}
            disabled={isChecking}
            aria-label="Your corrected text"
            rows={4}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.checkButton}
              onClick={onCheck}
              disabled={!canCheck}
            >
              {isChecking ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Checking…
                </>
              ) : (
                "Check my correction"
              )}
            </button>
            <button type="button" className={styles.skipLink} onClick={onSkip} disabled={isChecking}>
              Skip — show me the feedback
            </button>
          </div>

          {checkError && (
            <p className={styles.checkError} role="alert">
              {checkError}
            </p>
          )}
        </>
      )}

      {isCompleted && result && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <div className={styles.scoreBlock}>
              <span className={styles.scoreLabel}>
                {countFixed(result).fixed}/{countFixed(result).total} errors addressed
              </span>
              <div
                className={styles.scoreBar}
                role="progressbar"
                aria-valuenow={result.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Correction score: ${result.score} out of 100`}
              >
                <span
                  className={styles.scoreBarFill}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
            {isCompleted && (
              <button type="button" className={styles.collapseLink} onClick={onToggleCollapse}>
                Collapse
              </button>
            )}
          </div>

          <ul className={styles.verdictList}>
            {result.corrected.map((item, index) => (
              <li key={`${item.issue}-${index}`} className={styles.verdictRow}>
                <div className={styles.verdictMain}>
                  <span className={styles.verdictIssue}>{item.issue}</span>
                  <span className={`${styles.verdictTag} ${styles[`verdict_${item.verdict}`]}`}>
                    {verdictLabel(item.verdict)}
                  </span>
                </div>
                {(item.verdict === "partial" || item.verdict === "missed") && item.hint && (
                  <p className={styles.verdictHint}>{item.hint}</p>
                )}
              </li>
            ))}
          </ul>

          <p className={styles.encouragement}>{result.encouragement}</p>
        </div>
      )}

      {!isCompleted && (
        <span className={styles.srOnly} aria-live="polite">
          {knownErrors.length} {knownErrors.length === 1 ? "error" : "errors"} to fix
        </span>
      )}
    </section>
  );
}
