import type { ScoreTrajectoryPoint } from "../../lib/pteDashboardStats";
import { PTE_ESSAY_TARGET_65, PTE_ESSAY_TARGET_79 } from "../../lib/pteDashboardStats";
import { PTE_ESSAY_MAX_TOTAL } from "../../lib/pteEssayScoring";
import styles from "./DashboardCharts.module.css";

interface ScoreTrajectoryChartProps {
  data: ScoreTrajectoryPoint[];
  emptyMessage?: string;
}

const WIDTH = 320;
const HEIGHT = 150;
const PAD_X = 14;
const PAD_Y = 18;

export function ScoreTrajectoryChart({ data, emptyMessage }: ScoreTrajectoryChartProps) {
  if (data.length === 0) {
    return <p className={styles.emptyChart}>{emptyMessage ?? "No score data yet."}</p>;
  }

  const min = 0;
  const max = PTE_ESSAY_MAX_TOTAL;
  const range = max - min;
  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_Y * 2;

  const yForScore = (score: number) => PAD_Y + innerH - ((score - min) / range) * innerH;

  const points = data.map((point, index) => {
    const x = PAD_X + (index / Math.max(data.length - 1, 1)) * innerW;
    const y = yForScore(point.score);
    return { x, y, score: point.score };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PAD_Y} L ${points[0].x} ${HEIGHT - PAD_Y} Z`;

  const band65Top = yForScore(PTE_ESSAY_TARGET_79);
  const band65Bottom = yForScore(PTE_ESSAY_TARGET_65);

  return (
    <div className={styles.lineChartWrap}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.lineChart}
        role="img"
        aria-label="Essay score trajectory chart"
      >
        <rect
          x={PAD_X}
          y={band65Top}
          width={innerW}
          height={band65Bottom - band65Top}
          className={styles.targetBand65}
        />
        <rect
          x={PAD_X}
          y={PAD_Y}
          width={innerW}
          height={band65Top - PAD_Y}
          className={styles.targetBand79}
        />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = PAD_Y + innerH * tick;
          return (
            <line key={tick} x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} className={styles.gridLine} />
          );
        })}
        <path d={areaPath} className={styles.lineArea} />
        <path d={linePath} className={styles.lineStroke} />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.5" className={styles.lineDot} />
        ))}
      </svg>
      <div className={styles.lineMeta}>
        <span>Target 65+ (~{PTE_ESSAY_TARGET_65}/26)</span>
        <span>Target 79+ (~{PTE_ESSAY_TARGET_79}/26)</span>
      </div>
    </div>
  );
}
