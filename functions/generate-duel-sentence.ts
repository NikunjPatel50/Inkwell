import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { generateDuelSentence, GroqServiceError } from "./_shared/creative.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const result = await generateDuelSentence();
    return jsonResponse(result);
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Could not generate a duel sentence.";
    return jsonResponse({ error: message }, 500);
  }
}
