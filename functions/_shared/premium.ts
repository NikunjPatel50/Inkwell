export function isPremiumUser(userId: string): boolean {
  if (Deno.env.get("PREMIUM_STUB_ALL") === "true") return true;

  const allowlist = (Deno.env.get("PREMIUM_STUB_USER_IDS") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return allowlist.includes(userId);
}
