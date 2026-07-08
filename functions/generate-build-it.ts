import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { generateBuildItExercise, GroqServiceError } from "./_shared/learn.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as {
      skill?: { name: string; tier: number; description: string };
      varietySeed?: string;
    };
    if (!body.skill?.name || !body.varietySeed) {
      return jsonResponse({ error: "Skill and varietySeed are required." }, 400);
    }
    const result = await generateBuildItExercise(body.skill, body.varietySeed);
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof GroqServiceError ? err.message : "Could not generate exercise.";
    return jsonResponse({ error: message }, 500);
  }
}
