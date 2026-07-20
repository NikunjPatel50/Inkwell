import { DNA_DIMENSIONS, DNA_DIMENSION_LABELS, type WritingDnaDimensions } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaDimensionBreakdownProps {
  dimensions: WritingDnaDimensions;
}

export function DnaDimensionBreakdown({ dimensions }: DnaDimensionBreakdownProps) {
  return (
    <div className={styles.dimensionGrid}>
      {DNA_DIMENSIONS.map((key) => (
        <div key={key} className={styles.dimensionTile}>
          <p className={styles.dimensionLabel}>{DNA_DIMENSION_LABELS[key]}</p>
          <p className={styles.dimensionValue}>{dimensions[key]}</p>
          <div className={styles.dimensionBar}>
            <div className={styles.dimensionFill} style={{ width: `${dimensions[key]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
