import type { PatternSlice } from "../../lib/dashboardMetrics";
import styles from "./DashboardCharts.module.css";

interface PatternDonutChartProps {
  data: PatternSlice[];
  emptyMessage?: string;
}

const SIZE = 160;
const RADIUS = 52;
const STROKE = 18;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PatternDonutChart({ data, emptyMessage }: PatternDonutChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return <p className={styles.emptyChart}>{emptyMessage ?? "No error patterns yet."}</p>;
  }

  let offset = 0;

  return (
    <div className={styles.donutLayout}>
      <div className={styles.donutChart} role="img" aria-label="Error pattern distribution chart">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.donutSvg}>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            className={styles.donutTrack}
            strokeWidth={STROKE}
            fill="none"
          />
          {data.map((slice) => {
            const length = (slice.value / total) * CIRCUMFERENCE;
            const dasharray = `${length} ${CIRCUMFERENCE - length}`;
            const dashoffset = -offset;
            offset += length;
            return (
              <circle
                key={slice.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                stroke={slice.color}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                className={styles.donutSlice}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
              />
            );
          })}
        </svg>
        <div className={styles.donutCenter}>
          <span className={styles.donutTotal}>{total}</span>
          <span className={styles.donutTotalLabel}>errors</span>
        </div>
      </div>
      <ul className={styles.legend}>
        {data.map((slice) => (
          <li key={slice.label} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: slice.color }} />
            <span className={styles.legendLabel}>{slice.label}</span>
            <span className={styles.legendValue}>{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
