import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { checkCompleteIt, GroqServiceError } from "./_shared/learn.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as {
      stem?: string;
      userCompletion?: string;
      skill?: { name: string; tier: number; description: string };
    };
    const stem = body.stem?.trim() ?? "";
    const userCompletion = body.userCompletion?.trim() ?? "";
    if (!stem || !userCompletion || !body.skill?.name) {
      return jsonResponse({ error: "Stem, completion, and skill are required." }, 400);
    }
    const result = await checkCompleteIt(stem, userCompletion, body.skill);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof GroqServiceError ? err.message : "Could not check completion.";
    return jsonResponse({ error: message }, 500);
  }
}
