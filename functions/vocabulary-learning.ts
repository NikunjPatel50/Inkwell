import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import {
  checkReplaceIt,
  checkUseIt,
  generatePickMeaningExercise,
  generateReplaceItExercise,
  generateUseItExercise,
  GroqServiceError,
  type VocabularyWordInput,
} from "./_shared/vocabularyLearning.ts";

type VocabularyAction =
  | "generate-use-it"
  | "check-use-it"
  | "generate-pick-meaning"
  | "generate-replace-it"
  | "check-replace-it";

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
    const word = parseWord(body);

    if (!action || !word) {
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
