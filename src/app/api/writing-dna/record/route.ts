import { NextResponse, type NextRequest } from "next/server";
import { getServiceClient, verifyUserRequest } from "@/lib/insforgeRequestAuth";
import { persistWritingDna } from "@/lib/writingDnaPersistence";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    sourceTool?: "write" | "coach" | "pte";
    errors?: Array<{ issue: string; explanation: string }>;
    registerScore?: number;
    timeSpentSeconds?: number;
    analyzedSentenceId?: string | null;
    userId?: string;
  };

  const auth = await verifyUserRequest(request, body.userId);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const text = body.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const client = getServiceClient();
    const result = await persistWritingDna(client, auth.userId, {
      text,
      sourceTool: body.sourceTool ?? "write",
      errors: body.errors ?? [],
      registerScore: body.registerScore,
      timeSpentSeconds: body.timeSpentSeconds ?? null,
      analyzedSentenceId: body.analyzedSentenceId ?? null,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not record Writing DNA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
