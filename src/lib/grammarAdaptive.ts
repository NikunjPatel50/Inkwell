import type { GrammarCategoryId, GrammarTopic } from "../constants/grammarTopics";
import {
  GRAMMAR_CATEGORIES,
  getGrammarTopic,
} from "../constants/grammarTopics";

const GRAMMAR_WEAKNESS_KEY = "inkwell-grammar-weakness";

const TOPIC_TO_SKILL: Record<string, string> = {
  "subject-verb-agreement": "nouns-verbs",
  articles: "articles",
  "wrong-tense": "verb-tenses",
  "preposition-confusion": "prepositions-phrases",
  "comma-splices": "compound-sentences",
  "run-on-sentences": "compound-sentences",
  fragments: "basic-sentence-structure",
  "simple-sentences": "basic-sentence-structure",
  "compound-sentences": "compound-sentences",
  "complex-sentences": "subordinate-clauses",
  "compound-complex": "subordinate-clauses",
};

const CATEGORY_TO_SKILL: Record<GrammarCategoryId, string> = {
  "parts-of-speech": "nouns-verbs",
  "sentence-structure": "subordinate-clauses",
  "verb-tenses": "verb-tenses",
  punctuation: "capitalization-punctuation",
  "common-mistakes": "precise-word-choice",
};

const CATEGORY_TO_PATTERN: Record<GrammarCategoryId, string> = {
  "parts-of-speech": "Word Choice",
  "sentence-structure": "Sentence Structure",
  "verb-tenses": "Sentence Structure",
  punctuation: "Punctuation",
  "common-mistakes": "Word Choice",
};

const CATEGORY_ORDER: GrammarCategoryId[] = [
  "parts-of-speech",
  "sentence-structure",
  "verb-tenses",
  "punctuation",
  "common-mistakes",
];

interface GrammarWeakness {
  categoryId: GrammarCategoryId;
  topicId: string;
  count: number;
}

function readWeaknesses(): GrammarWeakness[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(GRAMMAR_WEAKNESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GrammarWeakness[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWeaknesses(entries: GrammarWeakness[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GRAMMAR_WEAKNESS_KEY, JSON.stringify(entries));
  } catch {
    // Session storage unavailable
  }
}

export function getGrammarCurriculumSkillId(topic: GrammarTopic): string {
  return TOPIC_TO_SKILL[topic.id] ?? CATEGORY_TO_SKILL[topic.categoryId];
}

export function getGrammarPatternCategory(topic: GrammarTopic): string {
  return CATEGORY_TO_PATTERN[topic.categoryId];
}

export function recordGrammarExerciseMiss(topic: GrammarTopic): void {
  const entries = readWeaknesses();
  const existing = entries.find(
    (entry) => entry.topicId === topic.id && entry.categoryId === topic.categoryId,
  );

  if (existing) {
    existing.count += 1;
  } else {
    entries.push({
      categoryId: topic.categoryId,
      topicId: topic.id,
      count: 1,
    });
  }

  writeWeaknesses(entries);
}

export function getTopGrammarWeakness(): GrammarWeakness | null {
  const entries = readWeaknesses();
  if (entries.length === 0) return null;
  return [...entries].sort((a, b) => b.count - a.count)[0] ?? null;
}

export function getRelatedGrammarTopics(topicId: string, count = 3): GrammarTopic[] {
  const topic = getGrammarTopic(topicId);
  if (!topic) return [];

  const category = GRAMMAR_CATEGORIES.find((entry) => entry.id === topic.categoryId);
  if (!category) return [];

  const sameCategory = category.topics.filter((entry) => entry.id !== topicId);
  const categoryIndex = CATEGORY_ORDER.indexOf(topic.categoryId);
  const nextCategory = GRAMMAR_CATEGORIES[(categoryIndex + 1) % GRAMMAR_CATEGORIES.length];
  const crossPick = nextCategory?.topics.find((entry) => entry.id !== topicId);

  const related = [...sameCategory.slice(0, 2)];
  if (crossPick) related.push(crossPick);

  return related.slice(0, count);
}
