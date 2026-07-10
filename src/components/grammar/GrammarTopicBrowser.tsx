"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GRAMMAR_CATEGORIES,
  GRAMMAR_TOPICS,
  type GrammarTopic,
} from "../../constants/grammarTopics";
import {
  getCompletedGrammarTopics,
  isGrammarTopicComplete,
} from "../../lib/learningProgress";
import styles from "../learning/LearningTab.module.css";

interface GrammarTopicBrowserProps {
  onSelectTopic: (topicId: string) => void;
}

export function GrammarTopicBrowser({ onSelectTopic }: GrammarTopicBrowserProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set([GRAMMAR_CATEGORIES[0]?.id ?? "parts-of-speech"]),
  );
  const [completed, setCompleted] = useState<Set<string>>(() => getCompletedGrammarTopics());

  useEffect(() => {
    const refresh = () => setCompleted(getCompletedGrammarTopics());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const completedCount = useMemo(
    () => GRAMMAR_TOPICS.filter((t) => completed.has(t.id)).length,
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
        <h2 className={styles.title}>Grammar</h2>
        <p className={styles.subtitle}>
          Every rule is taught through real sentences — shown, used, and practiced in context.
        </p>
      </header>

      <div className={styles.summaryBar}>
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{GRAMMAR_TOPICS.length}</span>
          <span className={styles.summaryLabel}>Topics</span>
        </div>
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{completedCount}</span>
          <span className={styles.summaryLabel}>Completed</span>
        </div>
      </div>

      <div className={styles.categoryList}>
        {GRAMMAR_CATEGORIES.map((category) => {
          const isOpen = openCategories.has(category.id);
          const doneInCategory = category.topics.filter((t) => completed.has(t.id)).length;

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
                    {doneInCategory}/{category.topics.length} completed
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
                  {category.topics.map((topic: GrammarTopic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className={styles.topicRow}
                      onClick={() => onSelectTopic(topic.id)}
                    >
                      <span
                        className={`${styles.statusDot} ${isGrammarTopicComplete(topic.id) || completed.has(topic.id) ? styles.statusDotDone : ""}`}
                        aria-label={
                          completed.has(topic.id) ? "Exercises completed" : "Not started"
                        }
                      />
                      <span className={styles.topicBody}>
                        <span className={styles.topicName}>{topic.name}</span>
                        <span className={styles.topicTeaser}>{topic.teaser}</span>
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
