import type { TraitAverage } from "../../lib/pteDashboardStats";
import { traitBarBand } from "../../lib/pteDashboardStats";
import styles from "./DashboardCharts.module.css";

interface TraitBreakdownChartProps {
  traits: TraitAverage[];
  emptyMessage?: string;
  hasData?: boolean;
}

export function TraitBreakdownChart({ traits, emptyMessage, hasData = true }: TraitBreakdownChartProps) {
  if (!hasData || traits.length === 0) {
    return <p className={styles.emptyChart}>{emptyMessage ?? "No trait data yet."}</p>;
  }

  return (
    <ul className={styles.traitBars}>
      {traits.map((trait) => {
        const band = traitBarBand(trait.ratio);
        const width = `${Math.round(trait.ratio * 100)}%`;

        return (
          <li key={trait.id} className={styles.traitBarRow}>
            <div className={styles.traitBarLabelRow}>
              <span className={styles.traitBarLabel}>{trait.label}</span>
              <span className={styles.traitBarScore}>
                {trait.averageScore.toFixed(1)}/{trait.maxScore}
              </span>
            </div>
            <div className={styles.traitBarTrack}>
              <div
                className={`${styles.traitBarFill} ${styles[`traitBar${band.charAt(0).toUpperCase()}${band.slice(1)}`]}`}
                style={{ width }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
