import { WRITING_MODES, type WritingMode } from "../types/writingMode";
import styles from "./WritingModeSelector.module.css";

interface WritingModeSelectorProps {
  selectedMode: WritingMode;
  disabled?: boolean;
  onModeChange: (mode: WritingMode) => void;
}

export function WritingModeSelector({
  selectedMode,
  disabled = false,
  onModeChange,
}: WritingModeSelectorProps) {
  return (
    <div className={styles.selector} role="group" aria-label="Writing mode">
      <span className={styles.label}>Mode</span>
      <div className={styles.pills}>
        {WRITING_MODES.map((mode) => {
          const isActive = selectedMode === mode.value;

          return (
            <button
              key={mode.value}
              type="button"
              className={`${styles.pill} ${isActive ? styles.pillActive : ""}`}
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onModeChange(mode.value)}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
