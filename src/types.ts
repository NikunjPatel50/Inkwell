export interface WritingError {
  issue: string;
  explanation: string;
}

export interface AnalysisResult {
  errors: WritingError[];
  simple: string;
  intermediate: string;
  intermediateTechnique: string;
  advanced: string;
  advancedTechnique: string;
}

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
