import type { WritingDnaVocabItem } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaVocabularyPanelProps {
  mostUsed: WritingDnaVocabItem[];
  rareWords: WritingDnaVocabItem[];
  academicWords: WritingDnaVocabItem[];
  newThisMonth: number;
  totalWords: number;
}

function VocabChips({ items, emptyLabel }: { items: WritingDnaVocabItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className={styles.emptyState}>{emptyLabel}</p>;
  }

  return (
    <div className={styles.vocabList}>
      {items.map((item) => (
        <span key={item.word} className={styles.vocabChip}>
          {item.word}
          <span className={styles.vocabCount}>×{item.frequency}</span>
          {item.cefr_level && <span className={styles.vocabCount}>{item.cefr_level}</span>}
        </span>
      ))}
    </div>
  );
}

export function DnaVocabularyPanel({
  mostUsed,
  rareWords,
  academicWords,
  newThisMonth,
  totalWords,
}: DnaVocabularyPanelProps) {
  return (
    <div className={styles.vocabPanel}>
      <p className={styles.emptyState}>
        {totalWords.toLocaleString()} unique words tracked · {newThisMonth} new this month
      </p>
      <div>
        <p className={styles.coachHeading}>Most used</p>
        <VocabChips items={mostUsed} emptyLabel="No vocabulary tracked yet." />
      </div>
      <div>
        <p className={styles.coachHeading}>Rare words</p>
        <VocabChips items={rareWords} emptyLabel="Rare words appear as you diversify." />
      </div>
      <div>
        <p className={styles.coachHeading}>Academic words</p>
        <VocabChips items={academicWords} emptyLabel="Advanced vocabulary builds over time." />
      </div>
    </div>
  );
}
