import { useEffect, useMemo, useState } from "react";
import { getSkillById } from "../constants/curriculum";
import { ActivityBarChart } from "./dashboard/ActivityBarChart";
import { DashboardCard } from "./dashboard/DashboardCard";
import { PatternDonutChart } from "./dashboard/PatternDonutChart";
import { RegisterLineChart } from "./dashboard/RegisterLineChart";
import { getAdaptiveRecommendation } from "../lib/adaptiveEngine";
import { ApiError, fetchHistory, fetchVocabulary } from "../lib/apiClient";
import {
  buildDailyActivity,
  buildPatternDistribution,
  buildRegisterTrend,
  computeRegisterDelta,
  DEMO_ACTIVITY,
  DEMO_PATTERNS,
  DEMO_REGISTER,
} from "../lib/dashboardMetrics";
import { fetchPracticedSkills } from "../lib/learnClient";
import { TabPageShell } from "./TabPageShell";
import type { AnalyzedSentenceRow, AppTab, PracticedSkill, SkillPatternRow } from "../types";
import styles from "./DashboardTab.module.css";

interface DashboardTabProps {
  isAuthenticated: boolean;
  refreshKey: number;
  practiceCount: number;
  skillPatterns: SkillPatternRow[];
  onSignIn: () => void;
  onTabChange: (tab: AppTab) => void;
}

function averageRegisterScore(sentences: AnalyzedSentenceRow[]): number | null {
  if (sentences.length === 0) return null;
  const total = sentences.reduce((sum, sentence) => sum + sentence.register_score, 0);
  return Math.round(total / sentences.length);
}

function MetricTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string | number;
  hint: string;
  delta?: number | null;
}) {
  return (
    <div className={styles.metricTile}>
      <p className={styles.metricLabel}>{label}</p>
      <div className={styles.metricRow}>
        <p className={styles.metricValue}>{value}</p>
        {delta !== null && delta !== undefined && (
          <span className={`${styles.metricDelta} ${delta >= 0 ? styles.metricDeltaUp : styles.metricDeltaDown}`}>
            {delta >= 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
      <p className={styles.metricHint}>{hint}</p>
    </div>
  );
}

function DashboardBody({
  isPreview,
  practiceCount,
  sentences,
  skillPatterns,
  vocabularyCount,
  practiced,
  onSignIn,
  onTabChange,
  loading,
  error,
}: {
  isPreview: boolean;
  practiceCount: number;
  sentences: AnalyzedSentenceRow[];
  skillPatterns: SkillPatternRow[];
  vocabularyCount: number;
  practiced: PracticedSkill[];
  onSignIn: () => void;
  onTabChange: (tab: AppTab) => void;
  loading?: boolean;
  error?: string | null;
}) {
  const activity = useMemo(
    () => (isPreview ? DEMO_ACTIVITY : buildDailyActivity(sentences)),
    [isPreview, sentences],
  );
  const registerTrend = useMemo(
    () => (isPreview ? DEMO_REGISTER : buildRegisterTrend(sentences)),
    [isPreview, sentences],
  );
  const patterns = useMemo(
    () => (isPreview ? DEMO_PATTERNS : buildPatternDistribution(skillPatterns)),
    [isPreview, skillPatterns],
  );

  const recommendation = useMemo(
    () => getAdaptiveRecommendation(skillPatterns, practiced),
    [skillPatterns, practiced],
  );
  const recommendedSkill = getSkillById(recommendation.skillId);
  const avgRegister = isPreview ? 64 : averageRegisterScore(sentences);
  const registerDelta = isPreview ? 6 : computeRegisterDelta(sentences);
  const topPattern = useMemo(() => {
    if (skillPatterns.length === 0) return undefined;
    return [...skillPatterns].sort((a, b) => b.occurrence_count - a.occurrence_count)[0];
  }, [skillPatterns]);
  const recentSentences = isPreview ? [] : sentences.slice(0, 5);
  const weekTotal = activity.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className={styles.content}>
      <div className={styles.dashboardGrid}>
        {loading && (
          <DashboardCard className={styles.spanFull} compact>
            <p className={styles.status}>Loading your overview…</p>
          </DashboardCard>
        )}
        {error && (
          <DashboardCard className={styles.spanFull} compact>
            <p className={styles.error} role="alert">
              {error}
            </p>
          </DashboardCard>
        )}

        <DashboardCard
          title="Key metrics"
          subtitle="Snapshot of your recent practice"
          className={styles.spanFull}
        >
          <div className={styles.metricsGrid}>
            <MetricTile
              label="Today"
              value={isPreview ? 4 : practiceCount}
              hint="sentences practised"
            />
            <MetricTile
              label="This week"
              value={isPreview ? 25 : weekTotal}
              hint="sessions in last 7 days"
            />
            <MetricTile
              label="Avg register"
              value={avgRegister ?? "—"}
              hint="across recent writing"
              delta={registerDelta}
            />
            <MetricTile
              label="Vocabulary"
              value={isPreview ? 18 : vocabularyCount}
              hint="words in your bank"
            />
          </div>
        </DashboardCard>

        <DashboardCard
          title="Practice activity"
          subtitle="Sessions per day — last 7 days"
          badge={`${isPreview ? 25 : weekTotal} total`}
          className={styles.spanHalf}
        >
          <ActivityBarChart
            data={activity}
            emptyMessage="Analyse writing to see your daily activity."
          />
        </DashboardCard>

        <DashboardCard
          title="Register score trend"
          subtitle="Recent session scores over time"
          badge={avgRegister !== null ? `Avg ${avgRegister}` : undefined}
          className={styles.spanHalf}
        >
          <RegisterLineChart
            data={registerTrend}
            emptyMessage="Complete a few sessions to plot your register trend."
          />
        </DashboardCard>

        <DashboardCard
          title="Error patterns"
          subtitle="Most frequent categories"
          className={styles.spanThird}
        >
          <PatternDonutChart
            data={patterns}
            emptyMessage="Patterns appear after you analyse writing with errors."
          />
        </DashboardCard>

        <DashboardCard
          title="Recommended focus"
          subtitle="Adaptive skill based on your errors"
          className={styles.spanThird}
        >
          {recommendedSkill && !isPreview ? (
            <div className={styles.focusContent}>
              <p className={styles.focusSkill}>{recommendedSkill.name}</p>
              <p className={styles.focusReason}>{recommendation.reason}</p>
              {topPattern && (
                <p className={styles.focusMeta}>
                  Top pattern: {topPattern.category} ({topPattern.occurrence_count}×)
                </p>
              )}
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => onTabChange("learn")}
              >
                Start skill
              </button>
            </div>
          ) : isPreview ? (
            <div className={styles.focusContent}>
              <p className={styles.focusSkill}>Basic sentence structure</p>
              <p className={styles.focusReason}>
                Adaptive recommendations based on your real error patterns.
              </p>
              <button type="button" className={styles.secondaryButton} onClick={onSignIn}>
                Sign in to unlock
              </button>
            </div>
          ) : (
            <p className={styles.muted}>Complete a writing session to unlock recommendations.</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Recent sessions"
          subtitle="Latest analysed sentences"
          className={styles.spanThird}
          action={
            !isPreview && sentences.length > 0 ? (
              <button type="button" className={styles.linkButton} onClick={() => onTabChange("history")}>
                View all
              </button>
            ) : undefined
          }
        >
          {recentSentences.length === 0 ? (
            <p className={styles.muted}>
              {isPreview
                ? "Your latest analysed sentences will appear here."
                : "No sessions yet — analyse your first sentence on the Write tab."}
            </p>
          ) : (
            <ul className={styles.sessionTable}>
              <li className={styles.sessionHeader}>
                <span>Sentence</span>
                <span>Reg</span>
                <span>Err</span>
              </li>
              {recentSentences.map((sentence) => (
                <li key={sentence.id} className={styles.sessionRow}>
                  <span className={styles.sessionPreview}>
                    {sentence.original_text.length > 48
                      ? `${sentence.original_text.slice(0, 48)}…`
                      : sentence.original_text}
                  </span>
                  <span className={styles.sessionRegister}>{sentence.register_score}</span>
                  <span className={styles.sessionErrors}>{sentence.error_count}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

export function DashboardTab({
  isAuthenticated,
  refreshKey,
  practiceCount,
  skillPatterns,
  onSignIn,
  onTabChange,
}: DashboardTabProps) {
  const [sentences, setSentences] = useState<AnalyzedSentenceRow[]>([]);
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [practiced, setPracticed] = useState<PracticedSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSentences([]);
      setVocabularyCount(0);
      setPracticed([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [history, vocab, practicedSkills] = await Promise.all([
          fetchHistory(),
          fetchVocabulary(),
          fetchPracticedSkills(),
        ]);
        if (cancelled) return;

        setSentences(history.sentences);
        setVocabularyCount(vocab.words.length);
        setPracticed(practicedSkills);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not load dashboard.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshKey]);

  return (
    <TabPageShell id="panel-dashboard" labelledBy="tab-dashboard">
      <DashboardBody
        isPreview={!isAuthenticated}
        practiceCount={practiceCount}
        sentences={sentences}
        skillPatterns={skillPatterns}
        vocabularyCount={vocabularyCount}
        practiced={practiced}
        onSignIn={onSignIn}
        onTabChange={onTabChange}
        loading={loading}
        error={error}
      />
    </TabPageShell>
  );
}
