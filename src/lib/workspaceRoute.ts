import type { AppTab } from "../types";
import { APP_TABS } from "../types";

const TAB_PARAM = "tab";
const GRAMMAR_TOPIC_PARAM = "topic";
const VOCABULARY_WORD_PARAM = "word";
const VOCABULARY_COLLECTION_PARAM = "collection";
const LEARN_SKILL_PARAM = "skill";

const VALID_TABS = new Set<AppTab>(APP_TABS.map((tab) => tab.id));

export function isAppTab(value: string | null | undefined): value is AppTab {
  return Boolean(value && VALID_TABS.has(value as AppTab));
}

export function readWorkspaceRoute(): {
  tab: AppTab;
  grammarTopicId: string | null;
  vocabularyWordId: string | null;
  vocabularyCollectionId: string | null;
  learnSkillId: string | null;
} {
  if (typeof window === "undefined") {
    return {
      tab: "dashboard",
      grammarTopicId: null,
      vocabularyWordId: null,
      vocabularyCollectionId: null,
      learnSkillId: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get(TAB_PARAM);
  const tab = isAppTab(tabParam) ? tabParam : "dashboard";

  return {
    tab,
    grammarTopicId: params.get(GRAMMAR_TOPIC_PARAM),
    vocabularyWordId: params.get(VOCABULARY_WORD_PARAM),
    vocabularyCollectionId: params.get(VOCABULARY_COLLECTION_PARAM),
    learnSkillId: params.get(LEARN_SKILL_PARAM),
  };
}

export function writeWorkspaceRoute(options: {
  tab?: AppTab;
  grammarTopicId?: string | null;
  vocabularyWordId?: string | null;
  vocabularyCollectionId?: string | null;
  learnSkillId?: string | null;
}): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (options.tab) {
    params.set(TAB_PARAM, options.tab);
  }

  if (options.grammarTopicId !== undefined) {
    if (options.grammarTopicId) params.set(GRAMMAR_TOPIC_PARAM, options.grammarTopicId);
    else params.delete(GRAMMAR_TOPIC_PARAM);
  }

  if (options.vocabularyWordId !== undefined) {
    if (options.vocabularyWordId) params.set(VOCABULARY_WORD_PARAM, options.vocabularyWordId);
    else params.delete(VOCABULARY_WORD_PARAM);
  }

  if (options.vocabularyCollectionId !== undefined) {
    if (options.vocabularyCollectionId) {
      params.set(VOCABULARY_COLLECTION_PARAM, options.vocabularyCollectionId);
    } else {
      params.delete(VOCABULARY_COLLECTION_PARAM);
    }
  }

  if (options.learnSkillId !== undefined) {
    if (options.learnSkillId) params.set(LEARN_SKILL_PARAM, options.learnSkillId);
    else params.delete(LEARN_SKILL_PARAM);
  }

  const next = `${url.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState(window.history.state, "", next);
}
