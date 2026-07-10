import type { GrammarTopic } from "../constants/grammarTopics";
import type {
  FillBlankExercise,
  FillBlankResult,
  IdentifyItExercise,
  TransformItExercise,
  TransformItResult,
} from "../types";
import { GroqApiError } from "./groqClient";

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
        : "Bad request — the selected model may be unavailable.";
    default:
      if (status === 0 || !navigator.onLine) {
        return "Network error — check your connection and try again.";
      }
      return apiMessage ?? `Request failed with status ${status}.`;
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
        temperature: 0.65,
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

function parseJson<T>(content: string): T {
  try {
    return JSON.parse(extractJsonPayload(content)) as T;
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }
}

function topicContext(topic: GrammarTopic): string {
  return `Topic: ${topic.name} (${topic.categoryId})
Key rule: ${topic.keyRule}
Teaser: ${topic.teaser}`;
}

export async function generateIdentifyItExercise(
  topic: GrammarTopic,
  seed: string,
): Promise<IdentifyItExercise> {
  const systemPrompt = `Create an "Identify It" grammar exercise. JSON only:
{ "sentence": string, "targetPhrase": string, "targetIndex": number, "confirmation": string, "hint": string, "explanation": string }

${topicContext(topic)}
Variety seed: ${seed}
The user must click the word or phrase demonstrating this concept. targetIndex is 0-based word index of targetPhrase's first word in sentence.split(/\\s+/). confirmation is brief praise when correct. hint guides without giving answer. explanation reveals after 2 wrong attempts. JSON only.`;

  const data = parseJson<IdentifyItExercise>(
    await callGroq(systemPrompt, "Generate exercise."),
  );

  const tokens = data.sentence?.split(/\s+/) ?? [];
  if (
    !data.sentence ||
    !data.targetPhrase ||
    data.targetIndex < 0 ||
    data.targetIndex >= tokens.length ||
    !data.confirmation ||
    !data.hint ||
    !data.explanation
  ) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function generateFillBlankExercise(
  topic: GrammarTopic,
  seed: string,
): Promise<FillBlankExercise> {
  const systemPrompt = `Create a "Fill in the Blank" grammar exercise. JSON only:
{ "stem": string, "hint": string }

${topicContext(topic)}
Variety seed: ${seed}
Stem has exactly one ___ blank. Hint is subtle. JSON only.`;

  const data = parseJson<FillBlankExercise>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (!data.stem?.includes("___") || !data.hint) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkFillBlank(
  topic: GrammarTopic,
  stem: string,
  answer: string,
): Promise<FillBlankResult> {
  const systemPrompt = `Evaluate a fill-in-the-blank grammar answer. JSON only:
{ "correct": boolean, "feedback": string, "correctAnswer": string, "explanation": string }

${topicContext(topic)}
Accept minor spelling variants if grammar is right. JSON only.`;

  const data = parseJson<FillBlankResult>(
    await callGroq(systemPrompt, `Stem: ${stem}\nAnswer: ${answer}`),
  );
  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.correctAnswer ||
    !data.explanation
  ) {
    throw new GroqApiError("The check response was invalid. Try again.");
  }
  return data;
}

export async function generateTransformItExercise(
  topic: GrammarTopic,
  seed: string,
): Promise<TransformItExercise> {
  const systemPrompt = `Create a "Transform It" grammar exercise. JSON only:
{ "originalSentence": string, "prompt": string, "modelAnswer": string }

${topicContext(topic)}
Variety seed: ${seed}
originalSentence does NOT yet use the target concept. User rewrites to apply it. prompt is one clear instruction. modelAnswer is an ideal rewrite. JSON only.`;

  const data = parseJson<TransformItExercise>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (!data.originalSentence || !data.prompt || !data.modelAnswer) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkTransformIt(
  topic: GrammarTopic,
  originalSentence: string,
  userRewrite: string,
): Promise<TransformItResult> {
  const systemPrompt = `Evaluate a grammar transformation rewrite. JSON only:
{ "correct": boolean, "feedback": string, "modelAnswer": string, "explanation": string }

${topicContext(topic)}
Judge grammar and whether the rewrite correctly applies the concept. JSON only.`;

  const data = parseJson<TransformItResult>(
    await callGroq(
      systemPrompt,
      `Original: ${originalSentence}\nRewrite: ${userRewrite}`,
    ),
  );
  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.modelAnswer ||
    !data.explanation
  ) {
    throw new GroqApiError("The check response was invalid. Try again.");
  }
  return data;
}
