import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) {
    return jsonResponse({ error: authError }, 401);
  }

  try {
    const { data: words, error } = await client.database
      .from("vocabulary_words")
      .select("id, word, definition, source_sentence, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message ?? "Could not load vocabulary.");
    }

    return jsonResponse({ words: words ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load vocabulary.";
    return jsonResponse({ error: message }, 500);
  }
}
