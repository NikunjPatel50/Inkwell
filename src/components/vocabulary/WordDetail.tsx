"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkWordUsage,
  generateWordDetail,
  generateWordPractice,
  saveLookedUpWord,
} from "../../lib/vocabularyClient";
import { addRecentWord } from "../../lib/vocabularyLookup";
import { ApiError } from "../../lib/apiClient";
import type { WordDetail, WordPracticeExercise } from "../../types";
import styles from "../learning/LearningTab.module.css";
import { WordPractice } from "./WordPractice";

interface WordDetailViewProps {
  word: string;
}

export function WordDetailView({ word }: WordDetailViewProps) {
  const [detail, setDetail] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [practice, setPractice] = useState<WordPracticeExercise | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [showPractice, setShowPractice] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnlockedLevel(1);
    setShowPractice(false);
    setPractice(null);

    try {
      const data = await generateWordDetail(word);
      setDetail(data);
      addRecentWord(data.word);
      void saveLookedUpWord(
        data.word,
        data.level1.definition,
        data.level1.examples[0] ?? `Looked up in Vocabulary: ${data.word}`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load word detail.");
    } finally {
      setLoading(false);
    }
  }, [word]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handlePractice = async () => {
    if (!detail) return;
    setPracticeLoading(true);
    setShowPractice(true);
    setError(null);
    try {
      const exercises = await generateWordPractice(detail.word, detail.level1.definition);
      setPractice(exercises);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load practice exercises.");
      setShowPractice(false);
      setPractice(null);
    } finally {
      setPracticeLoading(false);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Loading word depth for &ldquo;{word}&rdquo;…</p>;
  }

  if (error && !detail) {
    return (
      <div className={styles.exerciseBlock}>
        <p className={styles.error} role="alert">
          {error}
        </p>
        <button type="button" className={styles.optionButton} onClick={() => void loadDetail()}>
          Try again
        </button>
      </div>
    );
  }

  if (!detail?.level1?.definition) {
    return (
      <div className={styles.exerciseBlock}>
        <p className={styles.error} role="alert">
          Could not load details for &ldquo;{word}&rdquo;.
        </p>
        <button type="button" className={styles.optionButton} onClick={() => void loadDetail()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <article className={styles.detail}>
      <header>
        <h2 className={styles.title}>{detail.word}</h2>
        <div className={styles.wordMeta}>
          <span className={styles.phonetic}>{detail.phonetic}</span>
          <span className={styles.posBadge}>{detail.partOfSpeech}</span>
        </div>
      </header>

      <section className={styles.section}>
        <p className={styles.levelEyebrow}>Foundation</p>
        <div className={styles.levelRule} role="separator" />
        <p className={styles.definition}>{detail.level1.definition}</p>
        <div className={styles.exampleList}>
          {detail.level1.examples.map((example) => (
            <p key={example} className={styles.subtitle}>
              {example}
            </p>
          ))}
        </div>
        <p className={styles.subtitle}>
          <strong>Remember it:</strong> {detail.level1.mnemonic}
        </p>
        {unlockedLevel < 2 && (
          <button
            type="button"
            className={styles.goDeeperButton}
            onClick={() => setUnlockedLevel(2)}
          >
            Go deeper
          </button>
        )}
      </section>

      {unlockedLevel >= 2 && (
        <section className={styles.section}>
          <p className={styles.levelEyebrow}>Word family</p>
          <div className={styles.levelRule} role="separator" />
          {detail.level2.wordForms.length > 0 && (
            <div className={styles.exampleList}>
              {detail.level2.wordForms.map((entry) => (
                <p key={`${entry.form}-${entry.partOfSpeech}`} className={styles.subtitle}>
                  <strong>
                    {entry.form}
                  </strong>{" "}
                  ({entry.partOfSpeech}) — {entry.example}
                </p>
              ))}
            </div>
          )}
          {detail.level2.synonyms.length > 0 && (
            <>
              <h4 className={styles.sectionHeading}>Synonyms</h4>
              <ul className={styles.reviewList}>
                {detail.level2.synonyms.map((entry) => (
                  <li key={entry.word}>
                    <strong>{entry.word}</strong> — {entry.note}
                  </li>
                ))}
              </ul>
            </>
          )}
          {detail.level2.antonyms.length > 0 && (
            <>
              <h4 className={styles.sectionHeading}>Antonyms</h4>
              <ul className={styles.reviewList}>
                {detail.level2.antonyms.map((entry) => (
                  <li key={entry.word}>
                    <strong>{entry.word}</strong> — {entry.note}
                  </li>
                ))}
              </ul>
            </>
          )}
          {unlockedLevel < 3 && (
            <button
              type="button"
              className={styles.goDeeperButton}
              onClick={() => setUnlockedLevel(3)}
            >
              Go deeper
            </button>
          )}
        </section>
      )}

      {unlockedLevel >= 3 && (
        <section className={styles.section}>
          <p className={styles.levelEyebrow}>Usage in the wild</p>
          <div className={styles.levelRule} role="separator" />
          {detail.level3.collocations.length > 0 && (
            <>
              <h4 className={styles.sectionHeading}>Collocations</h4>
              <ul className={styles.reviewList}>
                {detail.level3.collocations.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ul>
            </>
          )}
          {detail.level3.register && (
            <p className={styles.subtitle}>
              <strong>Register:</strong> {detail.level3.register}
            </p>
          )}
          {detail.level3.commonMistake && (
            <p className={styles.subtitle}>
              <strong>Common mistake:</strong> {detail.level3.commonMistake}
            </p>
          )}
          {detail.level3.usageContext && (
            <p className={styles.subtitle}>
              <strong>When to use it:</strong> {detail.level3.usageContext}
            </p>
          )}
          {unlockedLevel < 4 && (
            <button
              type="button"
              className={styles.goDeeperButton}
              onClick={() => setUnlockedLevel(4)}
            >
              Go deeper
            </button>
          )}
        </section>
      )}

      {unlockedLevel >= 4 && (
        <section className={styles.section}>
          <p className={styles.levelEyebrow}>The full picture</p>
          <div className={styles.levelRule} role="separator" />
          {detail.level4.etymology && (
            <p className={styles.subtitle}>
              <strong>Etymology:</strong> {detail.level4.etymology}
            </p>
          )}
          {detail.level4.connotation && (
            <p className={styles.subtitle}>
              <strong>Connotation:</strong> {detail.level4.connotation}
            </p>
          )}
          {detail.level4.nuanceComparison && (
            <p className={styles.subtitle}>
              <strong>Nuance:</strong> {detail.level4.nuanceComparison}
            </p>
          )}
          {detail.level4.famousUsage && (
            <p className={styles.subtitle}>
              <strong>Example usage:</strong> {detail.level4.famousUsage}
            </p>
          )}
        </section>
      )}

      <div className={styles.exerciseBlock}>
        {!showPractice && (
          <button
            type="button"
            className={styles.optionButton}
            onClick={() => void handlePractice()}
            disabled={practiceLoading}
          >
            Practice this word
          </button>
        )}
        {showPractice && practiceLoading && (
          <p className={styles.loading}>Preparing practice…</p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>

      {showPractice && practice && (
        <WordPractice
          word={detail.word}
          exercise={practice}
          onCheckUsage={(sentence) =>
            checkWordUsage(detail.word, sentence, detail.level1.definition)
          }
        />
      )}
    </article>
  );
}
