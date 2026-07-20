import styles from "../dashboard/DashboardCharts.module.css";

interface DnaLineChartProps {
  data: Array<{ label: string; score: number }>;
  emptyMessage?: string;
}

const WIDTH = 320;
const HEIGHT = 150;
const PAD_X = 14;
const PAD_Y = 18;

export function DnaLineChart({ data, emptyMessage }: DnaLineChartProps) {
  if (data.length === 0) {
    return <p className={styles.emptyChart}>{emptyMessage ?? "No score data yet."}</p>;
  }

  const min = 0;
  const max = 100;
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

  return (
    <div className={styles.lineChartWrap}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.lineChart}
        role="img"
        aria-label="DNA score trajectory chart"
      >
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
    </div>
  );
}
