import type { CurriculumSkill } from "../constants/curriculum";
import type { GrammarTopic } from "../constants/grammarTopics";
import type {
  FillBlankExercise,
  FillBlankResult,
  IdentifyItExercise,
  SpotTheErrorExercise,
  TransformItExercise,
  TransformItResult,
} from "../types";
import { ApiError } from "./apiClient";
import { insforge, isInsforgeConfigured } from "./insforge";
import {
  checkCompleteIt,
  generateCompleteItExercise,
  generateSpotTheErrorExercise,
} from "./learnClient";
import * as grammarGroq from "./grammarGroq";
import { GroqApiError, isGroqConfigured } from "./groqClient";

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

function topicInput(topic: GrammarTopic) {
  return {
    name: topic.name,
    categoryId: topic.categoryId,
    keyRule: topic.keyRule,
    teaser: topic.teaser,
  };
}

function topicAsSkill(topic: GrammarTopic, exerciseFocus: string): CurriculumSkill {
  return {
    id: topic.id,
    name: topic.name,
    tier: 2,
    description: `${exerciseFocus} ${topic.keyRule} Example: ${topic.teaser}`,
    exerciseTypes: ["complete-it", "spot-error"],
    introduction: topic.keyRule,
  };
}

function spotToIdentify(spot: SpotTheErrorExercise, topic: GrammarTopic): IdentifyItExercise {
  return {
    sentence: spot.sentence,
    targetPhrase: spot.errorWord,
    targetIndex: spot.errorIndex,
    confirmation: "That's the one!",
    hint: `Look for the word related to ${topic.name.toLowerCase()}.`,
    explanation: `${spot.correction} — ${spot.principle}`,
  };
}

function completeCheckToFillBlank(result: {
  correct: boolean;
  feedback: string;
  exampleCompletion: string;
  principle: string;
}): FillBlankResult {
  return {
    correct: result.correct,
    feedback: result.feedback,
    correctAnswer: result.exampleCompletion,
    explanation: result.principle,
  };
}

function completeCheckToTransform(result: {
  correct: boolean;
  feedback: string;
  exampleCompletion: string;
  principle: string;
}): TransformItResult {
  return {
    correct: result.correct,
    feedback: result.feedback,
    modelAnswer: result.exampleCompletion,
    explanation: result.principle,
  };
}

async function tryDedicatedGrammar<T>(body: Record<string, unknown>): Promise<T | null> {
  if (!isInsforgeConfigured()) return null;

  const { data, error } = await insforge.functions.invoke("grammar-learning", { body });
  if (error) {
    const message = extractErrorMessage(error).toLowerCase();
    if (message.includes("not found") || message.includes("404")) return null;
    throw new ApiError(extractErrorMessage(error));
  }
  assertNoPayloadError(data);
  return data as T;
}

async function withGrammarFallback<T>(
  dedicatedBody: Record<string, unknown>,
  viaLearn: () => Promise<T>,
  viaGroq: () => Promise<T>,
): Promise<T> {
  const dedicated = await tryDedicatedGrammar<T>(dedicatedBody);
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

export function isGrammarLearningAvailable(): boolean {
  return isInsforgeConfigured() || isGroqConfigured();
}

export async function generateIdentifyItExercise(
  topic: GrammarTopic,
  seed: string,
): Promise<IdentifyItExercise> {
  return withGrammarFallback(
    { action: "generate-identify-it", topic: topicInput(topic), seed },
    async () => {
      const spot = await generateSpotTheErrorExercise(
        topicAsSkill(
          topic,
          `Create one deliberate error demonstrating ${topic.name}. The error word is what the student must identify.`,
        ),
        seed,
      );
      return spotToIdentify(spot, topic);
    },
    () => grammarGroq.generateIdentifyItExercise(topic, seed),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function generateFillBlankExercise(
  topic: GrammarTopic,
  seed: string,
): Promise<FillBlankExercise> {
  return withGrammarFallback(
    { action: "generate-fill-blank", topic: topicInput(topic), seed },
    () =>
      generateCompleteItExercise(
        topicAsSkill(topic, `Fill-in-the-blank exercise for ${topic.name}.`),
        seed,
      ),
    () => grammarGroq.generateFillBlankExercise(topic, seed),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function checkFillBlank(
  topic: GrammarTopic,
  stem: string,
  answer: string,
): Promise<FillBlankResult> {
  return withGrammarFallback(
    { action: "check-fill-blank", topic: topicInput(topic), stem, answer },
    async () => {
      const result = await checkCompleteIt(stem, answer, topicAsSkill(topic, topic.name));
      return completeCheckToFillBlank(result);
    },
    () => grammarGroq.checkFillBlank(topic, stem, answer),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function generateTransformItExercise(
  topic: GrammarTopic,
  seed: string,
): Promise<TransformItExercise> {
  return withGrammarFallback(
    { action: "generate-transform-it", topic: topicInput(topic), seed },
    async () => {
      const spot = await generateSpotTheErrorExercise(
        topicAsSkill(
          topic,
          `Create a sentence that breaks this rule so the student can rewrite it correctly: ${topic.name}.`,
        ),
        seed,
      );
      return {
        originalSentence: spot.sentence,
        prompt: `Rewrite this sentence correctly, applying: ${topic.keyRule}`,
        modelAnswer: spot.correction,
      };
    },
    () => grammarGroq.generateTransformItExercise(topic, seed),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function checkTransformIt(
  topic: GrammarTopic,
  originalSentence: string,
  userRewrite: string,
): Promise<TransformItResult> {
  return withGrammarFallback(
    {
      action: "check-transform-it",
      topic: topicInput(topic),
      originalSentence,
      userRewrite,
    },
    async () => {
      const result = await checkCompleteIt(
        `Original: ${originalSentence}\nRewrite using ${topic.name}:`,
        userRewrite,
        topicAsSkill(topic, `Judge whether the rewrite applies: ${topic.keyRule}`),
      );
      return completeCheckToTransform(result);
    },
    () => grammarGroq.checkTransformIt(topic, originalSentence, userRewrite),
  ).catch((err) => {
    throw toApiError(err);
  });
}
