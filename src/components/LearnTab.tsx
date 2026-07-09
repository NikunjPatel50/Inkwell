import { useCallback, useEffect, useState } from "react";
import { fetchPracticedSkills } from "../lib/learnClient";
import type { AppTab, PracticedSkill, SkillPatternRow } from "../types";
import { CurriculumOverview } from "./CurriculumOverview";
import { SkillExerciseView } from "./SkillExerciseView";
import { TabPageShell } from "./TabPageShell";

interface LearnTabProps {
  isAuthenticated: boolean;
  skillPatterns: SkillPatternRow[];
  onTabChange: (tab: AppTab) => void;
}

export function LearnTab({ isAuthenticated, skillPatterns, onTabChange }: LearnTabProps) {
  const [view, setView] = useState<"overview" | "skill">("overview");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [practiced, setPracticed] = useState<PracticedSkill[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPracticed([]);
      return;
    }

    fetchPracticedSkills()
      .then(setPracticed)
      .catch(() => {
        // Session-only fallback
      });
  }, [isAuthenticated]);

  const handleStartSkill = useCallback((skillId: string) => {
    setActiveSkillId(skillId);
    setView("skill");
  }, []);

  const handleBack = useCallback(() => {
    setView("overview");
    setActiveSkillId(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    onTabChange("dashboard");
  }, [onTabChange]);

  const handlePracticedUpdate = useCallback((record: PracticedSkill) => {
    setPracticed((prev) => {
      const idx = prev.findIndex((p) => p.skillId === record.skillId);
      if (idx === -1) return [...prev, record];
      const next = [...prev];
      next[idx] = record;
      return next;
    });
  }, []);

  if (view === "skill" && activeSkillId) {
    return (
      <TabPageShell
        id="panel-learn"
        labelledBy="tab-learn"
        backTo={{ label: "Learn", onBack: handleBack }}
      >
        <SkillExerciseView
          skillId={activeSkillId}
          practiced={practiced}
          onPracticedUpdate={handlePracticedUpdate}
          onBack={handleBack}
        />
      </TabPageShell>
    );
  }

  return (
    <TabPageShell
      id="panel-learn"
      labelledBy="tab-learn"
      backTo={{ label: "Dashboard", onBack: handleBackToDashboard }}
    >
      <CurriculumOverview
        skillPatterns={skillPatterns}
        practiced={practiced}
        onStartSkill={handleStartSkill}
      />
    </TabPageShell>
  );
}
