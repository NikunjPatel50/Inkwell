import { getAuthenticatedClient } from "./_shared/auth.ts";
import { categorizeError } from "./_shared/categories.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { analyzeWriting, GroqServiceError } from "./_shared/groq.ts";

function todayStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

async function upsertSkillPattern(
  client: ReturnType<typeof import("npm:@insforge/sdk@latest").createClient>,
  userId: string,
  category: string,
) {
  const { data: existing } = await client.database
    .from("skill_patterns")
    .select("id, occurrence_count")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing?.id) {
    await client.database
      .from("skill_patterns")
      .update({
        occurrence_count: (existing.occurrence_count ?? 0) + 1,
        last_seen_at: now,
        updated_at: now,
      })
      .eq("id", existing.id);
  } else {
    await client.database.from("skill_patterns").insert([
      {
        user_id: userId,
        category,
        occurrence_count: 1,
        last_seen_at: now,
        updated_at: now,
      },
    ]);
  }
}

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
    const body = (await req.json()) as { text?: string; tone?: string };
    const text = body.text?.trim() ?? "";
    const tone = body.tone ?? "neutral";

    if (!text) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const analysis = await analyzeWriting(text, tone);

    const dayStart = todayStartIso();
    const { data: sessions } = await client.database
      .from("practice_sessions")
      .select("id, sentence_count")
      .eq("user_id", userId)
      .gte("created_at", dayStart)
      .order("created_at", { ascending: false })
      .limit(1);

    let sessionId = sessions?.[0]?.id ?? null;
    const currentCount = sessions?.[0]?.sentence_count ?? 0;

    if (!sessionId) {
      const { data: newSession } = await client.database
        .from("practice_sessions")
        .insert([{ user_id: userId, sentence_count: 0 }])
        .select("id")
        .single();
      sessionId = newSession?.id ?? null;
    }

    await client.database.from("analyzed_sentences").insert([
      {
        user_id: userId,
        session_id: sessionId,
        original_text: text,
        register_score: analysis.registerScore,
        simple_version: analysis.simple,
        intermediate_version: analysis.intermediate,
        advanced_version: analysis.advanced,
        error_count: analysis.errors.length,
      },
    ]);

    for (const writingError of analysis.errors) {
      await upsertSkillPattern(client, userId, categorizeError(writingError.issue));
    }

    if (analysis.vocabularyCatch?.length) {
      await client.database.from("vocabulary_words").insert(
        analysis.vocabularyCatch.map((item) => ({
          user_id: userId,
          word: item.word,
          definition: item.definition,
          source_sentence: item.sourceSentence,
        })),
      );
    }

    if (sessionId) {
      await client.database
        .from("practice_sessions")
        .update({ sentence_count: currentCount + 1 })
        .eq("id", sessionId);
    }

    const { count: sentencesToday } = await client.database
      .from("analyzed_sentences")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", dayStart);

    return jsonResponse({
      ...analysis,
      sentencesToday: sentencesToday ?? currentCount + 1,
    });
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
    return jsonResponse({ error: message }, 500);
  }
}
