import { useCallback, useEffect, useState } from "react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { getDemoPTESessions, readPTESessions } from "../lib/pteEssaySessions";
import {
  DEFAULT_PASS_TARGET_SCORE,
  sessionOutcome,
} from "../lib/pteDashboardStats";
import { PTE_ESSAY_MAX_TOTAL } from "../lib/pteEssayScoring";
import { writeWorkspaceRoute } from "../lib/workspaceRoute";
import { ScoreTrajectoryChart } from "./dashboard/ScoreTrajectoryChart";
import { DashboardCard } from "./dashboard/DashboardCard";
import { PTESessionDetail } from "./dashboard/PTESessionDetail";
import { TraitBreakdownChart } from "./dashboard/TraitBreakdownChart";
import { RecurringErrorsCard } from "./dashboard/RecurringErrorsCard";
import { WritingDnaSection } from "./writing-dna/WritingDnaSection";
import { TabPageShell } from "./TabPageShell";
import type { AppTab } from "../types";
import type { PTEEssaySession } from "../types/writingMode";
import type { AuthUser } from "../hooks/useAuth";
import styles from "./DashboardTab.module.css";

interface DashboardTabProps {
  isAuthenticated: boolean;
  refreshKey: number;
  user: AuthUser | null;
  onSignIn: () => void;
  onTabChange: (tab: AppTab) => void;
}

function MetricTile({
  label,
  value,
  hint,
  delta,
  variant = "default",
  title,
}: {
  label: string;
  value: string | number;
  hint: string;
  delta?: number | null;
  variant?: "default" | "hero" | "alert";
  title?: string;
}) {
  return (
    <div
      className={`${styles.metricTile} ${variant === "hero" ? styles.metricTileHero : ""} ${
        variant === "alert" ? styles.metricTileAlert : ""
      }`}
      title={title}
    >
      <p className={styles.metricLabel}>{label}</p>
      <div className={styles.metricRow}>
        <p className={styles.metricValue}>{value}</p>
        {delta !== null && delta !== undefined && (
          <span className={`${styles.metricDelta} ${delta >= 0 ? styles.metricDeltaUp : styles.metricDeltaDown}`}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}
          </span>
        )}
      </div>
      <p className={styles.metricHint}>{hint}</p>
    </div>
  );
}

function DashboardBody({
  isPreview,
  sessions,
  user,
  refreshKey,
  onSignIn,
  onTabChange,
}: {
  isPreview: boolean;
  sessions: PTEEssaySession[];
  user: AuthUser | null;
  refreshKey: number;
  onSignIn: () => void;
  onTabChange: (tab: AppTab) => void;
}) {
  const stats = useDashboardStats(sessions);
  const [selectedSession, setSelectedSession] = useState<PTEEssaySession | null>(null);

  const handleFocusCta = useCallback(() => {
    if (isPreview) {
      onSignIn();
      return;
    }

    const goesToVocabulary = stats.focus.ctaLabel.toLowerCase().includes("vocabulary");
    if (goesToVocabulary) {
      onTabChange("vocabulary");
      return;
    }

    writeWorkspaceRoute({ tab: "write", writeMode: "pte-essay" });
    onTabChange("write");
  }, [isPreview, onSignIn, onTabChange, stats.focus.ctaLabel]);

  const truncatePrompt = (prompt: string, max = 52) =>
    prompt.length > max ? `${prompt.slice(0, max)}…` : prompt;

  return (
    <div className={styles.content}>
      <div className={styles.dashboardStack}>
        <DashboardCard
          title="Key metrics"
          subtitle="PTE essay readiness from your scored sessions"
        >
          <div className={styles.metricsGrid}>
            <MetricTile
              variant="hero"
              label="Readiness score"
              value={
                stats.readiness.empty
                  ? "—"
                  : `~${stats.readiness.estimatedPte} PTE`
              }
              hint={
                stats.readiness.empty
                  ? "Score an essay to see your readiness."
                  : `${stats.readiness.averageScore?.toFixed(1)}/${stats.readiness.maxScore} avg · est. overall PTE band`
              }
              delta={stats.readiness.delta}
            />
            <MetricTile
              variant="alert"
              label="Weakest trait"
              value={
                stats.weakestTrait.empty || !stats.weakestTrait.trait
                  ? "—"
                  : stats.weakestTrait.trait.label
              }
              hint={
                stats.weakestTrait.empty || !stats.weakestTrait.trait
                  ? "Score your first essay to find your gap."
                  : `${stats.weakestTrait.trait.averageScore.toFixed(1)}/${stats.weakestTrait.trait.maxScore} avg — highest leverage fix`
              }
            />
            <MetricTile
              label="Zero-score rate"
              value={stats.zeroScoreRate.empty ? "—" : `${stats.zeroScoreRate.percent}%`}
              hint={
                stats.zeroScoreRate.empty
                  ? "No essays scored yet."
                  : `${stats.zeroScoreRate.count} essay${stats.zeroScoreRate.count === 1 ? "" : "s"} with Content or Form at 0`
              }
              title="Content or Form scored 0 — no other traits counted."
            />
            <MetricTile
              label="Practice streak"
              value={stats.streak.empty ? "—" : `${stats.streak.current} days`}
              hint={
                stats.streak.empty
                  ? "Score an essay to start your streak."
                  : `Best streak: ${stats.streak.best} day${stats.streak.best === 1 ? "" : "s"}`
              }
            />
          </div>
        </DashboardCard>

        <div className={styles.cardRow}>
          <div className={styles.cardColumn}>
            <DashboardCard
              title="Score trajectory"
              subtitle="Total essay score per attempt (out of 26)"
              badge={stats.sessionCount > 0 ? `${stats.sessionCount} attempts` : undefined}
            >
              <ScoreTrajectoryChart
                data={stats.trajectory}
                emptyMessage="Score a few essays to see your trend."
              />
            </DashboardCard>
          </div>

          <div className={styles.cardColumn}>
            <DashboardCard
              title="Trait breakdown"
              subtitle="Average score vs max across recent sessions"
            >
              <TraitBreakdownChart
                traits={stats.traitAverages}
                emptyMessage="Score your first essay to see your trait profile."
                hasData={!stats.readiness.empty}
              />
            </DashboardCard>
          </div>
        </div>

        <div className={styles.cardRow3}>
          <DashboardCard
            title="Common weakness patterns"
            subtitle="Most frequent feedback from your essays"
          >
          {stats.weaknessPatterns.length === 0 ? (
            <p className={styles.muted}>
              {isPreview
                ? "Your recurring feedback themes will appear here after scoring."
                : "Patterns appear after you score a few PTE essays."}
            </p>
          ) : (
            <ol className={styles.patternList}>
              {stats.weaknessPatterns.map((pattern) => (
                <li key={pattern.text} className={styles.patternRow}>
                  <span className={styles.patternText}>{pattern.text}</span>
                  <span className={styles.patternCount}>{pattern.count}×</span>
                </li>
              ))}
            </ol>
          )}
          </DashboardCard>

          <DashboardCard
            title="Recommended focus"
            subtitle="Next step based on your weakest trait"
          >
          <div className={styles.focusContent}>
            <p className={styles.focusSkill}>{stats.focus.title}</p>
            <p className={styles.focusReason}>{stats.focus.description}</p>
            <button type="button" className={styles.secondaryButton} onClick={handleFocusCta}>
              {isPreview ? "Sign in to unlock" : stats.focus.ctaLabel}
            </button>
          </div>
          </DashboardCard>

          <DashboardCard
            title="Recent sessions"
            subtitle="Latest PTE essay scores"
          >
          {stats.recentSessions.length === 0 ? (
            <p className={styles.muted}>
              {isPreview
                ? "Your latest essay scores will appear here."
                : "No sessions yet — score your first essay in PTE Essay mode on the Write tab."}
            </p>
          ) : (
            <ul className={styles.sessionTable}>
              <li className={styles.sessionHeader}>
                <span>Date</span>
                <span>Score</span>
                <span>Prompt</span>
                <span aria-hidden="true" />
              </li>
              {stats.recentSessions.map((session) => {
                const outcome = sessionOutcome(session.score.totalScore, DEFAULT_PASS_TARGET_SCORE);
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      className={styles.sessionRow}
                      onClick={() => setSelectedSession(session)}
                    >
                      <span className={styles.sessionDate}>
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className={styles.sessionScore}>
                        {session.score.totalScore}/{PTE_ESSAY_MAX_TOTAL}
                      </span>
                      <span className={styles.sessionPreview}>{truncatePrompt(session.prompt)}</span>
                      <span
                        className={`${styles.sessionDot} ${styles[`sessionDot${outcome.charAt(0).toUpperCase()}${outcome.slice(1)}`]}`}
                        title={
                          outcome === "pass"
                            ? `At or above target (${DEFAULT_PASS_TARGET_SCORE}/${PTE_ESSAY_MAX_TOTAL})`
                            : outcome === "borderline"
                              ? "Borderline vs target"
                              : "Below target"
                        }
                        aria-label={`Outcome: ${outcome}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          </DashboardCard>
        </div>

        <RecurringErrorsCard user={user} refreshKey={refreshKey} />
      </div>

      {selectedSession && (
        <PTESessionDetail session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}

export function DashboardTab({
  isAuthenticated,
  refreshKey,
  user,
  onSignIn,
  onTabChange,
}: DashboardTabProps) {
  const [sessions, setSessions] = useState<PTEEssaySession[]>([]);

  const loadSessions = useCallback(() => {
    if (!isAuthenticated) {
      setSessions(getDemoPTESessions());
      return;
    }
    setSessions(readPTESessions());
  }, [isAuthenticated]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, refreshKey]);

  useEffect(() => {
    const onRecorded = () => loadSessions();
    window.addEventListener("pte-session-recorded", onRecorded);
    return () => window.removeEventListener("pte-session-recorded", onRecorded);
  }, [loadSessions]);

  return (
    <TabPageShell
      id="panel-dashboard"
      labelledBy="tab-dashboard"
      contentClassName={styles.dashboardPage}
    >
      <DashboardBody
        isPreview={!isAuthenticated}
        sessions={sessions}
        user={user}
        refreshKey={refreshKey}
        onSignIn={onSignIn}
        onTabChange={onTabChange}
      />
      <WritingDnaSection
        user={user}
        isAuthenticated={isAuthenticated}
        refreshKey={refreshKey}
        onSignIn={onSignIn}
      />
    </TabPageShell>
  );
}
