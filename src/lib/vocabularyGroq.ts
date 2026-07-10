import type { VocabularyWord } from "../constants/vocabularyTopics";
import type {
  PickMeaningExercise,
  UseItExercise,
  UseItResult,
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

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GroqApiError(
      "GROQ is not configured. Set NEXT_PUBLIC_GROQ_API_KEY in .env.local or connect InsForge.",
    );
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
      temperature: 0.65,
    }),
  });

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new GroqApiError(apiMessage ?? `Request failed (${response.status}).`);
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

function wordContext(word: VocabularyWord): string {
  return `Word: ${word.word} (${word.partOfSpeech})
Definition: ${word.definition}
Teaser: ${word.teaser}`;
}

export async function generateUseItExercise(
  word: VocabularyWord,
  seed: string,
): Promise<UseItExercise> {
  const systemPrompt = `Create a "Use It" vocabulary exercise. JSON only:
{ "context": string, "prompt": string }

${wordContext(word)}
Variety seed: ${seed}
context is 1-2 sentences setting a scene. prompt asks user to write ONE sentence using the target word correctly. JSON only.`;

  const data = parseJson<UseItExercise>(await callGroq(systemPrompt, "Generate exercise."));
  if (!data.context || !data.prompt) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkUseIt(
  word: VocabularyWord,
  userSentence: string,
): Promise<UseItResult> {
  const systemPrompt = `Evaluate vocabulary usage in a sentence. JSON only:
{ "correct": boolean, "feedback": string, "exampleSentence": string, "explanation": string }

${wordContext(word)}
Judge meaning, part of speech, and natural usage. JSON only.`;

  const data = parseJson<UseItResult>(
    await callGroq(systemPrompt, `Sentence: ${userSentence}`),
  );
  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.exampleSentence ||
    !data.explanation
  ) {
    throw new GroqApiError("The check response was invalid. Try again.");
  }
  return data;
}

export async function generatePickMeaningExercise(
  word: VocabularyWord,
  seed: string,
): Promise<PickMeaningExercise> {
  const systemPrompt = `Create a "Pick the Meaning" vocabulary exercise. JSON only:
{ "sentence": string, "options": string[], "correctIndex": number, "explanation": string }

${wordContext(word)}
Variety seed: ${seed}
sentence uses the word (or pair) in context. options: 4 short meaning choices, one correct. correctIndex 0-based. JSON only.`;

  const data = parseJson<PickMeaningExercise>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (
    !data.sentence ||
    !Array.isArray(data.options) ||
    data.options.length < 3 ||
    data.correctIndex < 0 ||
    data.correctIndex >= data.options.length ||
    !data.explanation
  ) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function generateReplaceItExercise(
  word: VocabularyWord,
  seed: string,
): Promise<{ weakSentence: string; weakWord: string; hint: string }> {
  const systemPrompt = `Create a "Replace It" vocabulary exercise. JSON only:
{ "weakSentence": string, "weakWord": string, "hint": string }

${wordContext(word)}
Variety seed: ${seed}
weakSentence uses a vague or weak word that should be replaced with the target word. weakWord is the word to replace. JSON only.`;

  const data = parseJson<{ weakSentence: string; weakWord: string; hint: string }>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (!data.weakSentence || !data.weakWord || !data.hint) {
    throw new GroqApiError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkReplaceIt(
  word: VocabularyWord,
  weakSentence: string,
  userSentence: string,
): Promise<UseItResult> {
  const systemPrompt = `Evaluate a vocabulary replacement rewrite. JSON only:
{ "correct": boolean, "feedback": string, "exampleSentence": string, "explanation": string }

${wordContext(word)}
Original weak sentence: ${weakSentence}
User should replace the weak word with "${word.word}" naturally. JSON only.`;

  const data = parseJson<UseItResult>(
    await callGroq(systemPrompt, `Rewrite: ${userSentence}`),
  );
  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.exampleSentence ||
    !data.explanation
  ) {
    throw new GroqApiError("The check response was invalid. Try again.");
  }
  return data;
}
