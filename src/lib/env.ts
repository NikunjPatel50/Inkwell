/** GROQ key from `.env` for local dev (`VITE_GROQ_API_KEY`). Not available in production unless set at build time. */
export function getEnvGroqApiKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  return typeof key === "string" ? key.trim() : "";
}

export function hasEnvGroqApiKey(): boolean {
  return getEnvGroqApiKey().length > 0;
}
