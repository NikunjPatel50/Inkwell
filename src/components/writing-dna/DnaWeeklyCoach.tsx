import type { WritingDnaWeeklyReport } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaWeeklyCoachProps {
  reports: WritingDnaWeeklyReport[];
}

export function DnaWeeklyCoach({ reports }: DnaWeeklyCoachProps) {
  const latest = reports[0];

  if (!latest) {
    return (
      <p className={styles.emptyState}>
        Your AI coach generates a weekly report after your first week of submissions.
      </p>
    );
  }

  const report = latest.report;

  return (
    <div className={styles.coachSection}>
      <p className={styles.emptyState}>Week of {latest.week_start}</p>
      <div className={styles.coachBlock}>
        <p className={styles.coachHeading}>Biggest improvement</p>
        <p className={styles.coachText}>{report.biggestImprovement}</p>
      </div>
      <div className={styles.coachBlock}>
        <p className={styles.coachHeading}>Biggest weakness</p>
        <p className={styles.coachText}>{report.biggestWeakness}</p>
      </div>
      <div className={styles.coachBlock}>
        <p className={styles.coachHeading}>Three exercises</p>
        <ul className={styles.insightList}>
          {report.exercises.map((exercise) => (
            <li key={exercise} className={styles.insightItem}>
              <span className={styles.insightDot} aria-hidden="true" />
              <span>{exercise}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.coachBlock}>
        <p className={styles.coachHeading}>Words to learn</p>
        <p className={styles.coachText}>{report.wordsToLearn.join(", ")}</p>
      </div>
      <div className={styles.coachBlock}>
        <p className={styles.coachHeading}>Grammar topic</p>
        <p className={styles.coachText}>{report.grammarTopic}</p>
      </div>
      <div className={styles.coachBlock}>
        <p className={styles.coachHeading}>Estimated progress</p>
        <p className={styles.coachText}>{report.estimatedProgress}</p>
      </div>
    </div>
  );
}
