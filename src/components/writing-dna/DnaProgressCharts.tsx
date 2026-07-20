import { DnaLineChart } from "./DnaLineChart";
import type { WritingDnaDashboard } from "../../types/writingDna";
import { DnaRadarChart } from "./DnaRadarChart";
import styles from "./WritingDna.module.css";
import chartStyles from "../dashboard/DashboardCharts.module.css";

interface DnaProgressChartsProps {
  dashboard: WritingDnaDashboard;
}

function MiniBarChart({
  data,
  labelKey,
  valueKey,
  emptyMessage,
}: {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
  emptyMessage: string;
}) {
  if (data.length === 0) {
    return <p className={styles.emptyState}>{emptyMessage}</p>;
  }

  const max = Math.max(...data.map((row) => Number(row[valueKey])), 1);

  return (
    <div className={styles.barPlotScroll}>
      <div className={styles.dnaBarPlot}>
        {data.map((row, index) => {
          const value = Number(row[valueKey]);
          const label = String(row[labelKey]);
          return (
            <div key={`${label}-${index}`} className={chartStyles.barColumn}>
              <span className={chartStyles.barValue}>{value}</span>
              <div className={chartStyles.barTrack}>
                <div
                  className={chartStyles.barFill}
                  style={{ height: `${Math.round((value / max) * 100)}%` }}
                />
              </div>
              <span className={chartStyles.barLabel}>{label.slice(-5)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DnaProgressCharts({ dashboard }: DnaProgressChartsProps) {
  const trajectory = dashboard.progress.monthlyScores.map((point) => ({
    score: point.score,
    label: point.date,
  }));

  const grammarSeries = dashboard.progress.monthlyScores.map((point) => ({
    label: point.date,
    value: point.grammar,
  }));

  const vocabSeries = dashboard.progress.monthlyScores.map((point) => ({
    label: point.date,
    value: point.vocabulary,
  }));

  const weeklyBars = dashboard.progress.weeklyScores.map((point) => ({
    week: point.week,
    score: point.score,
  }));

  const dimensions = dashboard.profile?.dimensions ?? {
    grammar: 0,
    vocabulary: 0,
    clarity: 0,
    structure: 0,
    flow: 0,
    style: 0,
    confidence: 0,
    consistency: 0,
  };

  return (
    <div className={styles.progressStack}>
      <div>
        <p className={styles.coachHeading}>DNA score trend</p>
        <DnaLineChart
          data={trajectory.map((point) => ({ label: point.label, score: point.score }))}
          emptyMessage="Score history appears after your first submissions."
        />
      </div>
      <div>
        <p className={styles.coachHeading}>Weekly scores</p>
        <MiniBarChart
          data={weeklyBars}
          labelKey="week"
          valueKey="score"
          emptyMessage="Weekly aggregation starts after a few sessions."
        />
      </div>
      <div className={styles.chartSplit}>
        <div>
          <p className={styles.coachHeading}>Grammar</p>
          <MiniBarChart
            data={grammarSeries}
            labelKey="label"
            valueKey="value"
            emptyMessage="No grammar trend yet."
          />
        </div>
        <div>
          <p className={styles.coachHeading}>Vocabulary</p>
          <MiniBarChart
            data={vocabSeries}
            labelKey="label"
            valueKey="value"
            emptyMessage="No vocabulary trend yet."
          />
        </div>
      </div>
      <div>
        <p className={styles.coachHeading}>Dimension radar</p>
        <DnaRadarChart dimensions={dimensions} />
      </div>
    </div>
  );
}
