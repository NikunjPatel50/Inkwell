import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) return jsonResponse({ error: authError }, 401);

  const { data, error } = await client.database
    .from("practiced_skills")
    .select("id, skill_id, exercises_completed, average_score, last_practiced_at")
    .eq("user_id", userId)
    .order("last_practiced_at", { ascending: false });

  if (error) return jsonResponse({ error: error.message }, 500);

  const skills = (data ?? []).map((row) => ({
    id: row.id,
    skillId: row.skill_id,
    exercisesCompleted: row.exercises_completed,
    averageScore: row.average_score,
    lastPracticedAt: row.last_practiced_at,
  }));

  return jsonResponse({ skills });
}
