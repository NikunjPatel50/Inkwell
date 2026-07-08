import type { DailyActivityPoint } from "../../lib/dashboardMetrics";
import styles from "./DashboardCharts.module.css";

interface ActivityBarChartProps {
  data: DailyActivityPoint[];
  emptyMessage?: string;
}

export function ActivityBarChart({ data, emptyMessage }: ActivityBarChartProps) {
  const max = Math.max(...data.map((point) => point.count), 1);
  const hasData = data.some((point) => point.count > 0);

  if (!hasData && emptyMessage) {
    return <p className={styles.emptyChart}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.barChart} role="img" aria-label="Daily practice activity chart">
      <div className={styles.barPlot}>
        {data.map((point) => {
          const height = Math.max((point.count / max) * 100, point.count > 0 ? 8 : 2);
          return (
            <div key={point.dateKey} className={styles.barColumn}>
              <span className={styles.barValue}>{point.count > 0 ? point.count : ""}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ height: `${height}%` }} />
              </div>
              <span className={styles.barLabel}>{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
