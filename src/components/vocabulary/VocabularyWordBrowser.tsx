"use client";

import { useEffect, useMemo, useState } from "react";
import {
  VOCABULARY_CATEGORIES,
  VOCABULARY_WORDS,
  type VocabularyWord,
} from "../../constants/vocabularyTopics";
import {
  getCompletedVocabularyWords,
  isVocabularyWordComplete,
} from "../../lib/learningProgress";
import styles from "../learning/LearningTab.module.css";

interface VocabularyWordBrowserProps {
  onSelectWord: (wordId: string) => void;
}

export function VocabularyWordBrowser({ onSelectWord }: VocabularyWordBrowserProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set([VOCABULARY_CATEGORIES[0]?.id ?? "academic"]),
  );
  const [completed, setCompleted] = useState<Set<string>>(() => getCompletedVocabularyWords());

  useEffect(() => {
    const refresh = () => setCompleted(getCompletedVocabularyWords());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const completedCount = useMemo(
    () => VOCABULARY_WORDS.filter((w) => completed.has(w.id)).length,
    [completed],
  );

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.overview}>
      <header className={styles.header}>
        <h2 className={styles.title}>Vocabulary</h2>
        <p className={styles.subtitle}>
          Words stick when you meet them in real sentences — not on flashcards alone.
        </p>
      </header>

      <div className={styles.summaryBar}>
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{VOCABULARY_WORDS.length}</span>
          <span className={styles.summaryLabel}>Words</span>
        </div>
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{completedCount}</span>
          <span className={styles.summaryLabel}>Completed</span>
        </div>
      </div>

      <div className={styles.categoryList}>
        {VOCABULARY_CATEGORIES.map((category) => {
          const isOpen = openCategories.has(category.id);
          const doneInCategory = category.words.filter((w) => completed.has(w.id)).length;

          return (
            <section key={category.id} className={styles.category}>
              <button
                type="button"
                className={styles.categoryToggle}
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isOpen}
              >
                <div>
                  <p className={styles.categoryTitle}>{category.title}</p>
                  <p className={styles.categoryMeta}>
                    {doneInCategory}/{category.words.length} completed
                  </p>
                </div>
                <svg
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                  aria-hidden="true"
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className={styles.topicList}>
                  {category.words.map((word: VocabularyWord) => (
                    <button
                      key={word.id}
                      type="button"
                      className={styles.topicRow}
                      onClick={() => onSelectWord(word.id)}
                    >
                      <span
                        className={`${styles.statusDot} ${isVocabularyWordComplete(word.id) || completed.has(word.id) ? styles.statusDotDone : ""}`}
                        aria-label={
                          completed.has(word.id) ? "Exercises completed" : "Not started"
                        }
                      />
                      <span className={styles.topicBody}>
                        <span className={styles.topicName}>{word.word}</span>
                        <span className={styles.topicTeaser}>{word.teaser}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
