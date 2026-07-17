import type { CollocationEvaluateResult, EssayCoachResult, StepFeedbackResult } from "../types/coach";
import {
  classifyErrorText,
  exampleTextFromIssue,
  type ErrorCategory,
} from "./errorClassification";
import { recordErrorEvents, type ErrorEventInput } from "./errorPatternClient";
import type { AuthUser } from "../hooks/useAuth";

let activeUser: AuthUser | null = null;

export function setErrorTrackingUser(user: AuthUser | null): void {
  activeUser = user;
}

function coachEvent(
  issue: string,
  explanation?: string,
  exampleText?: string,
): ErrorEventInput {
  const classified = classifyErrorText(issue, explanation);
  return {
    source_tool: "coach",
    category: classified.category as ErrorCategory,
    subcategory: classified.subcategory,
    example_text: exampleText ?? exampleTextFromIssue(issue, explanation),
  };
}

export async function recordCoachEssayErrors(
  result: EssayCoachResult,
  essayText: string,
  user: AuthUser | null | undefined = activeUser,
): Promise<void> {
  const events: ErrorEventInput[] = [];

  for (const mistake of result.grammarMistakes) {
    events.push(coachEvent(mistake, mistake, mistake));
  }

  for (const weak of result.weakCollocations) {
    events.push(coachEvent(`Weak collocation: ${weak}`, weak, weak));
  }

  for (const criterion of result.criteria) {
    for (const improvement of criterion.improvements ?? []) {
      events.push(coachEvent(improvement, criterion.teaching, improvement));
    }
  }

  if (events.length === 0 && essayText.trim()) {
    const lowest = [...result.criteria].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];
    if (lowest && lowest.score / lowest.maxScore < 0.75) {
      events.push(
        coachEvent(
          `${lowest.label} needs work`,
          lowest.teaching,
          essayText.trim().slice(0, 280),
        ),
      );
    }
  }

  await recordErrorEvents(user, events);
}

export async function recordCoachCollocationErrors(
  result: CollocationEvaluateResult,
  user: AuthUser | null | undefined = activeUser,
): Promise<void> {
  const events = result.results
    .filter((entry) => !entry.correct)
    .map((entry) =>
      coachEvent(
        `Collocation error: ${entry.phrase}`,
        entry.explanation,
        entry.phrase,
      ),
    );

  await recordErrorEvents(user, events);
}

export async function recordCoachStepFeedbackError(
  stepLabel: string,
  question: string,
  answer: string,
  feedback: StepFeedbackResult,
  user: AuthUser | null | undefined = activeUser,
): Promise<void> {
  if (feedback.passed) return;

  await recordErrorEvents(user, [
    coachEvent(
      `${stepLabel}: ${feedback.feedback}`,
      feedback.suggestion ?? question,
      answer.slice(0, 280),
    ),
  ]);
}
