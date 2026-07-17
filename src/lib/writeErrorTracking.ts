import type { WritingError } from "../types";
import {
  classifyErrorText,
  exampleTextFromIssue,
  type ErrorCategory,
} from "./errorClassification";
import { recordErrorEvents, type ErrorEventInput } from "./errorPatternClient";
import type { AuthUser } from "../hooks/useAuth";

export async function recordWriteAnalysisErrors(
  user: AuthUser | null | undefined,
  errors: WritingError[],
): Promise<void> {
  if (!errors.length) return;

  const events: ErrorEventInput[] = errors.map((error) => {
    const classified = classifyErrorText(error.issue, error.explanation);
    const example =
      error.teaching?.example?.before?.trim() ||
      exampleTextFromIssue(error.issue, error.explanation);

    return {
      source_tool: "write",
      category: classified.category as ErrorCategory,
      subcategory: classified.subcategory,
      example_text: example,
    };
  });

  await recordErrorEvents(user, events);
}
