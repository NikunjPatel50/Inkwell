import { ApiError } from "./apiClient";
import { getVerifiedAccessToken } from "./accessToken";

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

export async function postWritingDnaApi<T>(
  path: string,
  body: Record<string, unknown>,
  options: { userId: string },
): Promise<T> {
  const auth = await getVerifiedAccessToken(options.userId);
  if (!auth) {
    throw new ApiError("Could not load Writing DNA. Please refresh the page.");
  }

  const response = await fetch(`/api/writing-dna/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({
      ...body,
      userId: options.userId,
    }),
    credentials: "same-origin",
  });

  return parseResponse<T>(response);
}
