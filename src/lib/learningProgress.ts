const GRAMMAR_KEY = "inkwell-grammar-completed";
const VOCABULARY_KEY = "inkwell-vocabulary-completed";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // Session storage unavailable
  }
}

export function getCompletedGrammarTopics(): Set<string> {
  return readSet(GRAMMAR_KEY);
}

export function markGrammarTopicComplete(topicId: string): void {
  const ids = readSet(GRAMMAR_KEY);
  ids.add(topicId);
  writeSet(GRAMMAR_KEY, ids);
}

export function isGrammarTopicComplete(topicId: string): boolean {
  return readSet(GRAMMAR_KEY).has(topicId);
}

export function getCompletedVocabularyWords(): Set<string> {
  return readSet(VOCABULARY_KEY);
}

export function markVocabularyWordComplete(wordId: string): void {
  const ids = readSet(VOCABULARY_KEY);
  ids.add(wordId);
  writeSet(VOCABULARY_KEY, ids);
}

export function isVocabularyWordComplete(wordId: string): boolean {
  return readSet(VOCABULARY_KEY).has(wordId);
}
