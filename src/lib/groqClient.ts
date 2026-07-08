import type {
  DuelResult,
  DuelSentence,
  EmotionRewriteResult,
} from "../types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export class GroqApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqApiError";
  }
}

function getApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

export function isGroqConfigured(): boolean {
  return Boolean(getApiKey());
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
        temperature: 0.7,
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
  if (!content) {
    throw new GroqApiError("GROQ returned an empty response. Try again.");
  }

  return content;
}

const FLAW_TYPES = [
  "overly vague",
  "cliché-ridden",
  "excessively wordy",
  "tonally inconsistent",
  "structurally awkward",
] as const;

export async function generateDuelSentence(): Promise<DuelSentence> {
  const flawHint = FLAW_TYPES[Math.floor(Math.random() * FLAW_TYPES.length)];

  const systemPrompt = `You generate deliberately weak writing for a rewrite duel. Respond with JSON only:
{ "sentence": string, "flaw": string }

Rules:
- "sentence": exactly 1-2 sentences, genuinely weak in an interesting way (not just a typo).
- The weakness should be primarily: ${flawHint} (vary how you express this flaw).
- "flaw": one short phrase naming the weakness type (e.g. "overly vague", "cliché-ridden").
- Make it challenging but fun — something a good writer could clearly improve.
- No markdown. JSON only.`;

  const content = await callGroq(systemPrompt, "Generate a new challenger sentence.");
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as Record<string, unknown>;
  const sentence = typeof data.sentence === "string" ? data.sentence.trim() : "";
  const flaw = typeof data.flaw === "string" ? data.flaw.trim() : "";

  if (!sentence || !flaw) {
    throw new GroqApiError("The model response is missing the duel sentence or flaw.");
  }

  return { sentence, flaw };
}

export async function judgeDuel(
  badSentence: string,
  flaw: string,
  userRewrite: string,
): Promise<DuelResult> {
  const systemPrompt = `You are an honest editor judging a rewrite duel. Respond with JSON only:
{
  "aiRewrite": string,
  "verdict": "user" | "ai" | "tie",
  "judgment": string,
  "takeaway": string
}

Rules:
- Rewrite the bad sentence yourself in "aiRewrite" — your best version, same facts.
- Compare the user's rewrite fairly. Pick "user", "ai", or "tie" honestly — users should win sometimes.
- "judgment": 2-3 sentences of specific, editor-style reasoning (not cheerleading).
- "takeaway": one transferable writing principle (plain sentence).
- JSON only.`;

  const userContent = `Bad sentence:\n${badSentence}\n\nKnown flaw: ${flaw}\n\nUser's rewrite:\n${userRewrite || "(blank — user ran out of time)"}`;

  const content = await callGroq(systemPrompt, userContent);
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as Record<string, unknown>;
  const aiRewrite = typeof data.aiRewrite === "string" ? data.aiRewrite.trim() : "";
  const judgment = typeof data.judgment === "string" ? data.judgment.trim() : "";
  const takeaway = typeof data.takeaway === "string" ? data.takeaway.trim() : "";
  const verdict = data.verdict;

  if (
    !aiRewrite ||
    !judgment ||
    !takeaway ||
    (verdict !== "user" && verdict !== "ai" && verdict !== "tie")
  ) {
    throw new GroqApiError("The model response is missing duel judgment fields.");
  }

  return { aiRewrite, verdict, judgment, takeaway };
}

export async function rewriteWithEmotion(text: string): Promise<EmotionRewriteResult> {
  const systemPrompt = `You rewrite a neutral sentence in six emotional registers. Respond with JSON only:
{
  "emotions": {
    "hopeful": string,
    "melancholic": string,
    "tense": string,
    "ironic": string,
    "nostalgic": string,
    "urgent": string
  },
  "techniques": {
    "hopeful": string,
    "melancholic": string,
    "tense": string,
    "ironic": string,
    "nostalgic": string,
    "urgent": string
  }
}

Rules:
- Same facts in every version — only word choice, rhythm, and connotation change.
- Show emotion; do NOT name it (no "sadly", "hopefully", etc.).
- Keep length similar to the original.
- "techniques": one short phrase per emotion naming the key technique.
- JSON only.`;

  const content = await callGroq(systemPrompt, `Rewrite this sentence:\n\n${text}`);
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqApiError("The model returned a response we couldn't parse. Try again.");
  }

  const data = parsed as Record<string, unknown>;
  const emotionsRaw = data.emotions;
  const techniquesRaw = data.techniques;

  if (typeof emotionsRaw !== "object" || emotionsRaw === null) {
    throw new GroqApiError("The model response is missing emotion rewrites.");
  }

  const keys = [
    "hopeful",
    "melancholic",
    "tense",
    "ironic",
    "nostalgic",
    "urgent",
  ] as const;

  const emotions = {} as EmotionRewriteResult["emotions"];
  const techniques = {} as EmotionRewriteResult["techniques"];

  for (const key of keys) {
    const emotionValue = (emotionsRaw as Record<string, unknown>)[key];
    emotions[key] =
      typeof emotionValue === "string" && emotionValue.trim()
        ? emotionValue.trim()
        : "—";

    const techniqueValue =
      typeof techniquesRaw === "object" && techniquesRaw !== null
        ? (techniquesRaw as Record<string, unknown>)[key]
        : undefined;
    techniques[key] =
      typeof techniqueValue === "string" && techniqueValue.trim()
        ? techniqueValue.trim()
        : "—";
  }

  return { emotions, techniques };
}

export {
  generateBuildItExercise,
  generateSpotTheErrorExercise,
  generateCompleteItExercise,
  checkCompleteIt,
} from "./learnGroq";
