import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) return jsonResponse({ error: authError }, 401);

  try {
    const body = (await req.json()) as {
      skillId?: string;
      exercisesCompleted?: number;
      averageScore?: number;
    };

    const skillId = body.skillId?.trim() ?? "";
    const exercisesCompleted = body.exercisesCompleted ?? 0;
    const averageScore = body.averageScore ?? 0;

    if (!skillId) return jsonResponse({ error: "skillId is required." }, 400);

    const now = new Date().toISOString();

    const { data: existing } = await client.database
      .from("practiced_skills")
      .select("id")
      .eq("user_id", userId)
      .eq("skill_id", skillId)
      .maybeSingle();

    if (existing?.id) {
      await client.database
        .from("practiced_skills")
        .update({
          exercises_completed: exercisesCompleted,
          average_score: averageScore,
          last_practiced_at: now,
        })
        .eq("id", existing.id);
    } else {
      await client.database.from("practiced_skills").insert([
        {
          user_id: userId,
          skill_id: skillId,
          exercises_completed: exercisesCompleted,
          average_score: averageScore,
          last_practiced_at: now,
        },
      ]);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save progress.";
    return jsonResponse({ error: message }, 500);
  }
}
