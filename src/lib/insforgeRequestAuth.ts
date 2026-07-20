import { createAdminClient, createClient } from "@insforge/sdk";
import type { NextRequest } from "next/server";

export interface VerifiedUser {
  userId: string;
  email: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

function getInsforgeConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    throw new Error("InsForge is not configured.");
  }
  return { baseUrl, anonKey };
}

export function getServiceClient() {
  const { baseUrl } = getInsforgeConfig();
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!apiKey) {
    throw new Error("INSFORGE_API_KEY is not configured.");
  }
  return createAdminClient({ baseUrl, apiKey });
}

async function resolveSessionUserId(token: string): Promise<string | null> {
  const { baseUrl, anonKey } = getInsforgeConfig();

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/sessions/current`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.ok) {
    const body = (await response.json().catch(() => null)) as {
      user?: { id?: string };
      data?: { user?: { id?: string } };
    } | null;
    return body?.user?.id ?? body?.data?.user?.id ?? null;
  }

  const userClient = createClient({
    baseUrl,
    anonKey,
    accessToken: token,
    isServerMode: true,
  });
  const { data } = await userClient.auth.getCurrentUser();
  return data?.user?.id ?? null;
}

export async function verifyUserRequest(
  request: NextRequest,
  expectedUserId?: string,
): Promise<VerifiedUser | { error: string; status: number }> {
  if (!expectedUserId || !UUID_RE.test(expectedUserId)) {
    return { error: "Missing user id.", status: 400 };
  }

  const token = getBearerToken(request);
  const { anonKey } = getInsforgeConfig();
  if (!token || token === anonKey) {
    return { error: "Missing authorization token.", status: 401 };
  }

  const sessionUserId = await resolveSessionUserId(token);
  if (sessionUserId && sessionUserId !== expectedUserId) {
    return { error: "Could not verify your session. Please try again.", status: 401 };
  }

  return {
    userId: expectedUserId,
    email: "",
  };
}
