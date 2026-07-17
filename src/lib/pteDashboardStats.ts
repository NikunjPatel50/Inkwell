import { countWords } from "./textMetrics";
import { PTE_ESSAY_MAX_TOTAL, PTE_ESSAY_TRAIT_DEFS } from "./pteEssayScoring";
import type {
  PTEEssaySession,
  PTEEssayTraitId,
  PTEEssayTraitScore,
} from "../types/writingMode";

/** Essay score equivalents for overall PTE 65 / 79 readiness bands (chart shading). */
export const PTE_ESSAY_TARGET_65 = 15;
export const PTE_ESSAY_TARGET_79 = 20;
export const DEFAULT_PASS_TARGET_SCORE = PTE_ESSAY_TARGET_65;

export interface ScoreTrajectoryPoint {
  label: string;
  score: number;
  dateKey: string;
}

export interface TraitAverage {
  id: PTEEssayTraitId;
  label: string;
  averageScore: number;
  maxScore: number;
  ratio: number;
}

export interface WeaknessPattern {
  text: string;
  count: number;
}

export interface FocusRecommendation {
  title: string;
  description: string;
  ctaLabel: string;
}

export interface DashboardStats {
  sessions: PTEEssaySession[];
  sessionCount: number;
  readiness: {
    averageScore: number | null;
    maxScore: number;
    estimatedPte: number | null;
    delta: number | null;
    empty: boolean;
  };
  weakestTrait: {
    trait: TraitAverage | null;
    empty: boolean;
  };
  zeroScoreRate: {
    percent: number | null;
    count: number;
    empty: boolean;
  };
  streak: {
    current: number;
    best: number;
    empty: boolean;
  };
  trajectory: ScoreTrajectoryPoint[];
  traitAverages: TraitAverage[];
  weaknessPatterns: WeaknessPattern[];
  focus: FocusRecommendation;
  recentSessions: PTEEssaySession[];
}

/** Pearson published PTE Academic ↔ IELTS alignment (overall score). */
export function essayAverageToEstimatedPte(averageOutOf26: number): number {
  const ratio = Math.max(0, Math.min(1, averageOutOf26 / PTE_ESSAY_MAX_TOTAL));
  return Math.round(29 + ratio * 61);
}

function startOfDay(date: Date): string {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next.toISOString().slice(0, 10);
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function computeStreaks(sessions: PTEEssaySession[]): { current: number; best: number } {
  if (sessions.length === 0) return { current: 0, best: 0 };

  const daySet = new Set(sessions.map((session) => startOfDay(new Date(session.createdAt))));
  const sortedDays = [...daySet].sort();

  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const day of sortedDays) {
    if (!previous) {
      run = 1;
    } else {
      const prevDate = new Date(`${previous}T00:00:00`);
      const currDate = new Date(`${day}T00:00:00`);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86_400_000);
      run = diffDays === 1 ? run + 1 : 1;
    }
    best = Math.max(best, run);
    previous = day;
  }

  let current = 0;
  const today = startOfDay(new Date());
  let cursor = today;

  while (daySet.has(cursor)) {
    current += 1;
    const date = new Date(`${cursor}T00:00:00`);
    date.setDate(date.getDate() - 1);
    cursor = startOfDay(date);
  }

  return { current, best: Math.max(best, current) };
}

function computeTraitAverages(sessions: PTEEssaySession[]): TraitAverage[] {
  return PTE_ESSAY_TRAIT_DEFS.map((def) => {
    const scores = sessions
      .map((session) => session.score.traits.find((trait) => trait.id === def.id)?.score)
      .filter((value): value is number => typeof value === "number");

    const averageScore = average(scores) ?? 0;
    return {
      id: def.id,
      label: def.label,
      averageScore,
      maxScore: def.maxScore,
      ratio: def.maxScore > 0 ? averageScore / def.maxScore : 0,
    };
  });
}

function buildWeaknessPatterns(sessions: PTEEssaySession[]): WeaknessPattern[] {
  const counts = new Map<string, number>();

  for (const session of sessions) {
    for (const trait of session.score.traits) {
      if (trait.score / trait.maxScore >= 0.75) continue;
      const key = trait.feedback.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const fix of session.score.topFixes) {
      const key = fix.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({
      text: text.charAt(0).toUpperCase() + text.slice(1),
      count,
    }));
}

function buildFocusRecommendation(weakest: TraitAverage | null, sessions: PTEEssaySession[]): FocusRecommendation {
  const defaultFocus: FocusRecommendation = {
    title: "Score your first PTE essay",
    description: "Switch to PTE Essay mode on the Write tab and paste a 200–300 word response.",
    ctaLabel: "Open Write tab",
  };

  if (!weakest) return defaultFocus;

  const recentWordAvg = average(
    sessions.slice(0, 8).map((session) => countWords(session.essayText)),
  );

  switch (weakest.id) {
    case "content":
      return {
        title: "Essay planning",
        description:
          "Practice outlining your thesis and two supporting points before you write — Content is your weakest trait.",
        ctaLabel: "Practice in Write",
      };
    case "form":
      return {
        title: "Hit the word count",
        description: `Practice landing in 200–300 words${
          recentWordAvg ? ` — your recent essays average ${Math.round(recentWordAvg)} words` : ""
        }.`,
        ctaLabel: "Practice in Write",
      };
    case "development":
      return {
        title: "Four-paragraph structure",
        description:
          "Practice intro, two body paragraphs, and conclusion with clear linking — Development/Coherence needs work.",
        ctaLabel: "Practice in Write",
      };
    case "grammar":
    case "linguisticRange":
      return {
        title: "Sentence variety",
        description: "Practice varying sentence structures while keeping grammar accurate.",
        ctaLabel: "Practice in Write",
      };
    case "vocabulary":
      return {
        title: "Topic vocabulary",
        description: "Build topic-specific word lists and use them in your next essay draft.",
        ctaLabel: "Open Vocabulary",
      };
    case "spelling":
      return {
        title: "Spellcheck review",
        description: "Enable spellcheck and proofread once before submitting each essay.",
        ctaLabel: "Practice in Write",
      };
    default:
      return defaultFocus;
  }
}

const RECENT_SESSION_WINDOW = 5;

export function computeDashboardStats(sessions: PTEEssaySession[]): DashboardStats {
  const chronological = [...sessions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const recentSessions = chronological.slice(-RECENT_SESSION_WINDOW);
  const priorSessions = chronological.slice(-RECENT_SESSION_WINDOW * 2, -RECENT_SESSION_WINDOW);

  const recentScores = recentSessions.map((session) => session.score.totalScore);
  const priorScores = priorSessions.map((session) => session.score.totalScore);
  const recentAvg = average(recentScores);
  const priorAvg = average(priorScores);

  const traitAverages = computeTraitAverages(recentSessions);
  const weakestTrait = traitAverages.length
    ? [...traitAverages].sort((a, b) => a.ratio - b.ratio)[0]
    : null;

  const zeroCount = sessions.filter((session) => {
    const content = session.score.traits.find((trait) => trait.id === "content");
    const form = session.score.traits.find((trait) => trait.id === "form");
    return content?.score === 0 || form?.score === 0;
  }).length;

  const streak = computeStreaks(sessions);

  const trajectory = chronological.map((session, index) => ({
    label: `${index + 1}`,
    score: session.score.totalScore,
    dateKey: session.createdAt.slice(0, 10),
  }));

  const overallAvg = recentAvg;

  return {
    sessions,
    sessionCount: sessions.length,
    readiness: {
      averageScore: overallAvg,
      maxScore: PTE_ESSAY_MAX_TOTAL,
      estimatedPte: overallAvg !== null ? essayAverageToEstimatedPte(overallAvg) : null,
      delta:
        recentAvg !== null && priorAvg !== null
          ? essayAverageToEstimatedPte(recentAvg) - essayAverageToEstimatedPte(priorAvg)
          : null,
      empty: sessions.length === 0,
    },
    weakestTrait: {
      trait: weakestTrait,
      empty: sessions.length === 0,
    },
    zeroScoreRate: {
      percent: sessions.length > 0 ? Math.round((zeroCount / sessions.length) * 100) : null,
      count: zeroCount,
      empty: sessions.length === 0,
    },
    streak: {
      current: streak.current,
      best: streak.best,
      empty: sessions.length === 0,
    },
    trajectory,
    traitAverages,
    weaknessPatterns: buildWeaknessPatterns(sessions),
    focus: buildFocusRecommendation(weakestTrait, recentSessions),
    recentSessions: [...sessions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  };
}

export function traitBarBand(ratio: number): "strong" | "mid" | "weak" {
  if (ratio > 0.75) return "strong";
  if (ratio >= 0.4) return "mid";
  return "weak";
}

export function sessionOutcome(
  totalScore: number,
  targetScore: number = DEFAULT_PASS_TARGET_SCORE,
): "pass" | "borderline" | "fail" {
  if (totalScore >= targetScore + 3) return "pass";
  if (totalScore >= targetScore - 2) return "borderline";
  return "fail";
}

export function formatTraitScore(trait: PTEEssayTraitScore): string {
  return `${trait.score}/${trait.maxScore}`;
}
