import { useState } from "react";
import type { GrammarTopic } from "../../constants/grammarTopics";
import type {
  GrammarExerciseResult,
  TransformItExercise,
  TransformItResult,
} from "../../types";
import { checkTransformIt } from "../../lib/grammarClient";
import { ApiError } from "../../lib/apiClient";
import styles from "../exercises/ExerciseShared.module.css";

interface TransformItExerciseViewProps {
  exercise: TransformItExercise;
  topic: GrammarTopic;
  onComplete: (result: GrammarExerciseResult) => void;
}

export function TransformItExerciseView({
  exercise,
  topic,
  onComplete,
}: TransformItExerciseViewProps) {
  const [rewrite, setRewrite] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<TransformItResult | null>(null);

  const handleSubmit = async () => {
    const trimmed = rewrite.trim();
    if (!trimmed) return;

    setChecking(true);
    setError(null);

    try {
      const check = await checkTransformIt(topic, exercise.originalSentence, trimmed);
      setResult(check);
      setSubmitted(true);
      onComplete({
        label: "Transform it",
        passed: check.correct,
        reviewNote: check.explanation,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not check your rewrite.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.instruction}>{exercise.prompt}</p>
      <p className={styles.stem}>{exercise.originalSentence}</p>

      <label className={styles.srOnly} htmlFor="transform-it-input">
        Your rewrite
      </label>
      <textarea
        id="transform-it-input"
        className={styles.completionInput}
        value={rewrite}
        onChange={(e) => setRewrite(e.target.value)}
        rows={3}
        disabled={submitted || checking}
        placeholder="Rewrite the sentence here…"
      />

      {!submitted && (
        <button
          type="button"
          className={styles.checkButton}
          onClick={handleSubmit}
          disabled={!rewrite.trim() || checking}
        >
          {checking ? "Checking…" : "Check rewrite"}
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
          <div className={styles.comparison}>
            <div>
              <p className={styles.compareLabel}>Your rewrite</p>
              <p>{rewrite.trim()}</p>
            </div>
            <div>
              <p className={styles.compareLabel}>Model answer</p>
              <p>{result.modelAnswer}</p>
            </div>
          </div>
          <p className={styles.principle}>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
