import { ApiError } from "./apiClient";
import type { WordDetail } from "../types";
import { isValidWordDetail } from "./vocabularyLookup";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && payload.error
        ? payload.error
        : `Request failed (${response.status}).`;
    throw new ApiError(message);
  }
  if (payload && typeof payload === "object" && "error" in payload && payload.error) {
    throw new ApiError(payload.error);
  }
  return payload as T;
}

export async function fetchWordDetailFromApi(word: string): Promise<WordDetail> {
  const response = await fetch("/api/vocabulary/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
    credentials: "same-origin",
  });
  const detail = await parseResponse<WordDetail>(response);
  if (!isValidWordDetail(detail)) {
    throw new ApiError("Word lookup returned an incomplete response. Try again.");
  }
  return detail;
}

export async function fetchWordSuggestionsFromApi(query: string): Promise<string[]> {
  const response = await fetch("/api/vocabulary/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    credentials: "same-origin",
  });
  const payload = await parseResponse<{ suggestions: string[] }>(response);
  return payload.suggestions ?? [];
}
