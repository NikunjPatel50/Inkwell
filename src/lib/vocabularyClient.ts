import type { CurriculumSkill } from "../constants/curriculum";
import type { VocabularyWord } from "../constants/vocabularyTopics";
import { VOCABULARY_CATEGORIES } from "../constants/vocabularyTopics";
import type {
  CollectionQuizItem,
  PickMeaningExercise,
  UseItExercise,
  UseItResult,
  WordDetail,
  WordPracticeExercise,
  WordUsageResult,
} from "../types";
import { ApiError } from "./apiClient";
import { insforge, isInsforgeConfigured } from "./insforge";
import {
  buildLocalWordDetail,
  buildLocalWordPractice,
  checkWordUsageLocally,
  isValidWordDetail,
  normalizeWord,
} from "./vocabularyLookup";
import {
  fetchWordDetailFromApi,
  fetchWordSuggestionsFromApi,
} from "./vocabularyApi";
import {
  mergeWordSuggestions,
  searchWordSuggestions,
} from "./vocabularySearch";
import {
  checkCompleteIt,
  generateCompleteItExercise,
  generateSpotTheErrorExercise,
} from "./learnClient";
import { GroqApiError, isGroqConfigured } from "./groqClient";
import * as vocabularyGroq from "./vocabularyGroq";

function extractErrorMessage(error: unknown): string {
  if (!error) return "Request failed. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return "Request failed. Please try again.";
}

function assertNoPayloadError(data: unknown): void {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: string }).error;
    if (message) throw new ApiError(message);
  }
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof GroqApiError) return new ApiError(err.message);
  if (err instanceof Error) return new ApiError(err.message);
  return new ApiError("An unexpected error occurred. Please try again.");
}

function wordInput(word: VocabularyWord) {
  return {
    word: word.word,
    partOfSpeech: word.partOfSpeech,
    definition: word.definition,
    teaser: word.teaser,
  };
}

function wordAsSkill(word: VocabularyWord, exerciseFocus: string): CurriculumSkill {
  return {
    id: word.id,
    name: word.word,
    tier: 2,
    description: `${exerciseFocus} ${word.definition} (${word.partOfSpeech}). Example: ${word.teaser}`,
    exerciseTypes: ["complete-it", "spot-error"],
    introduction: word.definition,
  };
}

function completeCheckToUseIt(result: {
  correct: boolean;
  feedback: string;
  exampleCompletion: string;
  principle: string;
}): UseItResult {
  return {
    correct: result.correct,
    feedback: result.feedback,
    exampleSentence: result.exampleCompletion,
    explanation: result.principle,
  };
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

function generatePickMeaningLocally(word: VocabularyWord, seed: string): PickMeaningExercise {
  const distractors = VOCABULARY_CATEGORIES.flatMap((category) => category.words)
    .filter((entry) => entry.id !== word.id)
    .map((entry) => entry.definition);

  const start = hashSeed(seed) % Math.max(1, distractors.length - 3);
  const wrongOptions = distractors.slice(start, start + 3);
  while (wrongOptions.length < 3) {
    wrongOptions.push("A word with a different meaning.");
  }

  const options = [word.definition, ...wrongOptions.slice(0, 3)];
  const rotateBy = hashSeed(`${seed}-order`) % options.length;
  const ordered = [...options.slice(rotateBy), ...options.slice(0, rotateBy)];

  return {
    sentence: word.teaser,
    options: ordered,
    correctIndex: ordered.indexOf(word.definition),
    explanation: `${word.word}: ${word.definition}`,
  };
}

async function tryDedicatedVocabulary<T>(body: Record<string, unknown>): Promise<T | null> {
  if (!isInsforgeConfigured()) return null;

  const { data, error } = await insforge.functions.invoke("vocabulary-learning", { body });
  if (error) {
    const message = extractErrorMessage(error).toLowerCase();
    if (
      message.includes("not found") ||
      message.includes("404") ||
      message.includes("unknown action") ||
      message.includes("action and word are required")
    ) {
      return null;
    }
    throw new ApiError(extractErrorMessage(error));
  }
  assertNoPayloadError(data);
  return data as T;
}

async function withVocabularyFallback<T>(
  dedicatedBody: Record<string, unknown>,
  viaLearn: () => Promise<T>,
  viaGroq: () => Promise<T>,
): Promise<T> {
  const dedicated = await tryDedicatedVocabulary<T>(dedicatedBody);
  if (dedicated !== null) return dedicated;

  if (isInsforgeConfigured()) {
    try {
      return await viaLearn();
    } catch (err) {
      if (isGroqConfigured()) {
        try {
          return await viaGroq();
        } catch {
          throw err;
        }
      }
      throw err;
    }
  }

  return viaGroq();
}

export function isVocabularyLearningAvailable(): boolean {
  return isInsforgeConfigured() || isGroqConfigured();
}

export async function generateUseItExercise(
  word: VocabularyWord,
  seed: string,
): Promise<UseItExercise> {
  return withVocabularyFallback(
    { action: "generate-use-it", word: wordInput(word), seed },
    async () => {
      const exercise = await generateCompleteItExercise(
        wordAsSkill(
          word,
          `Scene-setting context for a vocabulary writing prompt using "${word.word}".`,
        ),
        seed,
      );
      return {
        context: exercise.stem.replace(/___/g, "…").trim(),
        prompt: `${exercise.hint} Write one sentence using "${word.word}".`,
      };
    },
    () => vocabularyGroq.generateUseItExercise(word, seed),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function checkUseIt(word: VocabularyWord, userSentence: string): Promise<UseItResult> {
  return withVocabularyFallback(
    { action: "check-use-it", word: wordInput(word), userSentence },
    async () => {
      const result = await checkCompleteIt(
        `Write a sentence using "${word.word}" (${word.definition}):`,
        userSentence,
        wordAsSkill(word, `Judge vocabulary usage of "${word.word}".`),
      );
      return completeCheckToUseIt(result);
    },
    () => vocabularyGroq.checkUseIt(word, userSentence),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function generatePickMeaningExercise(
  word: VocabularyWord,
  seed: string,
): Promise<PickMeaningExercise> {
  return withVocabularyFallback(
    { action: "generate-pick-meaning", word: wordInput(word), seed },
    () => Promise.resolve(generatePickMeaningLocally(word, seed)),
    () => vocabularyGroq.generatePickMeaningExercise(word, seed),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function generateReplaceItExercise(
  word: VocabularyWord,
  seed: string,
): Promise<{ weakSentence: string; weakWord: string; hint: string }> {
  return withVocabularyFallback(
    { action: "generate-replace-it", word: wordInput(word), seed },
    async () => {
      const spot = await generateSpotTheErrorExercise(
        wordAsSkill(
          word,
          `Include one vague or weak word that should be replaced with "${word.word}".`,
        ),
        seed,
      );
      return {
        weakSentence: spot.sentence,
        weakWord: spot.errorWord,
        hint: spot.principle,
      };
    },
    () => vocabularyGroq.generateReplaceItExercise(word, seed),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function checkReplaceIt(
  word: VocabularyWord,
  weakSentence: string,
  userSentence: string,
): Promise<UseItResult> {
  return withVocabularyFallback(
    { action: "check-replace-it", word: wordInput(word), weakSentence, userSentence },
    async () => {
      const result = await checkCompleteIt(
        `Replace the weak word in: ${weakSentence}\nUse "${word.word}" (${word.definition}):`,
        userSentence,
        wordAsSkill(word, `Judge whether "${word.word}" replaces the weak word naturally.`),
      );
      return completeCheckToUseIt(result);
    },
    () => vocabularyGroq.checkReplaceIt(word, weakSentence, userSentence),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function generateWordDetail(word: string): Promise<WordDetail> {
  const normalized = normalizeWord(word);
  const local = buildLocalWordDetail(normalized);
  if (isValidWordDetail(local)) return local;

  const apiDetail = await fetchWordDetailFromApi(normalized);
  if (isValidWordDetail(apiDetail)) return apiDetail;

  throw new ApiError(`Could not load details for "${normalized}". Try again.`);
}

export async function searchWordSuggestionsAsync(query: string): Promise<string[]> {
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed) return [];

  const local = searchWordSuggestions(trimmed, 4);
  let ai: string[] = [];

  try {
    ai = await fetchWordSuggestionsFromApi(trimmed);
  } catch {
    // Fall through to edge function / client Groq.
  }

  if (ai.length === 0) {
    const dedicated = await tryDedicatedVocabulary<{ suggestions: string[] }>({
      action: "suggest-words",
      query: trimmed,
    });
    if (dedicated?.suggestions?.length) {
      ai = dedicated.suggestions;
    }
  }

  if (ai.length === 0 && isGroqConfigured()) {
    try {
      ai = await vocabularyGroq.suggestWords(trimmed);
    } catch {
      // Use local + query only.
    }
  }

  return mergeWordSuggestions(local, ai, { limit: 6, query: trimmed });
}

export async function generateWordPractice(
  word: string,
  definition: string,
): Promise<WordPracticeExercise> {
  const localDetail = buildLocalWordDetail(normalizeWord(word));
  const local = buildLocalWordPractice(
    word,
    definition,
    localDetail?.level1.examples ?? [],
  );

  if (isGroqConfigured()) {
    try {
      return await vocabularyGroq.generateWordPractice(word, definition);
    } catch {
      return local;
    }
  }

  return local;
}

export async function checkWordUsage(
  word: string,
  userSentence: string,
  definition?: string,
): Promise<WordUsageResult> {
  const localDetail = buildLocalWordDetail(normalizeWord(word));
  const resolvedDefinition =
    definition ?? localDetail?.level1.definition ?? "the target meaning";

  if (isGroqConfigured()) {
    try {
      return await vocabularyGroq.checkWordUsage(word, userSentence);
    } catch {
      return checkWordUsageLocally(word, userSentence, resolvedDefinition);
    }
  }

  return checkWordUsageLocally(word, userSentence, resolvedDefinition);
}

export async function generateCollectionQuiz(words: string[]): Promise<CollectionQuizItem[]> {
  return withVocabularyFallback(
    { action: "generate-collection-quiz", words },
    () => vocabularyGroq.generateCollectionQuiz(words),
    () => vocabularyGroq.generateCollectionQuiz(words),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function saveLookedUpWord(
  word: string,
  definition: string,
  sourceSentence: string,
): Promise<void> {
  if (!isInsforgeConfigured()) return;

  try {
    const { data, error } = await insforge.functions.invoke("save-vocabulary-word", {
      body: { word, definition, sourceSentence },
    });
    if (error) {
      const message = extractErrorMessage(error).toLowerCase();
      if (message.includes("not found") || message.includes("404")) return;
      throw new ApiError(extractErrorMessage(error));
    }
    assertNoPayloadError(data);
  } catch {
    // Non-blocking — vocabulary bank is a nice-to-have
  }
}
