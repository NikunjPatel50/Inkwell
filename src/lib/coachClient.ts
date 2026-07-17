import type {
  CoachEvaluateMode,
  CoachLevelId,
  CoachProgressState,
  CollocationEvaluateResult,
  CollocationTopicExamples,
  CombineParagraphResult,
  EssayCoachResult,
  StepFeedbackResult,
} from "../types/coach";
import { ApiError } from "./apiClient";
import {
  recordCoachCollocationErrors,
  recordCoachEssayErrors,
  recordCoachStepFeedbackError,
} from "./coachErrorTracking";
import * as groqClient from "./groqClient";
import {
  buildCollocationTopicExamplesLocally,
  evaluateCollocationsLocally,
  isValidCollocationResult,
  isValidCollocationTopicExamples,
} from "./localCoach";
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

async function tryInvokeCoach<T>(body: Record<string, unknown>): Promise<T | null> {
  if (!isInsforgeConfigured()) return null;

  const { data, error } = await insforge.functions.invoke("coach-evaluate", { body });
  if (error) return null;
  if (data == null) return null;

  try {
    assertNoPayloadError(data);
  } catch {
    return null;
  }

  return data as T;
}

async function withCoachFallback<T>(
  body: Record<string, unknown>,
  fallback: () => Promise<T>,
  local?: () => T,
  validate?: (value: unknown) => value is T,
): Promise<T> {
  const dedicated = await tryInvokeCoach<T>(body);
  if (dedicated != null && (!validate || validate(dedicated))) {
    return dedicated;
  }

  if (groqClient.isGroqConfigured()) {
    try {
      return await fallback();
    } catch {
      if (local) return local();
      throw new ApiError("Coach evaluation failed. Try again.");
    }
  }

  if (local) return local();
  throw new ApiError("Coach evaluation is not configured. Connect InsForge or set GROQ API key.");
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
  return true;
}

export async function evaluateCollocationBuilder(
  verb: string,
  answers: string[],
): Promise<CollocationEvaluateResult> {
  const evaluation = await withCoachFallback<CollocationEvaluateResult>(
    { mode: "collocation-builder", anchor: verb, answers },
    () => groqClient.evaluateCollocations(verb, "verb", answers),
    () => evaluateCollocationsLocally(verb, "verb", answers),
    isValidCollocationResult,
  );

  void recordCoachCollocationErrors(evaluation);

  return ensureTopicExamples(evaluation, verb, "verb", answers);
}

export async function evaluateNounFamilies(
  noun: string,
  answers: string[],
): Promise<CollocationEvaluateResult> {
  const evaluation = await withCoachFallback<CollocationEvaluateResult>(
    { mode: "noun-families", anchor: noun, answers },
    () => groqClient.evaluateCollocations(noun, "noun", answers),
    () => evaluateCollocationsLocally(noun, "noun", answers),
    isValidCollocationResult,
  );

  void recordCoachCollocationErrors(evaluation);

  return ensureTopicExamples(evaluation, noun, "noun", answers);
}

async function ensureTopicExamples(
  evaluation: CollocationEvaluateResult,
  anchor: string,
  anchorType: "verb" | "noun",
  answers: string[],
): Promise<CollocationEvaluateResult> {
  if (evaluation.topicExamples?.length) return evaluation;

  const collocations = [...answers, ...evaluation.missingCollocations];
  const generated = await generateCollocationTopicExamples(anchor, anchorType, collocations);
  return { ...evaluation, topicExamples: generated };
}

export async function generateCollocationTopicExamples(
  anchor: string,
  anchorType: "verb" | "noun",
  collocations: string[],
): Promise<CollocationTopicExamples[]> {
  const trimmed = collocations.map((entry) => entry.trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  const dedicated = await tryInvokeCoach<{ topicExamples?: CollocationTopicExamples[] }>({
    mode: "collocation-topic-examples",
    anchor,
    anchorType,
    collocations: trimmed,
  });

  if (dedicated?.topicExamples && isValidCollocationTopicExamples(dedicated.topicExamples)) {
    return dedicated.topicExamples;
  }

  if (groqClient.isGroqConfigured()) {
    try {
      const examples = await groqClient.generateCollocationTopicExamples(
        anchor,
        anchorType,
        trimmed,
      );
      if (isValidCollocationTopicExamples(examples) && examples.length > 0) {
        return examples;
      }
    } catch {
      // Fall through to local templates.
    }
  }

  return buildCollocationTopicExamplesLocally(trimmed);
}

export async function getStepFeedback(
  stepLabel: string,
  question: string,
  answer: string,
  context?: string,
): Promise<StepFeedbackResult> {
  const result = await withCoachFallback<StepFeedbackResult>(
    { mode: "step-feedback", stepLabel, question, answer, context },
    () => groqClient.evaluateCoachStep(stepLabel, question, answer, context),
  );

  void recordCoachStepFeedbackError(stepLabel, question, answer, result);
  return result;
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
  const result = await withCoachFallback<EssayCoachResult>(
    { mode: "essay-coach", essay, prompt },
    () => groqClient.evaluateCoachEssay(essay, prompt),
  );

  void recordCoachEssayErrors(result, essay);
  return result;
}
