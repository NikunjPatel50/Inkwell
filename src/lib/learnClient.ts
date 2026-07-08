import type { CurriculumSkill } from "../constants/curriculum";
import type {
  BuildItExercise,
  CompleteItCheckResult,
  CompleteItExercise,
  PracticedSkill,
  PracticedSkillsResponse,
  SpotTheErrorExercise,
} from "../types";
import { ApiError } from "./apiClient";
import { insforge, isInsforgeConfigured } from "./insforge";
import {
  checkCompleteIt as checkCompleteItGroq,
  generateBuildItExercise as generateBuildItGroq,
  generateCompleteItExercise as generateCompleteItGroq,
  generateSpotTheErrorExercise as generateSpotGroq,
} from "./learnGroq";
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

async function invoke<T>(slug: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await insforge.functions.invoke(slug, { body });
  if (error) throw new ApiError(extractErrorMessage(error));
  assertNoPayloadError(data);
  return data as T;
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof GroqApiError) return new ApiError(err.message);
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
      return await invoke<T>(slug, body);
    } catch (err) {
      if (isGroqConfigured()) {
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

function skillInput(skill: CurriculumSkill) {
  return { name: skill.name, tier: skill.tier, description: skill.description };
}

export function isLearnAvailable(): boolean {
  return isInsforgeConfigured() || isGroqConfigured();
}

export async function generateBuildItExercise(
  skill: CurriculumSkill,
  varietySeed: string,
): Promise<BuildItExercise> {
  return withFallback("generate-build-it", { skill: skillInput(skill), varietySeed }, () =>
    generateBuildItGroq(skill, varietySeed),
  ).catch((e) => {
    throw toApiError(e);
  });
}

export async function generateSpotTheErrorExercise(
  skill: CurriculumSkill,
  varietySeed: string,
): Promise<SpotTheErrorExercise> {
  return withFallback("generate-spot-error", { skill: skillInput(skill), varietySeed }, () =>
    generateSpotGroq(skill, varietySeed),
  ).catch((e) => {
    throw toApiError(e);
  });
}

export async function generateCompleteItExercise(
  skill: CurriculumSkill,
  varietySeed: string,
): Promise<CompleteItExercise> {
  return withFallback("generate-complete-it", { skill: skillInput(skill), varietySeed }, () =>
    generateCompleteItGroq(skill, varietySeed),
  ).catch((e) => {
    throw toApiError(e);
  });
}

export async function checkCompleteIt(
  stem: string,
  userCompletion: string,
  skill: CurriculumSkill,
): Promise<CompleteItCheckResult> {
  return withFallback(
    "check-complete-it",
    { stem, userCompletion, skill: skillInput(skill) },
    () => checkCompleteItGroq(stem, userCompletion, skill),
  ).catch((e) => {
    throw toApiError(e);
  });
}

export async function fetchPracticedSkills(): Promise<PracticedSkill[]> {
  if (!isInsforgeConfigured()) return [];
  try {
    const { data, error } = await insforge.functions.invoke("get-practiced-skills", {
      method: "GET",
    });
    if (error) throw new ApiError(extractErrorMessage(error));
    assertNoPayloadError(data);
    const response = data as PracticedSkillsResponse;
    return response.skills.map((row) => ({
      skillId: row.skillId,
      exercisesCompleted: row.exercisesCompleted,
      averageScore: row.averageScore,
      lastPracticedAt: row.lastPracticedAt,
    }));
  } catch {
    return [];
  }
}

export async function savePracticedSkill(record: PracticedSkill): Promise<void> {
  if (!isInsforgeConfigured()) return;
  try {
    await invoke("upsert-practiced-skill", {
      skillId: record.skillId,
      exercisesCompleted: record.exercisesCompleted,
      averageScore: record.averageScore,
    });
  } catch {
    // Non-blocking
  }
}

export {
  generateBuildItExercise as generateBuildItExerciseDirect,
  generateSpotTheErrorExercise as generateSpotTheErrorExerciseDirect,
  generateCompleteItExercise as generateCompleteItExerciseDirect,
  checkCompleteIt as checkCompleteItDirect,
} from "./learnGroq";
