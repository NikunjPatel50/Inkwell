import type { CollocationTopicExamples } from "../../types/coach";
import shared from "./CoachShared.module.css";
import styles from "./CoachCollocationTopicExamples.module.css";

interface CoachCollocationTopicExamplesProps {
  topicExamples: CollocationTopicExamples[];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderSentence(sentence: string, collocation: string) {
  const pattern = new RegExp(`(${escapeRegex(collocation)})`, "i");
  const parts = sentence.split(pattern);

  return parts.map((part, index) =>
    part.toLowerCase() === collocation.toLowerCase() ? (
      <mark key={`${part}-${index}`} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function CoachCollocationTopicExamples({
  topicExamples,
}: CoachCollocationTopicExamplesProps) {
  if (topicExamples.length === 0) return null;

  return (
    <div className={shared.card}>
      <div>
        <p className={shared.sectionTitle}>Essay topic examples</p>
        <p className={shared.sectionHint}>
          See how these collocations sound in sentences across common PTE and IELTS essay themes.
        </p>
      </div>

      <div className={styles.topicGrid}>
        {topicExamples.map((group) => (
          <section key={group.topic} className={styles.topicCard}>
            <h4 className={styles.topicTitle}>{group.topic}</h4>
            <ul className={styles.sentenceList}>
              {group.sentences.map((entry) => (
                <li key={`${group.topic}-${entry.collocation}`} className={styles.sentenceItem}>
                  <span className={styles.collocationTag}>{entry.collocation}</span>
                  <p className={styles.sentence}>
                    {renderSentence(entry.sentence, entry.collocation)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
