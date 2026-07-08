import { useState } from "react";
import type { VocabularyItem } from "../types";
import styles from "./VocabularyCatch.module.css";

interface VocabularyCatchProps {
  items: VocabularyItem[];
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

export function VocabularyCatch({ items }: VocabularyCatchProps) {
  if (items.length === 0) {
    return (
      <p className={styles.emptyText}>No vocabulary collected yet — analyse a sentence to start.</p>
    );
  }

  return (
    <div className={styles.cardGrid}>
      {items.map((item) => (
        <Flashcard key={item.word.toLowerCase()} item={item} />
      ))}
    </div>
  );
}
