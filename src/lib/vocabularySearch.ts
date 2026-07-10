import { getAllCollectionWords } from "../constants/wordCollections";
import { WORDS_OF_THE_DAY } from "../constants/wordOfTheDay";

const SEARCH_INDEX = [
  ...WORDS_OF_THE_DAY.map((entry) => entry.word),
  ...getAllCollectionWords().map((entry) => entry.word),
];

const UNIQUE_WORDS = [...new Set(SEARCH_INDEX.map((word) => word.toLowerCase()))].sort();

export function searchWordSuggestions(query: string, limit = 4): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const startsWith = UNIQUE_WORDS.filter((word) => word.startsWith(normalized));
  const contains = UNIQUE_WORDS.filter(
    (word) => !word.startsWith(normalized) && word.includes(normalized),
  );

  return [...startsWith, ...contains].slice(0, limit);
}

export function isKnownWord(word: string): boolean {
  return UNIQUE_WORDS.includes(normalizeWord(word));
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}
