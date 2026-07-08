import { useEffect, useRef, useState } from "react";
import styles from "./CountdownTimer.module.css";

interface CountdownTimerProps {
  durationSeconds: number;
  running: boolean;
  resetKey: number;
  reducedMotion: boolean;
  onComplete: () => void;
}

export function CountdownTimer({
  durationSeconds,
  running,
  resetKey,
  reducedMotion,
  onComplete,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setSecondsLeft(durationSeconds);
    completedRef.current = false;
  }, [durationSeconds, resetKey]);

  useEffect(() => {
    if (!running) return;

    if (secondsLeft <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, secondsLeft, resetKey]);

  const progress = Math.max(0, Math.min(1, secondsLeft / durationSeconds));

  return (
    <div
      className={styles.timer}
      role="timer"
      aria-live="polite"
      aria-label={`${secondsLeft} seconds remaining`}
    >
      {reducedMotion ? (
        <span className={styles.staticTime}>{secondsLeft}s</span>
      ) : (
        <div className={styles.barTrack} aria-hidden="true">
          <div className={styles.barFill} style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}
      <span className={styles.label}>
        {secondsLeft > 0 ? `${secondsLeft}s left` : "Time's up"}
      </span>
    </div>
  );
}
