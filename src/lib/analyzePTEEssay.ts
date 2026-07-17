import { ApiError } from "./apiClient";
import { isInsforgeConfigured, insforge } from "./insforge";
import { isGroqConfigured } from "./groqClient";
import { scorePTEEssayWithGroq } from "./pteEssayGroq";
import { recordPTESession } from "./pteEssaySessions";
import {
  buildLocalPTEEssayScore,
  finalizePTEEssayScore,
  isValidPTEEssayScoreResult,
} from "./pteEssayScoring";
import type { PTEEssayScoreResult } from "../types/writingMode";

async function tryServerPTEScore(
  essay: string,
  prompt?: string,
): Promise<PTEEssayScoreResult | null> {
  if (!isInsforgeConfigured()) return null;

  const { data, error } = await insforge.functions.invoke("analyze-text", {
    body: { text: essay, mode: "pte-essay", prompt },
  });

  if (error || data == null) return null;
  if (typeof data === "object" && data !== null && "error" in data) return null;
  if (!isValidPTEEssayScoreResult(data)) return null;

  return finalizePTEEssayScore(
    (data as PTEEssayScoreResult).traits,
    essay,
    (data as PTEEssayScoreResult).topFixes,
  );
}

function persistScore(
  trimmed: string,
  result: PTEEssayScoreResult,
  prompt?: string,
): PTEEssayScoreResult {
  recordPTESession(trimmed, result, prompt);
  return result;
}

/** Single source of truth for PTE essay scoring (initial score and re-score). */
export async function analyzePTEEssay(
  essay: string,
  options: { prompt?: string; authenticated?: boolean } = {},
): Promise<PTEEssayScoreResult> {
  const trimmed = essay.trim();
  if (!trimmed) {
    throw new ApiError("Essay text is required.");
  }

  if (options.authenticated !== false) {
    const serverResult = await tryServerPTEScore(trimmed, options.prompt);
    if (serverResult) return persistScore(trimmed, serverResult, options.prompt);
  }

  if (isGroqConfigured()) {
    try {
      const ai = await scorePTEEssayWithGroq(trimmed, options.prompt);
      const result = finalizePTEEssayScore(ai.traits, trimmed, ai.topFixes);
      return persistScore(trimmed, result, options.prompt);
    } catch {
      // Fall through to local scoring.
    }
  }

  return persistScore(trimmed, buildLocalPTEEssayScore(trimmed), options.prompt);
}

export const scorePTEEssay = analyzePTEEssay;
