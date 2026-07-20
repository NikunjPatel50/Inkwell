"use client";

import { useEffect, useState } from "react";
import styles from "./WritingDna.module.css";

interface DnaScoreGaugeProps {
  score: number;
}

export function DnaScoreGauge({ score }: DnaScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={styles.gaugeShell}>
      <svg viewBox="0 0 100 100" className={styles.gauge} aria-hidden="true">
        <defs>
          <linearGradient id="dnaGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a9e96" />
            <stop offset="100%" stopColor="#5ec9c2" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} className={styles.gaugeTrack} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={styles.gaugeProgress}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.gaugeCenter}>
        <span className={styles.gaugeScore}>{animated}</span>
        <span className={styles.gaugeLabel}>DNA Score</span>
      </div>
    </div>
  );
}
