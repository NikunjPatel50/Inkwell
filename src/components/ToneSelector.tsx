import { TONES, type Tone } from "../types";
import styles from "./ToneSelector.module.css";

interface ToneSelectorProps {
  selectedTone: Tone;
  disabled?: boolean;
  onToneChange: (tone: Tone) => void;
}

export function ToneSelector({ selectedTone, disabled = false, onToneChange }: ToneSelectorProps) {
  return (
    <div className={styles.selector} role="group" aria-label="Rewrite tone">
      <span className={styles.label}>Tone</span>
      <div className={styles.pills}>
        {TONES.map((tone) => {
          const isActive = selectedTone === tone.value;

          return (
            <button
              key={tone.value}
              type="button"
              className={`${styles.pill} ${isActive ? styles.pillActive : ""}`}
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onToneChange(tone.value)}
            >
              {tone.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
