import { ApiError } from "./apiClient";
import { isInsforgeConfigured } from "./insforge";
import { postWritingDnaApi } from "./writingDnaApi";
import { userCanAccessPatternTracking } from "./premium";
import type { AuthUser } from "../hooks/useAuth";
import type { WritingDnaDashboard, WritingDnaGoal } from "../types/writingDna";
import {
  buildWritingFingerprint,
  createWritingDnaGoalRecord,
  deleteWritingDnaGoalRecord,
} from "./writingDnaStore";

export const WRITING_DNA_UPDATED_EVENT = "writing-dna-updated";

export function notifyWritingDnaUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WRITING_DNA_UPDATED_EVENT));
}

export function userCanAccessWritingDna(user: AuthUser | null | undefined): boolean {
  return userCanAccessPatternTracking(user);
}

function extractErrorMessage(error: unknown): string {
  if (!error) return "Request failed. Please try again.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.details === "string") return obj.details;
  }
  return "Request failed. Please try again.";
}

export async function fetchWritingDnaDashboard(
  user: AuthUser | null | undefined,
  options: { sessionPage?: number; vocabPage?: number } = {},
): Promise<WritingDnaDashboard | null> {
  if (!user || !userCanAccessWritingDna(user) || !isInsforgeConfigured()) {
    return null;
  }

  try {
    const dashboard = await postWritingDnaApi<WritingDnaDashboard>(
      "dashboard",
      {
        sessionPage: options.sessionPage ?? 0,
        vocabPage: options.vocabPage ?? 0,
      },
      { userId: user.id },
    );
    return {
      ...dashboard,
      fingerprint: dashboard.fingerprint ?? buildWritingFingerprint(dashboard.profile, dashboard.sessions),
    };
  } catch (error) {
    throw new ApiError(extractErrorMessage(error));
  }
}

export async function recordWritingDnaSubmission(
  user: AuthUser | null | undefined,
  payload: {
    text: string;
    sourceTool?: "write" | "coach" | "pte";
    errors?: Array<{ issue: string; explanation: string }>;
    registerScore?: number;
    timeSpentSeconds?: number;
    analyzedSentenceId?: string | null;
  },
): Promise<{ dnaScore: number; sessionId: string | null } | null> {
  if (!user || !userCanAccessWritingDna(user) || !isInsforgeConfigured()) {
    return null;
  }

  try {
    const result = await postWritingDnaApi<{ dnaScore: number; sessionId: string | null }>(
      "record",
      {
        text: payload.text,
        sourceTool: payload.sourceTool ?? "write",
        errors: payload.errors ?? [],
        registerScore: payload.registerScore,
        timeSpentSeconds: payload.timeSpentSeconds,
        analyzedSentenceId: payload.analyzedSentenceId ?? null,
      },
      { userId: user.id },
    );
    notifyWritingDnaUpdated();
    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Writing DNA persistence failed:", extractErrorMessage(error));
    }
    return null;
  }
}

export async function createWritingDnaGoal(
  user: AuthUser | null | undefined,
  goal: {
    goalType: string;
    title: string;
    targetValue: number;
    unit?: string;
  },
): Promise<WritingDnaGoal | null> {
  if (!user || !userCanAccessWritingDna(user) || !isInsforgeConfigured()) {
    return null;
  }

  try {
    return await createWritingDnaGoalRecord(user.id, goal);
  } catch (err) {
    throw new ApiError(extractErrorMessage(err));
  }
}

export async function deleteWritingDnaGoal(
  user: AuthUser | null | undefined,
  goalId: string,
): Promise<void> {
  if (!user || !userCanAccessWritingDna(user) || !isInsforgeConfigured()) {
    return;
  }

  try {
    await deleteWritingDnaGoalRecord(user.id, goalId);
  } catch (err) {
    throw new ApiError(extractErrorMessage(err));
  }
}

export function buildWritingDnaCsv(dashboard: WritingDnaDashboard): string {
  const lines = [
    "date,source,dna_score,word_count,unique_words,grammar,vocabulary,clarity",
  ];

  for (const session of dashboard.sessions) {
    lines.push(
      [
        session.created_at,
        session.source_tool,
        session.dna_score,
        session.word_count,
        session.unique_words,
        session.dimensions.grammar,
        session.dimensions.vocabulary,
        session.dimensions.clarity,
      ].join(","),
    );
  }

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildWritingDnaReportHtml(dashboard: WritingDnaDashboard): string {
  const profile = dashboard.profile;
  const insights = profile?.insights?.join("</li><li>") ?? "Submit writing to generate insights.";
  const personality = profile?.personality ?? "Emerging Writer";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Writing DNA Report</title>
  <style>
    body { font-family: Georgia, serif; color: #1a1a1a; max-width: 720px; margin: 2rem auto; line-height: 1.6; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .score { font-size: 3rem; font-weight: 700; color: #1a9e96; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; background: #f0f4f4; font-size: 0.85rem; }
    section { margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>Writing DNA™</h1>
  <p class="badge">${personality}</p>
  <p class="score">${profile?.dna_score ?? 0}</p>
  <p>Fingerprint: ${dashboard.fingerprint ?? "—"}</p>
  <p>Total words: ${profile?.total_words ?? 0} · Sessions: ${profile?.total_sessions ?? 0}</p>
  <section>
    <h2>Insights</h2>
    <ul><li>${insights}</li></ul>
  </section>
  <section>
    <h2>Streak</h2>
    <p>Current: ${dashboard.streak.current} days · Best: ${dashboard.streak.best} days</p>
  </section>
</body>
</html>`;
}

export function hasWritingDnaData(dashboard: WritingDnaDashboard | null): boolean {
  if (!dashboard) return false;
  return (
    Boolean(dashboard.profile) ||
    dashboard.sessions.length > 0 ||
    dashboard.sessionPagination.total > 0
  );
}
