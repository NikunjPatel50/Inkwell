import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { isPremiumUser } from "./_shared/premium.ts";
import { persistWritingDna } from "./_shared/writingDnaPersistence.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) {
    return jsonResponse({ error: authError }, 401);
  }

  if (!isPremiumUser(userId)) {
    return jsonResponse({ error: "Premium subscription required." }, 403);
  }

  try {
    const body = (await req.json()) as {
      text?: string;
      sourceTool?: "write" | "coach" | "pte";
      errors?: Array<{ issue: string; explanation: string }>;
      registerScore?: number;
      timeSpentSeconds?: number;
    };

    const text = body.text?.trim() ?? "";
    if (!text) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const result = await persistWritingDna(client, userId, {
      text,
      sourceTool: body.sourceTool ?? "write",
      errors: body.errors ?? [],
      registerScore: body.registerScore,
      timeSpentSeconds: body.timeSpentSeconds ?? null,
    });

    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not record Writing DNA.";
    return jsonResponse({ error: message }, 500);
  }
}
