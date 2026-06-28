import type { CSSProperties } from "react";
import { registerMeterLabel } from "../lib/registerScore";
import styles from "./RegisterMeter.module.css";

interface RegisterMeterProps {
  score: number;
  animate?: boolean;
}

export function RegisterMeter({ score, animate = true }: RegisterMeterProps) {
  const label = registerMeterLabel(score);

  return (
    <section className={styles.meter} aria-labelledby="register-meter-heading">
      <h2 id="register-meter-heading" className={styles.srOnly}>
        Writing register
      </h2>

      <div
        className={styles.track}
        role="img"
        aria-label={`${label}. Score ${score} out of 100.`}
      >
        <div
          className={`${styles.marker} ${animate ? styles.markerAnimate : ""}`}
          style={{ "--register-score": `${score}%` } as CSSProperties}
          aria-hidden="true"
        />
      </div>

      <div className={styles.labels}>
        <span className={styles.axisLabel}>Simple</span>
        <span className={styles.axisLabel}>Advanced</span>
      </div>

      <p className={styles.readout}>{label}</p>
    </section>
  );
}
