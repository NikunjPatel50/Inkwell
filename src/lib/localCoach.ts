import type { CollocationEvaluateResult, CollocationTopicExamples } from "../types/coach";
import { COLLOCATION_ESSAY_TOPICS } from "../constants/collocationEssayTopics";

const VERB_NOUN_COLLOCATIONS: Record<string, string[]> = {
  reduce: [
    "costs",
    "expenses",
    "waste",
    "emissions",
    "pollution",
    "stress",
    "risk",
    "consumption",
    "spending",
    "inequality",
    "barriers",
    "dependence",
  ],
  improve: [
    "performance",
    "productivity",
    "quality",
    "skills",
    "outcomes",
    "efficiency",
    "communication",
    "health",
    "standards",
    "results",
    "access",
    "understanding",
  ],
  enhance: [
    "learning",
    "experience",
    "quality",
    "performance",
    "productivity",
    "skills",
    "understanding",
    "reputation",
    "efficiency",
    "collaboration",
  ],
  increase: [
    "productivity",
    "efficiency",
    "awareness",
    "participation",
    "funding",
    "demand",
    "profits",
    "access",
    "engagement",
    "competition",
  ],
  develop: [
    "skills",
    "strategies",
    "solutions",
    "relationships",
    "understanding",
    "programs",
    "plans",
    "expertise",
    "partnerships",
    "initiatives",
  ],
  maintain: [
    "standards",
    "quality",
    "balance",
    "relationships",
    "health",
    "growth",
    "stability",
    "productivity",
    "communication",
    "discipline",
  ],
  achieve: [
    "goals",
    "objectives",
    "success",
    "results",
    "growth",
    "balance",
    "improvement",
    "equality",
    "sustainability",
    "efficiency",
  ],
  support: [
    "learning",
    "growth",
    "development",
    "initiatives",
    "students",
    "teams",
    "families",
    "communities",
    "decisions",
    "innovation",
  ],
  promote: [
    "learning",
    "growth",
    "health",
    "equality",
    "collaboration",
    "innovation",
    "sustainability",
    "awareness",
    "development",
    "wellbeing",
  ],
  address: [
    "issues",
    "concerns",
    "challenges",
    "problems",
    "needs",
    "inequality",
    "barriers",
    "gaps",
    "risks",
    "demands",
  ],
};

const NOUN_VERB_COLLOCATIONS: Record<string, string[]> = {
  productivity: ["improve", "increase", "enhance", "boost", "maintain", "raise", "maximize"],
  communication: ["improve", "enhance", "facilitate", "strengthen", "maintain", "promote", "support"],
  performance: ["improve", "enhance", "boost", "maintain", "measure", "monitor", "maximize"],
  efficiency: ["improve", "increase", "enhance", "boost", "maintain", "maximize", "optimize"],
  learning: ["improve", "enhance", "support", "promote", "facilitate", "encourage", "accelerate"],
  innovation: ["promote", "encourage", "support", "foster", "drive", "stimulate", "accelerate"],
  collaboration: ["improve", "enhance", "promote", "encourage", "facilitate", "strengthen", "support"],
  wellbeing: ["improve", "enhance", "promote", "support", "protect", "maintain", "prioritize"],
  sustainability: ["promote", "improve", "enhance", "support", "achieve", "maintain", "prioritize"],
  engagement: ["improve", "increase", "enhance", "boost", "maintain", "promote", "encourage"],
};

function normalizePhrase(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, " ");
}

function extractPartner(
  anchor: string,
  anchorType: "verb" | "noun",
  answer: string,
): string {
  const normalized = normalizePhrase(answer);
  const anchorLower = anchor.toLowerCase();

  if (anchorType === "verb") {
    if (normalized.startsWith(`${anchorLower} `)) {
      return normalized.slice(anchorLower.length + 1);
    }
    return normalized;
  }

  if (normalized.endsWith(` ${anchorLower}`)) {
    return normalized.slice(0, -(anchorLower.length + 1));
  }
  return normalized;
}

function looksLikeAdverb(partner: string): boolean {
  return /\b\w+ly\b/.test(partner) && !partner.includes(" ");
}

function buildExplanation(
  anchor: string,
  anchorType: "verb" | "noun",
  partner: string,
  correct: boolean,
): string {
  if (correct) {
    return anchorType === "verb"
      ? `Natural verb + noun pairing with ${anchor}.`
      : `Strong verb that commonly pairs with ${anchor}.`;
  }

  if (looksLikeAdverb(partner)) {
    return "This pairs an adverb, not a noun/verb collocation — try a concrete noun after the verb.";
  }

  return anchorType === "verb"
    ? `Uncommon pairing — try a high-frequency noun such as ${anchor.toLowerCase()} ${(VERB_NOUN_COLLOCATIONS[anchor.toLowerCase()] ?? ["quality"])[0]}.`
    : `Less common pairing — try verbs such as ${(NOUN_VERB_COLLOCATIONS[anchor.toLowerCase()] ?? ["improve"])[0]} ${anchor.toLowerCase()}.`;
}

function submittedPartners(
  anchor: string,
  anchorType: "verb" | "noun",
  answers: string[],
): Set<string> {
  return new Set(answers.map((answer) => extractPartner(anchor, anchorType, answer)));
}

const TOPIC_OPENERS: Record<string, string> = {
  Education: "In contemporary education systems",
  Technology: "Across the technology industry",
  Environment: "When addressing environmental policy",
  Health: "In public health debates",
  "Working From Home": "In discussions about remote work",
  "Social Media": "In essays about social media",
};

function uniqueCollocations(collocations: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const entry of collocations) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }
  return unique;
}

export function buildCollocationTopicExamplesLocally(
  collocations: string[],
): CollocationTopicExamples[] {
  const phrases = uniqueCollocations(collocations).slice(0, 6);
  if (phrases.length === 0) return [];

  return COLLOCATION_ESSAY_TOPICS.map((topic) => ({
    topic,
    sentences: phrases.slice(0, 2).map((collocation) => {
      const opener = TOPIC_OPENERS[topic] ?? `In ${topic.toLowerCase()} essays`;
      return {
        collocation,
        sentence: `${opener}, policymakers often need to ${collocation.toLowerCase()} to support long-term progress.`,
      };
    }),
  }));
}

export function isValidCollocationTopicExamples(
  value: unknown,
): value is CollocationTopicExamples[] {
  if (!Array.isArray(value)) return false;
  return value.every((group) => {
    if (!group || typeof group !== "object") return false;
    const entry = group as CollocationTopicExamples;
    return (
      typeof entry.topic === "string" &&
      Array.isArray(entry.sentences) &&
      entry.sentences.every(
        (item) =>
          item &&
          typeof item.collocation === "string" &&
          typeof item.sentence === "string",
      )
    );
  });
}

function collocationsForExamples(
  answers: string[],
  missingCollocations: string[],
): string[] {
  return uniqueCollocations([...answers, ...missingCollocations]).slice(0, 8);
}

export function evaluateCollocationsLocally(
  anchor: string,
  anchorType: "verb" | "noun",
  answers: string[],
): CollocationEvaluateResult {
  const anchorKey = anchor.toLowerCase();
  const known =
    anchorType === "verb"
      ? VERB_NOUN_COLLOCATIONS[anchorKey] ?? []
      : NOUN_VERB_COLLOCATIONS[anchorKey] ?? [];

  const results = answers.map((answer) => {
    const partner = extractPartner(anchor, anchorType, answer);
    const correct = known.includes(partner);
    return {
      phrase: answer.trim(),
      correct,
      explanation: buildExplanation(anchor, anchorType, partner, correct),
    };
  });

  const correctCount = results.filter((item) => item.correct).length;
  const found = submittedPartners(anchor, anchorType, answers);
  const missingCollocations = known
    .filter((item) => !found.has(item))
    .slice(0, 6)
    .map((item) =>
      anchorType === "verb"
        ? `${anchor.toLowerCase()} ${item}`
        : `${item} ${anchor.toLowerCase()}`,
    );

  const teachingSummary =
    correctCount === results.length
      ? `Strong recall for ${anchor}. Add a few more common pairings from the list below.`
      : `Focus on natural ${anchorType === "verb" ? "verb + noun" : "verb + noun"} pairings — collocations are learned as fixed phrases, not word by word.`;

  return {
    results,
    correctCount,
    totalCount: results.length,
    missingCollocations,
    teachingSummary,
    topicExamples: buildCollocationTopicExamplesLocally(
      collocationsForExamples(answers, missingCollocations),
    ),
  };
}

export function isValidCollocationResult(value: unknown): value is CollocationEvaluateResult {
  if (!value || typeof value !== "object") return false;
  const data = value as CollocationEvaluateResult;
  return (
    Array.isArray(data.results) &&
    typeof data.correctCount === "number" &&
    typeof data.totalCount === "number" &&
    Array.isArray(data.missingCollocations)
  );
}
