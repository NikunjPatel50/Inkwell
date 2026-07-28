import { createClient } from "npm:@insforge/sdk@1.4.3";

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

// shared: categories
export function categorizeError(issue: string): string {
  const lower = issue.toLowerCase();

  if (
    lower.includes("tone") ||
    lower.includes("informal") ||
    lower.includes("formal") ||
    lower.includes("register")
  ) {
    return "Tone";
  }

  if (
    lower.includes("punctuat") ||
    lower.includes("comma") ||
    lower.includes("apostrophe") ||
    lower.includes("period") ||
    lower.includes("semicolon") ||
    lower.includes("quotation")
  ) {
    return "Punctuation";
  }

  if (
    lower.includes("structure") ||
    lower.includes("run-on") ||
    lower.includes("fragment") ||
    lower.includes("clause") ||
    lower.includes("sentence")
  ) {
    return "Sentence Structure";
  }

  return "Word Choice";
}

// shared: groq
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const BASE_JSON_SHAPE = `{
  "errors": [{
    "issue": string,
    "explanation": string,
    "teaching": {
      "why": string,
      "principle": string,
      "example": { "before": string, "after": string }
    }
  }],
  "registerScore": number,
  "simple": string,
  "intermediate": string,
  "intermediateTechnique": string,
  "advanced": string,
  "advancedTechnique": string,
  "vocabularyCatch": [{ "word": string, "definition": string, "sourceSentence": string }]
}`;

const TONE_JSON_SHAPE = `${BASE_JSON_SHAPE.slice(0, -1)},
  "toneDriftNote": string
}`;

type AdjustedTone = "formal" | "casual";

const TONE_GUIDANCE: Record<AdjustedTone, string> = {
  formal:
    "more formal register, avoid contractions and casual phrasing, more precise word choice",
  casual: "conversational, contractions allowed, relaxed phrasing",
};

export interface WritingError {
  issue: string;
  explanation: string;
  teaching?: {
    why: string;
    principle: string;
    example: { before: string; after: string };
  };
}

export interface VocabularyItem {
  word: string;
  definition: string;
  sourceSentence: string;
}

export interface AnalysisResult {
  errors: WritingError[];
  registerScore: number;
  simple: string;
  intermediate: string;
  intermediateTechnique: string;
  advanced: string;
  advancedTechnique: string;
  toneDriftNote?: string;
  vocabularyCatch?: VocabularyItem[];
}

export interface CorrectionResult {
  score: number;
  corrected: Array<{
    issue: string;
    userAttempt: string;
    verdict: "fixed" | "partial" | "missed";
    hint: string;
  }>;
  encouragement: string;
}

export class GroqServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqServiceError";
  }
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function clampRegisterScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseTeaching(value: unknown) {
  if (typeof value !== "object" || value === null) return undefined;
  const data = value as Record<string, unknown>;
  const why = typeof data.why === "string" ? data.why.trim() : "";
  const principle = typeof data.principle === "string" ? data.principle.trim() : "";
  if (!why || !principle) return undefined;
  const exampleRaw = data.example;
  if (typeof exampleRaw !== "object" || exampleRaw === null) return undefined;
  const example = exampleRaw as Record<string, unknown>;
  const before = typeof example.before === "string" ? example.before.trim() : "";
  const after = typeof example.after === "string" ? example.after.trim() : "";
  if (!before || !after) return undefined;
  return { why, principle, example: { before, after } };
}

function parseVocabularyCatch(data: unknown): VocabularyItem[] | undefined {
  if (!Array.isArray(data)) return undefined;
  const items = data
    .filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return (
        typeof obj.word === "string" &&
        obj.word.trim() &&
        typeof obj.definition === "string" &&
        obj.definition.trim() &&
        typeof obj.sourceSentence === "string" &&
        obj.sourceSentence.trim()
      );
    })
    .map((item) => {
      const obj = item as Record<string, unknown>;
      return {
        word: String(obj.word).trim(),
        definition: String(obj.definition).trim(),
        sourceSentence: String(obj.sourceSentence).trim(),
      };
    })
    .slice(0, 3);
  return items.length > 0 ? items : undefined;
}

function parseAnalysisResult(raw: string, isTonePass: boolean): AnalysisResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(raw));
  } catch {
    throw new GroqServiceError(
      "The model returned a response we couldn't parse. Try again or switch models.",
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new GroqServiceError("The model returned an invalid response shape.");
  }

  const data = parsed as Record<string, unknown>;

  if (!Array.isArray(data.errors)) {
    throw new GroqServiceError("The model response is missing a valid errors list.");
  }

  const errors: WritingError[] = data.errors
    .filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return typeof obj.issue === "string" && typeof obj.explanation === "string";
    })
    .map((item) => {
      const obj = item as Record<string, unknown>;
      const teaching = parseTeaching(obj.teaching);
      return {
        issue: String(obj.issue),
        explanation: String(obj.explanation),
        ...(teaching ? { teaching } : {}),
      };
    });

  if (
    typeof data.simple !== "string" ||
    typeof data.intermediate !== "string" ||
    typeof data.advanced !== "string" ||
    typeof data.intermediateTechnique !== "string" ||
    typeof data.advancedTechnique !== "string"
  ) {
    throw new GroqServiceError("The model response is missing one or more rewrites.");
  }

  const toneDriftNote =
    typeof data.toneDriftNote === "string" && data.toneDriftNote.trim()
      ? data.toneDriftNote.trim()
      : undefined;

  return {
    errors,
    registerScore: clampRegisterScore(data.registerScore),
    simple: data.simple,
    intermediate: data.intermediate,
    intermediateTechnique: data.intermediateTechnique,
    advanced: data.advanced,
    advancedTechnique: data.advancedTechnique,
    toneDriftNote: isTonePass ? toneDriftNote : undefined,
    vocabularyCatch: parseVocabularyCatch(data.vocabularyCatch),
  };
}

function buildFullSystemPrompt(): string {
  return `You are an expert writing coach. Analyse the user's text and respond with JSON only.

Return a JSON object with exactly this shape:
${BASE_JSON_SHAPE}

Rules for "registerScore":
- A number from 0 to 100 estimating where the ORIGINAL text's vocabulary and sentence complexity fall on a simple-to-advanced spectrum.
- 0 = very simple/plain, 50 = intermediate/standard, 100 = very advanced/sophisticated.
- Base this only on the user's original text, not the rewrites.

Rules for "errors":
- List specific grammar, wording, punctuation, or clarity issues in the original text.
- Each item needs a short "issue" (what is wrong) and "explanation" (plain-English fix).
- In "issue", quote the exact problematic phrase from the user's text in double quotes when possible.
- If there are no mistakes, return "errors": [].

For each error, include a "teaching" object with "why", "principle", and "example" (generic before/after, not from user's text).

Rules for "vocabularyCatch":
- Extract 2–3 notable advanced-vocabulary words from the "advanced" rewrite ONLY.
- Each item: word, definition (one short plain-English sentence), sourceSentence (full advanced sentence).
- Return at most 3 items, or an empty array if none stand out.

Rules for rewrites: preserve exact meaning; only change vocabulary and complexity.

Respond with valid JSON only. No markdown.`;
}

function buildToneSystemPrompt(tone: AdjustedTone): string {
  return `You are an expert writing coach. Adjust tone of complexity-tier rewrites. Respond with JSON only.

Return exactly this shape:
${TONE_JSON_SHAPE}

Apply "${tone}" tone: ${TONE_GUIDANCE[tone]}
Preserve meaning and complexity tiers. Return "errors": [] and "registerScore": 50.
For vocabularyCatch return [] on tone passes.

Respond with valid JSON only.`;
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? null;
  } catch {
    return null;
  }
}

function mapHttpError(status: number, apiMessage: string | null): string {
  switch (status) {
    case 401:
      return "Invalid API key. Check your GROQ key and try again.";
    case 429:
      return "Rate limited by GROQ. Wait a moment and try again.";
    case 400:
      return apiMessage
        ? `Bad request: ${apiMessage}`
        : "Bad request — the selected model may be unavailable or the text may be too long.";
    case 403:
      return "Access denied. Your API key may lack permission for this model.";
    case 500:
    case 502:
    case 503:
      return "GROQ is temporarily unavailable. Please try again shortly.";
    default:
      return apiMessage
        ? `Request failed (${status}): ${apiMessage}`
        : `Request failed with status ${status}.`;
  }
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new GroqServiceError("GROQ API key is not configured on the server.");
  }

  const model = Deno.env.get("GROQ_MODEL") ?? DEFAULT_MODEL;

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new GroqServiceError(mapHttpError(response.status, apiMessage));
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqServiceError("GROQ returned an empty response. Try again.");
  }

  return content;
}

export async function analyzeWriting(
  text: string,
  tone: string = "neutral",
): Promise<AnalysisResult> {
  const isTonePass = tone !== "neutral" && (tone === "formal" || tone === "casual");
  const systemPrompt = isTonePass
    ? buildToneSystemPrompt(tone as AdjustedTone)
    : buildFullSystemPrompt();
  const userContent = isTonePass
    ? `Adjust the simple, intermediate, and advanced rewrites of this text to the "${tone}" tone:\n\n${text}`
    : `Analyse this text:\n\n${text}`;

  const content = await callGroq(systemPrompt, userContent);
  return parseAnalysisResult(content, isTonePass);
}

export async function checkCorrection(
  original: string,
  userAttempt: string,
  knownErrors: WritingError[],
): Promise<CorrectionResult> {
  const errorsContext = knownErrors
    .map((error, index) => `${index + 1}. Issue: ${error.issue}\n   Explanation: ${error.explanation}`)
    .join("\n");

  const systemPrompt = `You are an expert writing coach evaluating a self-correction attempt. Respond with JSON only:
{
  "score": number,
  "corrected": [{ "issue": string, "userAttempt": string, "verdict": "fixed" | "partial" | "missed", "hint": string }],
  "encouragement": string
}
Evaluate how well the student addressed each known error. One warm encouragement sentence. JSON only.`;

  const userContent = `Original:\n${original}\n\nKnown errors:\n${errorsContext}\n\nStudent attempt:\n${userAttempt}`;

  const content = await callGroq(systemPrompt, userContent);

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(content));
  } catch {
    throw new GroqServiceError("The model returned a response we couldn't parse.");
  }

  const data = parsed as Record<string, unknown>;
  const encouragement =
    typeof data.encouragement === "string" && data.encouragement.trim()
      ? data.encouragement.trim()
      : "Nice effort — compare your version with the feedback below.";

  let corrected: CorrectionResult["corrected"] = [];
  if (Array.isArray(data.corrected)) {
    corrected = data.corrected.filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return (
        typeof obj.issue === "string" &&
        typeof obj.userAttempt === "string" &&
        (obj.verdict === "fixed" || obj.verdict === "partial" || obj.verdict === "missed") &&
        typeof obj.hint === "string"
      );
    }) as CorrectionResult["corrected"];
  }

  const score =
    typeof data.score === "number" && !Number.isNaN(data.score)
      ? Math.min(100, Math.max(0, Math.round(data.score)))
      : 0;

  return { score, corrected, encouragement };
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
  client: ReturnType<typeof import("npm:@insforge/sdk@1.4.3").createClient>,
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

// shared: writingDnaAnalysis
export const DNA_DIMENSIONS = [
  "grammar",
  "vocabulary",
  "clarity",
  "structure",
  "flow",
  "style",
  "confidence",
  "consistency",
] as const;

export type DnaDimension = (typeof DNA_DIMENSIONS)[number];

export const GRAMMAR_HEATMAP_CATEGORIES = [
  "verb_tense",
  "articles",
  "prepositions",
  "subject_verb_agreement",
  "fragments",
  "run_on_sentences",
  "punctuation",
  "capitalization",
  "passive_voice",
  "sentence_variety",
] as const;

export type GrammarHeatmapCategory = (typeof GRAMMAR_HEATMAP_CATEGORIES)[number];

export interface WritingDnaMetrics {
  grammarScore: number;
  vocabularyRichness: number;
  vocabularyDiversity: number;
  sentenceComplexity: number;
  passiveVoicePercent: number;
  readabilityScore: number;
  readingGrade: number;
  toneFormal: number;
  toneInformal: number;
  persuasiveness: number;
  confidence: number;
  clarity: number;
  conciseness: number;
  repetition: number;
  transitionQuality: number;
  punctuationScore: number;
  spellingScore: number;
  averageSentenceLength: number;
  longestSentence: number;
  shortestSentence: number;
  paragraphBalance: number;
  aiGeneratedProbability: number;
  originalityScore: number;
  wordCount: number;
  uniqueWords: number;
  fillerWords: number;
  repeatedWords: string[];
  powerWords: number;
  emotionalWords: number;
  weakVerbs: number;
  strongVerbs: number;
  adverbs: number;
  passiveConstructions: number;
  tenseConsistency: number;
}

export interface WritingDnaDimensions {
  grammar: number;
  vocabulary: number;
  clarity: number;
  structure: number;
  flow: number;
  style: number;
  confidence: number;
  consistency: number;
}

export interface GrammarMistakeEntry {
  category: GrammarHeatmapCategory;
  description: string;
}

const FILLER_WORDS = new Set([
  "very", "really", "just", "quite", "basically", "actually", "literally",
  "maybe", "perhaps", "somewhat", "rather", "kind", "sort", "thing", "stuff",
]);

const POWER_WORDS = new Set([
  "achieve", "analyze", "compelling", "crucial", "demonstrate", "effective",
  "essential", "evidence", "impact", "improve", "innovative", "persuasive",
  "significant", "strategic", "transform", "vital",
]);

const EMOTIONAL_WORDS = new Set([
  "love", "hate", "fear", "hope", "joy", "anger", "excited", "worried",
  "passionate", "anxious", "grateful", "frustrated", "proud", "sad",
]);

const WEAK_VERBS = new Set([
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "get", "got", "make", "made", "go", "went",
]);

const STRONG_VERBS = new Set([
  "achieve", "analyze", "build", "create", "demonstrate", "develop",
  "establish", "improve", "increase", "lead", "produce", "reduce", "solve",
]);

const TRANSITION_WORDS = new Set([
  "however", "therefore", "furthermore", "moreover", "nevertheless",
  "consequently", "additionally", "meanwhile", "similarly", "in contrast",
  "for example", "in addition", "as a result", "on the other hand",
]);

const PASSIVE_PATTERNS = [
  /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi,
  /\b(am|is|are|was|were|be|been|being)\s+\w+en\b/gi,
];

function tokenizeWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const vowels = w.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;
  if (w.endsWith("e")) count -= 1;
  return Math.max(1, count);
}

function fleschKincaidGrade(text: string, words: string[], sentences: string[]): number {
  if (words.length === 0 || sentences.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59;
  return Math.max(1, Math.round(grade * 10) / 10);
}

function fleschReadingEase(text: string, words: string[], sentences: string[]): number {
  if (words.length === 0 || sentences.length === 0) return 50;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return clamp(
    206.835 -
      1.015 * (words.length / sentences.length) -
      84.6 * (syllables / words.length),
  );
}

function detectPassive(text: string): number {
  let count = 0;
  for (const pattern of PASSIVE_PATTERNS) {
    const matches = text.match(pattern);
    count += matches?.length ?? 0;
  }
  return count;
}

function mapErrorToGrammarCategory(issue: string): GrammarHeatmapCategory {
  const lower = issue.toLowerCase();
  if (/tense|verb/.test(lower)) return "verb_tense";
  if (/article|a\/an|the/.test(lower)) return "articles";
  if (/preposition/.test(lower)) return "prepositions";
  if (/agreement|subject/.test(lower)) return "subject_verb_agreement";
  if (/fragment/.test(lower)) return "fragments";
  if (/run-on|run on|comma splice/.test(lower)) return "run_on_sentences";
  if (/punctuat|comma|apostrophe|period/.test(lower)) return "punctuation";
  if (/capital/.test(lower)) return "capitalization";
  if (/passive/.test(lower)) return "passive_voice";
  if (/variety|structure|sentence/.test(lower)) return "sentence_variety";
  return "punctuation";
}

export function buildGrammarMistakes(
  errors: Array<{ issue: string; explanation: string }>,
): GrammarMistakeEntry[] {
  return errors.map((error) => ({
    category: mapErrorToGrammarCategory(error.issue),
    description: error.issue,
  }));
}

export function analyzeWritingDnaMetrics(
  text: string,
  errors: Array<{ issue: string; explanation: string }> = [],
  registerScore = 50,
): { metrics: WritingDnaMetrics; dimensions: WritingDnaDimensions; grammarMistakes: GrammarMistakeEntry[] } {
  const trimmed = text.trim();
  const words = tokenizeWords(trimmed);
  const uniqueSet = new Set(words);
  const sentences = splitSentences(trimmed);
  const paragraphs = splitParagraphs(trimmed);
  const sentenceLengths = sentences.map((s) => tokenizeWords(s).length);
  const avgSentenceLen =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;

  const wordFreq = new Map<string, number>();
  for (const w of words) wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  const repeatedWords = [...wordFreq.entries()]
    .filter(([w, c]) => c >= 3 && w.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  const fillerWords = words.filter((w) => FILLER_WORDS.has(w)).length;
  const powerWords = words.filter((w) => POWER_WORDS.has(w)).length;
  const emotionalWords = words.filter((w) => EMOTIONAL_WORDS.has(w)).length;
  const weakVerbs = words.filter((w) => WEAK_VERBS.has(w)).length;
  const strongVerbs = words.filter((w) => STRONG_VERBS.has(w)).length;
  const adverbs = words.filter((w) => w.endsWith("ly") && w.length > 4).length;

  const passiveConstructions = detectPassive(trimmed);
  const passiveVoicePercent =
    sentences.length > 0 ? clamp((passiveConstructions / sentences.length) * 100) : 0;

  const transitionHits = [...TRANSITION_WORDS].filter((t) =>
    trimmed.toLowerCase().includes(t),
  ).length;
  const transitionQuality = clamp(Math.min(100, transitionHits * 18 + 25));

  const lower = trimmed.toLowerCase();
  const contractions = (lower.match(/\b\w+'\w+/g) ?? []).length;
  const formalMarkers = (lower.match(/\b(furthermore|therefore|consequently|nevertheless)\b/g) ?? []).length;
  const toneInformal = clamp(contractions * 8 + (100 - registerScore) * 0.4);
  const toneFormal = clamp(registerScore * 0.6 + formalMarkers * 12);

  const vocabularyDiversity =
    words.length > 0 ? clamp((uniqueSet.size / words.length) * 140) : 0;
  const vocabularyRichness = clamp(
    vocabularyDiversity * 0.5 +
      Math.min(30, uniqueSet.size / Math.max(1, words.length / 50)) +
      powerWords * 3,
  );

  const grammarScore = clamp(100 - errors.length * 12 - passiveVoicePercent * 0.15);
  const spellingScore = clamp(grammarScore);
  const punctuationScore = clamp(
    100 -
      errors.filter((e) => /punctuat|comma|period/i.test(e.issue)).length * 15,
  );

  const readabilityScore = fleschReadingEase(trimmed, words, sentences);
  const readingGrade = fleschKincaidGrade(trimmed, words, sentences);

  const sentenceComplexity = clamp(
    avgSentenceLen * 4 +
      sentences.filter((s) => s.includes(",") || s.includes(";")).length * 5,
  );

  const paragraphLengths = paragraphs.map((p) => tokenizeWords(p).length);
  const paragraphBalance =
    paragraphLengths.length <= 1
      ? 70
      : clamp(
          100 -
            (Math.max(...paragraphLengths) - Math.min(...paragraphLengths)) /
              Math.max(1, avgSentenceLen),
        );

  const conciseness = clamp(100 - fillerWords * 4 - (avgSentenceLen > 25 ? 15 : 0));
  const clarity = clamp(
    grammarScore * 0.35 + readabilityScore * 0.35 + conciseness * 0.3,
  );
  const confidence = clamp(registerScore * 0.5 + strongVerbs * 5 + clarity * 0.3);
  const persuasiveness = clamp(
    powerWords * 6 + transitionQuality * 0.4 + confidence * 0.3,
  );
  const repetition = clamp(100 - repeatedWords.length * 10 - fillerWords * 2);

  const tenseMarkers = {
    past: (lower.match(/\b(was|were|had|did|ed)\b/g) ?? []).length,
    present: (lower.match(/\b(is|are|am|do|does)\b/g) ?? []).length,
    future: (lower.match(/\b(will|shall|going to)\b/g) ?? []).length,
  };
  const tenseTotal = tenseMarkers.past + tenseMarkers.present + tenseMarkers.future;
  const dominant = Math.max(tenseMarkers.past, tenseMarkers.present, tenseMarkers.future);
  const tenseConsistency =
    tenseTotal > 0 ? clamp((dominant / tenseTotal) * 100) : 80;

  const aiGeneratedProbability = clamp(
    (avgSentenceLen > 22 ? 15 : 0) +
      (transitionQuality > 70 ? 10 : 0) +
      (vocabularyDiversity < 45 ? 20 : 0) +
      (repeatedWords.length < 2 ? 10 : 0),
  );
  const originalityScore = clamp(100 - aiGeneratedProbability);

  const metrics: WritingDnaMetrics = {
    grammarScore,
    vocabularyRichness,
    vocabularyDiversity,
    sentenceComplexity,
    passiveVoicePercent,
    readabilityScore,
    readingGrade,
    toneFormal,
    toneInformal,
    persuasiveness,
    confidence,
    clarity,
    conciseness,
    repetition,
    transitionQuality,
    punctuationScore,
    spellingScore,
    averageSentenceLength: Math.round(avgSentenceLen * 10) / 10,
    longestSentence: sentenceLengths.length ? Math.max(...sentenceLengths) : 0,
    shortestSentence: sentenceLengths.length ? Math.min(...sentenceLengths) : 0,
    paragraphBalance,
    aiGeneratedProbability,
    originalityScore,
    wordCount: words.length,
    uniqueWords: uniqueSet.size,
    fillerWords,
    repeatedWords,
    powerWords,
    emotionalWords,
    weakVerbs,
    strongVerbs,
    adverbs,
    passiveConstructions,
    tenseConsistency,
  };

  const dimensions: WritingDnaDimensions = {
    grammar: grammarScore,
    vocabulary: vocabularyRichness,
    clarity,
    structure: clamp(paragraphBalance * 0.5 + sentenceComplexity * 0.5),
    flow: transitionQuality,
    style: clamp(toneFormal * 0.4 + persuasiveness * 0.3 + styleFromRegister(registerScore) * 0.3),
    confidence,
    consistency: tenseConsistency,
  };

  return {
    metrics,
    dimensions,
    grammarMistakes: buildGrammarMistakes(errors),
  };
}

function styleFromRegister(registerScore: number): number {
  return clamp(registerScore);
}

export function computeDnaScore(dimensions: WritingDnaDimensions): number {
  const values = DNA_DIMENSIONS.map((key) => dimensions[key]);
  return clamp(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function estimateCefr(word: string): string {
  if (word.length <= 4) return "A1";
  if (word.length <= 6) return "A2";
  if (word.length <= 8) return "B1";
  if (word.length <= 10) return "B2";
  return "C1";
}

export function generateInsights(
  metrics: WritingDnaMetrics,
  dimensions: WritingDnaDimensions,
  previousAvgDna: number | null,
): string[] {
  const insights: string[] = [];

  if (metrics.passiveVoicePercent > 12) {
    insights.push("You overuse passive voice — try leading with the subject doing the action.");
  }
  if (metrics.repeatedWords.length > 0) {
    insights.push(
      `You often repeat the words "${metrics.repeatedWords.slice(0, 2).join('" and "')}".`,
    );
  }
  if (previousAvgDna !== null && dimensions.vocabulary > previousAvgDna) {
    insights.push("Your vocabulary richness improved compared to your recent average.");
  }
  if (metrics.averageSentenceLength > 24) {
    insights.push("You write longer sentences than average — consider breaking up complex ideas.");
  }
  if (dimensions.clarity >= 75) {
    insights.push("Your strongest skill right now is sentence clarity.");
  }
  if (dimensions.flow < 60) {
    insights.push("You should improve transitions between paragraphs and ideas.");
  }
  if (metrics.fillerWords > 5) {
    insights.push("Reduce filler words like 'very' and 'really' for tighter prose.");
  }
  if (insights.length === 0) {
    insights.push("Keep submitting writing to sharpen your personal DNA profile.");
  }

  return insights.slice(0, 6);
}

export const PERSONALITY_TYPES = [
  { id: "academic", label: "Academic Writer", badge: "Scholar" },
  { id: "business", label: "Business Professional", badge: "Executive" },
  { id: "creative", label: "Creative Storyteller", badge: "Narrator" },
  { id: "technical", label: "Technical Writer", badge: "Architect" },
  { id: "persuasive", label: "Persuasive Speaker", badge: "Advocate" },
  { id: "minimalist", label: "Minimalist", badge: "Essentialist" },
  { id: "detailed", label: "Detailed Explainer", badge: "Analyst" },
  { id: "journalist", label: "Journalist", badge: "Reporter" },
  { id: "conversational", label: "Conversational", badge: "Connector" },
  { id: "formal", label: "Formal", badge: "Diplomat" },
  { id: "friendly", label: "Friendly", badge: "Guide" },
] as const;

export function inferPersonality(
  metrics: WritingDnaMetrics,
  dimensions: WritingDnaDimensions,
): { personality: string; personalityBadge: string } {
  if (metrics.toneFormal > 65 && dimensions.grammar > 70) {
    return { personality: "Academic Writer", personalityBadge: "Scholar" };
  }
  if (metrics.toneFormal > 60 && metrics.persuasiveness > 65) {
    return { personality: "Business Professional", personalityBadge: "Executive" };
  }
  if (metrics.emotionalWords > 3 && dimensions.style > 65) {
    return { personality: "Creative Storyteller", personalityBadge: "Narrator" };
  }
  if (metrics.sentenceComplexity > 70 && metrics.toneFormal > 55) {
    return { personality: "Technical Writer", personalityBadge: "Architect" };
  }
  if (metrics.persuasiveness > 70) {
    return { personality: "Persuasive Speaker", personalityBadge: "Advocate" };
  }
  if (metrics.wordCount < 120 && metrics.conciseness > 75) {
    return { personality: "Minimalist", personalityBadge: "Essentialist" };
  }
  if (metrics.averageSentenceLength > 22) {
    return { personality: "Detailed Explainer", personalityBadge: "Analyst" };
  }
  if (metrics.toneInformal > 55) {
    return { personality: "Conversational", personalityBadge: "Connector" };
  }
  if (metrics.toneFormal > 50) {
    return { personality: "Formal", personalityBadge: "Diplomat" };
  }
  return { personality: "Friendly", personalityBadge: "Guide" };
}

export const ACHIEVEMENT_DEFS = [
  { id: "grammar-master", title: "Grammar Master", description: "Reach Grammar dimension 90+" },
  { id: "vocabulary-genius", title: "Vocabulary Genius", description: "Reach Vocabulary dimension 90+" },
  { id: "streak-100", title: "100 Day Streak", description: "Write for 100 consecutive days" },
  { id: "words-10k", title: "10,000 Words", description: "Write 10,000 total words" },
  { id: "no-errors", title: "No Grammar Errors", description: "Submit with zero flagged errors" },
  { id: "perfect-clarity", title: "Perfect Clarity", description: "Reach Clarity dimension 95+" },
  { id: "business-writer", title: "Business Writer", description: "Unlock Business Professional personality" },
  { id: "academic-expert", title: "Academic Expert", description: "Unlock Academic Writer personality" },
  { id: "creative-writer", title: "Creative Writer", description: "Unlock Creative Storyteller personality" },
] as const;

export function checkAchievements(
  dimensions: WritingDnaDimensions,
  metrics: WritingDnaMetrics,
  personality: string,
  streakBest: number,
  totalWords: number,
  errorCount: number,
): string[] {
  const unlocked: string[] = [];
  if (dimensions.grammar >= 90) unlocked.push("grammar-master");
  if (dimensions.vocabulary >= 90) unlocked.push("vocabulary-genius");
  if (streakBest >= 100) unlocked.push("streak-100");
  if (totalWords >= 10000) unlocked.push("words-10k");
  if (errorCount === 0 && metrics.wordCount >= 20) unlocked.push("no-errors");
  if (dimensions.clarity >= 95) unlocked.push("perfect-clarity");
  if (personality === "Business Professional") unlocked.push("business-writer");
  if (personality === "Academic Writer") unlocked.push("academic-expert");
  if (personality === "Creative Storyteller") unlocked.push("creative-writer");
  return unlocked;
}

// shared: writingDnaPersistence
type DbClient = ReturnType<typeof import("npm:@insforge/sdk@1.4.3").createClient>;

export interface PersistWritingDnaInput {
  text: string;
  sourceTool: "write" | "coach" | "pte";
  errors?: Array<{ issue: string; explanation: string }>;
  registerScore?: number;
  timeSpentSeconds?: number | null;
  analyzedSentenceId?: string | null;
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setUTCDate(copy.getUTCDate() + diff);
  return copy.toISOString().slice(0, 10);
}

function startOfMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

function vocabTokenizeWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

async function upsertVocabulary(client: DbClient, userId: string, text: string): Promise<void> {
  const words = [...new Set(vocabTokenizeWords(text).filter((w) => w.length > 2))];
  if (words.length === 0) return;

  const now = new Date().toISOString();

  for (const word of words) {
    const { data: existing } = await client.database
      .from("writing_dna_vocabulary")
      .select("id, frequency")
      .eq("user_id", userId)
      .eq("word", word)
      .maybeSingle();

    if (existing?.id) {
      await client.database
        .from("writing_dna_vocabulary")
        .update({
          frequency: (existing.frequency ?? 0) + 1,
          last_used: now,
        })
        .eq("id", existing.id);
    } else {
      await client.database.from("writing_dna_vocabulary").insert([
        {
          user_id: userId,
          word,
          frequency: 1,
          cefr_level: estimateCefr(word),
          difficulty: word.length > 8 ? "advanced" : "common",
          synonyms: [],
          last_used: now,
          first_used: now,
        },
      ]);
    }
  }
}

async function upsertGrammarStats(
  client: DbClient,
  userId: string,
  mistakes: GrammarMistakeEntry[],
): Promise<void> {
  const counts = new Map<string, number>();
  for (const mistake of mistakes) {
    counts.set(mistake.category, (counts.get(mistake.category) ?? 0) + 1);
  }

  const now = new Date().toISOString();

  for (const [category, count] of counts) {
    const { data: existing } = await client.database
      .from("writing_dna_grammar_stats")
      .select("id, mistake_count, session_hits")
      .eq("user_id", userId)
      .eq("category", category)
      .maybeSingle();

    if (existing?.id) {
      await client.database
        .from("writing_dna_grammar_stats")
        .update({
          mistake_count: (existing.mistake_count ?? 0) + count,
          session_hits: (existing.session_hits ?? 0) + 1,
          last_seen: now,
        })
        .eq("id", existing.id);
    } else {
      await client.database.from("writing_dna_grammar_stats").insert([
        {
          user_id: userId,
          category,
          mistake_count: count,
          session_hits: 1,
          last_seen: now,
        },
      ]);
    }
  }
}

async function loadProfile(client: DbClient, userId: string) {
  const { data } = await client.database
    .from("writing_dna_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

function computeStreak(
  profile: { last_submission_at?: string | null; streak_current?: number } | null,
  today: string,
): { current: number; best: number } {
  const previousCurrent = profile?.streak_current ?? 0;
  const previousBest = (profile as { streak_best?: number } | null)?.streak_best ?? 0;

  if (!profile?.last_submission_at) {
    return { current: 1, best: Math.max(previousBest, 1) };
  }

  const lastDay = profile.last_submission_at.slice(0, 10);
  if (lastDay === today) {
    return { current: Math.max(previousCurrent, 1), best: previousBest };
  }

  const gap = daysBetween(lastDay, today);
  const current = gap === 1 ? previousCurrent + 1 : 1;
  return { current, best: Math.max(previousBest, current) };
}

async function unlockAchievements(
  client: DbClient,
  userId: string,
  achievementIds: string[],
): Promise<void> {
  if (achievementIds.length === 0) return;

  const { data: existing } = await client.database
    .from("writing_dna_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const existingIds = new Set((existing ?? []).map((row) => row.achievement_id));
  const toInsert = achievementIds
    .filter((id) => !existingIds.has(id))
    .map((achievement_id) => ({ user_id: userId, achievement_id }));

  if (toInsert.length > 0) {
    await client.database.from("writing_dna_achievements").insert(toInsert);
  }
}

async function updateGoals(
  client: DbClient,
  userId: string,
  metrics: WritingDnaMetrics,
  dimensions: WritingDnaDimensions,
  streakCurrent: number,
): Promise<void> {
  const { data: goals } = await client.database
    .from("writing_dna_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", false);

  const now = new Date().toISOString();

  for (const goal of goals ?? []) {
    let current = Number(goal.current_value ?? 0);
    const target = Number(goal.target_value ?? 0);

    switch (goal.goal_type) {
      case "daily_words":
        current = metrics.wordCount;
        break;
      case "grammar_score":
        current = dimensions.grammar;
        break;
      case "passive_voice":
        current = metrics.passiveVoicePercent;
        break;
      case "new_words":
        current += metrics.uniqueWords;
        break;
      case "streak":
        current = streakCurrent;
        break;
      default:
        break;
    }

    const completed =
      goal.goal_type === "passive_voice" ? current <= target : current >= target;

    await client.database
      .from("writing_dna_goals")
      .update({
        current_value: current,
        completed,
        updated_at: now,
      })
      .eq("id", goal.id);
  }
}

function buildWeeklyReport(
  sessions: Array<{ dna_score: number; metrics: WritingDnaMetrics; dimensions: WritingDnaDimensions }>,
): Record<string, unknown> {
  if (sessions.length === 0) {
    return {
      biggestImprovement: "Submit your first piece to start your weekly coach report.",
      biggestWeakness: "Not enough data yet.",
      exercises: ["Write 150 words on a topic you care about.", "Revise one paragraph for clarity.", "Replace three weak verbs."],
      wordsToLearn: ["demonstrate", "essential", "compelling"],
      grammarTopic: "subject-verb agreement",
      estimatedProgress: "0%",
    };
  }

  const avgGrammar =
    sessions.reduce((sum, s) => sum + (s.dimensions.grammar ?? 0), 0) / sessions.length;
  const avgVocab =
    sessions.reduce((sum, s) => sum + (s.dimensions.vocabulary ?? 0), 0) / sessions.length;
  const avgFlow =
    sessions.reduce((sum, s) => sum + (s.dimensions.flow ?? 0), 0) / sessions.length;

  const weakest =
    avgFlow < avgGrammar && avgFlow < avgVocab
      ? "transitions and flow"
      : avgGrammar < avgVocab
        ? "grammar accuracy"
        : "vocabulary range";

  const strongest =
    avgGrammar >= avgVocab && avgGrammar >= avgFlow
      ? "grammar"
      : avgVocab >= avgFlow
        ? "vocabulary"
        : "flow";

  return {
    biggestImprovement: `Your ${strongest} held steady across ${sessions.length} submission${sessions.length === 1 ? "" : "s"} this week.`,
    biggestWeakness: `Focus on ${weakest} — it trails your other dimensions.`,
    exercises: [
      "Rewrite one paragraph using active voice only.",
      "Add two transition phrases between ideas.",
      "Replace five weak verbs with stronger alternatives.",
    ],
    wordsToLearn: ["therefore", "demonstrate", "nuanced", "coherent", "precise"].slice(0, 5),
    grammarTopic: weakest.includes("grammar") ? "verb tense consistency" : "transition quality",
    estimatedProgress: `${Math.round(sessions.reduce((sum, s) => sum + s.dna_score, 0) / sessions.length)}% DNA score average`,
  };
}

async function ensureReports(
  client: DbClient,
  userId: string,
): Promise<void> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const { data: weekSessions } = await client.database
    .from("writing_dna_sessions")
    .select("dna_score, metrics, dimensions")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());

  const { data: existingWeek } = await client.database
    .from("writing_dna_weekly_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!existingWeek?.id && (weekSessions?.length ?? 0) > 0) {
    await client.database.from("writing_dna_weekly_reports").insert([
      {
        user_id: userId,
        week_start: weekStart,
        report: buildWeeklyReport(
          (weekSessions ?? []) as Array<{
            dna_score: number;
            metrics: WritingDnaMetrics;
            dimensions: WritingDnaDimensions;
          }>,
        ),
      },
    ]);
  }

  const monthAgo = new Date(now);
  monthAgo.setUTCMonth(monthAgo.getUTCMonth() - 1);

  const { data: monthSessions } = await client.database
    .from("writing_dna_sessions")
    .select("dna_score, word_count, metrics, dimensions, created_at")
    .eq("user_id", userId)
    .gte("created_at", monthAgo.toISOString());

  const { data: existingMonth } = await client.database
    .from("writing_dna_monthly_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("month_start", monthStart)
    .maybeSingle();

  if (!existingMonth?.id && (monthSessions?.length ?? 0) > 0) {
    const totalWords = (monthSessions ?? []).reduce((sum, s) => sum + (s.word_count ?? 0), 0);
    const avgScore =
      (monthSessions ?? []).reduce((sum, s) => sum + (s.dna_score ?? 0), 0) /
      Math.max(monthSessions?.length ?? 1, 1);

    await client.database.from("writing_dna_monthly_reports").insert([
      {
        user_id: userId,
        month_start: monthStart,
        report: {
          totalWords,
          sessions: monthSessions?.length ?? 0,
          averageDnaScore: Math.round(avgScore),
          vocabularyGrowth: "Tracked against your personal baseline.",
          summary: `You wrote ${totalWords.toLocaleString()} words across ${monthSessions?.length ?? 0} sessions.`,
        },
      },
    ]);
  }
}

export async function persistWritingDna(
  client: DbClient,
  userId: string,
  input: PersistWritingDnaInput,
): Promise<{ dnaScore: number; sessionId: string | null }> {
  const text = input.text.trim();
  if (!text) return { dnaScore: 0, sessionId: null };

  const errors = input.errors ?? [];
  const registerScore = input.registerScore ?? 50;
  const { metrics, dimensions, grammarMistakes } = analyzeWritingDnaMetrics(
    text,
    errors,
    registerScore,
  );

  const profile = await loadProfile(client, userId);
  const previousAvg =
    profile?.dimensions && typeof profile.dimensions === "object"
      ? (profile.dimensions as WritingDnaDimensions).vocabulary ?? null
      : null;

  const insights = generateInsights(metrics, dimensions, previousAvg);
  const { personality, personalityBadge } = inferPersonality(metrics, dimensions);
  const dnaScore = computeDnaScore(dimensions);
  const today = utcDateKey(new Date());
  const streak = computeStreak(profile, today);
  const totalWords = (profile?.total_words ?? 0) + metrics.wordCount;
  const totalSessions = (profile?.total_sessions ?? 0) + 1;
  const now = new Date().toISOString();

  const { data: sessionRow } = await client.database
    .from("writing_dna_sessions")
    .insert([
      {
        user_id: userId,
        source_tool: input.sourceTool,
        original_text: text,
        word_count: metrics.wordCount,
        unique_words: metrics.uniqueWords,
        time_spent_seconds: input.timeSpentSeconds ?? null,
        dna_score: dnaScore,
        metrics,
        dimensions,
        grammar_mistakes: grammarMistakes,
        personality,
        personality_badge: personalityBadge,
        insights,
        analyzed_sentence_id: input.analyzedSentenceId ?? null,
      },
    ])
    .select("id")
    .single();

  await upsertVocabulary(client, userId, text);
  await upsertGrammarStats(client, userId, grammarMistakes);

  const profilePayload = {
    user_id: userId,
    dna_score: dnaScore,
    personality,
    personality_badge: personalityBadge,
    dimensions,
    insights,
    streak_current: streak.current,
    streak_best: streak.best,
    total_words: totalWords,
    total_sessions: totalSessions,
    last_submission_at: now,
    updated_at: now,
  };

  if (profile?.user_id) {
    await client.database.from("writing_dna_profiles").update(profilePayload).eq("user_id", userId);
  } else {
    await client.database.from("writing_dna_profiles").insert([profilePayload]);
  }

  const achievements = checkAchievements(
    dimensions,
    metrics,
    personality,
    streak.best,
    totalWords,
    errors.length,
  );

  await unlockAchievements(client, userId, achievements);
  await updateGoals(client, userId, metrics, dimensions, streak.current);
  await ensureReports(client, userId);

  return { dnaScore, sessionId: sessionRow?.id ?? null };
}

// handler
function todayStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

async function upsertSkillPattern(
  client: ReturnType<typeof import("npm:@insforge/sdk@1.4.3").createClient>,
  userId: string,
  category: string,
) {
  const { data: existing } = await client.database
    .from("skill_patterns")
    .select("id, occurrence_count")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing?.id) {
    await client.database
      .from("skill_patterns")
      .update({
        occurrence_count: (existing.occurrence_count ?? 0) + 1,
        last_seen_at: now,
        updated_at: now,
      })
      .eq("id", existing.id);
  } else {
    await client.database.from("skill_patterns").insert([
      {
        user_id: userId,
        category,
        occurrence_count: 1,
        last_seen_at: now,
        updated_at: now,
      },
    ]);
  }
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

  try {
    const body = (await req.json()) as { text?: string; tone?: string };
    const text = body.text?.trim() ?? "";
    const tone = body.tone ?? "neutral";

    if (!text) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const analysis = await analyzeWriting(text, tone);

    const dayStart = todayStartIso();
    const { data: sessions } = await client.database
      .from("practice_sessions")
      .select("id, sentence_count")
      .eq("user_id", userId)
      .gte("created_at", dayStart)
      .order("created_at", { ascending: false })
      .limit(1);

    let sessionId = sessions?.[0]?.id ?? null;
    const currentCount = sessions?.[0]?.sentence_count ?? 0;

    if (!sessionId) {
      const { data: newSession } = await client.database
        .from("practice_sessions")
        .insert([{ user_id: userId, sentence_count: 0 }])
        .select("id")
        .single();
      sessionId = newSession?.id ?? null;
    }

    const { data: analyzedSentence } = await client.database
      .from("analyzed_sentences")
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          original_text: text,
          register_score: analysis.registerScore,
          simple_version: analysis.simple,
          intermediate_version: analysis.intermediate,
          advanced_version: analysis.advanced,
          error_count: analysis.errors.length,
        },
      ])
      .select("id")
      .single();

    for (const writingError of analysis.errors) {
      await upsertSkillPattern(client, userId, categorizeError(writingError.issue));
    }

    if (isPremiumUser(userId) && analysis.errors.length > 0) {
      const errorEvents = buildWriteErrorEvents(
        analysis.errors,
        classifyErrorText,
        (issue, explanation, teaching) =>
          exampleTextFromWritingError(issue, explanation, teaching?.example),
        sessionId,
      );
      await insertErrorEvents(client, userId, errorEvents);
    }

    if (analysis.vocabularyCatch?.length) {
      await client.database.from("vocabulary_words").insert(
        analysis.vocabularyCatch.map((item) => ({
          user_id: userId,
          word: item.word,
          definition: item.definition,
          source_sentence: item.sourceSentence,
        })),
      );
    }

    if (sessionId) {
      await client.database
        .from("practice_sessions")
        .update({ sentence_count: currentCount + 1 })
        .eq("id", sessionId);
    }

    if (isPremiumUser(userId)) {
      try {
        await persistWritingDna(client, userId, {
          text,
          sourceTool: "write",
          errors: analysis.errors,
          registerScore: analysis.registerScore,
          analyzedSentenceId: analyzedSentence?.id ?? null,
        });
      } catch {
        // Non-blocking — analysis response should still succeed.
      }
    }

    const { count: sentencesToday } = await client.database
      .from("analyzed_sentences")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", dayStart);

    return jsonResponse({
      ...analysis,
      sentencesToday: sentencesToday ?? currentCount + 1,
    });
  } catch (err) {
    const message =
      err instanceof GroqServiceError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
    return jsonResponse({ error: message }, 500);
  }
}
