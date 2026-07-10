import { useState } from "react";
import type { IdentifyItExercise } from "../../types";
import styles from "../exercises/ExerciseShared.module.css";

interface IdentifyItExerciseViewProps {
  exercise: IdentifyItExercise;
  onComplete: (score: number) => void;
}

function phraseLength(phrase: string): number {
  return phrase.split(/\s+/).length;
}

export function IdentifyItExerciseView({ exercise, onComplete }: IdentifyItExerciseViewProps) {
  const tokens = exercise.sentence.split(/\s+/);
  const targetLen = phraseLength(exercise.targetPhrase);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const isTargetIndex = (index: number) =>
    index >= exercise.targetIndex && index < exercise.targetIndex + targetLen;

  const handleSelect = (index: number) => {
    if (resolved) return;

    setSelectedIndex(index);
    const correct = isTargetIndex(index);
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

    setHint(exercise.hint);
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.instruction}>
        Click the word or phrase that matches this grammar concept.
      </p>

      <p className={styles.sentenceLine}>
        {tokens.map((token, index) => {
          const isSelected = selectedIndex === index;
          const showCorrect = resolved && isTargetIndex(index);
          const showWrong =
            isSelected && !wasCorrect && resolved && !isTargetIndex(index);
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
          <p>{wasCorrect ? exercise.confirmation : exercise.explanation}</p>
          {!wasCorrect && (
            <p>
              <strong>Answer:</strong> {exercise.targetPhrase}
            </p>
          )}
          {!wasCorrect && <p className={styles.principle}>{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
