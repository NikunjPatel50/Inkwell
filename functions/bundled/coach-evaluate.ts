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

// shared: coach
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const COLLOCATION_ESSAY_TOPICS = [
  "Education",
  "Technology",
  "Environment",
  "Health",
  "Working From Home",
  "Social Media",
];

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

export async function generateCollocationTopicExamples(
  anchor: string,
  anchorType: "verb" | "noun",
  collocations: string[],
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are an expert PTE/IELTS writing coach.
Anchor ${anchorType}: "${anchor}".
For each essay topic, write 2 academic sentences that naturally use different collocations from the list.
Topics: ${COLLOCATION_ESSAY_TOPICS.join(", ")}.
Return ONLY valid JSON:
{"topicExamples":[{"topic":string,"sentences":[{"collocation":string,"sentence":string}]}]}
Each sentence must contain the collocation phrase exactly. Use formal PTE/IELTS essay style.`;

  const userContent = JSON.stringify({ anchor, anchorType, collocations });
  const raw = await callGroq(systemPrompt, userContent);
  return JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
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
  "teachingSummary": string,
  "topicExamples": [{ "topic": string, "sentences": [{ "collocation": string, "sentence": string }] }]
}
Rules:
- ${anchorType === "verb" ? `Anchor VERB: "${anchor}". Accept natural verb+noun collocations like "${anchor} productivity".` : `Anchor NOUN: "${anchor}". Accept natural verb+noun collocations like "improve ${anchor.toLowerCase()}".`}
- Mark correct only if the collocation is natural in academic English.
- For incorrect answers, explain WHY it sounds unnatural in one short sentence.
- missingCollocations: list 5-8 common collocations the student did NOT mention.
- teachingSummary: 1-2 encouraging sentences about patterns learned.
- topicExamples: for topics ${COLLOCATION_ESSAY_TOPICS.join(", ")}, write 2 essay sentences each using collocations from the student's answers plus missingCollocations.`;

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

// handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as {
      mode?: string;
      anchor?: string;
      anchorType?: "verb" | "noun";
      answers?: string[];
      stepLabel?: string;
      question?: string;
      answer?: string;
      context?: string;
      steps?: Array<{ label: string; answer: string }>;
      essay?: string;
      prompt?: string;
    };

    const mode = body.mode?.trim();
    if (!mode) {
      return jsonResponse({ error: "Mode is required." }, 400);
    }

    switch (mode) {
      case "collocation-builder":
      case "noun-families": {
        const anchor = body.anchor?.trim() ?? "";
        const answers = Array.isArray(body.answers) ? body.answers.map((a) => String(a).trim()).filter(Boolean) : [];
        if (!anchor || answers.length === 0) {
          return jsonResponse({ error: "Anchor and answers are required." }, 400);
        }
        const anchorType = mode === "collocation-builder" ? "verb" : "noun";
        const result = await evaluateCollocations(anchor, anchorType, answers);
        return jsonResponse(result);
      }
      case "collocation-topic-examples": {
        const anchor = body.anchor?.trim() ?? "";
        const collocations = Array.isArray(body.collocations)
          ? body.collocations.map((entry) => String(entry).trim()).filter(Boolean)
          : [];
        const anchorType = body.anchorType === "noun" ? "noun" : "verb";
        if (!anchor || collocations.length === 0) {
          return jsonResponse({ error: "Anchor and collocations are required." }, 400);
        }
        const result = await generateCollocationTopicExamples(anchor, anchorType, collocations);
        return jsonResponse(result);
      }
      case "step-feedback": {
        const answer = body.answer?.trim() ?? "";
        const question = body.question?.trim() ?? "";
        const stepLabel = body.stepLabel?.trim() ?? "Step";
        if (!answer || !question) {
          return jsonResponse({ error: "Question and answer are required." }, 400);
        }
        const result = await evaluateStepFeedback(stepLabel, question, answer, body.context);
        return jsonResponse(result);
      }
      case "combine-paragraph": {
        const steps = Array.isArray(body.steps) ? body.steps : [];
        if (steps.length === 0) {
          return jsonResponse({ error: "Steps are required." }, 400);
        }
        const result = await combineParagraph(steps);
        return jsonResponse(result);
      }
      case "essay-coach": {
        const essay = body.essay?.trim() ?? "";
        if (!essay) {
          return jsonResponse({ error: "Essay text is required." }, 400);
        }
        const result = await evaluateEssay(essay, body.prompt);
        return jsonResponse(result);
      }
      default:
        return jsonResponse({ error: "Unknown mode." }, 400);
    }
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Coach evaluation failed.";
    return jsonResponse({ error: message }, 500);
  }
}
