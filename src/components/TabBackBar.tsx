import styles from "./TabBackBar.module.css";

interface TabBackBarProps {
  label: string;
  onBack: () => void;
}

export function TabBackBar({ label, onBack }: TabBackBarProps) {
  return (
    <div className={styles.topBar}>
      <button type="button" className={styles.backButton} onClick={onBack}>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.backIcon}>
          <path
            d="M10 3.5 5.5 8 10 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.backEyebrow}>Back to</span>
        <span className={styles.backLabel}>{label}</span>
      </button>
    </div>
  );
}
