import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { ERROR_CATEGORY_META } from "./_shared/errorClassification.ts";
import { isPremiumUser } from "./_shared/premium.ts";

const WINDOW_DAYS = 30;
const TOP_LIMIT = 5;

function windowStartIso(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - WINDOW_DAYS);
  return date.toISOString();
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "GET" && req.method !== "POST") {
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
    const since = windowStartIso();

    const { data: events, error: eventsError } = await client.database
      .from("error_events")
      .select("category, example_text, created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (eventsError) {
      throw new Error(eventsError.message ?? "Could not load error patterns.");
    }

    const grouped = new Map<
      string,
      { count: number; recentExample: string; latestAt: string }
    >();

    for (const event of events ?? []) {
      const category = event.category as string;
      const existing = grouped.get(category);
      if (!existing) {
        grouped.set(category, {
          count: 1,
          recentExample: event.example_text,
          latestAt: event.created_at,
        });
      } else {
        existing.count += 1;
      }
    }

    const patterns = [...grouped.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, TOP_LIMIT)
      .map(([category, stats]) => {
        const meta = ERROR_CATEGORY_META[category as keyof typeof ERROR_CATEGORY_META];
        return {
          category,
          label: meta?.label ?? category,
          description: meta?.description ?? "A recurring writing pattern from your recent sessions.",
          count: stats.count,
          recentExample: stats.recentExample,
          grammarSlug: meta?.grammarSlug ?? "common-mistakes",
        };
      });

    return jsonResponse({ patterns, windowDays: WINDOW_DAYS });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load error patterns.";
    return jsonResponse({ error: message }, 500);
  }
}
