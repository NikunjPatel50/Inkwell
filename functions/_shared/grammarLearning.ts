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

function mapHttpError(status: number, apiMessage: string | null): string {
  switch (status) {
    case 401:
      return "Invalid API key. Check your GROQ key and try again.";
    case 429:
      return "Rate limited by GROQ. Wait a moment and try again.";
    default:
      return apiMessage ?? `Request failed with status ${status}.`;
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
    throw new GroqServiceError(mapHttpError(response.status, await readErrorMessage(response)));
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

export interface GrammarTopicInput {
  name: string;
  categoryId: string;
  keyRule: string;
  teaser: string;
}

function topicContext(topic: GrammarTopicInput): string {
  return `Topic: ${topic.name} (${topic.categoryId})
Key rule: ${topic.keyRule}
Teaser: ${topic.teaser}`;
}

export async function generateIdentifyItExercise(topic: GrammarTopicInput, seed: string) {
  const systemPrompt = `Create an "Identify It" grammar exercise. JSON only:
{ "sentence": string, "targetPhrase": string, "targetIndex": number, "confirmation": string, "hint": string, "explanation": string }

${topicContext(topic)}
Variety seed: ${seed}
The user must click the word or phrase demonstrating this concept. targetIndex is 0-based word index of targetPhrase's first word in sentence.split(/\\s+/). confirmation is brief praise when correct. hint guides without giving answer. explanation reveals after 2 wrong attempts. JSON only.`;

  const data = parseJson<{
    sentence: string;
    targetPhrase: string;
    targetIndex: number;
    confirmation: string;
    hint: string;
    explanation: string;
  }>(await callGroq(systemPrompt, "Generate exercise."));

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
    throw new GroqServiceError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function generateFillBlankExercise(topic: GrammarTopicInput, seed: string) {
  const systemPrompt = `Create a "Fill in the Blank" grammar exercise. JSON only:
{ "stem": string, "hint": string }

${topicContext(topic)}
Variety seed: ${seed}
Stem has exactly one ___ blank. Hint is subtle. JSON only.`;

  const data = parseJson<{ stem: string; hint: string }>(
    await callGroq(systemPrompt, "Generate exercise."),
  );
  if (!data.stem?.includes("___") || !data.hint) {
    throw new GroqServiceError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkFillBlank(topic: GrammarTopicInput, stem: string, answer: string) {
  const systemPrompt = `Evaluate a fill-in-the-blank grammar answer. JSON only:
{ "correct": boolean, "feedback": string, "correctAnswer": string, "explanation": string }

${topicContext(topic)}
Accept minor spelling variants if grammar is right. JSON only.`;

  const data = parseJson<{
    correct: boolean;
    feedback: string;
    correctAnswer: string;
    explanation: string;
  }>(await callGroq(systemPrompt, `Stem: ${stem}\nAnswer: ${answer}`));

  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.correctAnswer ||
    !data.explanation
  ) {
    throw new GroqServiceError("The check response was invalid. Try again.");
  }
  return data;
}

export async function generateTransformItExercise(topic: GrammarTopicInput, seed: string) {
  const systemPrompt = `Create a "Transform It" grammar exercise. JSON only:
{ "originalSentence": string, "prompt": string, "modelAnswer": string }

${topicContext(topic)}
Variety seed: ${seed}
originalSentence does NOT yet use the target concept. User rewrites to apply it. prompt is one clear instruction. modelAnswer is an ideal rewrite. JSON only.`;

  const data = parseJson<{
    originalSentence: string;
    prompt: string;
    modelAnswer: string;
  }>(await callGroq(systemPrompt, "Generate exercise."));

  if (!data.originalSentence || !data.prompt || !data.modelAnswer) {
    throw new GroqServiceError("The exercise data was invalid. Try again.");
  }
  return data;
}

export async function checkTransformIt(
  topic: GrammarTopicInput,
  originalSentence: string,
  userRewrite: string,
) {
  const systemPrompt = `Evaluate a grammar transformation rewrite. JSON only:
{ "correct": boolean, "feedback": string, "modelAnswer": string, "explanation": string }

${topicContext(topic)}
Judge grammar and whether the rewrite correctly applies the concept. JSON only.`;

  const data = parseJson<{
    correct: boolean;
    feedback: string;
    modelAnswer: string;
    explanation: string;
  }>(await callGroq(systemPrompt, `Original: ${originalSentence}\nRewrite: ${userRewrite}`));

  if (
    typeof data.correct !== "boolean" ||
    !data.feedback ||
    !data.modelAnswer ||
    !data.explanation
  ) {
    throw new GroqServiceError("The check response was invalid. Try again.");
  }
  return data;
}
