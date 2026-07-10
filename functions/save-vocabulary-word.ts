import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";

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
      word?: string;
      definition?: string;
      sourceSentence?: string;
    };

    const word = body.word?.trim();
    const definition = body.definition?.trim();
    const sourceSentence = body.sourceSentence?.trim();

    if (!word || !definition || !sourceSentence) {
      return jsonResponse({ error: "word, definition, and sourceSentence are required." }, 400);
    }

    const { error } = await client.database.from("vocabulary_words").insert([
      {
        user_id: userId,
        word,
        definition,
        source_sentence: sourceSentence,
      },
    ]);

    if (error) {
      throw new Error(error.message ?? "Could not save vocabulary word.");
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save vocabulary word.";
    return jsonResponse({ error: message }, 500);
  }
}
