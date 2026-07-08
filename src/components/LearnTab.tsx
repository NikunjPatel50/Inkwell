import { useCallback, useEffect, useState } from "react";
import { fetchPracticedSkills } from "../lib/learnClient";
import type { PracticedSkill, SkillPatternRow } from "../types";
import { CurriculumOverview } from "./CurriculumOverview";
import { SkillExerciseView } from "./SkillExerciseView";
import { TabPageShell } from "./TabPageShell";
import styles from "./LearnTab.module.css";

interface LearnTabProps {
  isAuthenticated: boolean;
  skillPatterns: SkillPatternRow[];
}

export function LearnTab({ isAuthenticated, skillPatterns }: LearnTabProps) {
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
      <TabPageShell id="panel-learn" labelledBy="tab-learn" fullBleed contentClassName={styles.skillView}>
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
      eyebrow="Curriculum"
      title="Learn"
      description="Adaptive skill practice shaped by your writing patterns and error history."
    >
      <CurriculumOverview
        skillPatterns={skillPatterns}
        practiced={practiced}
        onStartSkill={handleStartSkill}
      />
    </TabPageShell>
  );
}
