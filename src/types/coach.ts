export type CoachLevelId =
  | "collocation-builder"
  | "noun-families"
  | "topic-language-bank"
  | "sentence-expansion"
  | "paragraph-builder"
  | "essay-builder"
  | "thinking-mode";

export type CoachEvaluateMode =
  | "collocation-builder"
  | "noun-families"
  | "step-feedback"
  | "combine-paragraph"
  | "essay-coach";

export interface CollocationAnswerResult {
  phrase: string;
  correct: boolean;
  explanation?: string;
}

export interface CollocationEvaluateResult {
  results: CollocationAnswerResult[];
  correctCount: number;
  totalCount: number;
  missingCollocations: string[];
  teachingSummary: string;
}

export interface StepFeedbackResult {
  feedback: string;
  passed: boolean;
  suggestion?: string;
}

export interface CombineParagraphResult {
  paragraph: string;
  techniques: string[];
}

export interface EssayCriterionFeedback {
  label: string;
  score: number;
  maxScore: number;
  teaching: string;
  goodExamples?: string[];
  improvements?: string[];
}

export interface EssayCoachResult {
  criteria: EssayCriterionFeedback[];
  overallSummary: string;
  goodCollocations: string[];
  weakCollocations: string[];
  grammarMistakes: string[];
}

export interface CoachLevelProgress {
  completedSessions: number;
  lastAccuracy: number | null;
  lastPracticedAt?: string;
  inProgressStep: number | null;
  inProgressData: Record<string, string>;
}

export interface CoachProgressState {
  levels: Partial<Record<CoachLevelId, CoachLevelProgress>>;
  weakCollocations: string[];
  recentVocabulary: string[];
  grammarMistakes: string[];
}

export interface CoachLevelDefinition {
  id: CoachLevelId;
  level: number;
  title: string;
  description: string;
  badge: string;
}
