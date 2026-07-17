import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import {
  combineParagraph,
  evaluateCollocations,
  evaluateEssay,
  evaluateStepFeedback,
  generateCollocationTopicExamples,
  GroqServiceError,
} from "./_shared/coach.ts";

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
