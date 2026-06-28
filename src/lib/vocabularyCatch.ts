import type { VocabularyItem } from "../types";

export const MAX_VOCABULARY_CARDS = 12;

export function appendVocabularyCatch(
  existing: VocabularyItem[],
  incoming: VocabularyItem[] | undefined,
): VocabularyItem[] {
  if (!incoming?.length) {
    return existing;
  }

  const seen = new Set(existing.map((item) => item.word.toLowerCase()));
  const nextItems = incoming.filter((item) => {
    const key = item.word.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return [...nextItems, ...existing].slice(0, MAX_VOCABULARY_CARDS);
}
