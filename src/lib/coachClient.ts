import type {
  CoachEvaluateMode,
  CoachLevelId,
  CoachProgressState,
  CollocationEvaluateResult,
  CombineParagraphResult,
  EssayCoachResult,
  StepFeedbackResult,
} from "../types/coach";
import { ApiError } from "./apiClient";
import * as groqClient from "./groqClient";
import { insforge, isInsforgeConfigured } from "./insforge";

const STORAGE_KEY = "wrytesmart_coach_progress";

function extractErrorMessage(error: unknown): string {
  if (!error) return "Request failed. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return "Request failed. Please try again.";
}

function assertNoPayloadError(data: unknown): void {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: string }).error;
    if (message) throw new ApiError(message);
  }
}

async function invokeCoach<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await insforge.functions.invoke("coach-evaluate", { body });
  if (error) {
    const message = extractErrorMessage(error);
    if (message.toLowerCase().includes("not found") && groqClient.isGroqConfigured()) {
      throw new ApiError("COACH_FALLBACK");
    }
    throw new ApiError(message);
  }
  assertNoPayloadError(data);
  return data as T;
}

function emptyProgress(): CoachProgressState {
  return {
    levels: {},
    weakCollocations: [],
    recentVocabulary: [],
    grammarMistakes: [],
  };
}

export function readCoachProgress(): CoachProgressState {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...(JSON.parse(raw) as CoachProgressState) };
  } catch {
    return emptyProgress();
  }
}

export function writeCoachProgress(state: CoachProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getLevelProgress(state: CoachProgressState, levelId: CoachLevelId) {
  return (
    state.levels[levelId] ?? {
      completedSessions: 0,
      lastAccuracy: null,
      inProgressStep: null,
      inProgressData: {},
    }
  );
}

export function recordLevelSession(
  levelId: CoachLevelId,
  accuracy: number,
  extras?: {
    weakCollocations?: string[];
    vocabulary?: string[];
    grammarMistakes?: string[];
  },
): CoachProgressState {
  const current = readCoachProgress();
  const level = getLevelProgress(current, levelId);

  const next: CoachProgressState = {
    ...current,
    levels: {
      ...current.levels,
      [levelId]: {
        ...level,
        completedSessions: level.completedSessions + 1,
        lastAccuracy: accuracy,
        lastPracticedAt: new Date().toISOString(),
        inProgressStep: null,
        inProgressData: {},
      },
    },
    weakCollocations: [...new Set([...current.weakCollocations, ...(extras?.weakCollocations ?? [])])].slice(-30),
    recentVocabulary: [...new Set([...(extras?.vocabulary ?? []), ...current.recentVocabulary])].slice(0, 30),
    grammarMistakes: [...new Set([...current.grammarMistakes, ...(extras?.grammarMistakes ?? [])])].slice(-30),
  };

  writeCoachProgress(next);
  return next;
}

export function saveLevelDraft(
  levelId: CoachLevelId,
  step: number | null,
  data: Record<string, string>,
): CoachProgressState {
  const current = readCoachProgress();
  const level = getLevelProgress(current, levelId);
  const next: CoachProgressState = {
    ...current,
    levels: {
      ...current.levels,
      [levelId]: {
        ...level,
        inProgressStep: step,
        inProgressData: data,
      },
    },
  };
  writeCoachProgress(next);
  return next;
}

export function isCoachAvailable(): boolean {
  return isInsforgeConfigured() || groqClient.isGroqConfigured();
}

async function withCoachFallback<T>(
  body: Record<string, unknown>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (isInsforgeConfigured()) {
    try {
      return await invokeCoach<T>(body);
    } catch (err) {
      if (err instanceof ApiError && err.message === "COACH_FALLBACK") {
        return fallback();
      }
      if (groqClient.isGroqConfigured()) {
        try {
          return await fallback();
        } catch {
          throw err;
        }
      }
      throw err;
    }
  }
  return fallback();
}

export async function evaluateCollocationBuilder(
  verb: string,
  answers: string[],
): Promise<CollocationEvaluateResult> {
  return withCoachFallback<CollocationEvaluateResult>(
    { mode: "collocation-builder", anchor: verb, answers },
    () => groqClient.evaluateCollocations(verb, "verb", answers),
  );
}

export async function evaluateNounFamilies(
  noun: string,
  answers: string[],
): Promise<CollocationEvaluateResult> {
  return withCoachFallback<CollocationEvaluateResult>(
    { mode: "noun-families", anchor: noun, answers },
    () => groqClient.evaluateCollocations(noun, "noun", answers),
  );
}

export async function getStepFeedback(
  stepLabel: string,
  question: string,
  answer: string,
  context?: string,
): Promise<StepFeedbackResult> {
  return withCoachFallback<StepFeedbackResult>(
    { mode: "step-feedback", stepLabel, question, answer, context },
    () => groqClient.evaluateCoachStep(stepLabel, question, answer, context),
  );
}

export async function combineCoachParagraph(
  steps: Array<{ label: string; answer: string }>,
): Promise<CombineParagraphResult> {
  return withCoachFallback<CombineParagraphResult>(
    { mode: "combine-paragraph", steps },
    () => groqClient.combineCoachParagraph(steps),
  );
}

export async function evaluateCoachEssay(
  essay: string,
  prompt?: string,
): Promise<EssayCoachResult> {
  return withCoachFallback<EssayCoachResult>(
    { mode: "essay-coach", essay, prompt },
    () => groqClient.evaluateCoachEssay(essay, prompt),
  );
}
