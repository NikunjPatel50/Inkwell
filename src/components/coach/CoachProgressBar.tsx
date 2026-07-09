import styles from "./CoachShared.module.css";

interface CoachProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export function CoachProgressBar({ value, max = 100, label }: CoachProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={styles.card} style={{ gap: "0.45rem", padding: "0.75rem 0.85rem" }}>
      {label && <p className={styles.sectionHint}>{label}</p>}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          height: "0.45rem",
          borderRadius: "999px",
          background: "var(--color-workspace-bg)",
          border: "1px solid var(--color-chrome-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--color-brand-teal)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <p className={styles.sectionHint}>{pct}% complete</p>
    </div>
  );
}
