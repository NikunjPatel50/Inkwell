import { useCallback, useEffect, useState } from "react";
import { COACH_LEVELS, THINKING_MODE_LEVEL } from "../../constants/coachLevels";
import {
  getLevelProgress,
  readCoachProgress,
} from "../../lib/coachClient";
import type { AppTab } from "../../types";
import type { CoachLevelId, CoachProgressState } from "../../types/coach";
import { TabPageShell } from "../TabPageShell";
import { CoachLevelCard } from "./CoachLevelCard";
import { CoachLevelView } from "./levels/CoachLevelView";
import styles from "./CoachTab.module.css";
import shared from "./CoachShared.module.css";

interface CoachTabProps {
  onTabChange: (tab: AppTab) => void;
}

export function CoachTab({ onTabChange }: CoachTabProps) {
  const [progress, setProgress] = useState<CoachProgressState>(() => readCoachProgress());
  const [expandedId, setExpandedId] = useState<CoachLevelId | null>(null);
  const [activeLevelId, setActiveLevelId] = useState<CoachLevelId | null>(null);

  const refreshProgress = useCallback(() => {
    setProgress(readCoachProgress());
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const handleBack = useCallback(() => {
    setActiveLevelId(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    onTabChange("dashboard");
  }, [onTabChange]);

  if (activeLevelId) {
    return (
      <TabPageShell
        id="panel-coach"
        labelledBy="tab-coach"
        backTo={{ label: "AI Writing Coach", onBack: handleBack }}
      >
        <CoachLevelView
          levelId={activeLevelId}
          progress={progress}
          onProgressUpdate={refreshProgress}
        />
      </TabPageShell>
    );
  }

  return (
    <TabPageShell
      id="panel-coach"
      labelledBy="tab-coach"
      backTo={{ label: "Dashboard", onBack: handleBackToDashboard }}
    >
      <section className={styles.levelList} aria-label="Learning levels">
        {COACH_LEVELS.map((level) => (
          <CoachLevelCard
            key={level.id}
            level={level}
            progress={getLevelProgress(progress, level.id)}
            expanded={expandedId === level.id}
            onToggle={() =>
              setExpandedId((current) => (current === level.id ? null : level.id))
            }
            onStart={() => setActiveLevelId(level.id)}
            onContinue={() => setActiveLevelId(level.id)}
          />
        ))}
      </section>

      <section className={styles.thinkingSection} aria-labelledby="thinking-mode-heading">
        <CoachLevelCard
          level={THINKING_MODE_LEVEL}
          progress={getLevelProgress(progress, "thinking-mode")}
          expanded={expandedId === "thinking-mode"}
          onToggle={() =>
            setExpandedId((current) => (current === "thinking-mode" ? null : "thinking-mode"))
          }
          onStart={() => setActiveLevelId("thinking-mode")}
          onContinue={() => setActiveLevelId("thinking-mode")}
        />
      </section>

      {(progress.weakCollocations.length > 0 ||
        progress.recentVocabulary.length > 0 ||
        progress.grammarMistakes.length > 0) && (
        <section className={shared.card} aria-labelledby="coach-insights-heading">
          <h3 id="coach-insights-heading" className={shared.sectionTitle}>
            Your learning insights
          </h3>
          {progress.weakCollocations.length > 0 && (
            <div style={{ marginTop: "0.65rem" }}>
              <p className={shared.sectionHint}>Weak collocations</p>
              <div className={shared.tagList}>
                {progress.weakCollocations.slice(0, 8).map((item) => (
                  <span key={item} className={shared.tag}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {progress.recentVocabulary.length > 0 && (
            <div style={{ marginTop: "0.65rem" }}>
              <p className={shared.sectionHint}>Recently learned vocabulary</p>
              <div className={shared.tagList}>
                {progress.recentVocabulary.slice(0, 8).map((item) => (
                  <span key={item} className={shared.tag}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {progress.grammarMistakes.length > 0 && (
            <div style={{ marginTop: "0.65rem" }}>
              <p className={shared.sectionHint}>Common grammar mistakes</p>
              <div className={shared.tagList}>
                {progress.grammarMistakes.slice(0, 6).map((item) => (
                  <span key={item} className={shared.tag}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </TabPageShell>
  );
}
