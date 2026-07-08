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

// shared: learn
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
      temperature: 0.6,
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

export interface LearnSkillInput {
  name: string;
  tier: number;
  description: string;
}

export async function generateBuildItExercise(
  skill: LearnSkillInput,
  varietySeed: string,
) {
  const systemPrompt = `Create a "Build It" grammar exercise. JSON only:
{ "words": string[], "correctOrder": string[], "explanation": string }

Skill: ${skill.name} (Tier ${skill.tier}) — ${skill.description}
Theme/variety seed: ${varietySeed}

Rules:
- "words": 4-6 word/fragment chips, scrambled OUT of correct order.
- "correctOrder": same items in grammatically correct sentence order.
- "explanation": 1-2 sentences on the grammatical rule when ordered correctly.
- One clear correct ordering. JSON only.`;

  const content = await callGroq(systemPrompt, "Generate exercise.");
  const data = JSON.parse(extractJsonPayload(content)) as Record<string, unknown>;
  const words = Array.isArray(data.words) ? data.words.map(String) : [];
  const correctOrder = Array.isArray(data.correctOrder) ? data.correctOrder.map(String) : [];
  const explanation = typeof data.explanation === "string" ? data.explanation.trim() : "";

  if (words.length < 4 || correctOrder.length < 4 || !explanation) {
    throw new GroqServiceError("Invalid Build It exercise shape.");
  }
  return { words, correctOrder, explanation };
}

export async function generateSpotTheErrorExercise(
  skill: LearnSkillInput,
  varietySeed: string,
) {
  const systemPrompt = `Create a "Spot the Error" exercise. JSON only:
{ "sentence": string, "errorWord": string, "errorIndex": number, "correction": string, "principle": string }

Skill: ${skill.name} (Tier ${skill.tier}) — ${skill.description}
Theme: ${varietySeed}

Rules:
- Exactly ONE deliberate error matching the skill.
- "errorIndex": 0-based index of the erroneous word in the sentence split by spaces.
- "errorWord": the exact erroneous token at that index.
- "correction": full corrected sentence.
- "principle": one clear grammar principle (1-2 sentences).
- JSON only.`;

  const content = await callGroq(systemPrompt, "Generate exercise.");
  const data = JSON.parse(extractJsonPayload(content)) as Record<string, unknown>;
  const sentence = typeof data.sentence === "string" ? data.sentence.trim() : "";
  const errorWord = typeof data.errorWord === "string" ? data.errorWord.trim() : "";
  const errorIndex = typeof data.errorIndex === "number" ? data.errorIndex : -1;
  const correction = typeof data.correction === "string" ? data.correction.trim() : "";
  const principle = typeof data.principle === "string" ? data.principle.trim() : "";
  const tokens = sentence.split(/\s+/);

  if (!sentence || !errorWord || !correction || !principle) {
    throw new GroqServiceError("Invalid Spot the Error exercise shape.");
  }
  if (errorIndex < 0 || errorIndex >= tokens.length || tokens[errorIndex] !== errorWord) {
    throw new GroqServiceError("Spot the Error errorIndex does not match sentence.");
  }

  return { sentence, errorWord, errorIndex, correction, principle };
}

export async function generateCompleteItExercise(
  skill: LearnSkillInput,
  varietySeed: string,
) {
  const systemPrompt = `Create a "Complete It" exercise. JSON only:
{ "stem": string, "hint": string }

Skill: ${skill.name} (Tier ${skill.tier}) — ${skill.description}
Theme: ${varietySeed}

Rules:
- "stem": sentence beginning with blank marked as ___ .
- "hint": subtle hint without giving the answer.
- JSON only.`;

  const content = await callGroq(systemPrompt, "Generate exercise.");
  const data = JSON.parse(extractJsonPayload(content)) as Record<string, unknown>;
  const stem = typeof data.stem === "string" ? data.stem.trim() : "";
  const hint = typeof data.hint === "string" ? data.hint.trim() : "";
  if (!stem || !hint) throw new GroqServiceError("Invalid Complete It exercise shape.");
  return { stem, hint };
}

export async function checkCompleteIt(
  stem: string,
  userCompletion: string,
  skill: LearnSkillInput,
) {
  const systemPrompt = `Evaluate a sentence completion for grammar only. JSON only:
{ "correct": boolean, "feedback": string, "exampleCompletion": string, "principle": string }

Skill: ${skill.name} — ${skill.description}
Judge grammar and skill use only, not creativity. JSON only.`;

  const userContent = `Stem: ${stem}\nUser completion: ${userCompletion}`;
  const content = await callGroq(systemPrompt, userContent);
  const data = JSON.parse(extractJsonPayload(content)) as Record<string, unknown>;
  const correct = data.correct === true;
  const feedback = typeof data.feedback === "string" ? data.feedback.trim() : "";
  const exampleCompletion =
    typeof data.exampleCompletion === "string" ? data.exampleCompletion.trim() : "";
  const principle = typeof data.principle === "string" ? data.principle.trim() : "";

  if (!feedback || !exampleCompletion || !principle) {
    throw new GroqServiceError("Invalid Complete It check response.");
  }
  return { correct, feedback, exampleCompletion, principle };
}

// handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as {
      skill?: { name: string; tier: number; description: string };
      varietySeed?: string;
    };
    if (!body.skill?.name || !body.varietySeed) {
      return jsonResponse({ error: "Skill and varietySeed are required." }, 400);
    }
    const result = await generateCompleteItExercise(body.skill, body.varietySeed);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof GroqServiceError ? err.message : "Could not generate exercise.";
    return jsonResponse({ error: message }, 500);
  }
}
