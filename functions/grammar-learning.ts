import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import {
  checkFillBlank,
  checkTransformIt,
  generateFillBlankExercise,
  generateIdentifyItExercise,
  generateTransformItExercise,
  GroqServiceError,
  type GrammarTopicInput,
} from "./_shared/grammarLearning.ts";

type GrammarAction =
  | "generate-identify-it"
  | "generate-fill-blank"
  | "check-fill-blank"
  | "generate-transform-it"
  | "check-transform-it";

function parseTopic(body: Record<string, unknown>): GrammarTopicInput | null {
  const topic = body.topic as GrammarTopicInput | undefined;
  if (!topic?.name || !topic.categoryId || !topic.keyRule || !topic.teaser) return null;
  return topic;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = body.action as GrammarAction | undefined;
    const topic = parseTopic(body);

    if (!action || !topic) {
      return jsonResponse({ error: "Action and topic are required." }, 400);
    }

    switch (action) {
      case "generate-identify-it": {
        if (typeof body.seed !== "string") {
          return jsonResponse({ error: "seed is required." }, 400);
        }
        return jsonResponse(await generateIdentifyItExercise(topic, body.seed));
      }
      case "generate-fill-blank": {
        if (typeof body.seed !== "string") {
          return jsonResponse({ error: "seed is required." }, 400);
        }
        return jsonResponse(await generateFillBlankExercise(topic, body.seed));
      }
      case "check-fill-blank": {
        if (typeof body.stem !== "string" || typeof body.answer !== "string") {
          return jsonResponse({ error: "stem and answer are required." }, 400);
        }
        return jsonResponse(await checkFillBlank(topic, body.stem, body.answer));
      }
      case "generate-transform-it": {
        if (typeof body.seed !== "string") {
          return jsonResponse({ error: "seed is required." }, 400);
        }
        return jsonResponse(await generateTransformItExercise(topic, body.seed));
      }
      case "check-transform-it": {
        if (typeof body.originalSentence !== "string" || typeof body.userRewrite !== "string") {
          return jsonResponse({ error: "originalSentence and userRewrite are required." }, 400);
        }
        return jsonResponse(
          await checkTransformIt(topic, body.originalSentence, body.userRewrite),
        );
      }
      default:
        return jsonResponse({ error: "Unknown action." }, 400);
    }
  } catch (err) {
    const message = err instanceof GroqServiceError ? err.message : "Could not complete request.";
    return jsonResponse({ error: message }, 500);
  }
}
