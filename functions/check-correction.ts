import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { checkCorrection, GroqServiceError, type WritingError } from "./_shared/groq.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) {
    return jsonResponse({ error: authError }, 401);
  }

  try {
    const body = (await req.json()) as {
      original?: string;
      attempt?: string;
      knownErrors?: WritingError[];
    };

    const original = body.original?.trim() ?? "";
    const attempt = body.attempt?.trim() ?? "";
    const knownErrors = Array.isArray(body.knownErrors) ? body.knownErrors : [];

    if (!original || !attempt || knownErrors.length === 0) {
      return jsonResponse({ error: "Original text, attempt, and known errors are required." }, 400);
    }

    const result = await checkCorrection(original, attempt, knownErrors);
    return jsonResponse(result);
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Could not check your correction. Please try again.";
    return jsonResponse({ error: message }, 500);
  }
}
