import { useState } from "react";
import type { SpotTheErrorExercise } from "../../types";
import styles from "./ExerciseShared.module.css";

interface SpotTheErrorExerciseProps {
  exercise: SpotTheErrorExercise;
  onComplete: (score: number) => void;
}

export function SpotTheErrorExerciseView({ exercise, onComplete }: SpotTheErrorExerciseProps) {
  const tokens = exercise.sentence.split(/\s+/);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleSelect = (index: number) => {
    if (resolved) return;

    setSelectedIndex(index);
    const correct = index === exercise.errorIndex;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (correct) {
      setWasCorrect(true);
      setResolved(true);
      onComplete(nextAttempts === 1 ? 100 : 75);
      return;
    }

    if (nextAttempts >= 2) {
      setResolved(true);
      setWasCorrect(false);
      onComplete(50);
      return;
    }

    setHint("Not quite — look at word order, agreement, or punctuation nearby.");
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.instruction}>Click the word you think is wrong.</p>

      <p className={styles.sentenceLine}>
        {tokens.map((token, index) => {
          const isSelected = selectedIndex === index;
          const showCorrect = resolved && index === exercise.errorIndex;
          const showWrong = isSelected && !wasCorrect && resolved && index !== exercise.errorIndex;
          const showPending = isSelected && !resolved;

          let className = styles.word;
          if (showCorrect) className = `${styles.word} ${styles.wordCorrect}`;
          else if (showWrong) className = `${styles.word} ${styles.wordWrong}`;
          else if (showPending) className = `${styles.word} ${styles.wordPending}`;

          return (
            <button
              key={`${token}-${index}`}
              type="button"
              className={className}
              onClick={() => handleSelect(index)}
              disabled={resolved}
            >
              {token}
            </button>
          );
        })}
      </p>

      {hint && !resolved && <p className={styles.hint}>{hint}</p>}

      {resolved && (
        <div
          className={`${styles.feedback} ${wasCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
        >
          <p>
            <strong>Corrected:</strong> {exercise.correction}
          </p>
          <p className={styles.principle}>{exercise.principle}</p>
        </div>
      )}
    </div>
  );
}
