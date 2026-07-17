export type WritingMode = "general" | "pte-essay";

export const WRITING_MODES: { value: WritingMode; label: string }[] = [
  { value: "general", label: "General" },
  { value: "pte-essay", label: "PTE Essay" },
];

export type PTEEssayTraitId =
  | "content"
  | "form"
  | "development"
  | "grammar"
  | "linguisticRange"
  | "vocabulary"
  | "spelling";

export interface PTEEssayTraitScore {
  id: PTEEssayTraitId;
  label: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface PTEEssayScoreResult {
  traits: PTEEssayTraitScore[];
  totalScore: number;
  maxTotalScore: number;
  cascadeNote: string | null;
  topFixes: string[];
}

export interface PTEEssaySession {
  id: string;
  createdAt: string;
  essayText: string;
  prompt: string;
  score: PTEEssayScoreResult;
}

export interface PTEEssayImproveChange {
  trait: string;
  whatChanged: string;
  whySuccinct: string;
}

export interface PTEEssayImproveResult {
  improvedEssay: string;
  changes: PTEEssayImproveChange[];
}

export interface PTETraitScoreComparison {
  label: string;
  before: number;
  after: number;
  maxScore: number;
}

export interface PTEScoreComparison {
  traits: PTETraitScoreComparison[];
  totalBefore: number;
  totalAfter: number;
  maxTotalScore: number;
}

export function isWritingMode(value: string | null | undefined): value is WritingMode {
  return value === "general" || value === "pte-essay";
}
