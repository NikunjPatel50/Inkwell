import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { rewriteWithEmotion, GroqServiceError } from "./_shared/creative.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as { text?: string };
    const text = body.text?.trim() ?? "";

    if (!text) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const result = await rewriteWithEmotion(text);
    return jsonResponse(result);
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Could not rewrite with emotion.";
    return jsonResponse({ error: message }, 500);
  }
}
