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
