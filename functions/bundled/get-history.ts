import { createClient } from "npm:@insforge/sdk@latest";

// shared: cors
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// shared: auth
export async function getAuthenticatedClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const userToken = authHeader?.replace(/^Bearer\s+/i, "").trim() ?? null;

  if (!userToken) {
    return { client: null, userId: null, error: "Missing authorization token." };
  }

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL") ?? "",
    edgeFunctionToken: userToken,
  });

  const { data: userData, error } = await client.auth.getCurrentUser();
  if (error || !userData?.user?.id) {
    return { client: null, userId: null, error: "Unauthorized — please sign in again." };
  }

  return { client, userId: userData.user.id, error: null };
}

// handler
function todayStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
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

  try {
    const dayStart = todayStartIso();

    const { data: sentences, error: sentencesError } = await client.database
      .from("analyzed_sentences")
      .select(
        "id, created_at, original_text, register_score, simple_version, intermediate_version, advanced_version, error_count",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (sentencesError) {
      throw new Error(sentencesError.message ?? "Could not load history.");
    }

    const { data: skillPatterns, error: patternsError } = await client.database
      .from("skill_patterns")
      .select("id, category, occurrence_count, last_seen_at")
      .eq("user_id", userId)
      .order("occurrence_count", { ascending: false });

    if (patternsError) {
      throw new Error(patternsError.message ?? "Could not load skill patterns.");
    }

    const { count: sentencesToday } = await client.database
      .from("analyzed_sentences")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", dayStart);

    return jsonResponse({
      sentences: sentences ?? [],
      skillPatterns: skillPatterns ?? [],
      sentencesToday: sentencesToday ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load history.";
    return jsonResponse({ error: message }, 500);
  }
}
