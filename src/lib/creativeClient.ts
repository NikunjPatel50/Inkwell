import type { DuelResult, DuelSentence, EmotionRewriteResult } from "../types";
import { ApiError } from "./apiClient";
import * as groqClient from "./groqClient";
import { insforge, isInsforgeConfigured } from "./insforge";

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
    if (message) {
      throw new ApiError(message);
    }
  }
}

async function invokeFunction<T>(slug: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await insforge.functions.invoke(slug, { body });

  if (error) {
    const message = extractErrorMessage(error);
    if (message.toLowerCase().includes("not found") && groqClient.isGroqConfigured()) {
      throw new ApiError("CREATIVE_FALLBACK");
    }
    throw new ApiError(message);
  }

  assertNoPayloadError(data);
  return data as T;
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof groqClient.GroqApiError) return new ApiError(err.message);
  if (err instanceof Error) return new ApiError(err.message);
  return new ApiError("An unexpected error occurred. Please try again.");
}

async function withFallback<T>(
  slug: string,
  body: Record<string, unknown>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (isInsforgeConfigured()) {
    try {
      return await invokeFunction<T>(slug, body);
    } catch (err) {
      if (err instanceof ApiError && err.message === "CREATIVE_FALLBACK") {
        return fallback();
      }
      if (groqClient.isGroqConfigured()) {
        try {
          return await fallback();
        } catch {
          throw err;
        }
      }
      throw err;
    }
  }

  return fallback();
}

export async function generateDuelSentence(): Promise<DuelSentence> {
  return withFallback<DuelSentence>("generate-duel-sentence", {}, () =>
    groqClient.generateDuelSentence(),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function judgeDuel(
  badSentence: string,
  flaw: string,
  userRewrite: string,
): Promise<DuelResult> {
  return withFallback<DuelResult>(
    "judge-duel",
    { badSentence, flaw, userRewrite },
    () => groqClient.judgeDuel(badSentence, flaw, userRewrite),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export async function rewriteWithEmotion(text: string): Promise<EmotionRewriteResult> {
  return withFallback<EmotionRewriteResult>(
    "rewrite-with-emotion",
    { text },
    () => groqClient.rewriteWithEmotion(text),
  ).catch((err) => {
    throw toApiError(err);
  });
}

export function isCreativeAvailable(): boolean {
  return isInsforgeConfigured() || groqClient.isGroqConfigured();
}
