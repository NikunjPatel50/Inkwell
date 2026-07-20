import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient, verifyUserRequest } from "@/lib/insforgeRequestAuth";
import {
  backfillWritingDnaFromHistory,
  buildWritingFingerprint,
  loadWritingDnaDashboard,
  runWithInsforgeClient,
} from "@/lib/writingDnaStore";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    sessionPage?: number;
    vocabPage?: number;
    userId?: string;
  };

  const auth = await verifyUserRequest(request, body.userId);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const client = getServiceClient();
    const dashboard = await runWithInsforgeClient(client, async () => {
      const sessionPage = body.sessionPage ?? 0;
      const vocabPage = body.vocabPage ?? 0;

      const { count: sessionCount } = await client.database
        .from("writing_dna_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.userId);

      if ((sessionCount ?? 0) === 0) {
        await backfillWritingDnaFromHistory(auth.userId, { skipAuthCheck: true });
      }

      return loadWritingDnaDashboard(auth.userId, {
        sessionPage,
        vocabPage,
        skipBackfill: true,
        skipAuthCheck: true,
      });
    });

    return NextResponse.json({
      ...dashboard,
      fingerprint: buildWritingFingerprint(dashboard.profile, dashboard.sessions),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load Writing DNA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
