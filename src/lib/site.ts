/** Canonical site URL for SEO, sitemap, and Open Graph. */
export const SITE_NAME = "Wrytesmart";

export const SITE_TAGLINE = "English writing practice that teaches in context";

export const SITE_DESCRIPTION =
  "Wrytesmart helps students and professionals improve English writing with AI feedback, grammar lessons, vocabulary depth, adaptive learning, and creative exercises — all taught through real sentences.";

export const SITE_KEYWORDS = [
  "English writing practice",
  "grammar exercises",
  "vocabulary builder",
  "writing feedback",
  "English learning app",
  "PTE writing",
  "essay writing practice",
  "adaptive English lessons",
];

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://www.wrytesmart.com";
}

/** Google Search Console token only — strips prefix/quotes if pasted from the meta tag. */
export function getGoogleSiteVerification(): string | null {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!raw) return null;

  let token = raw.replace(/^["']|["']$/g, "");
  const prefix = "google-site-verification=";
  if (token.startsWith(prefix)) {
    token = token.slice(prefix.length);
  }
  token = token.replace(/^["']|["']$/g, "").trim();

  return token || null;
}
