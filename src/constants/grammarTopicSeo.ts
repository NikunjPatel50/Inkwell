import { GRAMMAR_TOPIC_SEO_CONTENT } from "./grammarTopicSeoContent";

export interface GrammarCompareExample {
  incorrect: string;
  correct: string;
  note: string;
}

export interface GrammarEdgeCase {
  sentence: string;
  note: string;
}

export interface GrammarTopicSeoContent {
  whyThisHappens: string;
  seeInSentence: GrammarCompareExample[];
  edgeCases: GrammarEdgeCase[];
  quickCheck: {
    prompt: string;
    answer: string;
  };
}

export function getGrammarTopicSeo(topicId: string): GrammarTopicSeoContent | undefined {
  return GRAMMAR_TOPIC_SEO_CONTENT[topicId];
}

export function hasGrammarTopicSeo(topicId: string): boolean {
  return topicId in GRAMMAR_TOPIC_SEO_CONTENT;
}
