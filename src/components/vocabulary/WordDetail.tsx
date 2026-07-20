"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkWordUsage,
  generateWordDetail,
  generateWordPractice,
  saveLookedUpWord,
} from "../../lib/vocabularyClient";
import { addRecentWord } from "../../lib/vocabularyLookup";
import { formatSenseLabel, formatSyllables, getDisplaySenses } from "../../lib/wordDetailDisplay";
import { ApiError } from "../../lib/apiClient";
import type { WordDetail, WordPracticeExercise } from "../../types";
import pageStyles from "../learning/LearningTab.module.css";
import panelStyles from "./WordDetailPanel.module.css";
import { WordPractice } from "./WordPractice";

interface WordDetailViewProps {
  word: string;
  variant?: "page" | "panel";
}

function hasLevel2Content(detail: WordDetail): boolean {
  return (
    detail.level2.wordForms.length > 0 ||
    detail.level2.synonyms.length > 0 ||
    detail.level2.antonyms.length > 0
  );
}

function hasLevel3Content(detail: WordDetail): boolean {
  return (
    detail.level3.collocations.length > 0 ||
    Boolean(detail.level3.register) ||
    Boolean(detail.level3.commonMistake) ||
    Boolean(detail.level3.usageContext)
  );
}

function hasLevel4Content(detail: WordDetail): boolean {
  return (
    Boolean(detail.level4.etymology) ||
    Boolean(detail.level4.connotation) ||
    Boolean(detail.level4.nuanceComparison) ||
    Boolean(detail.level4.famousUsage)
  );
}

export function WordDetailView({ word, variant = "page" }: WordDetailViewProps) {
  const isPanel = variant === "panel";
  const styles = isPanel ? panelStyles : pageStyles;

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
    setDetail(null);
    setUnlockedLevel(1);
    setShowPractice(false);
    setPractice(null);

    try {
      const data = await generateWordDetail(word);
      if (!data?.level1?.definition?.trim()) {
        throw new ApiError(`Could not load details for "${word}".`);
      }
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

  const maxUnlockableLevel = detail
    ? 1 +
      (detail.level2.wordForms.length > 0 ? 1 : 0) +
      (hasLevel3Content(detail) ? 1 : 0) +
      (hasLevel4Content(detail) ? 1 : 0)
    : 1;

  const canGoDeeper = unlockedLevel < maxUnlockableLevel;

  if (loading) {
    return <p className={styles.loading}>Loading word depth for &ldquo;{word}&rdquo;…</p>;
  }

  if (error) {
    return (
      <div className={isPanel ? panelStyles.stateCard : pageStyles.exerciseBlock}>
        <p className={styles.error} role="alert">
          {error}
        </p>
        <button
          type="button"
          className={isPanel ? panelStyles.secondaryButton : pageStyles.optionButton}
          onClick={() => void loadDetail()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!detail?.level1?.definition) {
    return (
      <div className={isPanel ? panelStyles.stateCard : pageStyles.exerciseBlock}>
        <p className={styles.error} role="alert">
          Could not load details for &ldquo;{word}&rdquo;.
        </p>
        <button
          type="button"
          className={isPanel ? panelStyles.secondaryButton : pageStyles.optionButton}
          onClick={() => void loadDetail()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (isPanel) {
    const synonyms = detail.level2.synonyms;
    const antonyms = detail.level2.antonyms;
    const senses = getDisplaySenses(detail);

    const playAudio = () => {
      if (!detail.audioUrl) return;
      void new Audio(detail.audioUrl).play();
    };

    return (
      <article className={panelStyles.dictEntry}>
        <header className={panelStyles.dictHeader}>
          <div className={panelStyles.dictHeaderMain}>
            <p className={panelStyles.dictSyllables}>{formatSyllables(detail.word)}</p>
            <div className={panelStyles.dictPhoneticRow}>
              <span className={panelStyles.dictPhonetic}>{detail.phonetic}</span>
              {detail.audioUrl && (
                <button
                  type="button"
                  className={panelStyles.audioButton}
                  onClick={playAudio}
                  aria-label={`Play pronunciation of ${detail.word}`}
                >
                  <span aria-hidden>🔊</span>
                </button>
              )}
            </div>
          </div>
          <span className={panelStyles.dictPos}>{detail.partOfSpeech}</span>
        </header>

        {synonyms.length > 0 && (
          <p className={panelStyles.synonymsLine}>
            <span className={panelStyles.synonymsLabel}>Synonyms of {detail.word}</span>
            <span className={panelStyles.synonymsWords}>
              {synonyms.map((entry) => entry.word).join(", ")}
            </span>
          </p>
        )}

        <ol className={panelStyles.senseList}>
          {senses.map((sense) => (
            <li
              key={`${sense.number}${sense.subLabel ?? ""}-${sense.definition.slice(0, 24)}`}
              className={panelStyles.senseItem}
            >
              <span className={panelStyles.senseNumber}>{formatSenseLabel(sense)}</span>
              <div className={panelStyles.senseContent}>
                <p className={panelStyles.senseDefinition}>{sense.definition}</p>
                {sense.examples.map((example) => (
                  <p key={example} className={panelStyles.senseExample}>
                    {example}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {antonyms.length > 0 && (
          <p className={panelStyles.antonymsLine}>
            <span className={panelStyles.antonymsLabel}>Antonyms</span>
            <span className={panelStyles.antonymsWords}>
              {antonyms.map((entry) => entry.word).join(", ")}
            </span>
          </p>
        )}

        {detail.level2.wordForms.length > 0 && (
          <div className={panelStyles.relatedForms}>
            {detail.level2.wordForms.map((entry) => (
              <p key={`${entry.form}-${entry.partOfSpeech}`} className={panelStyles.relatedForm}>
                <strong>{entry.form}</strong>
                <span className={panelStyles.relatedPos}>{entry.partOfSpeech}</span>
              </p>
            ))}
          </div>
        )}

        {unlockedLevel >= 3 && hasLevel3Content(detail) && (
          <div className={panelStyles.extraBlock}>
            {detail.level3.collocations.length > 0 && (
              <p className={panelStyles.extraLine}>
                <strong>Collocations:</strong> {detail.level3.collocations.join("; ")}
              </p>
            )}
            {detail.level3.register && (
              <p className={panelStyles.extraLine}>
                <strong>Register:</strong> {detail.level3.register}
              </p>
            )}
            {detail.level3.usageContext && (
              <p className={panelStyles.extraLine}>
                <strong>Usage:</strong> {detail.level3.usageContext}
              </p>
            )}
          </div>
        )}

        {unlockedLevel >= 4 && hasLevel4Content(detail) && (
          <div className={panelStyles.extraBlock}>
            {detail.level4.etymology && (
              <p className={panelStyles.extraLine}>
                <strong>Etymology:</strong> {detail.level4.etymology}
              </p>
            )}
            {detail.level4.nuanceComparison && (
              <p className={panelStyles.extraLine}>
                <strong>Nuance:</strong> {detail.level4.nuanceComparison}
              </p>
            )}
          </div>
        )}

        <footer className={panelStyles.actions}>
          <div className={panelStyles.actionRow}>
            {canGoDeeper && !showPractice && (
              <button
                type="button"
                className={panelStyles.secondaryButton}
                onClick={() => setUnlockedLevel((level) => Math.min(level + 1, maxUnlockableLevel))}
              >
                More detail
              </button>
            )}
            {!showPractice && (
              <button
                type="button"
                className={`${panelStyles.primaryButton} ${!canGoDeeper ? panelStyles.primaryButtonFull : ""}`}
                onClick={() => void handlePractice()}
                disabled={practiceLoading}
              >
                {practiceLoading ? "Preparing…" : "Practice word"}
              </button>
            )}
          </div>
          {showPractice && practiceLoading && (
            <p className={panelStyles.loading}>Preparing practice…</p>
          )}
          {error && (
            <p className={panelStyles.error} role="alert">
              {error}
            </p>
          )}
        </footer>

        {showPractice && practice && (
          <div className={panelStyles.practiceWrap}>
            <WordPractice
              word={detail.word}
              exercise={practice}
              onCheckUsage={(sentence) =>
                checkWordUsage(detail.word, sentence, detail.level1.definition)
              }
            />
          </div>
        )}
      </article>
    );
  }

  return (
    <article className={pageStyles.detail}>
      <header>
        <h2 className={pageStyles.title}>{detail.word}</h2>
        <div className={pageStyles.wordMeta}>
          <span className={pageStyles.phonetic}>{detail.phonetic}</span>
          <span className={pageStyles.posBadge}>{detail.partOfSpeech}</span>
        </div>
      </header>

      <section className={pageStyles.section}>
        <p className={pageStyles.levelEyebrow}>Foundation</p>
        <div className={pageStyles.levelRule} role="separator" />
        <p className={pageStyles.definition}>{detail.level1.definition}</p>
        <div className={pageStyles.exampleList}>
          {detail.level1.examples.map((example) => (
            <p key={example} className={pageStyles.subtitle}>
              {example}
            </p>
          ))}
        </div>
        <p className={pageStyles.subtitle}>
          <strong>Remember it:</strong> {detail.level1.mnemonic}
        </p>
        {unlockedLevel < 2 && hasLevel2Content(detail) && (
          <button
            type="button"
            className={pageStyles.goDeeperButton}
            onClick={() => setUnlockedLevel(2)}
          >
            Go deeper
          </button>
        )}
      </section>

      {unlockedLevel >= 2 && hasLevel2Content(detail) && (
        <section className={pageStyles.section}>
          <p className={pageStyles.levelEyebrow}>Word family</p>
          <div className={pageStyles.levelRule} role="separator" />
          {detail.level2.wordForms.length > 0 && (
            <div className={pageStyles.exampleList}>
              {detail.level2.wordForms.map((entry) => (
                <p key={`${entry.form}-${entry.partOfSpeech}`} className={pageStyles.subtitle}>
                  <strong>{entry.form}</strong> ({entry.partOfSpeech}) — {entry.example}
                </p>
              ))}
            </div>
          )}
          {detail.level2.synonyms.length > 0 && (
            <>
              <h4 className={pageStyles.sectionHeading}>Synonyms</h4>
              <ul className={pageStyles.reviewList}>
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
              <h4 className={pageStyles.sectionHeading}>Antonyms</h4>
              <ul className={pageStyles.reviewList}>
                {detail.level2.antonyms.map((entry) => (
                  <li key={entry.word}>
                    <strong>{entry.word}</strong> — {entry.note}
                  </li>
                ))}
              </ul>
            </>
          )}
          {unlockedLevel < 3 && hasLevel3Content(detail) && (
            <button
              type="button"
              className={pageStyles.goDeeperButton}
              onClick={() => setUnlockedLevel(3)}
            >
              Go deeper
            </button>
          )}
        </section>
      )}

      {unlockedLevel >= 3 && hasLevel3Content(detail) && (
        <section className={pageStyles.section}>
          <p className={pageStyles.levelEyebrow}>Usage in the wild</p>
          <div className={pageStyles.levelRule} role="separator" />
          {detail.level3.collocations.length > 0 && (
            <>
              <h4 className={pageStyles.sectionHeading}>Collocations</h4>
              <ul className={pageStyles.reviewList}>
                {detail.level3.collocations.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ul>
            </>
          )}
          {detail.level3.register && (
            <p className={pageStyles.subtitle}>
              <strong>Register:</strong> {detail.level3.register}
            </p>
          )}
          {detail.level3.commonMistake && (
            <p className={pageStyles.subtitle}>
              <strong>Common mistake:</strong> {detail.level3.commonMistake}
            </p>
          )}
          {detail.level3.usageContext && (
            <p className={pageStyles.subtitle}>
              <strong>When to use it:</strong> {detail.level3.usageContext}
            </p>
          )}
          {unlockedLevel < 4 && hasLevel4Content(detail) && (
            <button
              type="button"
              className={pageStyles.goDeeperButton}
              onClick={() => setUnlockedLevel(4)}
            >
              Go deeper
            </button>
          )}
        </section>
      )}

      {unlockedLevel >= 4 && hasLevel4Content(detail) && (
        <section className={pageStyles.section}>
          <p className={pageStyles.levelEyebrow}>The full picture</p>
          <div className={pageStyles.levelRule} role="separator" />
          {detail.level4.etymology && (
            <p className={pageStyles.subtitle}>
              <strong>Etymology:</strong> {detail.level4.etymology}
            </p>
          )}
          {detail.level4.connotation && (
            <p className={pageStyles.subtitle}>
              <strong>Connotation:</strong> {detail.level4.connotation}
            </p>
          )}
          {detail.level4.nuanceComparison && (
            <p className={pageStyles.subtitle}>
              <strong>Nuance:</strong> {detail.level4.nuanceComparison}
            </p>
          )}
          {detail.level4.famousUsage && (
            <p className={pageStyles.subtitle}>
              <strong>Example usage:</strong> {detail.level4.famousUsage}
            </p>
          )}
        </section>
      )}

      <div className={pageStyles.exerciseBlock}>
        {!showPractice && (
          <button
            type="button"
            className={pageStyles.optionButton}
            onClick={() => void handlePractice()}
            disabled={practiceLoading}
          >
            Practice this word
          </button>
        )}
        {showPractice && practiceLoading && (
          <p className={pageStyles.loading}>Preparing practice…</p>
        )}
        {error && (
          <p className={pageStyles.error} role="alert">
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
