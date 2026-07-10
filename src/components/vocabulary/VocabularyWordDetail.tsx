"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVocabularyWord, type VocabularyWord } from "../../constants/vocabularyTopics";
import {
  checkReplaceIt,
  checkUseIt,
  generatePickMeaningExercise,
  generateReplaceItExercise,
  generateUseItExercise,
  isVocabularyLearningAvailable,
} from "../../lib/vocabularyClient";
import { ApiError } from "../../lib/apiClient";
import { markVocabularyWordComplete } from "../../lib/learningProgress";
import type { PickMeaningExercise, UseItExercise } from "../../types";
import { HighlightedSentence } from "../learning/HighlightedSentence";
import { KeyRuleQuote } from "../learning/KeyRuleQuote";
import styles from "../learning/LearningTab.module.css";
import exerciseStyles from "../exercises/ExerciseShared.module.css";

interface VocabularyWordDetailProps {
  wordId: string;
}

type ExercisePhase = "use" | "meaning" | "replace" | "done";

export function VocabularyWordDetail({ wordId }: VocabularyWordDetailProps) {
  const word = useMemo(() => getVocabularyWord(wordId), [wordId]);
  const [phase, setPhase] = useState<ExercisePhase>("use");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useIt, setUseIt] = useState<UseItExercise | null>(null);
  const [pickMeaning, setPickMeaning] = useState<PickMeaningExercise | null>(null);
  const [replaceIt, setReplaceIt] = useState<{
    weakSentence: string;
    weakWord: string;
    hint: string;
  } | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const [userSentence, setUserSentence] = useState("");
  const [replaceSentence, setReplaceSentence] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [useResult, setUseResult] = useState<{
    correct: boolean;
    feedback: string;
    exampleSentence: string;
    explanation: string;
  } | null>(null);
  const [replaceResult, setReplaceResult] = useState<{
    correct: boolean;
    feedback: string;
    exampleSentence: string;
    explanation: string;
  } | null>(null);
  const [meaningResolved, setMeaningResolved] = useState(false);
  const [selectedMeaning, setSelectedMeaning] = useState<number | null>(null);

  const seed = useMemo(() => `${wordId}-${Date.now()}`, [wordId]);

  const loadExercises = useCallback(async (currentWord: VocabularyWord) => {
    setLoading(true);
    setError(null);
    setPhase("use");
    setScores([]);
    setUserSentence("");
    setReplaceSentence("");
    setUseResult(null);
    setReplaceResult(null);
    setMeaningResolved(false);
    setSelectedMeaning(null);

    try {
      const [useEx, meaningEx, replaceEx] = await Promise.all([
        generateUseItExercise(currentWord, seed),
        generatePickMeaningExercise(currentWord, seed),
        generateReplaceItExercise(currentWord, seed),
      ]);
      setUseIt(useEx);
      setPickMeaning(meaningEx);
      setReplaceIt(replaceEx);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load exercises.");
    } finally {
      setLoading(false);
    }
  }, [seed]);

  useEffect(() => {
    if (word) void loadExercises(word);
  }, [word, loadExercises]);

  const advance = (score: number) => {
    setScores((prev) => {
      const next = [...prev, score];
      if (next.length === 1) setPhase("meaning");
      else if (next.length === 2) setPhase("replace");
      else if (next.length === 3) {
        setPhase("done");
        markVocabularyWordComplete(wordId);
      }
      return next;
    });
  };

  const handleUseSubmit = async () => {
    if (!word || !userSentence.trim()) return;
    setChecking(true);
    setCheckError(null);
    try {
      const result = await checkUseIt(word, userSentence.trim());
      setUseResult(result);
      if (phase === "use") advance(result.correct ? 100 : 40);
    } catch (err) {
      setCheckError(err instanceof ApiError ? err.message : "Could not check your sentence.");
    } finally {
      setChecking(false);
    }
  };

  const handleMeaningSelect = (index: number) => {
    if (!pickMeaning || meaningResolved || phase !== "meaning") return;
    setSelectedMeaning(index);
    const correct = index === pickMeaning.correctIndex;
    setMeaningResolved(true);
    advance(correct ? 100 : 50);
  };

  const handleReplaceSubmit = async () => {
    if (!word || !replaceIt || !replaceSentence.trim()) return;
    setChecking(true);
    setCheckError(null);
    try {
      const result = await checkReplaceIt(word, replaceIt.weakSentence, replaceSentence.trim());
      setReplaceResult(result);
      if (phase === "replace") advance(result.correct ? 100 : 45);
    } catch (err) {
      setCheckError(err instanceof ApiError ? err.message : "Could not check your rewrite.");
    } finally {
      setChecking(false);
    }
  };

  if (!word) {
    return <p className={styles.subtitle}>Word not found.</p>;
  }

  return (
    <article className={styles.detail}>
      <header>
        <h2 className={styles.title}>{word.word}</h2>
        <div className={styles.wordMeta}>
          <span className={styles.posBadge}>{word.partOfSpeech}</span>
        </div>
        <p className={styles.definition}>{word.definition}</p>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionHeading}>The explanation</h3>
        <div className={styles.explanation}>
          {word.explanation.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <KeyRuleQuote>{word.keyRule}</KeyRuleQuote>
      </section>

      <div className={styles.divider} role="separator" />

      <section className={styles.section}>
        <h3 className={styles.sectionHeading}>See it in action</h3>
        <div className={styles.exampleList}>
          {word.examples.map((example, i) => (
            <HighlightedSentence key={i} example={example} />
          ))}
        </div>
      </section>

      <div className={styles.divider} role="separator" />

      <section className={styles.section}>
        <h3 className={styles.sectionHeading}>Interactive exercises</h3>

        {loading && <p className={styles.loading}>Generating fresh exercises…</p>}

        {!isVocabularyLearningAvailable() && !loading && (
          <p className={styles.subtitle}>
            Exercise generation is not configured. Connect InsForge or add a GROQ API key.
          </p>
        )}

        {error && (
          <div className={styles.exerciseBlock}>
            <p className={exerciseStyles.error} role="alert">
              {error}
            </p>
            <button type="button" className={styles.optionButton} onClick={() => void loadExercises(word)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && useIt && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 1 — Use it</p>
            <div className={exerciseStyles.exercise}>
              <p className={exerciseStyles.instruction}>{useIt.prompt}</p>
              <p className={exerciseStyles.stem}>{useIt.context}</p>
              <textarea
                className={exerciseStyles.completionInput}
                value={userSentence}
                onChange={(e) => setUserSentence(e.target.value)}
                rows={2}
                disabled={Boolean(useResult) || checking}
                placeholder={`Write a sentence using "${word.word}"…`}
              />
              {!useResult && (
                <button
                  type="button"
                  className={exerciseStyles.checkButton}
                  onClick={() => void handleUseSubmit()}
                  disabled={!userSentence.trim() || checking}
                >
                  {checking ? "Checking…" : "Check sentence"}
                </button>
              )}
              {useResult && (
                <div
                  className={`${exerciseStyles.feedback} ${useResult.correct ? exerciseStyles.feedbackCorrect : exerciseStyles.feedbackWrong}`}
                >
                  <p>{useResult.feedback}</p>
                  <p>
                    <strong>Example:</strong> {useResult.exampleSentence}
                  </p>
                  <p className={exerciseStyles.principle}>{useResult.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !error && pickMeaning && scores.length >= 1 && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 2 — Pick the meaning</p>
            <div className={exerciseStyles.exercise}>
              <p className={exerciseStyles.instruction}>
                Which meaning best fits how the word is used here?
              </p>
              <p className={exerciseStyles.stem}>{pickMeaning.sentence}</p>
              <div className={styles.optionGrid}>
                {pickMeaning.options.map((option, index) => {
                  let className = styles.optionButton;
                  if (meaningResolved && index === pickMeaning.correctIndex) {
                    className = `${styles.optionButton} ${styles.optionCorrect}`;
                  } else if (
                    meaningResolved &&
                    selectedMeaning === index &&
                    index !== pickMeaning.correctIndex
                  ) {
                    className = `${styles.optionButton} ${styles.optionWrong}`;
                  }
                  return (
                    <button
                      key={option}
                      type="button"
                      className={className}
                      onClick={() => handleMeaningSelect(index)}
                      disabled={meaningResolved}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {meaningResolved && (
                <p className={exerciseStyles.principle}>{pickMeaning.explanation}</p>
              )}
            </div>
          </div>
        )}

        {!loading && !error && replaceIt && scores.length >= 2 && (
          <div className={styles.exerciseBlock}>
            <p className={styles.exerciseLabel}>Exercise 3 — Replace it</p>
            <div className={exerciseStyles.exercise}>
              <p className={exerciseStyles.instruction}>
                Replace the weak word with a stronger, more precise choice.
              </p>
              <p className={exerciseStyles.stem}>{replaceIt.weakSentence}</p>
              <p className={exerciseStyles.hint}>Hint: {replaceIt.hint}</p>
              <textarea
                className={exerciseStyles.completionInput}
                value={replaceSentence}
                onChange={(e) => setReplaceSentence(e.target.value)}
                rows={2}
                disabled={Boolean(replaceResult) || checking}
                placeholder="Rewrite the sentence with a stronger word…"
              />
              {!replaceResult && (
                <button
                  type="button"
                  className={exerciseStyles.checkButton}
                  onClick={() => void handleReplaceSubmit()}
                  disabled={!replaceSentence.trim() || checking}
                >
                  {checking ? "Checking…" : "Check rewrite"}
                </button>
              )}
              {replaceResult && (
                <div
                  className={`${exerciseStyles.feedback} ${replaceResult.correct ? exerciseStyles.feedbackCorrect : exerciseStyles.feedbackWrong}`}
                >
                  <p>{replaceResult.feedback}</p>
                  <p>
                    <strong>Example:</strong> {replaceResult.exampleSentence}
                  </p>
                  <p className={exerciseStyles.principle}>{replaceResult.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {checkError && (
          <p className={exerciseStyles.error} role="alert">
            {checkError}
          </p>
        )}

        {phase === "done" && (
          <p className={styles.subtitle}>
            All three exercises complete — this word is marked finished for this session.
          </p>
        )}
      </section>
    </article>
  );
}
