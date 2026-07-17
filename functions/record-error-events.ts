import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { ERROR_CATEGORIES } from "./_shared/errorClassification.ts";
import { insertErrorEvents, type ErrorEventInsert } from "./_shared/errorEvents.ts";
import { isPremiumUser } from "./_shared/premium.ts";

function isValidEvent(event: unknown): event is ErrorEventInsert {
  if (!event || typeof event !== "object") return false;
  const row = event as Record<string, unknown>;
  return (
    (row.source_tool === "write" || row.source_tool === "coach") &&
    typeof row.category === "string" &&
    ERROR_CATEGORIES.includes(row.category as (typeof ERROR_CATEGORIES)[number]) &&
    typeof row.example_text === "string" &&
    row.example_text.trim().length > 0
  );
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

  if (!isPremiumUser(userId)) {
    return jsonResponse({ recorded: 0 });
  }

  try {
    const body = (await req.json()) as { events?: unknown[] };
    const events = Array.isArray(body.events) ? body.events.filter(isValidEvent) : [];

    if (events.length === 0) {
      return jsonResponse({ recorded: 0 });
    }

    await insertErrorEvents(client, userId, events.slice(0, 40));
    return jsonResponse({ recorded: events.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not record error events.";
    return jsonResponse({ error: message }, 500);
  }
}
