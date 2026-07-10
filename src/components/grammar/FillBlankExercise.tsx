import { useState } from "react";
import type { GrammarTopic } from "../../constants/grammarTopics";
import type { FillBlankExercise, FillBlankResult } from "../../types";
import { checkFillBlank } from "../../lib/grammarClient";
import { ApiError } from "../../lib/apiClient";
import styles from "../exercises/ExerciseShared.module.css";

interface FillBlankExerciseViewProps {
  exercise: FillBlankExercise;
  topic: GrammarTopic;
  onComplete: (score: number) => void;
}

export function FillBlankExerciseView({
  exercise,
  topic,
  onComplete,
}: FillBlankExerciseViewProps) {
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<FillBlankResult | null>(null);

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed) return;

    setChecking(true);
    setError(null);

    try {
      const check = await checkFillBlank(topic, exercise.stem, trimmed);
      setResult(check);
      setSubmitted(true);
      onComplete(check.correct ? 100 : 40);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not check your answer.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.instruction}>Fill in the blank to complete the sentence.</p>
      <p className={styles.stem}>{exercise.stem}</p>
      <p className={styles.hint}>Hint: {exercise.hint}</p>

      <label className={styles.srOnly} htmlFor="fill-blank-input">
        Your answer
      </label>
      <input
        id="fill-blank-input"
        className={styles.completionInput}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted || checking}
        placeholder="Type the missing word or phrase…"
      />

      {!submitted && (
        <button
          type="button"
          className={styles.checkButton}
          onClick={handleSubmit}
          disabled={!answer.trim() || checking}
        >
          {checking ? "Checking…" : "Check answer"}
        </button>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {submitted && result && (
        <div
          className={`${styles.feedback} ${result.correct ? styles.feedbackCorrect : styles.feedbackWrong}`}
        >
          <p>{result.feedback}</p>
          {!result.correct && (
            <p>
              <strong>Correct answer:</strong> {result.correctAnswer}
            </p>
          )}
          <p className={styles.principle}>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
