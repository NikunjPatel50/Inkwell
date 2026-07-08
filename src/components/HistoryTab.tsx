import { useEffect, useState } from "react";
import { ApiError, fetchHistory, fetchVocabulary } from "../lib/apiClient";
import type { AnalyzedSentenceRow, SkillPatternRow, VocabularyItem } from "../types";
import { TabPageShell } from "./TabPageShell";
import { VocabularyCatch } from "./VocabularyCatch";
import styles from "./HistoryTab.module.css";

interface HistoryTabProps {
  isAuthenticated: boolean;
  refreshKey: number;
  onSignIn: () => void;
}

export function HistoryTab({ isAuthenticated, refreshKey, onSignIn }: HistoryTabProps) {
  const [sentences, setSentences] = useState<AnalyzedSentenceRow[]>([]);
  const [skillPatterns, setSkillPatterns] = useState<SkillPatternRow[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSentences([]);
      setSkillPatterns([]);
      setVocabulary([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [history, vocab] = await Promise.all([fetchHistory(), fetchVocabulary()]);
        if (cancelled) return;

        setSentences(history.sentences);
        setSkillPatterns(history.skillPatterns);
        setVocabulary(
          vocab.words.map((word) => ({
            word: word.word,
            definition: word.definition,
            sourceSentence: word.source_sentence,
          })),
        );
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not load history.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshKey]);

  if (!isAuthenticated) {
    return (
      <TabPageShell
        id="panel-history"
        labelledBy="tab-history"
        eyebrow="Records"
        title="History"
        description="Sign in to review sessions, skill patterns, and your vocabulary bank."
        action={
          <button type="button" className={styles.signInButton} onClick={onSignIn}>
            Sign in
          </button>
        }
      />
    );
  }

  return (
    <TabPageShell
      id="panel-history"
      labelledBy="tab-history"
      eyebrow="Records"
      title="History"
      description="Session archive, recurring error patterns, and saved vocabulary."
    >
      {loading && <p className={styles.status}>Loading your history…</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.bodyGrid}>
        <div className={styles.primaryColumn}>
          <section className={styles.section} aria-labelledby="recent-sentences-heading">
            <div className={styles.sectionHeader}>
              <h3 id="recent-sentences-heading" className={styles.sectionTitle}>
                Recent sentences
              </h3>
              <p className={styles.sectionDescription}>Your last 20 analysed sentences.</p>
            </div>

            {sentences.length === 0 ? (
              <p className={styles.muted}>No sentences yet — analyse your first one on the Write tab.</p>
            ) : (
              <ul className={styles.sentenceList}>
                {sentences.map((sentence) => {
                  const isExpanded = expandedId === sentence.id;
                  return (
                    <li key={sentence.id} className={styles.sentenceItem}>
                      <button
                        type="button"
                        className={styles.sentenceToggle}
                        onClick={() => setExpandedId(isExpanded ? null : sentence.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className={styles.sentenceMeta}>
                          Register {sentence.register_score} · {sentence.error_count}{" "}
                          {sentence.error_count === 1 ? "error" : "errors"}
                        </span>
                        <span className={styles.sentencePreview}>
                          {sentence.original_text.length > 72
                            ? `${sentence.original_text.slice(0, 72)}…`
                            : sentence.original_text}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className={styles.sentenceDetails}>
                          <p className={styles.originalText}>{sentence.original_text}</p>
                          <p className={styles.detailMeta}>
                            Analysed {new Date(sentence.created_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className={styles.secondaryColumn}>
          <section className={styles.section} aria-labelledby="skill-patterns-heading">
            <div className={styles.sectionHeader}>
              <h3 id="skill-patterns-heading" className={styles.sectionTitle}>
                Skill patterns
              </h3>
              <p className={styles.sectionDescription}>
                Error categories across all sessions, sorted by frequency.
              </p>
            </div>

            {skillPatterns.length === 0 ? (
              <p className={styles.muted}>Patterns will appear after you analyse writing with errors.</p>
            ) : (
              <ul className={styles.patternList}>
                {skillPatterns.map((pattern) => (
                  <li key={pattern.id} className={styles.patternItem}>
                    <span className={styles.patternCategory}>{pattern.category}</span>
                    <span className={styles.patternCount}>{pattern.occurrence_count}×</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section} aria-labelledby="vocabulary-bank-heading">
            <div className={styles.sectionHeader}>
              <h3 id="vocabulary-bank-heading" className={styles.sectionTitle}>
                Vocabulary bank
              </h3>
              <p className={styles.sectionDescription}>
                Words from your advanced rewrites — flip each card to review.
              </p>
            </div>
            <VocabularyCatch items={vocabulary} />
          </section>
        </div>
      </div>
    </TabPageShell>
  );
}
