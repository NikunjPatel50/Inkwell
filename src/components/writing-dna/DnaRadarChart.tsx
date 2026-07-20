import type { WritingDnaDimensions } from "../../types/writingDna";
import styles from "./WritingDna.module.css";

interface DnaRadarChartProps {
  dimensions: WritingDnaDimensions;
}

const ORDER: Array<keyof WritingDnaDimensions> = [
  "grammar",
  "vocabulary",
  "clarity",
  "structure",
  "flow",
  "style",
  "confidence",
  "consistency",
];

export function DnaRadarChart({ dimensions }: DnaRadarChartProps) {
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const angleStep = (Math.PI * 2) / ORDER.length;

  const points = ORDER.map((key, index) => {
    const value = dimensions[key] / 100;
    const angle = angleStep * index - Math.PI / 2;
    const x = center + Math.cos(angle) * radius * value;
    const y = center + Math.sin(angle) * radius * value;
    return `${x},${y}`;
  }).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className={styles.radarWrap}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" role="img" aria-label="Writing DNA radar chart">
        {gridLevels.map((level) => {
          const ring = ORDER.map((_, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = center + Math.cos(angle) * radius * level;
            const y = center + Math.sin(angle) * radius * level;
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={ring}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={points}
          fill="rgba(26, 158, 150, 0.2)"
          stroke="var(--color-brand-teal)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
