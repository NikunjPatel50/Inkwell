import { insforge, isInsforgeConfigured } from "./insforge";
import { isGroqConfigured } from "./groqClient";
import { buildLocalAnalysis, ensureDistinctRewrites, isValidAnalysisResult } from "./localAnalysis";
import * as writingGroq from "./writingGroq";
import type {
  AnalysisResult,
  CorrectionResult,
  HistoryResponse,
  Tone,
  VocabularyResponse,
  WritingError,
} from "../types";
import type { AuthUser } from "../hooks/useAuth";
import { recordWriteAnalysisErrors } from "./writeErrorTracking";
import { userCanAccessPatternTracking } from "./premium";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

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
    if (message) {
      throw new ApiError(message);
    }
  }
}

export interface AnalyzeResponse extends AnalysisResult {
  sentencesToday: number;
}

function checkCorrectionLocally(
  original: string,
  attempt: string,
  knownErrors: WritingError[],
): CorrectionResult {
  const changed = attempt.trim() !== original.trim();
  const corrected = knownErrors.map((error) => ({
    issue: error.issue,
    userAttempt: attempt,
    verdict: changed ? ("partial" as const) : ("missed" as const),
    hint: changed
      ? "You revised the sentence — check whether each flagged issue is fully addressed."
      : "Try rewriting the sentence to fix the flagged issue.",
  }));

  return {
    score: changed ? 70 : 20,
    corrected,
    encouragement: changed
      ? "Good start — compare your rewrite with the teaching notes."
      : "Give it another pass using the feedback above.",
  };
}

async function tryServerAnalysis(
  text: string,
  tone: Tone,
): Promise<AnalyzeResponse | null> {
  if (!isInsforgeConfigured()) return null;

  const { data, error } = await insforge.functions.invoke("analyze-text", {
    body: { text, tone },
  });

  if (error) {
    const message = extractErrorMessage(error).toLowerCase();
    if (
      message.includes("unauthorized") ||
      message.includes("sign in") ||
      message.includes("401")
    ) {
      return null;
    }
    return null;
  }

  if (data == null) return null;

  try {
    assertNoPayloadError(data);
  } catch {
    return null;
  }

  if (!isValidAnalysisResult(data)) return null;

  const response = data as AnalyzeResponse;
  const normalized = text.trim();
  const enhanced = ensureDistinctRewrites(normalized, response);
  return { ...enhanced, sentencesToday: response.sentencesToday ?? 1 };
}

export async function analyzeWriting(
  text: string,
  options: { tone?: Tone; authenticated?: boolean; user?: AuthUser | null } = {},
): Promise<AnalyzeResponse> {
  const tone = options.tone ?? "neutral";
  const trimmed = text.trim();
  if (!trimmed) {
    throw new ApiError("Text is required.");
  }

  if (options.authenticated !== false) {
    const serverResult = await tryServerAnalysis(trimmed, tone);
    if (serverResult) return serverResult;
  }

  let analysis: AnalyzeResponse;

  if (isGroqConfigured()) {
    try {
      analysis = {
        ...ensureDistinctRewrites(trimmed, await writingGroq.analyzeWriting(trimmed, tone)),
        sentencesToday: 1,
      };
      if (options.authenticated !== false && userCanAccessPatternTracking(options.user)) {
        void recordWriteAnalysisErrors(options.user, analysis.errors);
      }
      return analysis;
    } catch {
      // Fall through to local analysis.
    }
  }

  analysis = {
    ...ensureDistinctRewrites(trimmed, buildLocalAnalysis(trimmed, tone)),
    sentencesToday: 1,
  };

  if (options.authenticated !== false && userCanAccessPatternTracking(options.user)) {
    void recordWriteAnalysisErrors(options.user, analysis.errors);
  }

  return analysis;
}

export async function checkCorrection(
  original: string,
  attempt: string,
  knownErrors: WritingError[],
  options: { authenticated?: boolean } = {},
): Promise<CorrectionResult> {
  if (options.authenticated !== false && isInsforgeConfigured()) {
    try {
      const { data, error } = await insforge.functions.invoke("check-correction", {
        body: { original, attempt, knownErrors },
      });

      if (!error && data != null) {
        assertNoPayloadError(data);
        return data as CorrectionResult;
      }
    } catch {
      // Fall through.
    }
  }

  if (isGroqConfigured()) {
    try {
      return await writingGroq.checkCorrection(original, attempt, knownErrors);
    } catch {
      // Fall through.
    }
  }

  return checkCorrectionLocally(original, attempt, knownErrors);
}

export async function fetchHistory(): Promise<HistoryResponse> {
  const { data, error } = await insforge.functions.invoke("get-history", {
    method: "GET",
  });

  if (error) {
    throw new ApiError(extractErrorMessage(error));
  }

  assertNoPayloadError(data);
  return data as HistoryResponse;
}

export async function fetchVocabulary(): Promise<VocabularyResponse> {
  const { data, error } = await insforge.functions.invoke("get-vocabulary", {
    method: "GET",
  });

  if (error) {
    throw new ApiError(extractErrorMessage(error));
  }

  assertNoPayloadError(data);
  return data as VocabularyResponse;
}
