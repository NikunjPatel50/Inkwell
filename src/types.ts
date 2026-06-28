export interface WritingError {
  issue: string;
  explanation: string;
}

export interface LadderResult {
  simple: string;
  intermediate: string;
  intermediateTechnique: string;
  advanced: string;
  advancedTechnique: string;
  toneDriftNote?: string;
}

export interface AnalysisResult extends LadderResult {
  errors: WritingError[];
  registerScore: number;
}

export type Tone = "neutral" | "formal" | "casual" | "direct" | "warm";

export type AdjustedTone = Exclude<Tone, "neutral">;

export const TONES: { value: Tone; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "direct", label: "Direct" },
  { value: "warm", label: "Warm" },
];

export type GroqModel =
  | "llama-3.3-70b-versatile"
  | "llama-3.1-8b-instant"
  | "gemma2-9b-it";

export const GROQ_MODELS: { value: GroqModel; label: string }[] = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (versatile)" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (instant)" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B" },
];

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export type ToneCache = Partial<Record<AdjustedTone, LadderResult>>;

export function ladderFromAnalysis(result: AnalysisResult): LadderResult {
  return {
    simple: result.simple,
    intermediate: result.intermediate,
    intermediateTechnique: result.intermediateTechnique,
    advanced: result.advanced,
    advancedTechnique: result.advancedTechnique,
    toneDriftNote: result.toneDriftNote,
  };
}
