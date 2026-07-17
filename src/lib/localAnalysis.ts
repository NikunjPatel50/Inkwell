import type { AnalysisResult, Tone, WritingError } from "../types";

const WEAK_WORDS: Array<{
  pattern: RegExp;
  issue: string;
  explanation: string;
  principle: string;
  before: string;
  after: string;
}> = [
  {
    pattern: /\breally\b/i,
    issue: 'Weak word: "really"',
    explanation:
      '"Really" is a vague intensifier. Cut it or replace it with a more precise detail.',
    principle: "Replace weak intensifiers with specific detail or stronger verbs.",
    before: "It was really good.",
    after: "It exceeded expectations.",
  },
  {
    pattern: /\bvery\b/i,
    issue: 'Weak word: "very"',
    explanation:
      '"Very" often pads a weak adjective. Choose a stronger word instead of stacking intensity.',
    principle: "One strong adjective beats very + weak adjective.",
    before: "She was very tired.",
    after: "She was exhausted.",
  },
  {
    pattern: /\bgood\b/i,
    issue: 'Vague adjective: "good"',
    explanation:
      '"Good" is broad. Name what kind of good — clear, persuasive, accurate, elegant.',
    principle: "Swap generic praise for a specific quality.",
    before: "This is a good sentence.",
    after: "This sentence is clear and direct.",
  },
  {
    pattern: /\bnice\b/i,
    issue: 'Vague adjective: "nice"',
    explanation: '"Nice" tells the reader little. Show the quality you mean.',
    principle: "Replace nice with a word that names the effect on the reader.",
    before: "That is a nice point.",
    after: "That is a compelling point.",
  },
  {
    pattern: /\bthings\b/i,
    issue: 'Vague noun: "things"',
    explanation: 'Name the things. Specific nouns make writing easier to picture.',
    principle: "Replace things/stuff with concrete nouns.",
    before: "Many things went wrong.",
    after: "Several deadlines slipped.",
  },
];

function detectErrors(text: string): WritingError[] {
  const errors: WritingError[] = [];
  for (const rule of WEAK_WORDS) {
    if (!rule.pattern.test(text)) continue;
    errors.push({
      issue: rule.issue,
      explanation: rule.explanation,
      teaching: {
        why: "Readers skim over filler words and vague praise.",
        principle: rule.principle,
        example: { before: rule.before, after: rule.after },
      },
    });
  }
  return errors.slice(0, 3);
}

function estimateRegisterScore(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const avgLength =
    words.reduce((sum, word) => sum + word.replace(/[^a-z]/gi, "").length, 0) /
    Math.max(words.length, 1);
  const fillerCount = (text.match(/\b(really|very|good|nice|things|stuff)\b/gi) ?? []).length;
  const base = Math.min(100, Math.round(30 + avgLength * 8));
  return Math.max(0, Math.min(100, base - fillerCount * 8));
}

function normalizeCompare(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function applyReplacements(text: string, replacements: Array<[RegExp, string]>): string {
  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
}

function simpleFallback(text: string): string {
  const contracted = text
    .replace(/\bThis is\b/g, "It's")
    .replace(/\bI am\b/gi, "I'm")
    .replace(/\bIt is\b/gi, "It's")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't");
  if (normalizeCompare(contracted) !== normalizeCompare(text)) return contracted;

  const shortened = text.split(/[,;]/)[0]?.trim();
  if (shortened && shortened.length > 8 && normalizeCompare(shortened) !== normalizeCompare(text)) {
    return shortened.endsWith(".") ? shortened : `${shortened}.`;
  }

  return `In short, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function intermediateFallback(text: string): string {
  if (/^This is\b/i.test(text)) {
    return text.replace(/^This is\b/i, "This is clearly");
  }
  if (/^I\b/.test(text)) {
    return text.replace(/^I\b/, "I believe");
  }
  if (/^It\b/.test(text)) {
    return text.replace(/^It\b/, "It seems");
  }
  return `To be clear, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function advancedFallback(text: string): string {
  return applyReplacements(text, [
    [/\bThis is my\b/i, "This represents my preferred"],
    [/\bThis is\b/i, "This constitutes"],
    [/\btype of\b/gi, "kind of"],
    [/\bwriting platform\b/gi, "writing environment"],
    [/\bplatform\b/gi, "environment"],
    [/\bwriting\b/gi, "written expression"],
    [/\bgood\b/gi, "commendable"],
    [/\bimportant\b/gi, "significant"],
    [/\bhelp\b/gi, "facilitate"],
    [/\buse\b/gi, "employ"],
    [/\bshow\b/gi, "demonstrate"],
  ]);
}

function ensureTierDiffers(
  original: string,
  current: string,
  fallback: () => string,
): string {
  if (normalizeCompare(current) !== normalizeCompare(original)) return current;
  const next = fallback();
  if (normalizeCompare(next) !== normalizeCompare(original)) return next;
  return `${next.replace(/\.$/, "")} — restated for clarity.`;
}

function buildRewrites(text: string) {
  const trimmed = text.trim();

  let simple = applyReplacements(trimmed, [
    [/\breally\s+/gi, ""],
    [/\bvery\s+/gi, ""],
    [/\btype of\b/gi, ""],
    [/\bkind of\b/gi, ""],
    [/\bactually\b/gi, ""],
    [/\bbasically\b/gi, ""],
    [/\butilize\b/gi, "use"],
    [/\bcommence\b/gi, "start"],
    [/\bapproximately\b/gi, "about"],
    [/\bThis is\b/g, "It's"],
  ]);

  let intermediate = applyReplacements(trimmed, [
    [/\breally\b/gi, "genuinely"],
    [/\bvery\b/gi, ""],
    [/\bgood\b/gi, "effective"],
    [/\bnice\b/gi, "thoughtful"],
    [/\bplatform\b/gi, "platform"],
    [/\bThis is my\b/i, "This is the"],
  ]);

  let advanced = applyReplacements(trimmed, [
    [/\breally\s+/gi, ""],
    [/\bgood\b/gi, "commendable"],
    [/\bnice\b/gi, "insightful"],
    [/\bthings\b/gi, "details"],
    [/\bplatform\b/gi, "writing environment"],
    [/\bwriting\b/gi, "written"],
    [/\bThis is my\b/i, "This represents my preferred"],
  ]);

  simple = ensureTierDiffers(trimmed, simple, () => simpleFallback(trimmed));
  intermediate = ensureTierDiffers(trimmed, intermediate, () => intermediateFallback(trimmed));
  advanced = ensureTierDiffers(trimmed, advanced, () => advancedFallback(trimmed));

  if (normalizeCompare(simple) === normalizeCompare(intermediate)) {
    intermediate = intermediateFallback(trimmed);
  }
  if (normalizeCompare(intermediate) === normalizeCompare(advanced)) {
    advanced = advancedFallback(trimmed);
  }
  if (normalizeCompare(simple) === normalizeCompare(advanced)) {
    advanced = `${advancedFallback(trimmed).replace(/\.$/, "")}, precisely as intended.`;
  }

  return {
    simple,
    intermediate,
    intermediateTechnique: "Swap vague intensifiers for precise word choice.",
    advanced,
    advancedTechnique: "Elevate diction while preserving the original meaning.",
  };
}

export function ensureDistinctRewrites(
  original: string,
  result: AnalysisResult,
): AnalysisResult {
  const trimmed = original.trim();
  const needsFix =
    normalizeCompare(result.simple) === normalizeCompare(trimmed) ||
    normalizeCompare(result.intermediate) === normalizeCompare(trimmed) ||
    normalizeCompare(result.advanced) === normalizeCompare(trimmed) ||
    normalizeCompare(result.simple) === normalizeCompare(result.intermediate) ||
    normalizeCompare(result.intermediate) === normalizeCompare(result.advanced);

  if (!needsFix) return result;

  const rewrites = buildRewrites(trimmed);
  return {
    ...result,
    simple:
      normalizeCompare(result.simple) === normalizeCompare(trimmed)
        ? rewrites.simple
        : result.simple,
    intermediate:
      normalizeCompare(result.intermediate) === normalizeCompare(trimmed) ||
      normalizeCompare(result.intermediate) === normalizeCompare(result.simple)
        ? rewrites.intermediate
        : result.intermediate,
    advanced:
      normalizeCompare(result.advanced) === normalizeCompare(trimmed) ||
      normalizeCompare(result.advanced) === normalizeCompare(result.intermediate)
        ? rewrites.advanced
        : result.advanced,
    intermediateTechnique: result.intermediateTechnique || rewrites.intermediateTechnique,
    advancedTechnique: result.advancedTechnique || rewrites.advancedTechnique,
  };
}

export function buildLocalAnalysis(text: string, tone: Tone = "neutral"): AnalysisResult {
  const rewrites = buildRewrites(text);
  const toneDriftNote =
    tone === "formal"
      ? "Formal tone: fewer contractions and more precise diction."
      : tone === "casual"
        ? "Casual tone: relaxed phrasing and conversational rhythm."
        : undefined;

  return {
    errors: detectErrors(text),
    registerScore: estimateRegisterScore(text),
    ...rewrites,
    toneDriftNote,
    vocabularyCatch: [],
  };
}

export function isValidAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const data = value as AnalysisResult;
  return Boolean(
    Array.isArray(data.errors) &&
      typeof data.registerScore === "number" &&
      typeof data.simple === "string" &&
      typeof data.intermediate === "string" &&
      typeof data.advanced === "string" &&
      typeof data.intermediateTechnique === "string" &&
      typeof data.advancedTechnique === "string",
  );
}
