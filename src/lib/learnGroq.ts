import type {
  BuildItExercise,
  CompleteItCheckResult,
  CompleteItExercise,
  SpotTheErrorExercise,
} from "../types";
import type { CurriculumSkill } from "../constants/curriculum";
import { GroqApiError } from "./groqClient";

// Re-use groq call infrastructure via duplicated thin wrappers calling same endpoint pattern
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function getApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
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
      if (status === 0 || !navigator.onLine) {
        return "Network error — check your connection and try again.";
      }
      return apiMessage
        ? `Request failed (${status}): ${apiMessage}`
        : `Request failed with status ${status}.`;
  }
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GroqApiError(
      "GROQ is not configured. Set NEXT_PUBLIC_GROQ_API_KEY in .env.local or connect InsForge.",
    );
  }

  let response: Response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
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
        temperature: 0.6,
      }),
    });
  } catch {
    throw new GroqApiError("Network error — check your connection and try again.");
  }

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new GroqApiError(mapHttpError(response.status, apiMessage));
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new GroqApiError("GROQ returned an empty response. Try again.");
  return content;
}

export function validateBuildItExercise(data: BuildItExercise): boolean {
  return (
    Array.isArray(data.words) &&
    data.words.length >= 4 &&
    Array.isArray(data.correctOrder) &&
    data.correctOrder.length >= 4 &&
    typeof data.explanation === "string" &&
    data.explanation.length > 0
  );
}

export function validateSpotTheErrorExercise(data: SpotTheErrorExercise): boolean {
  const tokens = data.sentence.split(/\s+/);
  return (
    data.sentence.length > 0 &&
    data.errorIndex >= 0 &&
    data.errorIndex < tokens.length &&
    tokens[data.errorIndex] === data.errorWord &&
    data.correction.length > 0 &&
    data.principle.length > 0
  );
}

export function validateCompleteItExercise(data: CompleteItExercise): boolean {
  return data.stem.length > 0 && data.hint.length > 0;
}

export async function generateBuildItExercise(
  skill: CurriculumSkill,
  varietySeed: string,
): Promise<BuildItExercise> {
  const systemPrompt = `Create a "Build It" grammar exercise. JSON only:
{ "words": string[], "correctOrder": string[], "explanation": string }

Skill: ${skill.name} (Tier ${skill.tier}) — ${skill.description}
Theme: ${varietySeed}
"words": 4-6 scrambled chips. "correctOrder": correct order. "explanation": why the order works. JSON only.`;

  const content = await callGroq(systemPrompt, "Generate exercise.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as BuildItExercise;
  if (!validateBuildItExercise(data)) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function generateSpotTheErrorExercise(
  skill: CurriculumSkill,
  varietySeed: string,
): Promise<SpotTheErrorExercise> {
  const systemPrompt = `Create a "Spot the Error" exercise. JSON only:
{ "sentence": string, "errorWord": string, "errorIndex": number, "correction": string, "principle": string }

Skill: ${skill.name} (Tier ${skill.tier}) — ${skill.description}
Theme: ${varietySeed}
One error matching the skill. errorIndex is 0-based word index. JSON only.`;

  const content = await callGroq(systemPrompt, "Generate exercise.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as SpotTheErrorExercise;
  if (!validateSpotTheErrorExercise(data)) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function generateCompleteItExercise(
  skill: CurriculumSkill,
  varietySeed: string,
): Promise<CompleteItExercise> {
  const systemPrompt = `Create a "Complete It" exercise. JSON only:
{ "stem": string, "hint": string }

Skill: ${skill.name} (Tier ${skill.tier}) — ${skill.description}
Theme: ${varietySeed}
Stem with ___ blank. Subtle hint. JSON only.`;

  const content = await callGroq(systemPrompt, "Generate exercise.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as CompleteItExercise;
  if (!validateCompleteItExercise(data)) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkCompleteIt(
  stem: string,
  userCompletion: string,
  skill: CurriculumSkill,
): Promise<CompleteItCheckResult> {
  const systemPrompt = `Evaluate sentence completion for grammar. JSON only:
{ "correct": boolean, "feedback": string, "exampleCompletion": string, "principle": string }

Skill: ${skill.name} — ${skill.description}
Grammar only, not creativity. JSON only.`;

  const content = await callGroq(systemPrompt, `Stem: ${stem}\nCompletion: ${userCompletion}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as CompleteItCheckResult;
  if (
    typeof data.correct !== "boolean" ||
    !data.feedback?.trim() ||
    !data.exampleCompletion?.trim() ||
    !data.principle?.trim()
  ) {
    throw new GroqApiError("The check response was invalid. Try again.");
  }
  return data;
}
