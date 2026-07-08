import type { RegisterTrendPoint } from "../../lib/dashboardMetrics";
import styles from "./DashboardCharts.module.css";

interface RegisterLineChartProps {
  data: RegisterTrendPoint[];
  emptyMessage?: string;
}

const WIDTH = 320;
const HEIGHT = 140;
const PAD_X = 12;
const PAD_Y = 16;

export function RegisterLineChart({ data, emptyMessage }: RegisterLineChartProps) {
  if (data.length === 0) {
    return <p className={styles.emptyChart}>{emptyMessage ?? "No register data yet."}</p>;
  }

  const scores = data.map((point) => point.score);
  const min = Math.max(0, Math.min(...scores) - 8);
  const max = Math.min(100, Math.max(...scores) + 8);
  const range = Math.max(max - min, 1);
  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_Y * 2;

  const points = data.map((point, index) => {
    const x = PAD_X + (index / Math.max(data.length - 1, 1)) * innerW;
    const y = PAD_Y + innerH - ((point.score - min) / range) * innerH;
    return { x, y, score: point.score };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PAD_Y} L ${points[0].x} ${HEIGHT - PAD_Y} Z`;

  return (
    <div className={styles.lineChartWrap}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.lineChart}
        role="img"
        aria-label="Register score trend chart"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = PAD_Y + innerH * tick;
          return (
            <line
              key={tick}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              className={styles.gridLine}
            />
          );
        })}
        <path d={areaPath} className={styles.lineArea} />
        <path d={linePath} className={styles.lineStroke} />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.5" className={styles.lineDot} />
        ))}
      </svg>
      <div className={styles.lineMeta}>
        <span>Low {Math.round(min)}</span>
        <span>High {Math.round(max)}</span>
      </div>
    </div>
  );
}
