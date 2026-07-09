"use client";

import { useState } from "react";
import { TOPIC_LANGUAGE_BANK } from "../../../constants/topicLanguageBank";
import { recordLevelSession } from "../../../lib/coachClient";
import shared from "../CoachShared.module.css";
import styles from "./TopicLanguageBankLevel.module.css";

interface TopicLanguageBankLevelProps {
  onProgressUpdate: () => void;
}

export function TopicLanguageBankLevel({ onProgressUpdate }: TopicLanguageBankLevelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(TOPIC_LANGUAGE_BANK[0]?.id ?? null);
  const [viewedTopics, setViewedTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
    setViewedTopics((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= 3) {
        recordLevelSession("topic-language-bank", Math.round((next.size / TOPIC_LANGUAGE_BANK.length) * 100));
        onProgressUpdate();
      }
      return next;
    });
  };

  return (
    <div className={styles.grid}>
      {TOPIC_LANGUAGE_BANK.map((topic) => {
        const open = expandedId === topic.id;

        return (
          <article key={topic.id} className={styles.topicCard}>
            <button
              type="button"
              className={styles.topicHeader}
              aria-expanded={open}
              onClick={() => toggleTopic(topic.id)}
            >
              <span className={styles.topicTitle}>{topic.title}</span>
              <span className={styles.chevron} aria-hidden="true">
                {open ? "−" : "+"}
              </span>
            </button>

            {open && (
              <div className={styles.topicBody}>
                <section>
                  <h4 className={styles.groupLabel}>Advantages</h4>
                  <div className={shared.tagList}>
                    {topic.advantages.map((item) => (
                      <span key={item} className={shared.tag}>
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className={styles.groupLabel}>Disadvantages</h4>
                  <div className={shared.tagList}>
                    {topic.disadvantages.map((item) => (
                      <span key={item} className={shared.tag}>
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
                <section className={styles.twoCol}>
                  <div>
                    <h4 className={styles.groupLabel}>Useful nouns</h4>
                    <div className={shared.tagList}>
                      {topic.usefulNouns.map((item) => (
                        <span key={item} className={shared.tag}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className={styles.groupLabel}>Useful verbs</h4>
                    <div className={shared.tagList}>
                      {topic.usefulVerbs.map((item) => (
                        <span key={item} className={shared.tag}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
                <section>
                  <h4 className={styles.groupLabel}>Example sentences</h4>
                  {topic.exampleSentences.map((sentence) => (
                    <p key={sentence} className={styles.exampleSentence}>
                      {sentence}
                    </p>
                  ))}
                </section>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
