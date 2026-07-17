import { ApiError } from "./apiClient";
import { fetchTopErrorCategoriesForPrompt } from "./errorPatternClient";
import { isGroqConfigured } from "./groqClient";
import {
  buildLocalPTEEssayImprove,
  improvePTEEssayWithGroq,
} from "./improvePTEEssayGroq";
import { getWeakestTraits } from "./pteEssayScoring";
import { userCanAccessPatternTracking } from "./premium";
import type { PTEEssayImproveResult, PTEEssayScoreResult } from "../types/writingMode";
import type { AuthUser } from "../hooks/useAuth";

export async function improvePTEEssay(
  essay: string,
  prompt: string,
  scoreResult: PTEEssayScoreResult,
  options: { user?: AuthUser | null } = {},
): Promise<PTEEssayImproveResult> {
  const trimmed = essay.trim();
  if (!trimmed) {
    throw new ApiError("Essay text is required.");
  }

  const weakestTraits = getWeakestTraits(scoreResult, 3);
  const recurringPatterns = userCanAccessPatternTracking(options.user)
    ? await fetchTopErrorCategoriesForPrompt(options.user, 3)
    : [];

  if (isGroqConfigured()) {
    try {
      return await improvePTEEssayWithGroq(
        trimmed,
        prompt,
        scoreResult,
        weakestTraits,
        recurringPatterns,
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Fall through to local revision.
    }
  }

  return buildLocalPTEEssayImprove(trimmed, weakestTraits, recurringPatterns);
}
