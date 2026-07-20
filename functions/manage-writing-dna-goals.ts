import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { isPremiumUser } from "./_shared/premium.ts";

const GOAL_TYPES = new Set([
  "daily_words",
  "grammar_score",
  "passive_voice",
  "new_words",
  "streak",
]);

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
      action?: "create" | "delete";
      goalType?: string;
      title?: string;
      targetValue?: number;
      unit?: string;
      goalId?: string;
    };

    if (body.action === "delete") {
      if (!body.goalId) {
        return jsonResponse({ error: "goalId is required." }, 400);
      }

      await client.database
        .from("writing_dna_goals")
        .delete()
        .eq("id", body.goalId)
        .eq("user_id", userId);

      return jsonResponse({ ok: true });
    }

    const goalType = body.goalType ?? "";
    const title = body.title?.trim() ?? "";
    const targetValue = Number(body.targetValue);

    if (!GOAL_TYPES.has(goalType) || !title || !Number.isFinite(targetValue)) {
      return jsonResponse({ error: "Invalid goal payload." }, 400);
    }

    const { data, error } = await client.database
      .from("writing_dna_goals")
      .insert([
        {
          user_id: userId,
          goal_type: goalType,
          title,
          target_value: targetValue,
          current_value: 0,
          unit: body.unit ?? "",
        },
      ])
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return jsonResponse({ goal: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not manage goal.";
    return jsonResponse({ error: message }, 500);
  }
}
