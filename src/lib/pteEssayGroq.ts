import type { PTEEssayScoreResult, PTEEssayTraitScore } from "../types/writingMode";
import { GroqApiError, isGroqConfigured } from "./groqClient";
import { PTE_ESSAY_TRAIT_DEFS } from "./pteEssayScoring";

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
      temperature: 0.35,
    }),
  });

  if (!response.ok) {
    throw new GroqApiError(`Request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new GroqApiError("Empty response from GROQ.");
  return content;
}

const PTE_SYSTEM_PROMPT = `You are an official PTE Academic Write Essay scorer.
Score ONLY using these seven traits (reference the student's actual text in every feedback string):
1. content (/6) — fully addresses the prompt with depth, reformulates the issue, supports with specific relevant examples
2. form (/2) — 2 if 200-300 words; 1 if 120-199 or 301-380; 0 if under 120 or over 380, all-caps, no punctuation, or bullet-point-only
3. development (/6) — logical paragraphing, intro/body/conclusion, connectives, easy to follow
4. grammar (/2) — control of complex structures; 2=rare minor errors, 0=frequent basic mistakes
5. linguisticRange (/6) — variety and precision of expression
6. vocabulary (/2) — broad lexical repertoire vs basic vocabulary
7. spelling (/2) — 2=correct, 1=one error, 0=more than one error

Return ONLY JSON:
{
  "traits": [
    { "id": "content"|"form"|"development"|"grammar"|"linguisticRange"|"vocabulary"|"spelling", "score": number, "feedback": string }
  ],
  "topFixes": [string]
}
Use trait ids exactly as listed. Feedback must quote or reference specific phrases from the essay. topFixes: 2-3 prioritized fixes (Content/Form first).`;

export async function scorePTEEssayWithGroq(
  essay: string,
  prompt?: string,
): Promise<{ traits: PTEEssayTraitScore[]; topFixes: string[] }> {
  if (!isGroqConfigured()) {
    throw new GroqApiError("GROQ is not configured.");
  }

  const userContent = JSON.stringify({
    essayPrompt: prompt ?? "General PTE Academic essay topic.",
    essay,
    wordCount: essay.trim().split(/\s+/).filter(Boolean).length,
    traitMaxScores: Object.fromEntries(PTE_ESSAY_TRAIT_DEFS.map((t) => [t.id, t.maxScore])),
  });

  const raw = await callGroq(PTE_SYSTEM_PROMPT, userContent);
  const data = JSON.parse(extractJsonPayload(raw)) as {
    traits?: Array<{ id?: string; score?: number; feedback?: string }>;
    topFixes?: string[];
  };

  const traits: PTEEssayTraitScore[] = PTE_ESSAY_TRAIT_DEFS.map((def) => {
    const fromAi = data.traits?.find((trait) => trait.id === def.id);
    return {
      id: def.id,
      label: def.label,
      maxScore: def.maxScore,
      score: Math.max(0, Math.min(def.maxScore, Math.round(fromAi?.score ?? 0))),
      feedback: fromAi?.feedback?.trim() || `Review ${def.label}.`,
    };
  });

  return {
    traits,
    topFixes: Array.isArray(data.topFixes)
      ? data.topFixes.filter((fix): fix is string => typeof fix === "string").slice(0, 3)
      : [],
  };
}
