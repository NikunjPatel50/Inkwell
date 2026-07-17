import type { ReactNode } from "react";
import type { PTEEssayScoreResult } from "../types/writingMode";
import { traitScoreBand } from "../lib/pteEssayScoring";
import styles from "./PTEEssayScorePanel.module.css";

interface PTEEssayScorePanelProps {
  result: PTEEssayScoreResult;
  footer?: ReactNode;
}

function bandClass(score: number, maxScore: number): string {
  const band = traitScoreBand(score, maxScore);
  if (band === "strong") return styles.traitStrong;
  if (band === "mid") return styles.traitMid;
  return styles.traitWeak;
}

export function PTEEssayScorePanel({ result, footer }: PTEEssayScorePanelProps) {
  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>PTE Essay Score</h2>
          <p className={styles.modeLabel}>PTE Academic Essay</p>
        </div>
        <div className={styles.totalScore} aria-label={`Total score ${result.totalScore} out of ${result.maxTotalScore}`}>
          <span className={styles.totalValue}>{result.totalScore}</span>
          <span className={styles.totalMax}>/{result.maxTotalScore}</span>
        </div>
      </header>

      {result.cascadeNote && (
        <p className={styles.cascadeNote} role="status">
          {result.cascadeNote}
        </p>
      )}

      <div className={styles.traitGrid}>
        {result.traits.map((trait) => (
          <article
            key={trait.id}
            className={`${styles.traitCard} ${bandClass(trait.score, trait.maxScore)}`}
          >
            <div className={styles.traitHeader}>
              <h3 className={styles.traitName}>{trait.label}</h3>
              <span className={styles.traitScore}>
                {trait.score}/{trait.maxScore}
              </span>
            </div>
            <p className={styles.traitFeedback}>{trait.feedback}</p>
          </article>
        ))}
      </div>

      {result.topFixes.length > 0 && (
        <section className={styles.fixesSection} aria-labelledby="pte-top-fixes">
          <h3 id="pte-top-fixes" className={styles.fixesTitle}>
            Top fixes
          </h3>
          <ol className={styles.fixesList}>
            {result.topFixes.map((fix) => (
              <li key={fix} className={styles.fixItem}>
                {fix}
              </li>
            ))}
          </ol>
        </section>
      )}

      {footer && <section className={styles.improveSection}>{footer}</section>}
    </div>
  );
}
