import { useState } from "react";
import type { CompleteItExercise } from "../../types";
import type { CurriculumSkill } from "../../constants/curriculum";
import { checkCompleteIt } from "../../lib/learnClient";
import { ApiError } from "../../lib/apiClient";
import styles from "./ExerciseShared.module.css";

interface CompleteItExerciseProps {
  exercise: CompleteItExercise;
  skill: CurriculumSkill;
  onComplete: (score: number) => void;
}

export function CompleteItExerciseView({
  exercise,
  skill,
  onComplete,
}: CompleteItExerciseProps) {
  const [completion, setCompletion] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    exampleCompletion: string;
    principle: string;
  } | null>(null);

  const handleSubmit = async () => {
    const trimmed = completion.trim();
    if (!trimmed) return;

    setChecking(true);
    setError(null);

    try {
      const check = await checkCompleteIt(exercise.stem, trimmed, skill);
      setResult(check);
      setSubmitted(true);
      onComplete(check.correct ? 100 : 40);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not check your completion.";
      setError(message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.instruction}>Complete the sentence.</p>
      <p className={styles.stem}>{exercise.stem}</p>
      <p className={styles.hint}>Hint: {exercise.hint}</p>

      <label className={styles.srOnly} htmlFor="complete-it-input">
        Your completion
      </label>
      <textarea
        id="complete-it-input"
        className={styles.completionInput}
        value={completion}
        onChange={(e) => setCompletion(e.target.value)}
        rows={2}
        disabled={submitted || checking}
        placeholder="Type your completion…"
      />

      {!submitted && (
        <button
          type="button"
          className={styles.checkButton}
          onClick={handleSubmit}
          disabled={!completion.trim() || checking}
        >
          {checking ? "Checking…" : "Check completion"}
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
          <div className={styles.comparison}>
            <div>
              <p className={styles.compareLabel}>Your completion</p>
              <p>{completion.trim()}</p>
            </div>
            <div>
              <p className={styles.compareLabel}>Example completion</p>
              <p>{result.exampleCompletion}</p>
            </div>
          </div>
          <p>{result.feedback}</p>
          <p className={styles.principle}>{result.principle}</p>
        </div>
      )}
    </div>
  );
}
