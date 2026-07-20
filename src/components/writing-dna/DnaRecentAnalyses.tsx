import type { WritingDnaSession } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaRecentAnalysesProps {
  sessions: WritingDnaSession[];
}

function truncate(text: string, max = 88): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DnaRecentAnalyses({ sessions }: DnaRecentAnalysesProps) {
  if (sessions.length === 0) {
    return <p className={styles.emptyState}>Recent analyses appear here after each submission.</p>;
  }

  return (
    <ul className={styles.recentList}>
      {sessions.slice(0, 8).map((session) => (
        <li key={session.id} className={styles.recentItem}>
          <div className={styles.recentHeader}>
            <span className={styles.recentScore}>{session.dna_score}</span>
            <div className={styles.recentMeta}>
              <span className={styles.recentSource}>{session.source_tool}</span>
              <span className={styles.recentDate}>{formatDate(session.created_at)}</span>
            </div>
          </div>
          <p className={styles.recentExcerpt}>
            {session.original_text ? truncate(session.original_text) : "Analysis session"}
          </p>
          <p className={styles.recentExcerpt}>
            {truncate(
              `${session.word_count} words · Grammar ${session.dimensions.grammar} · Vocabulary ${session.dimensions.vocabulary} · Clarity ${session.dimensions.clarity}`,
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
