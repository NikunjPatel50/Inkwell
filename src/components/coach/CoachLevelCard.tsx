import type { CoachLevelDefinition } from "../../types/coach";
import type { CoachLevelProgress } from "../../types/coach";
import styles from "./CoachLevelCard.module.css";

interface CoachLevelCardProps {
  level: CoachLevelDefinition;
  progress: CoachLevelProgress;
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
  onContinue: () => void;
}

export function CoachLevelCard({
  level,
  progress,
  expanded,
  onToggle,
  onStart,
  onContinue,
}: CoachLevelCardProps) {
  const hasProgress =
    progress.completedSessions > 0 ||
    progress.inProgressStep !== null ||
    Object.keys(progress.inProgressData).length > 0;

  const accuracyLabel =
    progress.lastAccuracy !== null ? `${progress.lastAccuracy}% last accuracy` : "Not started";

  const progressPct = progress.lastAccuracy ?? (hasProgress ? 15 : 0);

  return (
    <article className={`${styles.card} ${expanded ? styles.cardExpanded : ""}`}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className={styles.headerMain}>
          <div className={styles.levelRow}>
            <span className={styles.levelBadge}>Level {level.level || "★"}</span>
            <span className={styles.topicBadge}>{level.badge}</span>
          </div>
          <h3 className={styles.title}>{level.title}</h3>
          <p className={styles.description}>{level.description}</p>
        </div>
        <span className={styles.chevron} aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className={styles.body}>
          <div className={styles.progressBlock}>
            <div className={styles.progressMeta}>
              <span>{accuracyLabel}</span>
              {progress.completedSessions > 0 && (
                <span>{progress.completedSessions} session{progress.completedSessions === 1 ? "" : "s"}</span>
              )}
            </div>
            <div className={styles.progressTrack} aria-hidden="true">
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.startButton} onClick={onStart}>
              {hasProgress ? "Restart" : "Start"}
            </button>
            {(progress.inProgressStep !== null || Object.keys(progress.inProgressData).length > 0) && (
              <button type="button" className={styles.continueButton} onClick={onContinue}>
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
