import type { PTEEssayImproveResult, PTEEssayScoreResult, PTEEssayTraitScore } from "../types/writingMode";
import { GroqApiError, isGroqConfigured } from "./groqClient";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const IMPROVE_SYSTEM_PROMPT = `You are revising a PTE Academic essay to raise its score against the official Pearson rubric. You will be given the essay, the prompt it responds to, and its current trait scores with feedback. Rewrite the essay to address the specific weaknesses noted, while keeping the writer's original argument, stance, and structure of ideas intact where possible. Keep the essay within 200-300 words. Return ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "improvedEssay": string,
  "changes": [
    { "trait": string, "whatChanged": string, "whySuccinct": string }
  ]
}
The 'changes' array should list 3-6 concrete edits made, tied to the trait each edit improves.
If recurringErrorPatterns are provided, explicitly call out in whySuccinct when a fix addresses one of the writer's known recurring patterns (e.g. "Fixed a dropped article — this is a pattern in your last 8 sessions too").`;

function getApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

export function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function parseImproveResult(content: string): PTEEssayImproveResult {
  const data = JSON.parse(extractJsonPayload(content)) as {
    improvedEssay?: string;
    changes?: Array<{ trait?: string; whatChanged?: string; whySuccinct?: string }>;
  };

  if (!data.improvedEssay?.trim()) {
    throw new GroqApiError("The improve response did not include an improved essay.");
  }

  const changes = Array.isArray(data.changes)
    ? data.changes
        .filter((entry) => entry?.trait && entry?.whatChanged)
        .map((entry) => ({
          trait: String(entry.trait),
          whatChanged: String(entry.whatChanged),
          whySuccinct: String(entry.whySuccinct ?? ""),
        }))
        .slice(0, 6)
    : [];

  return {
    improvedEssay: data.improvedEssay.trim(),
    changes,
  };
}

export async function improvePTEEssayWithGroq(
  essay: string,
  prompt: string,
  scoreResult: PTEEssayScoreResult,
  weakestTraits: PTEEssayTraitScore[],
  recurringPatterns: Array<{ category: string; label: string; count: number }> = [],
): Promise<PTEEssayImproveResult> {
  if (!isGroqConfigured()) {
    throw new GroqApiError("GROQ is not configured.");
  }

  const apiKey = getApiKey();
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
        { role: "system", content: IMPROVE_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            essayPrompt: prompt,
            essay,
            traitScores: scoreResult.traits,
            weakestTraits,
            topFixes: scoreResult.topFixes,
            recurringErrorPatterns: recurringPatterns,
          }),
        },
      ],
      temperature: 0.45,
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

  try {
    return parseImproveResult(content);
  } catch {
    throw new GroqApiError("Could not parse the improved essay response. Try again.");
  }
}

export function buildLocalPTEEssayImprove(
  essay: string,
  weakestTraits: PTEEssayTraitScore[],
  recurringPatterns: Array<{ category: string; label: string; count: number }> = [],
): PTEEssayImproveResult {
  let improved = essay.trim();

  if (!/\b(furthermore|moreover|however|therefore|in conclusion)\b/i.test(improved)) {
    improved = improved.replace(
      /\.\s*$/,
      ". Furthermore, this position is supported by concrete examples drawn from everyday experience.",
    );
  }

  if (!/\bin conclusion\b/i.test(improved)) {
    improved = `${improved}\n\nIn conclusion, the essay maintains its original stance while presenting the argument more clearly for an academic reader.`;
  }

  return {
    improvedEssay: improved.trim(),
    changes: weakestTraits.slice(0, 4).map((trait) => {
      const matchedPattern = recurringPatterns.find((pattern) =>
        trait.feedback.toLowerCase().includes(pattern.label.toLowerCase().split(" ")[0] ?? ""),
      );
      const patternNote = matchedPattern
        ? ` — this matches a pattern from your last ${matchedPattern.count} sessions too.`
        : "";

      return {
        trait: trait.label,
        whatChanged: `Revised wording to strengthen ${trait.label.toLowerCase()}.`,
        whySuccinct: `${trait.feedback}${patternNote}`,
      };
    }),
  };
}
