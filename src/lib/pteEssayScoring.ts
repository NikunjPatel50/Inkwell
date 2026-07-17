import { countWords } from "./textMetrics";
import type {
  PTEEssayScoreResult,
  PTEEssayTraitId,
  PTEEssayTraitScore,
  PTEScoreComparison,
} from "../types/writingMode";

export const PTE_ESSAY_TRAIT_DEFS: Array<{
  id: PTEEssayTraitId;
  label: string;
  maxScore: number;
}> = [
  { id: "content", label: "Content", maxScore: 6 },
  { id: "form", label: "Form", maxScore: 2 },
  {
    id: "development",
    label: "Development, Structure & Coherence",
    maxScore: 6,
  },
  { id: "grammar", label: "Grammar", maxScore: 2 },
  { id: "linguisticRange", label: "General Linguistic Range", maxScore: 6 },
  { id: "vocabulary", label: "Vocabulary Range", maxScore: 2 },
  { id: "spelling", label: "Spelling", maxScore: 2 },
];

export const PTE_ESSAY_MAX_TOTAL = PTE_ESSAY_TRAIT_DEFS.reduce(
  (sum, trait) => sum + trait.maxScore,
  0,
);

export function pteWordCountState(wordCount: number): "in-range" | "out-of-range" {
  return wordCount >= 200 && wordCount <= 300 ? "in-range" : "out-of-range";
}

function isMostlyUppercase(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 20) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.8;
}

function lacksPunctuation(text: string): boolean {
  return !/[.!?]/.test(text);
}

function isBulletPointOnly(text: string): boolean {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return false;
  return lines.every((line) => /^[-*•\d]+[.)]?\s/.test(line));
}

export function computeFormScore(
  text: string,
  wordCount = countWords(text),
): { score: number; feedback: string } {
  const trimmed = text.trim();

  if (isMostlyUppercase(trimmed)) {
    return {
      score: 0,
      feedback:
        "The response is mostly in capitals — PTE Form requires normal sentence case.",
    };
  }

  if (lacksPunctuation(trimmed)) {
    return {
      score: 0,
      feedback: "No sentence-ending punctuation was detected, so Form scores 0.",
    };
  }

  if (isBulletPointOnly(trimmed)) {
    return {
      score: 0,
      feedback: "Bullet-point-only responses score 0 on Form — write connected prose.",
    };
  }

  if (wordCount < 120 || wordCount > 380) {
    return {
      score: 0,
      feedback: `At ${wordCount} words, the essay is outside the 120–380 word band required for Form credit.`,
    };
  }

  if (wordCount >= 200 && wordCount <= 300) {
    return {
      score: 2,
      feedback: `${wordCount} words — within the ideal 200–300 band for full Form marks.`,
    };
  }

  return {
    score: 1,
    feedback: `${wordCount} words — acceptable (120–199 or 301–380) but outside the ideal 200–300 target.`,
  };
}

function zeroedTrait(
  id: PTEEssayTraitId,
  label: string,
  maxScore: number,
  message: string,
): PTEEssayTraitScore {
  return { id, label, maxScore, score: 0, feedback: message };
}

export function applyPteCascadingScores(
  traits: PTEEssayTraitScore[],
): Pick<PTEEssayScoreResult, "traits" | "totalScore" | "cascadeNote"> {
  const byId = Object.fromEntries(traits.map((trait) => [trait.id, trait])) as Record<
    PTEEssayTraitId,
    PTEEssayTraitScore
  >;

  const content = byId.content;
  const form = byId.form;

  if (content?.score === 0) {
    const note = "Content scored 0 — no further traits assessed.";
    const cascaded = PTE_ESSAY_TRAIT_DEFS.map((def) => {
      const existing = byId[def.id];
      if (def.id === "content") return existing;
      return zeroedTrait(def.id, def.label, def.maxScore, note);
    });
    return {
      traits: cascaded,
      totalScore: 0,
      cascadeNote: note,
    };
  }

  if (form?.score === 0) {
    const note =
      "Form scored 0 — essay outside 120–380 words or invalid format.";
    const cascaded = PTE_ESSAY_TRAIT_DEFS.map((def) => {
      const existing = byId[def.id];
      if (def.id === "content" || def.id === "form") return existing;
      return zeroedTrait(def.id, def.label, def.maxScore, note);
    });
    const totalScore = cascaded.reduce((sum, trait) => sum + trait.score, 0);
    return { traits: cascaded, totalScore, cascadeNote: note };
  }

  const totalScore = traits.reduce((sum, trait) => sum + trait.score, 0);
  return { traits, totalScore, cascadeNote: null };
}

export function traitScoreBand(
  score: number,
  maxScore: number,
): "strong" | "mid" | "weak" {
  if (score <= 0) return "weak";
  const ratio = score / maxScore;
  if (ratio >= 2 / 3) return "strong";
  if (ratio >= 1 / 3) return "mid";
  return "weak";
}

function countParagraphs(text: string): number {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean).length;
}

function estimateSpellingErrors(text: string): number {
  const commonMisspellings = [
    /\brecieve\b/gi,
    /\boccured\b/gi,
    /\bdefinately\b/gi,
    /\bgoverment\b/gi,
    /\benvirnment\b/gi,
    /\barguement\b/gi,
    /\bthier\b/gi,
    /\bteh\b/gi,
  ];
  return commonMisspellings.reduce(
    (count, pattern) => count + (text.match(pattern)?.length ?? 0),
    0,
  );
}

export function getWeakestTraits(
  result: PTEEssayScoreResult,
  limit = 3,
): PTEEssayTraitScore[] {
  return [...result.traits]
    .sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)
    .slice(0, limit);
}

export function comparePTEScores(
  before: PTEEssayScoreResult,
  after: PTEEssayScoreResult,
): PTEScoreComparison {
  const traits = before.traits
    .map((trait) => {
      const next = after.traits.find((entry) => entry.id === trait.id);
      if (!next || next.score === trait.score) return null;
      return {
        label: trait.label,
        before: trait.score,
        after: next.score,
        maxScore: trait.maxScore,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    traits,
    totalBefore: before.totalScore,
    totalAfter: after.totalScore,
    maxTotalScore: before.maxTotalScore,
  };
}

export function buildTopFixes(traits: PTEEssayTraitScore[]): string[] {
  const ranked = [...traits].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore);
  const fixes: string[] = [];

  for (const trait of ranked) {
    if (trait.score >= trait.maxScore) continue;
    if (fixes.length >= 3) break;
    fixes.push(`${trait.label}: ${trait.feedback}`);
  }

  return fixes;
}

export function buildLocalPTEEssayScore(text: string): PTEEssayScoreResult {
  const trimmed = text.trim();
  const wordCount = countWords(trimmed);
  const formResult = computeFormScore(trimmed, wordCount);
  const paragraphs = countParagraphs(trimmed);
  const spellingErrors = estimateSpellingErrors(trimmed);

  const hasIntro = /^(in my opinion|this essay|many people|nowadays|in recent years)/i.test(
    trimmed,
  );
  const hasConclusion = /(in conclusion|to conclude|overall|in summary)[,.]?\s/i.test(trimmed);

  const contentScore =
    wordCount < 80 ? 0 : wordCount < 150 ? 2 : wordCount < 200 ? 4 : hasIntro && hasConclusion ? 5 : 4;

  const developmentScore =
    paragraphs >= 3 && hasIntro && hasConclusion
      ? 5
      : paragraphs >= 2
        ? 4
        : 2;

  const grammarScore = /\b(is|are|was|were)\s+\w+ing\b/i.test(trimmed) ? 1 : 2;
  const linguisticScore = wordCount > 220 ? 5 : wordCount > 160 ? 4 : 3;
  const vocabularyScore = /\b(furthermore|moreover|consequently|nevertheless)\b/i.test(trimmed)
    ? 2
    : 1;
  const spellingScore = spellingErrors === 0 ? 2 : spellingErrors === 1 ? 1 : 0;

  const rawTraits: PTEEssayTraitScore[] = PTE_ESSAY_TRAIT_DEFS.map((def) => {
    switch (def.id) {
      case "content":
        return {
          ...def,
          score: contentScore,
          feedback:
            contentScore >= 4
              ? "The response addresses the topic with some development, but add specific examples in your own words."
              : "The argument needs more depth — reformulate the issue and support it with concrete examples.",
        };
      case "form":
        return { ...def, score: formResult.score, feedback: formResult.feedback };
      case "development":
        return {
          ...def,
          score: developmentScore,
          feedback:
            paragraphs >= 3
              ? "Paragraphing is present — tighten connectives between intro, body, and conclusion."
              : `Only ${paragraphs} paragraph block(s) detected — use clear intro, body, and conclusion sections.`,
        };
      case "grammar":
        return {
          ...def,
          score: grammarScore,
          feedback:
            grammarScore === 2
              ? "Sentence control looks generally sound — keep complex structures accurate."
              : "Watch tense and agreement in longer sentences — errors may limit the Grammar score.",
        };
      case "linguisticRange":
        return {
          ...def,
          score: linguisticScore,
          feedback:
            "Vary sentence openings and clause structures so ideas are expressed with more precision.",
        };
      case "vocabulary":
        return {
          ...def,
          score: vocabularyScore,
          feedback:
            vocabularyScore === 2
              ? "Some academic linking language appears — broaden topic-specific vocabulary."
              : "Lexis is fairly basic — add precise topic vocabulary and collocations.",
        };
      case "spelling":
        return {
          ...def,
          score: spellingScore,
          feedback:
            spellingErrors === 0
              ? "No obvious spelling errors detected in this pass."
              : `${spellingErrors} likely spelling issue(s) detected — proofread before submitting.`,
        };
      default:
        return { ...def, score: 0, feedback: "" };
    }
  });

  const { traits, totalScore, cascadeNote } = applyPteCascadingScores(rawTraits);

  return {
    traits,
    totalScore,
    maxTotalScore: PTE_ESSAY_MAX_TOTAL,
    cascadeNote,
    topFixes: buildTopFixes(traits),
  };
}

export function finalizePTEEssayScore(
  aiTraits: PTEEssayTraitScore[],
  text: string,
  topFixes: string[],
): PTEEssayScoreResult {
  const formResult = computeFormScore(text);
  const merged = PTE_ESSAY_TRAIT_DEFS.map((def) => {
    const fromAi = aiTraits.find((trait) => trait.id === def.id);
    if (def.id === "form") {
      return { ...def, score: formResult.score, feedback: formResult.feedback };
    }
    return {
      id: def.id,
      label: def.label,
      maxScore: def.maxScore,
      score: Math.max(0, Math.min(def.maxScore, Math.round(fromAi?.score ?? 0))),
      feedback: fromAi?.feedback?.trim() || `Review ${def.label.toLowerCase()} against the official PTE rubric.`,
    };
  });

  const { traits, totalScore, cascadeNote } = applyPteCascadingScores(merged);

  return {
    traits,
    totalScore,
    maxTotalScore: PTE_ESSAY_MAX_TOTAL,
    cascadeNote,
    topFixes: topFixes.length > 0 ? topFixes.slice(0, 3) : buildTopFixes(traits),
  };
}

export function isValidPTEEssayScoreResult(value: unknown): value is PTEEssayScoreResult {
  if (!value || typeof value !== "object") return false;
  const data = value as PTEEssayScoreResult;
  return (
    Array.isArray(data.traits) &&
    data.traits.length === PTE_ESSAY_TRAIT_DEFS.length &&
    typeof data.totalScore === "number" &&
    Array.isArray(data.topFixes)
  );
}
