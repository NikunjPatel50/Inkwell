"use client";

import { DashboardCard } from "../dashboard/DashboardCard";
import { useWritingDna } from "../../hooks/useWritingDna";
import {
  buildWritingDnaCsv,
  buildWritingDnaReportHtml,
  downloadTextFile,
  hasWritingDnaData,
} from "../../lib/writingDnaClient";
import type { AuthUser } from "../../hooks/useAuth";
import { DnaAchievementsGrid } from "./DnaAchievementsGrid";
import { DnaDimensionBreakdown } from "./DnaDimensionBreakdown";
import { DnaGoalsPanel } from "./DnaGoalsPanel";
import { DnaGrammarHeatmap } from "./DnaGrammarHeatmap";
import { DnaInsightsList } from "./DnaInsightsList";
import { DnaPersonalityBadge } from "./DnaPersonalityBadge";
import { DnaRecentAnalyses } from "./DnaRecentAnalyses";
import { DnaScoreGauge } from "./DnaScoreGauge";
import { DnaScoreTiles } from "./DnaScoreTiles";
import { DnaStreakCalendar } from "./DnaStreakCalendar";
import { DnaVocabularyPanel } from "./DnaVocabularyPanel";
import { DnaWeeklyCoach } from "./DnaWeeklyCoach";
import dashboardStyles from "../DashboardTab.module.css";
import styles from "./WritingDna.module.css";

interface WritingDnaSectionProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  refreshKey: number;
  onSignIn: () => void;
}

function WritingDnaSkeleton() {
  return (
    <div className={dashboardStyles.dashboardStack}>
      <div className={`${styles.skeleton} ${styles.skeletonHero}`} />
      <div className={dashboardStyles.cardRow}>
        <div className={`${dashboardStyles.cardColumn} ${styles.skeletonColumn}`}>
          <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
          <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
        </div>
        <div className={`${dashboardStyles.cardColumn} ${styles.skeletonColumn}`}>
          <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
          <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
        </div>
      </div>
    </div>
  );
}

export function WritingDnaSection({
  user,
  isAuthenticated,
  refreshKey,
  onSignIn,
}: WritingDnaSectionProps) {
  const { data, loading, error, addGoal, removeGoal, reload } = useWritingDna({
    user,
    refreshKey,
    enabled: isAuthenticated,
  });

  const profile = data?.profile;
  const dimensions = profile?.dimensions ?? {
    grammar: 0,
    vocabulary: 0,
    clarity: 0,
    structure: 0,
    flow: 0,
    style: 0,
    confidence: 0,
    consistency: 0,
  };

  const handleExportCsv = () => {
    if (!data) return;
    downloadTextFile("writing-dna-sessions.csv", buildWritingDnaCsv(data), "text/csv");
  };

  const handleExportReport = () => {
    if (!data) return;
    const html = buildWritingDnaReportHtml(data);
    downloadTextFile("writing-dna-report.html", html, "text/html");
  };

  const showDashboard = isAuthenticated && !loading && hasWritingDnaData(data);

  return (
    <section className={dashboardStyles.dnaSection} aria-labelledby="writing-dna-heading">
      <div className={dashboardStyles.dnaSectionHeader}>
        <div>
          <p className={dashboardStyles.dnaEyebrow}>Premium</p>
          <h2 id="writing-dna-heading" className={dashboardStyles.dnaTitle}>
            Writing DNA™
          </h2>
          <p className={dashboardStyles.dnaDescription}>
            Your permanent AI writing profile — tracked across every submission, improving over months.
          </p>
        </div>
        {showDashboard && (
          <div className={styles.exportRow}>
            <button type="button" className={styles.exportBtn} onClick={handleExportCsv}>
              Export CSV
            </button>
            <button type="button" className={styles.exportBtn} onClick={handleExportReport}>
              Export report
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className={styles.lockedCard}>
          <p className={styles.lockedTitle}>Sign in to unlock Writing DNA™</p>
          <p className={styles.lockedText}>
            Your writing profile builds from every submission — grammar, vocabulary, style, and streaks over time.
          </p>
          <button type="button" className={styles.exportBtn} onClick={onSignIn}>
            Sign in
          </button>
        </div>
      )}

      {isAuthenticated && loading && <WritingDnaSkeleton />}

      {isAuthenticated && error && (
        <div className={styles.lockedCard}>
          <p className={styles.lockedTitle}>Could not load Writing DNA</p>
          <p className={styles.lockedText}>{error}</p>
          <button type="button" className={styles.exportBtn} onClick={() => void reload()}>
            Try again
          </button>
        </div>
      )}

      {showDashboard && data && (
        <div className={dashboardStyles.dashboardStack}>
          <DashboardCard bodyClassName={styles.heroCard}>
            <DnaScoreGauge score={profile?.dna_score ?? 0} />
            <div className={styles.heroMeta}>
              {profile?.personality && profile.personality_badge && (
                <DnaPersonalityBadge
                  personality={profile.personality}
                  badge={profile.personality_badge}
                />
              )}
              {data.fingerprint && (
                <span className={styles.fingerprint} title="Writing Fingerprint">
                  {data.fingerprint}
                </span>
              )}
              <h3 className={styles.heroTitle}>Your writing identity</h3>
              <p className={styles.heroSubtitle}>
                <span className={styles.counterValue}>
                  {(profile?.total_words ?? 0).toLocaleString()}
                </span>{" "}
                words across{" "}
                <span className={styles.counterValue}>{profile?.total_sessions ?? 0}</span> sessions — stored
                permanently and compared to your history.
              </p>
              <DnaScoreTiles
                dnaScore={profile?.dna_score ?? 0}
                grammar={dimensions.grammar}
                vocabulary={dimensions.vocabulary}
                clarity={dimensions.clarity}
                style={dimensions.style}
              />
              <DnaDimensionBreakdown dimensions={dimensions} />
            </div>
          </DashboardCard>

          <div className={dashboardStyles.cardRow}>
            <div className={dashboardStyles.cardColumn}>
              <DashboardCard title="Recent analyses" subtitle="Your latest Writing DNA sessions">
                <DnaRecentAnalyses sessions={data.sessions} />
              </DashboardCard>

              <DashboardCard title="Writing streak" subtitle="Daily activity calendar">
                <DnaStreakCalendar calendar={data.calendar} streak={data.streak} />
              </DashboardCard>

              <DashboardCard title="Grammar heatmap" subtitle="Mistakes by category">
                <DnaGrammarHeatmap cells={data.grammarHeatmap} />
              </DashboardCard>

              <DashboardCard title="Achievements" subtitle="Badges earned from your writing">
                <DnaAchievementsGrid achievements={data.achievements} />
              </DashboardCard>
            </div>

            <div className={dashboardStyles.cardColumn}>
              <DashboardCard title="Personal insights" subtitle="Compared to your recent writing">
                <DnaInsightsList insights={profile?.insights ?? []} />
              </DashboardCard>

              <DashboardCard title="Vocabulary intelligence" subtitle="Your personal word database">
                <DnaVocabularyPanel
                  mostUsed={data.vocabulary.mostUsed}
                  rareWords={data.vocabulary.rareWords}
                  academicWords={data.vocabulary.academicWords}
                  newThisMonth={data.vocabulary.newThisMonth}
                  totalWords={data.vocabulary.pagination.total}
                />
              </DashboardCard>

              <DashboardCard title="Goals" subtitle="Track what matters to you">
                <DnaGoalsPanel goals={data.goals} onAddGoal={addGoal} onDeleteGoal={removeGoal} />
              </DashboardCard>

              <DashboardCard title="AI Coach" subtitle="Weekly personalized report">
                <DnaWeeklyCoach reports={data.weeklyReports} />
              </DashboardCard>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && !loading && !showDashboard && !error && (
        <div className={styles.lockedCard}>
          <p className={styles.lockedTitle}>Start building your Writing DNA™</p>
          <p className={styles.lockedText}>
            Submit your first piece in Write or Coach. Every analysis adds to your permanent profile.
          </p>
        </div>
      )}
    </section>
  );
}
