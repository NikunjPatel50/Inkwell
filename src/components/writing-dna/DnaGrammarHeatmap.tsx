import type { GrammarHeatmapCell } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaGrammarHeatmapProps {
  cells: GrammarHeatmapCell[];
}

function heatLevel(count: number): string {
  if (count >= 12) return styles.calendarActive4;
  if (count >= 8) return styles.calendarActive3;
  if (count >= 4) return styles.calendarActive2;
  if (count >= 1) return styles.calendarActive1;
  return "";
}

export function DnaGrammarHeatmap({ cells }: DnaGrammarHeatmapProps) {
  const max = Math.max(...cells.map((cell) => cell.mistakeCount), 1);

  return (
    <div className={styles.heatmapGrid} role="list" aria-label="Grammar mistake heatmap">
      {cells.map((cell) => (
        <div
          key={cell.category}
          className={`${styles.heatmapCell} ${heatLevel(cell.mistakeCount)}`}
          role="listitem"
          title={`${cell.label}: ${cell.mistakeCount} mistakes`}
        >
          <p className={styles.heatmapLabel}>{cell.label}</p>
          <p className={styles.heatmapCount}>{cell.mistakeCount}</p>
          <div className={styles.dimensionBar}>
            <div
              className={styles.dimensionFill}
              style={{ width: `${Math.round((cell.mistakeCount / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
