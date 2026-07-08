import { useCallback, useState, type DragEvent, type KeyboardEvent } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { BuildItExercise } from "../../types";
import styles from "./ExerciseShared.module.css";

interface BuildItExerciseProps {
  exercise: BuildItExercise;
  onComplete: (score: number) => void;
}

export function BuildItExerciseView({ exercise, onComplete }: BuildItExerciseProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [pool, setPool] = useState(() => [...exercise.words]);
  const [built, setBuilt] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [keyboardPick, setKeyboardPick] = useState<string | null>(null);

  const moveToBuilt = useCallback((word: string, fromPool: boolean) => {
    if (submitted) return;
    if (fromPool) {
      setPool((p) => {
        const idx = p.indexOf(word);
        if (idx === -1) return p;
        const next = [...p];
        next.splice(idx, 1);
        return next;
      });
      setBuilt((b) => [...b, word]);
    }
  }, [submitted]);

  const moveToPool = useCallback((index: number) => {
    if (submitted) return;
    setBuilt((b) => {
      const word = b[index];
      if (!word) return b;
      setPool((p) => [...p, word]);
      return b.filter((_, i) => i !== index);
    });
  }, [submitted]);

  const handleDragStart = (word: string) => (event: DragEvent) => {
    event.dataTransfer.setData("text/plain", word);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnBuilt = (event: DragEvent) => {
    event.preventDefault();
    const word = event.dataTransfer.getData("text/plain");
    if (word && pool.includes(word)) moveToBuilt(word, true);
  };

  const handleDropOnPool = (event: DragEvent) => {
    event.preventDefault();
    const word = event.dataTransfer.getData("text/plain");
    if (!word) return;
    const builtIndex = built.indexOf(word);
    if (builtIndex >= 0) moveToPool(builtIndex);
  };

  const handleCheck = () => {
    const correct =
      built.length === exercise.correctOrder.length &&
      built.every((w, i) => w === exercise.correctOrder[i]);
    setIsCorrect(correct);
    setSubmitted(true);
    onComplete(correct ? 100 : 0);
  };

  const handleChipKeyDown = (word: string) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setKeyboardPick(word);
    }
  };

  const handleBuiltKeyDown = (event: KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && keyboardPick && pool.includes(keyboardPick)) {
      event.preventDefault();
      moveToBuilt(keyboardPick, true);
      setKeyboardPick(null);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.instruction}>Arrange the words into a correct sentence.</p>

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnBuilt}
        onKeyDown={handleBuiltKeyDown}
        tabIndex={0}
        aria-label="Your sentence — drop words here"
      >
        {built.length === 0 ? (
          <span className={styles.dropPlaceholder}>Drop words here…</span>
        ) : (
          <div className={styles.chipRow}>
            {built.map((word, index) => (
              <button
                key={`${word}-${index}`}
                type="button"
                className={styles.chip}
                draggable={!submitted}
                onDragStart={handleDragStart(word)}
                onClick={() => moveToPool(index)}
                disabled={submitted}
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={styles.pool}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnPool}
        aria-label="Word pool"
      >
        {pool.map((word, index) => (
          <button
            key={`${word}-pool-${index}`}
            type="button"
            className={`${styles.chip} ${keyboardPick === word ? styles.chipSelected : ""} ${!reducedMotion ? styles.chipDraggable : ""}`}
            draggable={!submitted}
            onDragStart={handleDragStart(word)}
            onClick={() => moveToBuilt(word, true)}
            onKeyDown={handleChipKeyDown(word)}
            disabled={submitted}
          >
            {word}
          </button>
        ))}
      </div>

      {!submitted && (
        <button
          type="button"
          className={styles.checkButton}
          onClick={handleCheck}
          disabled={built.length !== exercise.words.length}
        >
          Check my sentence
        </button>
      )}

      {submitted && (
        <div
          className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
        >
          {isCorrect ? (
            <p>Your order works — {exercise.explanation}</p>
          ) : (
            <>
              <p>
                Correct order:{" "}
                <strong>{exercise.correctOrder.join(" ")}</strong>
              </p>
              <p>{exercise.explanation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
