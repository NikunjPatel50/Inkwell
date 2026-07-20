import styles from "./WritingDna.module.css";

interface DnaInsightsListProps {
  insights: string[];
}

export function DnaInsightsList({ insights }: DnaInsightsListProps) {
  if (insights.length === 0) {
    return <p className={styles.emptyState}>Submit writing to unlock personalized insights.</p>;
  }

  return (
    <ul className={styles.insightList}>
      {insights.map((insight) => (
        <li key={insight} className={styles.insightItem}>
          <span className={styles.insightDot} aria-hidden="true" />
          <span>{insight}</span>
        </li>
      ))}
    </ul>
  );
}
