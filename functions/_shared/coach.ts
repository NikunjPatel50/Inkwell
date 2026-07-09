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

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new GroqServiceError("GROQ API key is not configured on the server.");
  }

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
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new GroqServiceError(`GROQ request failed with status ${response.status}.`);
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqServiceError("Empty response from GROQ.");
  }
  return content;
}

export async function evaluateCollocations(
  anchor: string,
  anchorType: "verb" | "noun",
  answers: string[],
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are an expert English collocation coach for PTE/academic writing.
Evaluate student collocation attempts. Return ONLY valid JSON:
{
  "results": [{ "phrase": string, "correct": boolean, "explanation": string }],
  "correctCount": number,
  "totalCount": number,
  "missingCollocations": [string],
  "teachingSummary": string
}
Rules:
- ${anchorType === "verb" ? `Anchor VERB: "${anchor}". Accept natural verb+noun collocations like "${anchor} productivity".` : `Anchor NOUN: "${anchor}". Accept natural verb+noun collocations like "improve ${anchor.toLowerCase()}".`}
- Mark correct only if the collocation is natural in academic English.
- For incorrect answers, explain WHY it sounds unnatural in one short sentence.
- missingCollocations: list 5-8 common collocations the student did NOT mention.
- teachingSummary: 1-2 encouraging sentences about patterns learned.`;

  const userContent = JSON.stringify({ anchor, anchorType, answers });
  const raw = await callGroq(systemPrompt, userContent);
  return JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
}

export async function evaluateStepFeedback(
  stepLabel: string,
  question: string,
  answer: string,
  context?: string,
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are a writing coach teaching HOW to write, not just scoring.
Return ONLY valid JSON:
{
  "feedback": string,
  "passed": boolean,
  "suggestion": string
}
Give brief, encouraging teaching feedback (2-4 sentences). passed=true if the answer is adequate to move forward.
suggestion: one concrete improved version if needed, else empty string.`;

  const userContent = JSON.stringify({ stepLabel, question, answer, context });
  const raw = await callGroq(systemPrompt, userContent);
  return JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
}

export async function combineParagraph(
  steps: Array<{ label: string; answer: string }>,
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are an academic writing coach.
Combine the student's step answers into ONE polished academic paragraph.
Return ONLY valid JSON:
{
  "paragraph": string,
  "techniques": [string]
}
techniques: 2-3 brief notes on what makes the paragraph effective.`;

  const userContent = JSON.stringify({ steps });
  const raw = await callGroq(systemPrompt, userContent);
  return JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
}

export async function evaluateEssay(essay: string, prompt?: string): Promise<Record<string, unknown>> {
  const systemPrompt = `You are an expert PTE/IELTS writing coach. Teach the student HOW to improve.
Return ONLY valid JSON:
{
  "criteria": [{
    "label": string,
    "score": number,
    "maxScore": 10,
    "teaching": string,
    "goodExamples": [string],
    "improvements": [string]
  }],
  "overallSummary": string,
  "goodCollocations": [string],
  "weakCollocations": [string],
  "grammarMistakes": [string]
}
Evaluate these criteria: Grammar, Vocabulary, Collocations, Idea Development, Cohesion, Linguistic Range, Content.
For each criterion: give score/10 and TEACHING feedback (not just the score). Quote specific fixes.
goodExamples: collocations or phrases done well. improvements: specific better alternatives.`;

  const userContent = JSON.stringify({ essay, prompt });
  const raw = await callGroq(systemPrompt, userContent);
  return JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
}
