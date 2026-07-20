import {
  captureAuthSessionFromClient,
  hydrateAuthSession,
  readPersistedAuthSession,
  restoreAuthSession,
} from "./authPersistence";

/**
 * InsForge database RLS requires a user JWT (auth.uid()). Without hydrating
 * the session, requests fall back to the anon key and inserts are denied.
 */
export function ensureInsforgeUserSession(expectedUserId?: string): void {
  const session =
    restoreAuthSession() ??
    captureAuthSessionFromClient() ??
    readPersistedAuthSession();

  if (!session?.accessToken || !session.user?.id) {
    throw new Error("Sign in required. Your session may have expired — please sign in again.");
  }

  hydrateAuthSession(session);

  if (expectedUserId && session.user.id !== expectedUserId) {
    throw new Error("Session user mismatch. Please sign out and sign in again.");
  }
}

export function isRlsPolicyError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("row-level security") || lower.includes("rls") || lower.includes("42501");
}
