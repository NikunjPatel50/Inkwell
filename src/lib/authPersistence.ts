import { insforge } from "./insforge";

export const AUTH_STORAGE_KEY = "wrytesmart-auth-session";
const STORAGE_KEY = AUTH_STORAGE_KEY;

export interface PersistedAuthSession {
  accessToken: string;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    profile?: { name?: string } | null;
  };
}

type ClientInternals = {
  tokenManager: {
    saveSession(session: { accessToken: string; user: PersistedAuthSession["user"] }): void;
    getSession(): { accessToken: string; user: PersistedAuthSession["user"] } | null;
  };
  http: {
    setAuthToken(token: string | null): void;
    setRefreshToken(token: string | null): void;
    refreshToken: string | null;
  };
};

function getClientInternals(): ClientInternals {
  return insforge as unknown as ClientInternals;
}

export function hasPersistedAuthSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function readPersistedAuthSession(): PersistedAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAuthSession;
    if (!parsed?.accessToken || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistAuthSession(session: PersistedAuthSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage unavailable
  }
  hydrateAuthSession(session);
}

export function hydrateAuthSession(session: PersistedAuthSession): void {
  const client = getClientInternals();
  client.tokenManager.saveSession({
    accessToken: session.accessToken,
    user: session.user,
  });
  client.http.setAuthToken(session.accessToken);
  client.http.setRefreshToken(session.refreshToken);
}

export function captureAuthSessionFromClient(): PersistedAuthSession | null {
  const client = getClientInternals();
  const session = client.tokenManager.getSession();
  if (!session?.accessToken || !session.user?.id) return null;

  return {
    accessToken: session.accessToken,
    refreshToken: client.http.refreshToken ?? null,
    user: session.user,
  };
}

export function restoreAuthSession(): PersistedAuthSession | null {
  const session = readPersistedAuthSession();
  if (!session) return null;
  hydrateAuthSession(session);
  return session;
}

export function clearPersistedAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}
