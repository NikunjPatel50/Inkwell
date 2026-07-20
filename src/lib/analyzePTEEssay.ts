import { ApiError } from "./apiClient";
import { isInsforgeConfigured, insforge } from "./insforge";
import { isGroqConfigured } from "./groqClient";
import { scorePTEEssayWithGroq } from "./pteEssayGroq";
import { recordPTESession } from "./pteEssaySessions";
import { recordWritingDnaSubmission } from "./writingDnaClient";
import {
  buildLocalPTEEssayScore,
  finalizePTEEssayScore,
  isValidPTEEssayScoreResult,
} from "./pteEssayScoring";
import type { PTEEssayScoreResult, PTEEssayTraitScore } from "../types/writingMode";
import type { AuthUser } from "../hooks/useAuth";

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

function traitScore(result: PTEEssayScoreResult, id: PTEEssayTraitScore["id"]): number {
  return result.traits.find((trait) => trait.id === id)?.score ?? 0;
}

async function persistScore(
  trimmed: string,
  result: PTEEssayScoreResult,
  prompt?: string,
  options: { user?: AuthUser | null } = {},
): Promise<PTEEssayScoreResult> {
  recordPTESession(trimmed, result, prompt);
  try {
    await recordWritingDnaSubmission(options.user ?? null, {
      text: trimmed,
      sourceTool: "pte",
      errors: result.topFixes.map((fix) => ({
        issue: fix,
        explanation: fix,
      })),
      registerScore: Math.round((traitScore(result, "grammar") + traitScore(result, "vocabulary")) / 2),
    });
  } catch {
    // Non-blocking — PTE score UX should not fail if DNA persistence fails.
  }
  return result;
}

/** Single source of truth for PTE essay scoring (initial score and re-score). */
export async function analyzePTEEssay(
  essay: string,
  options: { prompt?: string; authenticated?: boolean; user?: AuthUser | null } = {},
): Promise<PTEEssayScoreResult> {
  const trimmed = essay.trim();
  if (!trimmed) {
    throw new ApiError("Essay text is required.");
  }

  if (options.authenticated !== false) {
    const serverResult = await tryServerPTEScore(trimmed, options.prompt);
    if (serverResult) return persistScore(trimmed, serverResult, options.prompt, { user: options.user });
  }

  if (isGroqConfigured()) {
    try {
      const ai = await scorePTEEssayWithGroq(trimmed, options.prompt);
      const result = finalizePTEEssayScore(ai.traits, trimmed, ai.topFixes);
      return persistScore(trimmed, result, options.prompt, { user: options.user });
    } catch {
      // Fall through to local scoring.
    }
  }

  return persistScore(trimmed, buildLocalPTEEssayScore(trimmed), options.prompt, { user: options.user });
}

export const scorePTEEssay = analyzePTEEssay;
