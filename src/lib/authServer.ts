import { createClient } from "@insforge/sdk";
import type { NextRequest } from "next/server";
import type { PersistedAuthSession } from "./authPersistence";

const CODE_VERIFIER_COOKIE = "insforge_code_verifier";

export function getInsforgeServerConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("InsForge auth is not configured.");
  }

  return { baseUrl, anonKey };
}

export function createInsforgeAuthClient() {
  const { baseUrl, anonKey } = getInsforgeServerConfig();
  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
  });
}

export function getRequestOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";
}

export function getOAuthCallbackUrl(request: NextRequest): string {
  return `${getRequestOrigin(request)}/api/auth/callback`;
}

export function getCodeVerifierCookieName(): string {
  return CODE_VERIFIER_COOKIE;
}

export function codeVerifierCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
}

export function buildOAuthCompleteHtml(session: PersistedAuthSession, storageKey: string): string {
  const serialized = JSON.stringify(session).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Signing you in…</title>
</head>
<body>
  <p>Signing you in…</p>
  <script>
    try {
      localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(serialized)});
      window.location.replace("/app");
    } catch (error) {
      window.location.replace("/login?error=oauth_storage");
    }
  </script>
</body>
</html>`;
}

export function mapOAuthSession(data: {
  accessToken: string;
  refreshToken?: string | null;
  user: {
    id: string;
    email?: string;
    profile?: { name?: string } | null;
  };
}): PersistedAuthSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      profile: data.user.profile ?? null,
    },
  };
}
