import { createClient } from "npm:@insforge/sdk@latest";

// shared: cors
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// shared: vocabularyLearning
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

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

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? null;
  } catch {
    return null;
  }
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new GroqServiceError("GROQ API key is not configured on the server.");

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
      temperature: 0.65,
    }),
  });

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new GroqServiceError(apiMessage ?? `Request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new GroqServiceError("GROQ returned an empty response. Try again.");
  return content;
}

function parseJson<T>(content: string): T {
  try {
    return JSON.parse(extractJsonPayload(content)) as T;
  } catch {
    throw new GroqServiceError("The model returned a response we couldn't parse. Try again.");
  }
}

export interface VocabularyWordInput {
  word: string;
  partOfSpeech: string;
  definition: string;
  teaser: string;
}

function wordContext(word: VocabularyWordInput): string {
  return `Word: ${word.word} (${word.partOfSpeech})
Definition: ${word.definition}
Teaser: ${word.teaser}`;
}

export async function generateUseItExercise(word: VocabularyWordInput, seed: string) {
  const systemPrompt = `Create a "Use It" vocabulary exercise. JSON only:
{ "context": string, "prompt": string }

${wordContext(word)}
Variety seed: ${seed}
context is 1-2 sentences setting a scene. prompt asks user to write ONE sentence using the target word correctly. JSON only.`;

  const data = parseJson<{ context: string; prompt: string }>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (!data.context || !data.prompt) {
    throw new GroqServiceError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkUseIt(word: VocabularyWordInput, userSentence: string) {
  const systemPrompt = `Evaluate vocabulary usage in a sentence. JSON only:
{ "correct": boolean, "feedback": string, "exampleSentence": string, "explanation": string }

${wordContext(word)}
Judge meaning, part of speech, and natural usage. JSON only.`;

  const data = parseJson<{
    correct: boolean;
    feedback: string;
    exampleSentence: string;
    explanation: string;
  }>(await callGroq(systemPrompt, `Sentence: ${userSentence}`));

  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.exampleSentence ||
    !data.explanation
  ) {
    throw new GroqServiceError("The check response was invalid. Try again.");
  }
  return data;
}

export async function generatePickMeaningExercise(word: VocabularyWordInput, seed: string) {
  const systemPrompt = `Create a "Pick the Meaning" vocabulary exercise. JSON only:
{ "sentence": string, "options": string[], "correctIndex": number, "explanation": string }

${wordContext(word)}
Variety seed: ${seed}
sentence uses the word (or pair) in context. options: 4 short meaning choices, one correct. correctIndex 0-based. JSON only.`;

  const data = parseJson<{
    sentence: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>(await callGroq(systemPrompt, "Generate exercise."));

  if (
    !data.sentence ||
    !Array.isArray(data.options) ||
    data.options.length < 3 ||
    data.correctIndex < 0 ||
    data.correctIndex >= data.options.length ||
    !data.explanation
  ) {
    throw new GroqServiceError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function generateReplaceItExercise(word: VocabularyWordInput, seed: string) {
  const systemPrompt = `Create a "Replace It" vocabulary exercise. JSON only:
{ "weakSentence": string, "weakWord": string, "hint": string }

${wordContext(word)}
Variety seed: ${seed}
weakSentence uses a vague or weak word that should be replaced with the target word. weakWord is the word to replace. JSON only.`;

  const data = parseJson<{ weakSentence: string; weakWord: string; hint: string }>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (!data.weakSentence || !data.weakWord || !data.hint) {
    throw new GroqServiceError("The exercise data was invalid. Try again.");
  }
  return data;
}

export interface WordDetailPayload {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  level1: {
    definition: string;
    examples: string[];
    mnemonic: string;
  };
  level2: {
    wordForms: Array<{ form: string; partOfSpeech: string; example: string }>;
    synonyms: Array<{ word: string; note: string }>;
    antonyms: Array<{ word: string; note: string }>;
  };
  level3: {
    collocations: string[];
    register: string;
    commonMistake: string;
    usageContext: string;
  };
  level4: {
    etymology: string;
    connotation: string;
    nuanceComparison: string;
    famousUsage: string;
  };
}

export async function suggestWords(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const systemPrompt = `You help users find English vocabulary. Given a partial or full search query, return JSON only:
{ "suggestions": string[] }

Return up to 5 real English words or phrases (1-3 words) that match or relate to the query.
Include the exact word if the query is already a valid English word.
Prefer common, learnable vocabulary. Lowercase single words unless a proper noun. JSON only.`;

  const data = parseJson<{ suggestions: string[] }>(
    await callGroq(systemPrompt, `Query: ${trimmed}`),
  );

  if (!Array.isArray(data.suggestions)) {
    throw new GroqServiceError("The suggestion response was invalid. Try again.");
  }

  return data.suggestions
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim())
    .slice(0, 5);
}

export async function generateWordDetail(word: string): Promise<WordDetailPayload> {
  const systemPrompt = `You are an English vocabulary teacher. Return JSON only for the word requested.
{
  "word": string,
  "phonetic": string,
  "partOfSpeech": string,
  "level1": { "definition": string, "examples": string[2], "mnemonic": string },
  "level2": {
    "wordForms": [{ "form": string, "partOfSpeech": string, "example": string }],
    "synonyms": [{ "word": string, "note": string }],
    "antonyms": [{ "word": string, "note": string }]
  },
  "level3": {
    "collocations": string[3],
    "register": string,
    "commonMistake": string,
    "usageContext": string
  },
  "level4": {
    "etymology": string,
    "connotation": string,
    "nuanceComparison": string,
    "famousUsage": string
  }
}

Plain English. Examples must use the word naturally. Omit empty word forms in level2.wordForms. JSON only.`;

  const data = parseJson<WordDetailPayload>(
    await callGroq(systemPrompt, `Word: ${word.trim()}`),
  );

  if (!data.word || !data.level1?.definition || !data.level1.examples?.length) {
    throw new GroqServiceError("The word detail response was invalid. Try again.");
  }

  return {
    ...data,
    word: data.word || word,
    level2: {
      wordForms: data.level2?.wordForms?.filter((entry) => entry.form && entry.example) ?? [],
      synonyms: data.level2?.synonyms?.filter((entry) => entry.word) ?? [],
      antonyms: data.level2?.antonyms?.filter((entry) => entry.word) ?? [],
    },
    level3: {
      collocations: data.level3?.collocations ?? [],
      register: data.level3?.register ?? "",
      commonMistake: data.level3?.commonMistake ?? "",
      usageContext: data.level3?.usageContext ?? "",
    },
    level4: {
      etymology: data.level4?.etymology ?? "",
      connotation: data.level4?.connotation ?? "",
      nuanceComparison: data.level4?.nuanceComparison ?? "",
      famousUsage: data.level4?.famousUsage ?? "",
    },
  };
}

export async function checkReplaceIt(
  word: VocabularyWordInput,
  weakSentence: string,
  userSentence: string,
) {
  const systemPrompt = `Evaluate a vocabulary replacement rewrite. JSON only:
{ "correct": boolean, "feedback": string, "exampleSentence": string, "explanation": string }

${wordContext(word)}
Original weak sentence: ${weakSentence}
User should replace the weak word with "${word.word}" naturally. JSON only.`;

  const data = parseJson<{
    correct: boolean;
    feedback: string;
    exampleSentence: string;
    explanation: string;
  }>(await callGroq(systemPrompt, `Rewrite: ${userSentence}`));

  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.exampleSentence ||
    !data.explanation
  ) {
    throw new GroqServiceError("The check response was invalid. Try again.");
  }
  return data;
}

// handler
type WordAction =
  | "generate-use-it"
  | "check-use-it"
  | "generate-pick-meaning"
  | "generate-replace-it"
  | "check-replace-it";

type VocabularyAction = WordAction | "generate-word-detail" | "suggest-words";

function parseWord(body: Record<string, unknown>): VocabularyWordInput | null {
  const word = body.word as VocabularyWordInput | undefined;
  if (!word?.word || !word.partOfSpeech || !word.definition || !word.teaser) return null;
  return word;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = body.action as VocabularyAction | undefined;

    if (!action) {
      return jsonResponse({ error: "Action is required." }, 400);
    }

    if (action === "suggest-words") {
      if (typeof body.query !== "string" || !body.query.trim()) {
        return jsonResponse({ error: "query is required." }, 400);
      }
      const suggestions = await suggestWords(body.query);
      return jsonResponse({ suggestions });
    }

    if (action === "generate-word-detail") {
      if (typeof body.word !== "string" || !body.word.trim()) {
        return jsonResponse({ error: "word is required." }, 400);
      }
      return jsonResponse(await generateWordDetail(body.word));
    }

    const word = parseWord(body);
    if (!word) {
      return jsonResponse({ error: "Action and word are required." }, 400);
    }

    switch (action) {
      case "generate-use-it": {
        if (typeof body.seed !== "string") {
          return jsonResponse({ error: "seed is required." }, 400);
        }
        return jsonResponse(await generateUseItExercise(word, body.seed));
      }
      case "check-use-it": {
        if (typeof body.userSentence !== "string") {
          return jsonResponse({ error: "userSentence is required." }, 400);
        }
        return jsonResponse(await checkUseIt(word, body.userSentence));
      }
      case "generate-pick-meaning": {
        if (typeof body.seed !== "string") {
          return jsonResponse({ error: "seed is required." }, 400);
        }
        return jsonResponse(await generatePickMeaningExercise(word, body.seed));
      }
      case "generate-replace-it": {
        if (typeof body.seed !== "string") {
          return jsonResponse({ error: "seed is required." }, 400);
        }
        return jsonResponse(await generateReplaceItExercise(word, body.seed));
      }
      case "check-replace-it": {
        if (typeof body.weakSentence !== "string" || typeof body.userSentence !== "string") {
          return jsonResponse({ error: "weakSentence and userSentence are required." }, 400);
        }
        return jsonResponse(await checkReplaceIt(word, body.weakSentence, body.userSentence));
      }
      default:
        return jsonResponse({ error: "Unknown action." }, 400);
    }
  } catch (err) {
    const message = err instanceof GroqServiceError ? err.message : "Could not complete request.";
    return jsonResponse({ error: message }, 500);
  }
}
