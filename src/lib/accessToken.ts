import type { PersistedAuthSession } from "./authPersistence";
import {
  captureAuthSessionFromClient,
  persistAuthSession,
  readPersistedAuthSession,
  restoreAuthSession,
} from "./authPersistence";
import { getClientAccessToken } from "./authToken";
import { insforge } from "./insforge";

export interface DecodedAccessToken {
  userId: string;
  email?: string;
  exp?: number;
}

function mapRefreshedSession(
  previous: PersistedAuthSession,
  refreshed: {
    accessToken: string;
    refreshToken?: string | null;
    user?: {
      id: string;
      email?: string;
      profile?: { name?: string } | null;
    } | null;
  },
): PersistedAuthSession {
  return {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? previous.refreshToken,
    user: refreshed.user
      ? {
          id: refreshed.user.id,
          email: refreshed.user.email ?? previous.user.email,
          profile: refreshed.user.profile ?? previous.user.profile ?? null,
        }
      : previous.user,
  };
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  return atob(padded);
}

export function decodeAccessToken(token: string): DecodedAccessToken | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;

    const userId =
      (typeof payload.sub === "string" && payload.sub) ||
      (typeof payload.user_id === "string" && payload.user_id) ||
      (typeof payload.id === "string" && payload.id) ||
      null;

    if (!userId) return null;

    return {
      userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(decoded: DecodedAccessToken, skewSeconds = 30): boolean {
  if (!decoded.exp) return false;
  return decoded.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

function readAccessToken(): string | null {
  const session = captureAuthSessionFromClient() ?? readPersistedAuthSession();
  return session?.accessToken ?? getClientAccessToken();
}

async function tryRefreshSession(
  session: PersistedAuthSession,
): Promise<PersistedAuthSession | null> {
  if (!session.refreshToken) return null;

  const { data: refreshed, error } = await insforge.auth.refreshSession({
    refreshToken: session.refreshToken,
  });

  if (error || !refreshed?.accessToken) return null;

  const next = mapRefreshedSession(session, refreshed);
  persistAuthSession(next);
  return next;
}

export async function getVerifiedAccessToken(
  expectedUserId?: string,
): Promise<{ token: string; userId: string } | null> {
  restoreAuthSession();

  const { data: currentUser } = await insforge.auth.getCurrentUser();
  if (!currentUser?.user?.id) return null;

  const userId = currentUser.user.id;
  if (expectedUserId && userId !== expectedUserId) return null;

  const captured = captureAuthSessionFromClient();
  if (captured) {
    persistAuthSession(captured);
  }

  let token = readAccessToken();
  if (!token) return null;

  const session = captureAuthSessionFromClient() ?? readPersistedAuthSession();
  const decoded = decodeAccessToken(token);

  if (decoded && isAccessTokenExpired(decoded) && session?.refreshToken) {
    const refreshed = await tryRefreshSession(session);
    if (refreshed?.accessToken) {
      token = refreshed.accessToken;
    }
  }

  return { token, userId };
}
