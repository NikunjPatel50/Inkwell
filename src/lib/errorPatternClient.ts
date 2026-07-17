import type { ErrorCategory } from "./errorClassification";
import { ApiError } from "./apiClient";
import { insforge, isInsforgeConfigured } from "./insforge";
import { userCanAccessPatternTracking } from "./premium";
import type { AuthUser } from "../hooks/useAuth";

export interface ErrorEventInput {
  source_tool: "write" | "coach";
  category: ErrorCategory;
  subcategory?: string | null;
  example_text: string;
  session_id?: string | null;
}

export interface RecurringErrorPattern {
  category: ErrorCategory;
  label: string;
  description: string;
  count: number;
  recentExample: string;
  grammarSlug: string;
}

export interface ErrorPatternsResponse {
  patterns: RecurringErrorPattern[];
  windowDays: number;
}

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

export async function fetchRecurringErrorPatterns(
  user: AuthUser | null | undefined,
): Promise<ErrorPatternsResponse | null> {
  if (!user || !userCanAccessPatternTracking(user) || !isInsforgeConfigured()) {
    return null;
  }

  const { data, error } = await insforge.functions.invoke("get-error-patterns", {
    body: {},
  });

  if (error) {
    const message = extractErrorMessage(error).toLowerCase();
    if (message.includes("403") || message.includes("premium")) {
      return null;
    }
    throw new ApiError(extractErrorMessage(error));
  }

  if (!data || typeof data !== "object") return { patterns: [], windowDays: 30 };

  const payload = data as ErrorPatternsResponse;
  return {
    patterns: Array.isArray(payload.patterns) ? payload.patterns : [],
    windowDays: payload.windowDays ?? 30,
  };
}

export async function fetchTopErrorCategoriesForPrompt(
  user: AuthUser | null | undefined,
  limit = 3,
): Promise<Array<{ category: ErrorCategory; label: string; count: number }>> {
  const response = await fetchRecurringErrorPatterns(user);
  if (!response) return [];

  return response.patterns.slice(0, limit).map((pattern) => ({
    category: pattern.category,
    label: pattern.label,
    count: pattern.count,
  }));
}

export async function recordErrorEvents(
  user: AuthUser | null | undefined,
  events: ErrorEventInput[],
): Promise<void> {
  if (!user || !userCanAccessPatternTracking(user) || !isInsforgeConfigured() || events.length === 0) {
    return;
  }

  try {
    await insforge.functions.invoke("record-error-events", {
      body: { events: events.slice(0, 40) },
    });
  } catch {
    // Non-blocking — analysis UX should not fail if tracking fails.
  }
}
