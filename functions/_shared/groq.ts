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

const TONE_JSON_SHAPE = `${BASE_JSON_SHAPE.slice(0, -1)},
  "toneDriftNote": string
}`;

type AdjustedTone = "formal" | "casual";

const TONE_GUIDANCE: Record<AdjustedTone, string> = {
  formal:
    "more formal register, avoid contractions and casual phrasing, more precise word choice",
  casual: "conversational, contractions allowed, relaxed phrasing",
};

export interface WritingError {
  issue: string;
  explanation: string;
  teaching?: {
    why: string;
    principle: string;
    example: { before: string; after: string };
  };
}

export interface VocabularyItem {
  word: string;
  definition: string;
  sourceSentence: string;
}

export interface AnalysisResult {
  errors: WritingError[];
  registerScore: number;
  simple: string;
  intermediate: string;
  intermediateTechnique: string;
  advanced: string;
  advancedTechnique: string;
  toneDriftNote?: string;
  vocabularyCatch?: VocabularyItem[];
}

export interface CorrectionResult {
  score: number;
  corrected: Array<{
    issue: string;
    userAttempt: string;
    verdict: "fixed" | "partial" | "missed";
    hint: string;
  }>;
  encouragement: string;
}

export class GroqServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqServiceError";
  }
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

function parseVocabularyCatch(data: unknown): VocabularyItem[] | undefined {
  if (!Array.isArray(data)) return undefined;
  const items = data
    .filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return (
        typeof obj.word === "string" &&
        obj.word.trim() &&
        typeof obj.definition === "string" &&
        obj.definition.trim() &&
        typeof obj.sourceSentence === "string" &&
        obj.sourceSentence.trim()
      );
    })
    .map((item) => {
      const obj = item as Record<string, unknown>;
      return {
        word: String(obj.word).trim(),
        definition: String(obj.definition).trim(),
        sourceSentence: String(obj.sourceSentence).trim(),
      };
    })
    .slice(0, 3);
  return items.length > 0 ? items : undefined;
}

function parseAnalysisResult(raw: string, isTonePass: boolean): AnalysisResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(raw));
  } catch {
    throw new GroqServiceError(
      "The model returned a response we couldn't parse. Try again or switch models.",
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new GroqServiceError("The model returned an invalid response shape.");
  }

  const data = parsed as Record<string, unknown>;

  if (!Array.isArray(data.errors)) {
    throw new GroqServiceError("The model response is missing a valid errors list.");
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
    throw new GroqServiceError("The model response is missing one or more rewrites.");
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
    vocabularyCatch: parseVocabularyCatch(data.vocabularyCatch),
  };
}

function buildFullSystemPrompt(): string {
  return `You are an expert writing coach. Analyse the user's text and respond with JSON only.

Return a JSON object with exactly this shape:
${BASE_JSON_SHAPE}

Rules for "registerScore":
- A number from 0 to 100 estimating where the ORIGINAL text's vocabulary and sentence complexity fall on a simple-to-advanced spectrum.
- 0 = very simple/plain, 50 = intermediate/standard, 100 = very advanced/sophisticated.
- Base this only on the user's original text, not the rewrites.

Rules for "errors":
- List specific grammar, wording, punctuation, or clarity issues in the original text.
- Each item needs a short "issue" (what is wrong) and "explanation" (plain-English fix).
- In "issue", quote the exact problematic phrase from the user's text in double quotes when possible.
- If there are no mistakes, return "errors": [].

For each error, include a "teaching" object with "why", "principle", and "example" (generic before/after, not from user's text).

Rules for "vocabularyCatch":
- Extract 2–3 notable advanced-vocabulary words from the "advanced" rewrite ONLY.
- Each item: word, definition (one short plain-English sentence), sourceSentence (full advanced sentence).
- Return at most 3 items, or an empty array if none stand out.

Rules for rewrites: preserve exact meaning; only change vocabulary and complexity.

Respond with valid JSON only. No markdown.`;
}

function buildToneSystemPrompt(tone: AdjustedTone): string {
  return `You are an expert writing coach. Adjust tone of complexity-tier rewrites. Respond with JSON only.

Return exactly this shape:
${TONE_JSON_SHAPE}

Apply "${tone}" tone: ${TONE_GUIDANCE[tone]}
Preserve meaning and complexity tiers. Return "errors": [] and "registerScore": 50.
For vocabularyCatch return [] on tone passes.

Respond with valid JSON only.`;
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? null;
  } catch {
    return null;
  }
}

function mapHttpError(status: number, apiMessage: string | null): string {
  switch (status) {
    case 401:
      return "Invalid API key. Check your GROQ key and try again.";
    case 429:
      return "Rate limited by GROQ. Wait a moment and try again.";
    case 400:
      return apiMessage
        ? `Bad request: ${apiMessage}`
        : "Bad request — the selected model may be unavailable or the text may be too long.";
    case 403:
      return "Access denied. Your API key may lack permission for this model.";
    case 500:
    case 502:
    case 503:
      return "GROQ is temporarily unavailable. Please try again shortly.";
    default:
      return apiMessage
        ? `Request failed (${status}): ${apiMessage}`
        : `Request failed with status ${status}.`;
  }
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new GroqServiceError("GROQ API key is not configured on the server.");
  }

  const model = Deno.env.get("GROQ_MODEL") ?? DEFAULT_MODEL;

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new GroqServiceError(mapHttpError(response.status, apiMessage));
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqServiceError("GROQ returned an empty response. Try again.");
  }

  return content;
}

export async function analyzeWriting(
  text: string,
  tone: string = "neutral",
): Promise<AnalysisResult> {
  const isTonePass = tone !== "neutral" && (tone === "formal" || tone === "casual");
  const systemPrompt = isTonePass
    ? buildToneSystemPrompt(tone as AdjustedTone)
    : buildFullSystemPrompt();
  const userContent = isTonePass
    ? `Adjust the simple, intermediate, and advanced rewrites of this text to the "${tone}" tone:\n\n${text}`
    : `Analyse this text:\n\n${text}`;

  const content = await callGroq(systemPrompt, userContent);
  return parseAnalysisResult(content, isTonePass);
}

export async function checkCorrection(
  original: string,
  userAttempt: string,
  knownErrors: WritingError[],
): Promise<CorrectionResult> {
  const errorsContext = knownErrors
    .map((error, index) => `${index + 1}. Issue: ${error.issue}\n   Explanation: ${error.explanation}`)
    .join("\n");

  const systemPrompt = `You are an expert writing coach evaluating a self-correction attempt. Respond with JSON only:
{
  "score": number,
  "corrected": [{ "issue": string, "userAttempt": string, "verdict": "fixed" | "partial" | "missed", "hint": string }],
  "encouragement": string
}
Evaluate how well the student addressed each known error. One warm encouragement sentence. JSON only.`;

  const userContent = `Original:\n${original}\n\nKnown errors:\n${errorsContext}\n\nStudent attempt:\n${userAttempt}`;

  const content = await callGroq(systemPrompt, userContent);

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqServiceError("The model returned a response we couldn't parse.");
  }

  const data = parsed as Record<string, unknown>;
  const encouragement =
    typeof data.encouragement === "string" && data.encouragement.trim()
      ? data.encouragement.trim()
      : "Nice effort — compare your version with the feedback below.";

  let corrected: CorrectionResult["corrected"] = [];
  if (Array.isArray(data.corrected)) {
    corrected = data.corrected.filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return (
        typeof obj.issue === "string" &&
        typeof obj.userAttempt === "string" &&
        (obj.verdict === "fixed" || obj.verdict === "partial" || obj.verdict === "missed") &&
        typeof obj.hint === "string"
      );
    }) as CorrectionResult["corrected"];
  }

  const score =
    typeof data.score === "number" && !Number.isNaN(data.score)
      ? Math.min(100, Math.max(0, Math.round(data.score)))
      : 0;

  return { score, corrected, encouragement };
}
