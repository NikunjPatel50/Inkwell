import type { AnalysisResult, GroqModel } from "../types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert writing coach. Analyse the user's text and respond with JSON only.

Return a JSON object with exactly this shape:
{
  "errors": [{ "issue": string, "explanation": string }],
  "simple": string,
  "intermediate": string,
  "intermediateTechnique": string,
  "advanced": string,
  "advancedTechnique": string
}

Rules for "errors":
- List specific grammar, wording, punctuation, or clarity issues in the original text.
- Each item needs a short "issue" (what is wrong) and "explanation" (plain-English fix).
- In "issue", quote the exact problematic phrase from the user's text in double quotes when possible (e.g. Informal tone: "a nice platform").
- If there are no mistakes, return "errors": [].

Rules for rewrites (simple, intermediate, advanced):
- Preserve the EXACT same meaning and facts as the original — do not add, remove, or change information.
- Only change vocabulary and sentence complexity.
- Keep similar length and scope to the original.
- "simple": plain, accessible English suitable for beginners.
- "intermediate": standard, clear English for general readers.
- "advanced": sophisticated vocabulary and sentence structure for proficient readers.

Rules for technique notes:
- "intermediateTechnique": one short line naming the main structural/stylistic shift in the intermediate rewrite (e.g. "more formal connectors, clearer clause structure").
- "advancedTechnique": one short line naming the main structural/stylistic shift in the advanced rewrite (e.g. "passive voice, nominalization, subordinate clause").
- Keep each technique note under 12 words — a phrase, not a paragraph.

Respond with valid JSON only. No markdown, no commentary outside the JSON object.`;

export class GroqApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqApiError";
  }
}

/** Strip markdown code fences if the model wraps JSON despite instructions. */
function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

function isWritingError(value: unknown): value is AnalysisResult["errors"][number] {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.issue === "string" && typeof obj.explanation === "string";
}

function parseAnalysisResult(raw: string): AnalysisResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(raw));
  } catch {
    throw new GroqApiError(
      "The model returned a response we couldn't parse. Try again or switch models.",
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new GroqApiError("The model returned an invalid response shape.");
  }

  const data = parsed as Record<string, unknown>;

  if (!Array.isArray(data.errors) || !data.errors.every(isWritingError)) {
    throw new GroqApiError("The model response is missing a valid errors list.");
  }

  if (
    typeof data.simple !== "string" ||
    typeof data.intermediate !== "string" ||
    typeof data.advanced !== "string"
  ) {
    throw new GroqApiError("The model response is missing one or more rewrites.");
  }

  if (
    typeof data.intermediateTechnique !== "string" ||
    typeof data.advancedTechnique !== "string"
  ) {
    throw new GroqApiError("The model response is missing technique notes.");
  }

  return {
    errors: data.errors,
    simple: data.simple,
    intermediate: data.intermediate,
    intermediateTechnique: data.intermediateTechnique,
    advanced: data.advanced,
    advancedTechnique: data.advancedTechnique,
  };
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

export async function analyzeWriting(
  text: string,
  apiKey: string,
  model: GroqModel,
): Promise<AnalysisResult> {
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
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyse this text:\n\n${text}`,
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new GroqApiError(mapHttpError(response.status, apiMessage));
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqApiError("GROQ returned an empty response. Try again.");
  }

  return parseAnalysisResult(content);
}
