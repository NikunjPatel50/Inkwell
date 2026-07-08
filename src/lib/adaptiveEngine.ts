import { CURRICULUM_SKILLS, getSkillById } from "../constants/curriculum";
import type {
  AdaptiveRecommendation,
  ExerciseType,
  PracticedSkill,
  SkillPatternRow,
  Tier,
} from "../types";

const CATEGORY_TO_SKILL: Record<string, string> = {
  Tone: "tone-and-register",
  Punctuation: "capitalization-punctuation",
  "Sentence Structure": "subordinate-clauses",
  "Word Choice": "precise-word-choice",
};

const PRACTICE_THRESHOLD = 3;
const SCORE_THRESHOLD = 70;

export function isSkillPracticed(record: PracticedSkill | undefined): boolean {
  if (!record) return false;
  return (
    record.exercisesCompleted >= PRACTICE_THRESHOLD && record.averageScore >= SCORE_THRESHOLD
  );
}

export function hasCompletedTier(practiced: PracticedSkill[], tier: Tier): boolean {
  const tierSkillIds = CURRICULUM_SKILLS.filter((s) => s.tier === tier).map((s) => s.id);
  const practicedMap = new Map(practiced.map((p) => [p.skillId, p]));
  return tierSkillIds.some((id) => isSkillPracticed(practicedMap.get(id)));
}

export function mapCategoryToSkillId(category: string): string | null {
  return CATEGORY_TO_SKILL[category] ?? null;
}

function getNextSequentialSkill(practiced: PracticedSkill[]): string {
  const practicedMap = new Map(practiced.map((p) => [p.skillId, p]));

  for (const skill of CURRICULUM_SKILLS) {
    if (!isSkillPracticed(practicedMap.get(skill.id))) {
      return skill.id;
    }
  }

  return CURRICULUM_SKILLS[0].id;
}

export function getAdaptiveRecommendation(
  skillPatterns: SkillPatternRow[],
  practiced: PracticedSkill[],
): AdaptiveRecommendation {
  const practicedMap = new Map(practiced.map((p) => [p.skillId, p]));

  if (skillPatterns.length > 0) {
    const sorted = [...skillPatterns].sort(
      (a, b) => b.occurrence_count - a.occurrence_count,
    );
    const topCategory = sorted[0];

    const mappedId = mapCategoryToSkillId(topCategory.category);
    if (mappedId) {
      const skill = getSkillById(mappedId);
      if (skill && !isSkillPracticed(practicedMap.get(mappedId))) {
        return {
          skillId: mappedId,
          reason: `Based on your recent writing, ${skill.name.toLowerCase()} appears most often in your errors.`,
        };
      }
    }
  }

  const nextId = getNextSequentialSkill(practiced);
  const nextSkill = getSkillById(nextId);

  if (skillPatterns.length === 0) {
    return {
      skillId: nextId,
      reason: `Start from the beginning: ${nextSkill?.name ?? "Basic sentence structure"}.`,
    };
  }

  return {
    skillId: nextId,
    reason: `Continue with ${nextSkill?.name ?? "the next skill"} to build your foundation.`,
  };
}

export function getNextExerciseType(
  currentIndex: number,
  weakTypes: ExerciseType[] = [],
): ExerciseType {
  const order: ExerciseType[] = ["build-it", "spot-error", "complete-it"];

  if (weakTypes.length > 0) {
    const weak = weakTypes[currentIndex % weakTypes.length];
    if (weak) return weak;
  }

  return order[currentIndex % order.length];
}

export function updatePracticedSkill(
  existing: PracticedSkill | undefined,
  score: number,
): PracticedSkill {
  const prev = existing ?? {
    skillId: "",
    exercisesCompleted: 0,
    averageScore: 0,
  };

  const completed = prev.exercisesCompleted + 1;
  const averageScore = Math.round(
    (prev.averageScore * prev.exercisesCompleted + score) / completed,
  );

  return {
    skillId: prev.skillId,
    exercisesCompleted: completed,
    averageScore,
    lastPracticedAt: new Date().toISOString(),
  };
}
