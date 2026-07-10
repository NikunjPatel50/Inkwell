import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  console.warn(
    "Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY — auth and analysis will not work until configured.",
  );
}

function resolveFunctionsUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // Use the main-host proxy path. The *.functions.insforge.app subhost is not
  // deployed for this project and causes browser "Failed to fetch" (CORS) errors.
  return `${url.replace(/\/$/, "")}/functions`;
}

export const insforge = createClient({
  baseUrl: baseUrl ?? "",
  anonKey: anonKey ?? "",
  functionsUrl: resolveFunctionsUrl(baseUrl),
  auth: {
    detectOAuthCallback: false,
  },
});

export function isInsforgeConfigured(): boolean {
  return Boolean(baseUrl && anonKey);
}
