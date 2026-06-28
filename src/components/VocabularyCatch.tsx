import { useState } from "react";
import type { VocabularyItem } from "../types";
import styles from "./VocabularyCatch.module.css";

interface VocabularyCatchProps {
  items: VocabularyItem[];
  onGoToWrite: () => void;
}

function Flashcard({ item }: { item: VocabularyItem }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`${styles.card} ${flipped ? styles.cardFlipped : ""}`}
      onClick={() => setFlipped((value) => !value)}
      aria-pressed={flipped}
      aria-label={`${item.word}. ${flipped ? "Showing definition." : "Tap to reveal definition."}`}
    >
      <span className={styles.cardInner}>
        <span className={styles.cardFace}>
          <span className={styles.word}>{item.word}</span>
          <span className={styles.flipHint}>Tap to flip</span>
        </span>
        <span className={styles.cardFace} aria-hidden={!flipped}>
          <span className={styles.definition}>{item.definition}</span>
          <span className={styles.sourceSentence}>&ldquo;{item.sourceSentence}&rdquo;</span>
        </span>
      </span>
    </button>
  );
}

export function VocabularyCatch({ items, onGoToWrite }: VocabularyCatchProps) {
  return (
    <section className={styles.section} aria-labelledby="vocabulary-catch-heading">
      <header className={styles.header}>
        <h2 id="vocabulary-catch-heading" className={styles.title}>
          Vocabulary Catch
        </h2>
        <p className={styles.description}>
          Words pulled from your advanced rewrites — flip each card to review the meaning.
        </p>
      </header>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            Analyse a sentence first to collect vocabulary.
          </p>
          <button type="button" className={styles.primaryButton} onClick={onGoToWrite}>
            Go to Write tab
          </button>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {items.map((item) => (
            <Flashcard key={item.word.toLowerCase()} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
