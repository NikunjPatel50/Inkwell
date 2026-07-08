import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { judgeDuel, GroqServiceError } from "./_shared/creative.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as {
      badSentence?: string;
      flaw?: string;
      userRewrite?: string;
    };

    const badSentence = body.badSentence?.trim() ?? "";
    const flaw = body.flaw?.trim() ?? "";
    const userRewrite = body.userRewrite?.trim() ?? "";

    if (!badSentence || !flaw) {
      return jsonResponse({ error: "Bad sentence and flaw are required." }, 400);
    }

    const result = await judgeDuel(badSentence, flaw, userRewrite);
    return jsonResponse(result);
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Could not judge the duel.";
    return jsonResponse({ error: message }, 500);
  }
}
