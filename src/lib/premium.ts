import type { AuthUser } from "../hooks/useAuth";

/**
 * Premium features are open to all signed-in users during beta.
 * Swap in real subscription status later.
 */
export function userCanAccessPatternTracking(user: AuthUser | null | undefined): boolean {
  return Boolean(user);
}

/** UI helper — features are tagged Premium but not paywalled yet. */
export function isPremiumFeature(): boolean {
  return true;
}
