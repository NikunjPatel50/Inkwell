import { GRAMMAR_CATEGORIES, getGrammarTopic } from "@/constants/grammarTopics";
import { WORD_COLLECTIONS } from "@/constants/wordCollections";

export interface RelatedLink {
  href: string;
  label: string;
}

export function getGrammarRelatedTopics(topicId: string, limit = 4): RelatedLink[] {
  const topic = getGrammarTopic(topicId);
  if (!topic) return [];

  const category = GRAMMAR_CATEGORIES.find((entry) => entry.id === topic.categoryId);
  if (!category) return [];

  return category.topics
    .filter((entry) => entry.id !== topicId)
    .slice(0, limit)
    .map((entry) => ({
      href: `/grammar/${entry.id}`,
      label: entry.name,
    }));
}

export function getVocabularyRelatedCollections(collectionId: string, limit = 3): RelatedLink[] {
  const index = WORD_COLLECTIONS.findIndex((entry) => entry.id === collectionId);
  if (index === -1) return [];

  const related: RelatedLink[] = [];
  for (let offset = 1; related.length < limit && offset < WORD_COLLECTIONS.length; offset++) {
    const entry = WORD_COLLECTIONS[(index + offset) % WORD_COLLECTIONS.length];
    if (entry.id === collectionId) continue;
    related.push({
      href: `/vocabulary/${entry.id}`,
      label: entry.title,
    });
  }

  return related;
}
