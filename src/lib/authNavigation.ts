import { hasPersistedAuthSession } from "./authPersistence";

const LOGIN_PATH = "/login";

export function isLikelyAuthenticated(user: { id: string } | null | undefined): boolean {
  return Boolean(user) || hasPersistedAuthSession();
}

export function resolveAuthDestination(
  appHref: string,
  user?: { id: string } | null,
): string {
  return isLikelyAuthenticated(user) ? appHref : LOGIN_PATH;
}
