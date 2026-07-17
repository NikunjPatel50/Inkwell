import type { AuthUser } from "../hooks/useAuth";

const PREMIUM_STUB_USER_IDS = (process.env.NEXT_PUBLIC_PREMIUM_STUB_USER_IDS ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

/**
 * Single gate for premium pattern tracking. Swap in real subscription status later.
 */
export function userCanAccessPatternTracking(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (process.env.NEXT_PUBLIC_PREMIUM_STUB_ALL === "true") return true;
  return PREMIUM_STUB_USER_IDS.includes(user.id);
}
