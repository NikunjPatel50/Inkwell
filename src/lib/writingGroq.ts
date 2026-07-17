import type { AnalysisResult, CorrectionResult, Tone, WritingError } from "../types";
import { GroqApiError, isGroqConfigured } from "./groqClient";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const BASE_JSON_SHAPE = `{
  "errors": [{
    "issue": string,
    "explanation": string,
    "teaching": {
      "why": string,
      "principle": string,
      "example": { "before": string, "after": string }
    }
  }],
  "registerScore": number,
  "simple": string,
  "intermediate": string,
  "intermediateTechnique": string,
  "advanced": string,
  "advancedTechnique": string,
  "vocabularyCatch": [{ "word": string, "definition": string, "sourceSentence": string }]
}`;

function getApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function clampRegisterScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseTeaching(value: unknown) {
  if (typeof value !== "object" || value === null) return undefined;
  const data = value as Record<string, unknown>;
  const why = typeof data.why === "string" ? data.why.trim() : "";
  const principle = typeof data.principle === "string" ? data.principle.trim() : "";
  if (!why || !principle) return undefined;
  const exampleRaw = data.example;
  if (typeof exampleRaw !== "object" || exampleRaw === null) return undefined;
  const example = exampleRaw as Record<string, unknown>;
  const before = typeof example.before === "string" ? example.before.trim() : "";
  const after = typeof example.after === "string" ? example.after.trim() : "";
  if (!before || !after) return undefined;
  return { why, principle, example: { before, after } };
}

function parseAnalysisResult(raw: string, isTonePass: boolean): AnalysisResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(raw));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new GroqApiError("The model returned an invalid response shape.");
  }

  const data = parsed as Record<string, unknown>;
  if (!Array.isArray(data.errors)) {
    throw new GroqApiError("The model response is missing a valid errors list.");
  }

  const errors: WritingError[] = data.errors
    .filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return typeof obj.issue === "string" && typeof obj.explanation === "string";
    })
    .map((item) => {
      const obj = item as Record<string, unknown>;
      const teaching = parseTeaching(obj.teaching);
      return {
        issue: String(obj.issue),
        explanation: String(obj.explanation),
        ...(teaching ? { teaching } : {}),
      };
    });

  if (
    typeof data.simple !== "string" ||
    typeof data.intermediate !== "string" ||
    typeof data.advanced !== "string" ||
    typeof data.intermediateTechnique !== "string" ||
    typeof data.advancedTechnique !== "string"
  ) {
    throw new GroqApiError("The model response is missing one or more rewrites.");
  }

  const toneDriftNote =
    typeof data.toneDriftNote === "string" && data.toneDriftNote.trim()
      ? data.toneDriftNote.trim()
      : undefined;

  return {
    errors,
    registerScore: clampRegisterScore(data.registerScore),
    simple: data.simple,
    intermediate: data.intermediate,
    intermediateTechnique: data.intermediateTechnique,
    advanced: data.advanced,
    advancedTechnique: data.advancedTechnique,
    toneDriftNote: isTonePass ? toneDriftNote : undefined,
    vocabularyCatch: [],
  };
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GroqApiError("GROQ is not configured.");
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new GroqApiError(`Request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new GroqApiError("GROQ returned an empty response.");
  return content;
}

function buildFullSystemPrompt(): string {
  return `You are an expert writing coach. Analyse the user's text and respond with JSON only.

Return a JSON object with exactly this shape:
${BASE_JSON_SHAPE}

Rules for "registerScore": number from 0 to 100 for the ORIGINAL text only.
Rules for "errors": grammar, wording, punctuation, or clarity issues. Return [] if none.
For each error include teaching with why, principle, and example.
Rules for rewrites: preserve exact meaning; only change vocabulary and complexity.
Respond with valid JSON only.`;
}

function buildToneSystemPrompt(tone: "formal" | "casual"): string {
  return `Adjust tone of complexity-tier rewrites. Respond with JSON only using this shape:
${BASE_JSON_SHAPE.slice(0, -1)},
  "toneDriftNote": string
}
Apply "${tone}" tone. Preserve meaning. Return "errors": [] and "registerScore": 50.`;
}

export async function analyzeWriting(text: string, tone: Tone = "neutral"): Promise<AnalysisResult> {
  if (!isGroqConfigured()) {
    throw new GroqApiError("GROQ is not configured.");
  }

  const isTonePass = tone === "formal" || tone === "casual";
  const systemPrompt = isTonePass ? buildToneSystemPrompt(tone) : buildFullSystemPrompt();
  const userContent = isTonePass
    ? `Adjust the simple, intermediate, and advanced rewrites of this text to the "${tone}" tone:\n\n${text}`
    : `Analyse this text:\n\n${text}`;

  return parseAnalysisResult(await callGroq(systemPrompt, userContent), isTonePass);
}

export async function checkCorrection(
  original: string,
  attempt: string,
  knownErrors: WritingError[],
): Promise<CorrectionResult> {
  if (!isGroqConfigured()) {
    throw new GroqApiError("GROQ is not configured.");
  }

  const errorsContext = knownErrors
    .map((error, index) => `${index + 1}. Issue: ${error.issue}\n   Explanation: ${error.explanation}`)
    .join("\n");

  const systemPrompt = `Evaluate a self-correction attempt. Respond with JSON only:
{ "score": number, "corrected": [{ "issue": string, "userAttempt": string, "verdict": "fixed" | "partial" | "missed", "hint": string }], "encouragement": string }`;

  const userContent = `Original:\n${original}\n\nKnown errors:\n${errorsContext}\n\nStudent attempt:\n${attempt}`;
  const content = await callGroq(systemPrompt, userContent);
  const parsed = JSON.parse(extractJsonPayload(content)) as Record<string, unknown>;

  return {
    score: typeof parsed.score === "number" ? Math.round(parsed.score) : 0,
    corrected: Array.isArray(parsed.corrected) ? (parsed.corrected as CorrectionResult["corrected"]) : [],
    encouragement:
      typeof parsed.encouragement === "string"
        ? parsed.encouragement
        : "Nice effort — compare your version with the feedback below.",
  };
}
