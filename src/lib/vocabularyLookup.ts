const RECENT_WORDS_KEY = "inkwell-vocabulary-recent";
const MAX_RECENT = 5;

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

export function addRecentWord(word: string): string[] {
  const normalized = normalizeWord(word);
  if (!normalized) return readRecentWords();

  const recent = readRecentWords().filter((entry) => entry !== normalized);
  recent.unshift(normalized);
  const trimmed = recent.slice(0, MAX_RECENT);

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(RECENT_WORDS_KEY, JSON.stringify(trimmed));
    } catch {
      // Session storage unavailable
    }
  }

  return trimmed;
}

export function readRecentWords(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(RECENT_WORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
