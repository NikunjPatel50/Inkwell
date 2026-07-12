import { GRAMMAR_TOPICS } from "@/constants/grammarTopics";
import { WORD_COLLECTIONS } from "@/constants/wordCollections";

export const MARKETING_NAV = [
  { label: "Learn", href: "/learn" },
  { label: "Grammar", href: "/grammar" },
  { label: "Vocabulary", href: "/vocabulary" },
  { label: "Write", href: "/write" },
  { label: "Coach", href: "/coach" },
  { label: "Creative", href: "/creative" },
] as const;

export const STATIC_MARKETING_PATHS = [
  "/",
  "/learn",
  "/grammar",
  "/vocabulary",
  "/write",
  "/coach",
  "/creative",
  "/ielts-writing-practice",
  "/pte-writing-practice",
] as const;

export function getGrammarTopicPaths(): string[] {
  return GRAMMAR_TOPICS.map((topic) => `/grammar/${topic.id}`);
}

export function getVocabularyCollectionPaths(): string[] {
  return WORD_COLLECTIONS.map((collection) => `/vocabulary/${collection.id}`);
}

export function getAllMarketingPaths(): string[] {
  return [
    ...STATIC_MARKETING_PATHS,
    ...getGrammarTopicPaths(),
    ...getVocabularyCollectionPaths(),
  ];
}
