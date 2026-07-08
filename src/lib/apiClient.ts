import { insforge } from "./insforge";
import type {
  AnalysisResult,
  CorrectionResult,
  HistoryResponse,
  Tone,
  VocabularyResponse,
  WritingError,
} from "../types";

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

export async function analyzeWriting(
  text: string,
  options: { tone?: Tone } = {},
): Promise<AnalyzeResponse> {
  const { data, error } = await insforge.functions.invoke("analyze-text", {
    body: { text, tone: options.tone ?? "neutral" },
  });

  if (error) {
    throw new ApiError(extractErrorMessage(error));
  }

  assertNoPayloadError(data);
  return data as AnalyzeResponse;
}

export async function checkCorrection(
  original: string,
  attempt: string,
  knownErrors: WritingError[],
): Promise<CorrectionResult> {
  const { data, error } = await insforge.functions.invoke("check-correction", {
    body: { original, attempt, knownErrors },
  });

  if (error) {
    throw new ApiError(extractErrorMessage(error));
  }

  assertNoPayloadError(data);
  return data as CorrectionResult;
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
