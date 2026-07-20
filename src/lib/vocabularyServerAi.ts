import { createAdminClient } from "@insforge/sdk";
import type { WordDetail, WordSense } from "../types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.0-flash-001";
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DATAMUSE_API = "https://api.datamuse.com/words";
const DICTIONARY_TIMEOUT_MS = 3_000;
const DATAMUSE_TIMEOUT_MS = 2_000;
const AI_LOOKUP_TIMEOUT_MS = 4_000;

const WORD_DETAIL_PROMPT = `You are a comprehensive English dictionary and vocabulary teacher.
The user may look up ANY real English word or short phrase (1-3 words) — common, rare, technical, literary, archaic, slang, or regional.
If the word exists in English, return an accurate, helpful entry.
If the input is a close misspelling, resolve to the intended English word.
Return JSON only:
{
  "word": string,
  "phonetic": string,
  "partOfSpeech": string,
  "level1": { "definition": string, "examples": string[2], "mnemonic": string },
  "level2": {
    "wordForms": [{ "form": string, "partOfSpeech": string, "example": string }],
    "synonyms": [{ "word": string, "note": string }],
    "antonyms": [{ "word": string, "note": string }]
  },
  "level3": {
    "collocations": string[3],
    "register": string,
    "commonMistake": string,
    "usageContext": string
  },
  "level4": {
    "etymology": string,
    "connotation": string,
    "nuanceComparison": string,
    "famousUsage": string
  }
}

Plain English. Examples must use the word naturally. Omit empty word forms in level2.wordForms. JSON only.`;

const SUGGEST_WORDS_PROMPT = `You help users find English vocabulary. Given any partial or full search query, return JSON only:
{ "suggestions": string[] }

Return up to 5 real English words or short phrases (1-3 words) that match or relate to the query.
Include the exact query when it is already a valid English word or phrase.
Cover common, advanced, and specialized vocabulary. Lowercase single words unless a proper noun. JSON only.`;

export class VocabularyAiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VocabularyAiError";
  }
}

export function isVocabularyAiConfigured(): boolean {
  return Boolean(getServerGroqKey() || getOpenRouterKey() || getInsforgeAdminConfig());
}

function getServerGroqKey(): string | null {
  const serverKey = process.env.GROQ_API_KEY?.trim();
  if (serverKey) return serverKey;
  const publicKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
  return publicKey || null;
}

function getOpenRouterKey(): string | null {
  return process.env.OPENROUTER_API_KEY?.trim() || null;
}

function getInsforgeAdminConfig(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim();
  const apiKey = process.env.INSFORGE_API_KEY?.trim();
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey };
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as {
      error?: string | { message?: string };
      message?: string;
    };
    if (typeof body.error === "string") return body.error;
    if (body.error && typeof body.error.message === "string") return body.error.message;
    if (typeof body.message === "string") return body.message;
    return null;
  } catch {
    return null;
  }
}

function parseJson<T>(content: string): T {
  try {
    return JSON.parse(extractJsonPayload(content)) as T;
  } catch {
    throw new VocabularyAiError("AI returned a response we couldn't parse. Try again.");
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new VocabularyAiError("Lookup timed out. Try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function callChatCompletions(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  extraHeaders?: Record<string, string>,
  options?: { jsonObject?: boolean },
): Promise<string> {
  const requestBody: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.65,
  };
  if (options?.jsonObject !== false) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify(requestBody),
    },
    AI_LOOKUP_TIMEOUT_MS,
  );

  if (!response.ok) {
    const apiMessage = await readErrorMessage(response);
    throw new VocabularyAiError(apiMessage ?? `AI request failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new VocabularyAiError("AI returned an empty response. Try again.");
  return content;
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = getServerGroqKey();
  if (!apiKey) {
    throw new VocabularyAiError("GROQ is not configured.");
  }

  return callChatCompletions(
    GROQ_ENDPOINT,
    apiKey,
    process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
    systemPrompt,
    userContent,
  );
}

async function callOpenRouter(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new VocabularyAiError("OpenRouter is not configured.");
  }

  const referer =
    process.env.NEXT_PUBLIC_INSFORGE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";

  const model = process.env.OPENROUTER_CHAT_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;

  return callChatCompletions(
    OPENROUTER_ENDPOINT,
    apiKey,
    model,
    systemPrompt,
    userContent,
    {
      "HTTP-Referer": referer,
      "X-Title": "Inkwell Vocabulary",
    },
    { jsonObject: false },
  );
}

async function callVocabularyAi(systemPrompt: string, userContent: string): Promise<string> {
  if (getServerGroqKey()) {
    try {
      return await callGroq(systemPrompt, userContent);
    } catch {
      // Fall through to OpenRouter or edge function.
    }
  }

  if (getOpenRouterKey()) {
    return callOpenRouter(systemPrompt, userContent);
  }

  throw new VocabularyAiError("No AI provider is configured.");
}

async function invokeInsforgeVocabulary<T>(body: Record<string, unknown>): Promise<T | null> {
  const config = getInsforgeAdminConfig();
  if (!config) return null;

  try {
    const client = createAdminClient({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      functionsUrl: `${config.baseUrl.replace(/\/$/, "")}/functions`,
    });
    const { data, error } = await client.functions.invoke("vocabulary-learning", { body });
    if (error) return null;
    if (data && typeof data === "object" && "error" in data && data.error) return null;
    return data as T;
  } catch {
    return null;
  }
}

interface DictionaryDefinition {
  definition?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryMeaning {
  partOfSpeech?: string;
  definitions?: DictionaryDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: DictionaryMeaning[];
}

function buildSensesFromDefinitions(
  definitions: DictionaryDefinition[],
  word: string,
  partOfSpeech: string,
): WordSense[] {
  const trimmed = definitions
    .map((entry) => ({
      definition: entry.definition?.trim() ?? "",
      example: entry.example?.trim() ?? "",
    }))
    .filter((entry) => entry.definition);

  if (trimmed.length === 0) {
    return [];
  }

  const naturalExamples = buildNaturalExamples(word, partOfSpeech);

  return trimmed.slice(0, 6).map((entry, index) => {
    const examples = entry.example ? [entry.example] : index === 0 ? [naturalExamples[0]] : [];
    return {
      number: index + 1,
      definition: entry.definition,
      examples: examples.filter(Boolean),
    };
  });
}

function buildSensesFromDatamuseDefs(
  parsed: Array<{ partOfSpeech: string; definition: string }>,
  word: string,
): WordSense[] {
  if (parsed.length === 0) return [];

  const partOfSpeech = parsed[0]?.partOfSpeech ?? "word";
  const naturalExamples = buildNaturalExamples(word, partOfSpeech);

  return parsed.slice(0, 6).map((entry, index) => ({
    number: index + 1,
    definition: entry.definition,
    examples: index === 0 ? [naturalExamples[0]] : [],
  }));
}

function pickAudioUrl(entries: DictionaryEntry[]): string | undefined {
  for (const entry of entries) {
    const audio = entry.phonetics?.find((phonetic) => phonetic.audio?.trim())?.audio?.trim();
    if (audio) return audio;
  }
  return undefined;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function pickPrimaryMeaning(entries: DictionaryEntry[]): DictionaryMeaning | null {
  const meanings = entries.flatMap((entry) => entry.meanings ?? []);
  if (meanings.length === 0) return null;

  const preferred = ["verb", "noun", "adjective", "adverb"];
  for (const partOfSpeech of preferred) {
    const match = meanings.find((meaning) => meaning.partOfSpeech === partOfSpeech);
    if (match?.definitions?.some((definition) => definition.definition?.trim())) {
      return match;
    }
  }

  return meanings.find((meaning) => meaning.definitions?.some((definition) => definition.definition?.trim())) ?? null;
}

function buildNaturalExamples(word: string, partOfSpeech: string): string[] {
  switch (partOfSpeech) {
    case "verb":
      return [
        `Please ${word} your notes to the meeting.`,
        `She asked him to ${word} her the details.`,
      ];
    case "noun":
      return [
        `The ${word} was hard to ignore.`,
        `We discussed the ${word} at length.`,
      ];
    case "adjective":
      return [
        `She looked ${word} after the long journey.`,
        `It was a ${word} afternoon by the river.`,
      ];
    case "adverb":
      return [
        `He spoke ${word} and everyone listened.`,
        `She ${word} finished the assignment.`,
      ];
    default:
      return [
        `Try using "${word}" in your next sentence.`,
        `"${word}" works well in formal writing.`,
      ];
  }
}

function isGenericExample(example: string): boolean {
  return (
    example.includes("naturally in context") ||
    example.includes("write with more precision") ||
    example.includes("fits naturally here")
  );
}

async function fetchDatamuseRelations(
  word: string,
): Promise<{ synonyms: string[]; antonyms: string[] }> {
  const normalized = word.trim().toLowerCase();
  if (!normalized || /\s/.test(normalized)) {
    return { synonyms: [], antonyms: [] };
  }

  const request = (relation: "rel_syn" | "rel_ant") =>
    fetchWithTimeout(
      `${DATAMUSE_API}?${relation}=${encodeURIComponent(normalized)}&max=6`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
      DATAMUSE_TIMEOUT_MS,
    )
      .then(async (response) => {
        if (!response.ok) return [] as string[];
        const payload = (await response.json()) as Array<{ word?: string }>;
        return payload
          .map((entry) => entry.word?.trim().toLowerCase())
          .filter((entry): entry is string => Boolean(entry && entry !== normalized));
      })
      .catch(() => [] as string[]);

  const [synonyms, antonyms] = await Promise.all([request("rel_syn"), request("rel_ant")]);
  return { synonyms: uniqueStrings(synonyms), antonyms: uniqueStrings(antonyms) };
}

function enrichWordDetail(
  detail: WordDetail,
  relations: { synonyms: string[]; antonyms: string[] },
): WordDetail {
  const examples = uniqueStrings(detail.level1.examples).filter((entry) => !isGenericExample(entry));
  const naturalExamples = buildNaturalExamples(detail.word, detail.partOfSpeech);

  const synonyms = uniqueStrings([
    ...detail.level2.synonyms.map((entry) => entry.word),
    ...relations.synonyms,
  ]);
  const antonyms = uniqueStrings([
    ...detail.level2.antonyms.map((entry) => entry.word),
    ...relations.antonyms,
  ]);

  return {
    ...detail,
    level1: {
      ...detail.level1,
      examples: (examples.length >= 2 ? examples : naturalExamples).slice(0, 2),
    },
    level2: {
      ...detail.level2,
      synonyms: synonyms.slice(0, 6).map((entry) => ({
        word: entry,
        note: `Similar meaning to ${detail.word}.`,
      })),
      antonyms: antonyms.slice(0, 6).map((entry) => ({
        word: entry,
        note: `Opposite of ${detail.word}.`,
      })),
    },
  };
}

function mergeLexiconDetails(
  dictionary: WordDetail | null,
  datamuse: WordDetail | null,
): WordDetail | null {
  const primary = dictionary ?? datamuse;
  if (!primary) return null;

  const examples = uniqueStrings([
    ...(dictionary?.level1.examples ?? []),
    ...(datamuse?.level1.examples ?? []),
  ]).filter((entry) => !isGenericExample(entry));

  const synonyms = uniqueStrings([
    ...(dictionary?.level2.synonyms.map((entry) => entry.word) ?? []),
    ...(datamuse?.level2.synonyms.map((entry) => entry.word) ?? []),
  ]);

  const antonyms = uniqueStrings([
    ...(dictionary?.level2.antonyms.map((entry) => entry.word) ?? []),
    ...(datamuse?.level2.antonyms.map((entry) => entry.word) ?? []),
  ]);

  const partOfSpeech =
    dictionary?.partOfSpeech || datamuse?.partOfSpeech || primary.partOfSpeech;

  return {
    ...primary,
    phonetic: dictionary?.phonetic || datamuse?.phonetic || primary.phonetic,
    partOfSpeech,
    level1: {
      definition:
        dictionary?.level1.definition || datamuse?.level1.definition || primary.level1.definition,
      examples:
        examples.length >= 2
          ? examples.slice(0, 2)
          : buildNaturalExamples(primary.word, partOfSpeech),
      mnemonic: dictionary?.level1.mnemonic || datamuse?.level1.mnemonic || primary.level1.mnemonic,
    },
    level2: {
      wordForms: dictionary?.level2.wordForms.length
        ? dictionary.level2.wordForms
        : datamuse?.level2.wordForms ?? primary.level2.wordForms,
      synonyms: synonyms.slice(0, 6).map((word) => ({
        word,
        note: `Similar meaning to ${primary.word}.`,
      })),
      antonyms: antonyms.slice(0, 6).map((word) => ({
        word,
        note: `Opposite of ${primary.word}.`,
      })),
    },
    level3: dictionary?.level3.register ? dictionary.level3 : datamuse?.level3 ?? primary.level3,
    level4: dictionary?.level4.etymology ? dictionary.level4 : datamuse?.level4 ?? primary.level4,
    senses: dictionary?.senses?.length ? dictionary.senses : datamuse?.senses ?? primary.senses,
    audioUrl: dictionary?.audioUrl ?? datamuse?.audioUrl ?? primary.audioUrl,
  };
}

function datamuseTagToPartOfSpeech(tag: string): string {
  if (tag.startsWith("v")) return "verb";
  if (tag.startsWith("n")) return "noun";
  if (tag.startsWith("adj")) return "adjective";
  if (tag.startsWith("adv")) return "adverb";
  return "word";
}

function buildLexiconWordDetail(
  normalized: string,
  partOfSpeech: string,
  primaryDefinition: string,
  secondaryDefinition: string | undefined,
  extras?: {
    phonetic?: string;
    examples?: string[];
    synonyms?: string[];
    antonyms?: string[];
    senses?: WordSense[];
    audioUrl?: string;
  },
): WordDetail {
  const examples = uniqueStrings(extras?.examples ?? []).filter((entry) => !isGenericExample(entry));
  const resolvedExamples =
    examples.length >= 2 ? examples : buildNaturalExamples(normalized, partOfSpeech);

  const synonyms = uniqueStrings(extras?.synonyms ?? []);
  const antonyms = uniqueStrings(extras?.antonyms ?? []);

  return {
    word: normalized,
    phonetic: extras?.phonetic?.trim() || `/${normalized}/`,
    partOfSpeech,
    audioUrl: extras?.audioUrl,
    senses: extras?.senses,
    level1: {
      definition: primaryDefinition,
      examples: resolvedExamples.slice(0, 2),
      mnemonic: `Link "${normalized}" to: ${primaryDefinition.charAt(0).toLowerCase()}${primaryDefinition.slice(1)}`,
    },
    level2: {
      wordForms: [],
      synonyms: synonyms.slice(0, 5).map((entry) => ({
        word: entry,
        note: `Similar in meaning to ${normalized}.`,
      })),
      antonyms: antonyms.slice(0, 5).map((entry) => ({
        word: entry,
        note: `Opposite direction from ${normalized}.`,
      })),
    },
    level3: {
      collocations: [`use ${normalized}`, `${normalized} clearly`, `learn ${normalized}`],
      register: `Common ${partOfSpeech} in everyday and academic English.`,
      commonMistake: secondaryDefinition
        ? `Do not confuse the main sense (${primaryDefinition.toLowerCase()}) with: ${secondaryDefinition.toLowerCase()}.`
        : `Check which part of speech you need before using "${normalized}".`,
      usageContext: `Use "${normalized}" when this sense matches your sentence and audience.`,
    },
    level4: {
      etymology: "",
      connotation: primaryDefinition,
      nuanceComparison: secondaryDefinition ? `Another sense: ${secondaryDefinition}` : "",
      famousUsage: resolvedExamples[0] ?? "",
    },
  };
}

export async function fetchDatamuseWordDetail(word: string): Promise<WordDetail | null> {
  const normalized = word.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized || /\s/.test(normalized)) return null;

  try {
    const response = await fetchWithTimeout(
      `${DATAMUSE_API}?sp=${encodeURIComponent(normalized)}&md=d&max=1`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
      DATAMUSE_TIMEOUT_MS,
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as Array<{ word?: string; defs?: string[] }>;
    const entry = payload[0];
    if (!entry?.defs?.length) return null;

    const parsed = entry.defs
      .map((line) => {
        const [tag, ...rest] = line.split("\t");
        const definition = rest.join(" ").trim();
        if (!definition) return null;
        return {
          partOfSpeech: datamuseTagToPartOfSpeech(tag ?? ""),
          definition,
        };
      })
      .filter((value): value is { partOfSpeech: string; definition: string } => value !== null);

    const primary = parsed[0];
    if (!primary) return null;

    return buildLexiconWordDetail(
      normalized,
      primary.partOfSpeech,
      primary.definition,
      parsed[1]?.definition,
      {
        senses: buildSensesFromDatamuseDefs(parsed, normalized),
      },
    );
  } catch {
    return null;
  }
}

export async function fetchDictionaryWordDetail(word: string): Promise<WordDetail | null> {
  const normalized = word.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized || /\s/.test(normalized)) return null;

  try {
    const response = await fetchWithTimeout(
      `${DICTIONARY_API}/${encodeURIComponent(normalized)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
      DICTIONARY_TIMEOUT_MS,
    );
    if (!response.ok) return null;

    const entries = (await response.json()) as DictionaryEntry[];
    if (!Array.isArray(entries) || entries.length === 0) return null;

    const meaning = pickPrimaryMeaning(entries);
    const definitions =
      meaning?.definitions?.filter((entry) => entry.definition?.trim()) ?? [];
    const primaryDefinition = definitions[0]?.definition?.trim();
    if (!primaryDefinition) return null;

    const examples = uniqueStrings(
      definitions.map((entry) => entry.example?.trim() ?? "").filter(Boolean),
    );
    const partOfSpeech = meaning?.partOfSpeech?.trim() || "word";
    const resolvedExamples =
      examples.length >= 2 ? examples : buildNaturalExamples(normalized, partOfSpeech);
    const secondaryDefinition = definitions[1]?.definition?.trim();

    const synonyms = uniqueStrings([
      ...(meaning?.synonyms ?? []),
      ...definitions.flatMap((entry) => entry.synonyms ?? []),
    ]);
    const antonyms = uniqueStrings([
      ...(meaning?.antonyms ?? []),
      ...definitions.flatMap((entry) => entry.antonyms ?? []),
    ]);

    const phonetic =
      entries.find((entry) => entry.phonetic?.trim())?.phonetic?.trim() ?? `/${normalized}/`;
    const senses = buildSensesFromDefinitions(definitions, normalized, partOfSpeech);
    const audioUrl = pickAudioUrl(entries);

    return buildLexiconWordDetail(
      normalized,
      partOfSpeech,
      primaryDefinition,
      secondaryDefinition,
      {
        phonetic,
        examples: resolvedExamples,
        synonyms,
        antonyms,
        senses,
        audioUrl,
      },
    );
  } catch {
    return null;
  }
}

function normalizeWordDetail(data: WordDetail, fallbackWord: string): WordDetail {
  if (!data.word || !data.level1?.definition || !data.level1.examples?.length) {
    throw new VocabularyAiError("The word detail response was invalid. Try again.");
  }

  return {
    ...data,
    word: data.word || fallbackWord,
    level2: {
      wordForms: data.level2?.wordForms?.filter((entry) => entry.form && entry.example) ?? [],
      synonyms: data.level2?.synonyms?.filter((entry) => entry.word) ?? [],
      antonyms: data.level2?.antonyms?.filter((entry) => entry.word) ?? [],
    },
    level3: {
      collocations: data.level3?.collocations ?? [],
      register: data.level3?.register ?? "",
      commonMistake: data.level3?.commonMistake ?? "",
      usageContext: data.level3?.usageContext ?? "",
    },
    level4: {
      etymology: data.level4?.etymology ?? "",
      connotation: data.level4?.connotation ?? "",
      nuanceComparison: data.level4?.nuanceComparison ?? "",
      famousUsage: data.level4?.famousUsage ?? "",
    },
  };
}

export async function suggestWordsWithAi(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (getServerGroqKey() || getOpenRouterKey()) {
    try {
      const data = parseJson<{ suggestions: string[] }>(
        await callVocabularyAi(SUGGEST_WORDS_PROMPT, `Query: ${trimmed}`),
      );
      if (Array.isArray(data.suggestions)) {
        return data.suggestions
          .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
          .map((entry) => entry.trim())
          .slice(0, 5);
      }
    } catch {
      // Fall through to InsForge edge function.
    }
  }

  const dedicated = await invokeInsforgeVocabulary<{ suggestions: string[] }>({
    action: "suggest-words",
    query: trimmed,
  });
  if (dedicated?.suggestions?.length) {
    return dedicated.suggestions.slice(0, 5);
  }

  throw new VocabularyAiError("Could not fetch word suggestions right now.");
}

async function tryAiWordDetail(word: string): Promise<WordDetail | null> {
  if (!getServerGroqKey() && !getOpenRouterKey()) return null;

  try {
    const data = parseJson<WordDetail>(
      await callVocabularyAi(WORD_DETAIL_PROMPT, `Word or phrase: ${word}`),
    );
    return normalizeWordDetail(data, word);
  } catch {
    return null;
  }
}

export async function lookupWordDetail(word: string): Promise<WordDetail> {
  const normalized = word.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) {
    throw new VocabularyAiError("Enter a word to look up.");
  }

  const isSingleWord = !/\s/.test(normalized);

  if (isSingleWord) {
    const [datamuse, dictionary, relations] = await Promise.all([
      fetchDatamuseWordDetail(normalized),
      fetchDictionaryWordDetail(normalized),
      fetchDatamuseRelations(normalized),
    ]);

    const merged = mergeLexiconDetails(dictionary, datamuse);
    if (merged) return enrichWordDetail(merged, relations);

    const datamuseRetry = datamuse ?? (await fetchDatamuseWordDetail(normalized));
    if (datamuseRetry) {
      const relationData =
        relations.synonyms.length || relations.antonyms.length
          ? relations
          : await fetchDatamuseRelations(normalized);
      return enrichWordDetail(datamuseRetry, relationData);
    }

    const dictionaryRetry = dictionary ?? (await fetchDictionaryWordDetail(normalized));
    if (dictionaryRetry) return dictionaryRetry;
  }

  const aiDetail = await tryAiWordDetail(normalized);
  if (aiDetail) return aiDetail;

  if (!isSingleWord) {
    const dictionary = await fetchDictionaryWordDetail(normalized);
    if (dictionary) return dictionary;
  }

  throw new VocabularyAiError(
    "Could not look up that word right now. Check your connection and try again.",
  );
}

export async function rescueLexiconLookup(word: string): Promise<WordDetail | null> {
  const normalized = word.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized || /\s/.test(normalized)) return null;

  const relations = await fetchDatamuseRelations(normalized);
  const datamuse = await fetchDatamuseWordDetail(normalized);
  if (datamuse) return enrichWordDetail(datamuse, relations);

  return fetchDictionaryWordDetail(normalized);
}

export async function generateWordDetailWithAi(word: string): Promise<WordDetail> {
  return lookupWordDetail(word);
}
