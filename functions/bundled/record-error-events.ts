import { createClient } from "npm:@insforge/sdk@latest";

// shared: cors
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// shared: auth
export async function getAuthenticatedClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const userToken = authHeader?.replace(/^Bearer\s+/i, "").trim() ?? null;

  if (!userToken) {
    return { client: null, userId: null, error: "Missing authorization token." };
  }

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL") ?? "",
    edgeFunctionToken: userToken,
  });

  const { data: userData, error } = await client.auth.getCurrentUser();
  if (error || !userData?.user?.id) {
    return { client: null, userId: null, error: "Unauthorized — please sign in again." };
  }

  return { client, userId: userData.user.id, error: null };
}

// shared: premium
/**
 * Premium features are open to all authenticated users during beta.
 * Auth is enforced by each handler before this check.
 */
export function isPremiumUser(_userId: string): boolean {
  return true;
}

// shared: errorClassification
export const ERROR_CATEGORIES = [
  "subject_verb_agreement",
  "tense_shift",
  "article_misuse",
  "preposition_error",
  "run_on_sentence",
  "fragment",
  "word_choice_register",
  "spelling",
  "punctuation",
  "pronoun_reference",
  "word_form",
  "other",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export interface ClassifiedError {
  category: ErrorCategory;
  subcategory: string | null;
}

export interface ErrorCategoryMeta {
  label: string;
  description: string;
  grammarSlug: string;
}

export const ERROR_CATEGORY_META: Record<ErrorCategory, ErrorCategoryMeta> = {
  subject_verb_agreement: {
    label: "Subject–verb agreement",
    description:
      "The verb form does not match the subject in number or person — a common slip under time pressure.",
    grammarSlug: "subject-verb-agreement",
  },
  tense_shift: {
    label: "Tense shifts",
    description:
      "Verb tenses change inconsistently within a sentence or paragraph, confusing the timeline.",
    grammarSlug: "wrong-tense",
  },
  article_misuse: {
    label: "Article misuse",
    description:
      "Missing, extra, or incorrect a/an/the choices — especially with abstract nouns and countability.",
    grammarSlug: "article-errors",
  },
  preposition_error: {
    label: "Preposition errors",
    description:
      "The wrong preposition was chosen for the verb, adjective, or phrase pattern.",
    grammarSlug: "preposition-confusion",
  },
  run_on_sentence: {
    label: "Run-on sentences",
    description:
      "Two independent clauses are joined without proper punctuation or a conjunction.",
    grammarSlug: "run-ons",
  },
  fragment: {
    label: "Sentence fragments",
    description:
      "An incomplete sentence is presented as a full thought — often missing a subject or finite verb.",
    grammarSlug: "fragments",
  },
  word_choice_register: {
    label: "Word choice & register",
    description:
      "A word or phrase is too informal, imprecise, or off-register for the context.",
    grammarSlug: "confused-words",
  },
  spelling: {
    label: "Spelling",
    description: "Misspelled words or near-homophone slips that change meaning.",
    grammarSlug: "confused-words",
  },
  punctuation: {
    label: "Punctuation",
    description:
      "Comma splices, missing end marks, apostrophe errors, or other punctuation issues.",
    grammarSlug: "commas",
  },
  pronoun_reference: {
    label: "Pronoun reference",
    description:
      "A pronoun does not clearly refer to its antecedent, or the wrong pronoun form is used.",
    grammarSlug: "pronouns",
  },
  word_form: {
    label: "Word form",
    description:
      "The wrong part of speech was used — e.g. adjective instead of adverb, or noun instead of verb.",
    grammarSlug: "confused-words",
  },
  other: {
    label: "Other patterns",
    description: "Recurring issues that do not fit a single grammar category yet.",
    grammarSlug: "common-mistakes",
  },
};

type Rule = { category: ErrorCategory; subcategory?: string; patterns: RegExp[] };

const RULES: Rule[] = [
  {
    category: "subject_verb_agreement",
    subcategory: "agreement",
    patterns: [
      /\bsubject[- ]verb\b/i,
      /\bagreement\b/i,
      /\bdon'?t\b.*\b(he|she|it)\b/i,
      /\b(he|she|it)\s+\w+[^s]\b/i,
      /\b(they|we)\s+(is|was|has)\b/i,
      /\b(singular|plural)\s+(verb|subject)\b/i,
    ],
  },
  {
    category: "tense_shift",
    subcategory: "consistency",
    patterns: [
      /\btense\b/i,
      /\b(past|present|future)\s+(tense|form)\b/i,
      /\binconsistent\s+tense\b/i,
      /\btense\s+shift\b/i,
      /\bshifted\s+tense\b/i,
    ],
  },
  {
    category: "article_misuse",
    subcategory: "articles",
    patterns: [/\barticle\b/i, /\ba\/an\b/i, /\b(the|a|an)\s+(missing|wrong|incorrect)\b/i],
  },
  {
    category: "preposition_error",
    subcategory: "prepositions",
    patterns: [/\bpreposition\b/i, /\bwrong\s+preposition\b/i, /\bpreposition\s+choice\b/i],
  },
  {
    category: "run_on_sentence",
    subcategory: "run_on",
    patterns: [/\brun[- ]on\b/i, /\bcomma\s+splice\b/i, /\bfused\s+sentence\b/i],
  },
  {
    category: "fragment",
    subcategory: "fragment",
    patterns: [/\bfragment\b/i, /\bincomplete\s+sentence\b/i, /\bmissing\s+(subject|verb)\b/i],
  },
  {
    category: "word_choice_register",
    subcategory: "register",
    patterns: [
      /\bregister\b/i,
      /\bformal\b/i,
      /\binformal\b/i,
      /\btone\b/i,
      /\bword\s+choice\b/i,
      /\bimprecise\b/i,
      /\bcollocation\b/i,
      /\bawkward\s+phrasing\b/i,
    ],
  },
  {
    category: "spelling",
    subcategory: "spelling",
    patterns: [/\bspell(ing|ed)?\b/i, /\btypo\b/i, /\bmisspell/i, /\bhomophone\b/i],
  },
  {
    category: "punctuation",
    subcategory: "punctuation",
    patterns: [
      /\bpunctuat/i,
      /\bcomma\b/i,
      /\bapostrophe\b/i,
      /\bsemicolon\b/i,
      /\bquotation\b/i,
      /\bperiod\b/i,
      /\bcolon\b/i,
    ],
  },
  {
    category: "pronoun_reference",
    subcategory: "pronouns",
    patterns: [
      /\bpronoun\b/i,
      /\bantecedent\b/i,
      /\btheir\/they\b/i,
      /\bunclear\s+reference\b/i,
      /\bwho\/whom\b/i,
    ],
  },
  {
    category: "word_form",
    subcategory: "morphology",
    patterns: [
      /\bword\s+form\b/i,
      /\badjective\b/i,
      /\badverb\b/i,
      /\bnoun\s+form\b/i,
      /\bverb\s+form\b/i,
      /\b-ly\b/i,
    ],
  },
];

function haystack(issue: string, explanation?: string): string {
  return `${issue} ${explanation ?? ""}`.toLowerCase();
}

export function classifyErrorText(issue: string, explanation?: string): ClassifiedError {
  const text = haystack(issue, explanation);

  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return { category: rule.category, subcategory: rule.subcategory ?? null };
    }
  }

  if (/\bstructure\b/i.test(text) || /\bclause\b/i.test(text) || /\bsentence\b/i.test(text)) {
    return { category: "run_on_sentence", subcategory: "structure" };
  }

  return { category: "other", subcategory: null };
}

export function exampleTextFromWritingError(
  issue: string,
  explanation?: string,
  teachingExample?: { before?: string },
): string {
  const fromTeaching = teachingExample?.before?.trim();
  if (fromTeaching) return fromTeaching.slice(0, 280);
  const combined = `${issue}. ${explanation ?? ""}`.trim();
  return combined.slice(0, 280);
}

// shared: errorEvents
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

// handler
function isValidEvent(event: unknown): event is ErrorEventInsert {
  if (!event || typeof event !== "object") return false;
  const row = event as Record<string, unknown>;
  return (
    (row.source_tool === "write" || row.source_tool === "coach") &&
    typeof row.category === "string" &&
    ERROR_CATEGORIES.includes(row.category as (typeof ERROR_CATEGORIES)[number]) &&
    typeof row.example_text === "string" &&
    row.example_text.trim().length > 0
  );
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) {
    return jsonResponse({ error: authError }, 401);
  }

  if (!isPremiumUser(userId)) {
    return jsonResponse({ recorded: 0 });
  }

  try {
    const body = (await req.json()) as { events?: unknown[] };
    const events = Array.isArray(body.events) ? body.events.filter(isValidEvent) : [];

    if (events.length === 0) {
      return jsonResponse({ recorded: 0 });
    }

    await insertErrorEvents(client, userId, events.slice(0, 40));
    return jsonResponse({ recorded: events.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not record error events.";
    return jsonResponse({ error: message }, 500);
  }
}
