import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import {
  checkReplaceIt,
  checkUseIt,
  generatePickMeaningExercise,
  generateReplaceItExercise,
  generateUseItExercise,
  generateWordDetail,
  GroqServiceError,
  suggestWords,
  type VocabularyWordInput,
} from "./_shared/vocabularyLearning.ts";

type WordAction =
  | "generate-use-it"
  | "check-use-it"
  | "generate-pick-meaning"
  | "generate-replace-it"
  | "check-replace-it";

type VocabularyAction = WordAction | "generate-word-detail" | "suggest-words";

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

    if (!action) {
      return jsonResponse({ error: "Action is required." }, 400);
    }

    if (action === "suggest-words") {
      if (typeof body.query !== "string" || !body.query.trim()) {
        return jsonResponse({ error: "query is required." }, 400);
      }
      const suggestions = await suggestWords(body.query);
      return jsonResponse({ suggestions });
    }

    if (action === "generate-word-detail") {
      if (typeof body.word !== "string" || !body.word.trim()) {
        return jsonResponse({ error: "word is required." }, 400);
      }
      return jsonResponse(await generateWordDetail(body.word));
    }

    const word = parseWord(body);
    if (!word) {
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
