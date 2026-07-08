import { NextResponse, type NextRequest } from "next/server";
import { fetchAdminUsers, verifyAdminRequest } from "@/lib/adminServer";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const users = await fetchAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
