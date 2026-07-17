import type { ClassifiedError } from "./errorClassification.ts";

export interface ErrorEventInsert {
  source_tool: "write" | "coach";
  category: string;
  subcategory?: string | null;
  example_text: string;
  session_id?: string | null;
}

export async function insertErrorEvents(
  client: ReturnType<typeof import("npm:@insforge/sdk@latest").createClient>,
  userId: string,
  events: ErrorEventInsert[],
): Promise<void> {
  if (events.length === 0) return;

  await client.database.from("error_events").insert(
    events.map((event) => ({
      user_id: userId,
      source_tool: event.source_tool,
      category: event.category,
      subcategory: event.subcategory ?? null,
      example_text: event.example_text,
      session_id: event.session_id ?? null,
    })),
  );
}

export function buildWriteErrorEvents(
  errors: Array<{
    issue: string;
    explanation: string;
    teaching?: { example?: { before?: string } };
  }>,
  classify: (issue: string, explanation?: string) => ClassifiedError,
  exampleFor: (
    issue: string,
    explanation?: string,
    teaching?: { example?: { before?: string } },
  ) => string,
  sessionId: string | null,
): ErrorEventInsert[] {
  return errors.map((error) => {
    const classified = classify(error.issue, error.explanation);
    return {
      source_tool: "write",
      category: classified.category,
      subcategory: classified.subcategory,
      example_text: exampleFor(error.issue, error.explanation, error.teaching),
      session_id: sessionId,
    };
  });
}
