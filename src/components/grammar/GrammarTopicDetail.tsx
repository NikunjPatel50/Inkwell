"use client";

import { useMemo } from "react";
import { getGrammarTopic } from "../../constants/grammarTopics";
import { HighlightedSentence, exampleHasRenderableHighlights } from "../learning/HighlightedSentence";
import { KeyRuleQuote } from "../learning/KeyRuleQuote";
import styles from "../learning/LearningTab.module.css";

interface GrammarTopicDetailProps {
  topicId: string;
}

export function GrammarTopicDetail({ topicId }: GrammarTopicDetailProps) {
  const topic = useMemo(() => getGrammarTopic(topicId), [topicId]);
  const examples = useMemo(
    () => topic?.examples.filter(exampleHasRenderableHighlights) ?? [],
    [topic],
  );

  if (!topic) {
    return <p className={styles.subtitle}>Topic not found.</p>;
  }

  return (
    <article className={styles.grammarDetailPage}>
      <header className={styles.grammarDetailHeader}>
        <h2 className={styles.title}>{topic.name}</h2>
        <p className={styles.grammarDetailTeaser}>{topic.teaser}</p>
      </header>

      <div className={styles.grammarDetailColumns}>
        <section className={styles.grammarDetailColumn} aria-labelledby="grammar-explanation">
          <p id="grammar-explanation" className={styles.sectionTitle}>
            Section 1
          </p>
          <h3 className={styles.sectionHeading}>The explanation</h3>
          <div className={styles.explanation}>
            {topic.explanation.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <KeyRuleQuote>{topic.keyRule}</KeyRuleQuote>
        </section>

        <section
          className={styles.grammarDetailColumn}
          aria-labelledby="grammar-examples"
        >
          <p id="grammar-examples" className={styles.sectionTitle}>
            Section 2
          </p>
          <h3 className={styles.sectionHeading}>See it in action</h3>
          <div className={styles.grammarExamplesPanel}>
            {examples.map((example, i) => (
              <HighlightedSentence key={i} example={example} />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
