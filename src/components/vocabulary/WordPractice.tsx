"use client";

import { useState } from "react";
import type { WordPracticeExercise, WordUsageResult } from "../../types";
import { ApiError } from "../../lib/apiClient";
import styles from "../exercises/ExerciseShared.module.css";
import learningStyles from "../learning/LearningTab.module.css";

interface WordPracticeProps {
  word: string;
  exercise: WordPracticeExercise;
  onCheckUsage: (sentence: string) => Promise<WordUsageResult>;
}

export function WordPractice({ word, exercise, onCheckUsage }: WordPracticeProps) {
  const [fillAnswer, setFillAnswer] = useState("");
  const [fillSubmitted, setFillSubmitted] = useState(false);
  const [fillCorrect, setFillCorrect] = useState(false);
  const [usageSentence, setUsageSentence] = useState("");
  const [usageChecking, setUsageChecking] = useState(false);
  const [usageResult, setUsageResult] = useState<WordUsageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFillSubmit = () => {
    const normalized = fillAnswer.trim().toLowerCase();
    const expected = exercise.fillBlank.answer.trim().toLowerCase();
    setFillCorrect(normalized === expected);
    setFillSubmitted(true);
  };

  const handleUsageSubmit = async () => {
    const trimmed = usageSentence.trim();
    if (!trimmed) return;

    setUsageChecking(true);
    setError(null);
    try {
      const result = await onCheckUsage(trimmed);
      setUsageResult(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not check your sentence.");
    } finally {
      setUsageChecking(false);
    }
  };

  return (
    <div className={learningStyles.exerciseBlock}>
      <p className={learningStyles.exerciseLabel}>Practice — {word}</p>

      <div className={styles.exercise}>
        <p className={styles.instruction}>Fill in the blank</p>
        <p className={styles.stem}>{exercise.fillBlank.sentence}</p>
        <input
          className={styles.completionInput}
          value={fillAnswer}
          onChange={(event) => setFillAnswer(event.target.value)}
          disabled={fillSubmitted}
          placeholder="Type the missing word…"
        />
        {!fillSubmitted && (
          <button
            type="button"
            className={styles.checkButton}
            onClick={handleFillSubmit}
            disabled={!fillAnswer.trim()}
          >
            Check answer
          </button>
        )}
        {fillSubmitted && (
          <div
            className={`${styles.feedback} ${fillCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
          >
            <p>
              {fillCorrect
                ? "Correct — you recalled the word in context."
                : `Not quite. The answer is "${exercise.fillBlank.answer}".`}
            </p>
          </div>
        )}
      </div>

      {fillSubmitted && (
        <div className={styles.exercise}>
          <p className={styles.instruction}>{exercise.useItYourself.prompt}</p>
          <textarea
            className={styles.completionInput}
            value={usageSentence}
            onChange={(event) => setUsageSentence(event.target.value)}
            rows={3}
            disabled={Boolean(usageResult)}
            placeholder="Write your sentence…"
          />
          {!usageResult && (
            <button
              type="button"
              className={styles.checkButton}
              onClick={() => void handleUsageSubmit()}
              disabled={!usageSentence.trim() || usageChecking}
            >
              {usageChecking ? "Checking…" : "Check sentence"}
            </button>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {usageResult && (
            <div
              className={`${styles.feedback} ${usageResult.correct ? styles.feedbackCorrect : styles.feedbackWrong}`}
            >
              <p>{usageResult.feedback}</p>
              <p className={styles.principle}>Example: {usageResult.exampleSentence}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
