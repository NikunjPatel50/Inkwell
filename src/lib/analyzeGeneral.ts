import { analyzeWriting } from "./apiClient";
import type { AnalyzeResponse } from "./apiClient";
import type { AuthUser } from "../hooks/useAuth";
import type { Tone } from "../types";

export async function analyzeGeneral(
  text: string,
  options: { tone?: Tone; authenticated?: boolean; user?: AuthUser | null } = {},
): Promise<AnalyzeResponse> {
  return analyzeWriting(text, options);
}
