import {
  getAllCollectionWords,
  WORD_COLLECTIONS,
  type CollectionWord,
} from "../constants/wordCollections";
import { WORDS_OF_THE_DAY } from "../constants/wordOfTheDay";
import type { WordDetail, WordPracticeExercise, WordUsageResult } from "../types";

const RECENT_WORDS_KEY = "inkwell-vocabulary-recent";
const MAX_RECENT = 5;

function findCollectionEntry(word: string): CollectionWord | undefined {
  return getAllCollectionWords().find((entry) => entry.word.toLowerCase() === word);
}

function findWordOfDayEntry(word: string) {
  return WORDS_OF_THE_DAY.find((entry) => entry.word.toLowerCase() === word);
}

function findParentCollection(word: string) {
  return WORD_COLLECTIONS.find((collection) =>
    collection.words.some((entry) => entry.word.toLowerCase() === word),
  );
}

export function buildLocalWordDetail(word: string): WordDetail | null {
  const normalized = normalizeWord(word);
  if (!normalized) return null;

  const collectionEntry = findCollectionEntry(normalized);
  const wordOfDay = findWordOfDayEntry(normalized);
  if (!collectionEntry && !wordOfDay) return null;

  const partOfSpeech = collectionEntry?.partOfSpeech ?? wordOfDay?.partOfSpeech ?? "word";
  const definition = collectionEntry?.definition ?? wordOfDay?.definition ?? "";
  if (!definition.trim()) return null;
  const primaryExample =
    wordOfDay?.example ??
    `She used the word ${normalized} naturally in her essay.`;

  const collection = findParentCollection(normalized);
  const relatedWords =
    collection?.words.filter((entry) => entry.word.toLowerCase() !== normalized) ?? [];

  const secondaryExample =
    relatedWords[0] != null
      ? `Unlike ${relatedWords[0].word}, ${normalized} suggests ${definition.toLowerCase()}.`
      : `The ${normalized} tone of the letter surprised everyone.`;

  return {
    word: normalized,
    phonetic: `/${normalized}/`,
    partOfSpeech,
    level1: {
      definition,
      examples: [primaryExample, secondaryExample],
      mnemonic: `Link ${normalized} to: ${definition.charAt(0).toLowerCase()}${definition.slice(1)}`,
    },
    level2: {
      wordForms: [],
      synonyms: relatedWords.slice(0, 3).map((entry) => ({
        word: entry.word,
        note: entry.definition,
      })),
      antonyms: relatedWords.slice(3, 5).map((entry) => ({
        word: entry.word,
        note: `Contrast with ${normalized}: ${entry.definition.toLowerCase()}`,
      })),
    },
    level3: {
      collocations: collection
        ? [`${normalized} mood`, `a touch of ${normalized}`, `feel ${normalized}`]
        : [],
      register: collection
        ? `Common in ${collection.title.toLowerCase()} and descriptive writing.`
        : "Useful in essays, stories, and reflective writing.",
      commonMistake: `Do not confuse the tone of ${normalized} with a stronger, more dramatic emotion.`,
      usageContext: `Use when you need a precise shade of meaning — not a vague synonym like "sad" or "happy".`,
    },
    level4: {
      etymology: "",
      connotation: definition,
      nuanceComparison:
        relatedWords.length > 0
          ? `Compared with ${relatedWords[0].word}, ${normalized} is more specific: ${definition.toLowerCase()}.`
          : "",
      famousUsage: primaryExample,
    },
  };
}

export function buildGenericWordDetail(word: string): WordDetail {
  const normalized = normalizeWord(word);
  return {
    word: normalized,
    phonetic: `/${normalized}/`,
    partOfSpeech: "word",
    level1: {
      definition: `A vocabulary entry for "${normalized}". Full AI detail was unavailable — try again when online.`,
      examples: [
        `The writer used ${normalized} with clear intent.`,
        `Understanding ${normalized} helps you read and write with more precision.`,
      ],
      mnemonic: `Picture a sentence where ${normalized} is the most precise word choice.`,
    },
    level2: {
      wordForms: [],
      synonyms: [],
      antonyms: [],
    },
    level3: {
      collocations: [],
      register: "Varies by context — check a dictionary for formal vs informal use.",
      commonMistake: "Confirm spelling and part of speech before using in an exam essay.",
      usageContext: "Use when the meaning fits your sentence and audience.",
    },
    level4: {
      etymology: "",
      connotation: "",
      nuanceComparison: "",
      famousUsage: "",
    },
  };
}

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isPlaceholderWordDetail(detail: WordDetail): boolean {
  return detail.level1.definition.includes("Full AI detail was unavailable");
}

export function isValidWordDetail(detail: WordDetail | null | undefined): detail is WordDetail {
  return Boolean(
    detail?.word &&
      detail.level1?.definition?.trim() &&
      Array.isArray(detail.level1.examples) &&
      detail.level1.examples.length > 0 &&
      !isPlaceholderWordDetail(detail),
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildLocalWordPractice(
  word: string,
  definition: string,
  examples: string[] = [],
): WordPracticeExercise {
  const normalized = normalizeWord(word);
  const example =
    examples.find((entry) => entry.toLowerCase().includes(normalized)) ??
    examples[0] ??
    `The letter left her feeling ${normalized}.`;

  const blankSentence = new RegExp(`\\b${escapeRegex(normalized)}\\b`, "i").test(example)
    ? example.replace(new RegExp(`\\b${escapeRegex(normalized)}\\b`, "i"), "___")
    : `${example.replace(/\.$/, "")}, which felt ___.`;

  return {
    fillBlank: {
      sentence: blankSentence.includes("___")
        ? blankSentence
        : `She described the mood as ___ (${definition.toLowerCase()}).`,
      answer: normalized,
    },
    useItYourself: {
      prompt: `Write one sentence using "${normalized}" to mean: ${definition}`,
      register: "Essays, stories, and reflective writing",
    },
  };
}

export function checkWordUsageLocally(
  word: string,
  userSentence: string,
  definition: string,
): WordUsageResult {
  const normalized = normalizeWord(word);
  const sentence = userSentence.trim();
  const includesWord = new RegExp(`\\b${escapeRegex(normalized)}\\b`, "i").test(sentence);
  const example = `Her ${normalized} mood lingered long after the conversation ended.`;

  if (!includesWord) {
    return {
      correct: false,
      feedback: `Use "${normalized}" in your sentence to show you understand the meaning.`,
      exampleSentence: example,
    };
  }

  return {
    correct: true,
    feedback: `Nice — you used "${normalized}" (${definition.toLowerCase()}) in context.`,
    exampleSentence: sentence,
  };
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
