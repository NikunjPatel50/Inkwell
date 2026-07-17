export interface ErrorExample {
  before: string;
  after: string;
}

export interface TeachingNote {
  why: string;
  principle: string;
  example: ErrorExample;
}

export interface WritingError {
  issue: string;
  explanation: string;
  teaching?: TeachingNote;
}

export type Verdict = "fixed" | "partial" | "missed";

export interface CorrectedItem {
  issue: string;
  userAttempt: string;
  verdict: Verdict;
  hint: string;
}

export interface CorrectionResult {
  score: number;
  corrected: CorrectedItem[];
  encouragement: string;
}

export type SelfCorrectionPhase = "hidden" | "active" | "completed" | "skipped";

export interface LadderResult {
  simple: string;
  intermediate: string;
  intermediateTechnique: string;
  advanced: string;
  advancedTechnique: string;
  toneDriftNote?: string;
}

export interface AnalysisResult extends LadderResult {
  errors: WritingError[];
  registerScore: number;
  vocabularyCatch?: VocabularyItem[];
}

export type Tone = "neutral" | "formal" | "casual";

export type AdjustedTone = Exclude<Tone, "neutral">;

export const TONES: { value: Tone; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
];

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export type AppTab =
  | "dashboard"
  | "learn"
  | "grammar"
  | "vocabulary"
  | "write"
  | "coach"
  | "history";

export const APP_TABS: { id: AppTab; label: string; description: string }[] = [
  { id: "dashboard", label: "Dashboard", description: "Practice overview and quick actions" },
  { id: "learn", label: "Learn", description: "Adaptive curriculum and skill exercises" },
  { id: "grammar", label: "Grammar", description: "In-context grammar lessons and exercises" },
  { id: "vocabulary", label: "Vocabulary", description: "Words learned through real sentences" },
  { id: "write", label: "Write", description: "Analyse drafts with grammar feedback and rewrites" },
  { id: "coach", label: "AI Writing Coach", description: "Learn how to write with guided coaching levels" },
  { id: "history", label: "History", description: "Session history and progress tracking" },
];

export interface VocabularyItem {
  word: string;
  definition: string;
  sourceSentence: string;
}

export interface VocabularyWordRow {
  id: string;
  word: string;
  definition: string;
  source_sentence: string;
  created_at: string;
}

export interface AnalyzedSentenceRow {
  id: string;
  created_at: string;
  original_text: string;
  register_score: number;
  simple_version: string;
  intermediate_version: string;
  advanced_version: string;
  error_count: number;
}

export interface SkillPatternRow {
  id: string;
  category: string;
  occurrence_count: number;
  last_seen_at: string;
}

export interface HistoryResponse {
  sentences: AnalyzedSentenceRow[];
  skillPatterns: SkillPatternRow[];
  sentencesToday: number;
}

export interface VocabularyResponse {
  words: VocabularyWordRow[];
}

export type ToneCache = Partial<Record<AdjustedTone, LadderResult>>;

export interface DuelSentence {
  sentence: string;
  flaw: string;
}

export type DuelVerdict = "user" | "ai" | "tie";

export interface DuelResult {
  aiRewrite: string;
  verdict: DuelVerdict;
  judgment: string;
  takeaway: string;
}

export const EMOTION_KEYS = [
  "hopeful",
  "melancholic",
  "tense",
  "ironic",
  "nostalgic",
  "urgent",
] as const;

export type EmotionKey = (typeof EMOTION_KEYS)[number];

export type EmotionRewrites = Record<EmotionKey, string>;
export type EmotionTechniques = Record<EmotionKey, string>;

export interface EmotionRewriteResult {
  emotions: EmotionRewrites;
  techniques: EmotionTechniques;
}

export const EMOTION_LABELS: Record<EmotionKey, string> = {
  hopeful: "Hopeful",
  melancholic: "Melancholic",
  tense: "Tense",
  ironic: "Ironic",
  nostalgic: "Nostalgic",
  urgent: "Urgent",
};

export type Tier = 1 | 2 | 3;

export type ExerciseType = "build-it" | "spot-error" | "complete-it";

export interface Skill {
  id: string;
  name: string;
  tier: Tier;
  description: string;
}

export interface BuildItExercise {
  words: string[];
  correctOrder: string[];
  explanation: string;
}

export interface SpotTheErrorExercise {
  sentence: string;
  errorWord: string;
  errorIndex: number;
  correction: string;
  principle: string;
}

export interface CompleteItExercise {
  stem: string;
  hint: string;
}

export interface CompleteItCheckResult {
  correct: boolean;
  feedback: string;
  exampleCompletion: string;
  principle: string;
}

export interface ExerciseResult {
  score: number;
  exerciseType: ExerciseType;
}

export interface PracticedSkill {
  skillId: string;
  exercisesCompleted: number;
  averageScore: number;
  lastPracticedAt?: string;
}

export interface PracticedSkillRow extends PracticedSkill {
  id: string;
}

export interface PracticedSkillsResponse {
  skills: PracticedSkillRow[];
}

export interface AdaptiveRecommendation {
  skillId: string;
  reason: string;
}

export function ladderFromAnalysis(result: AnalysisResult): LadderResult {
  return {
    simple: result.simple,
    intermediate: result.intermediate,
    intermediateTechnique: result.intermediateTechnique,
    advanced: result.advanced,
    advancedTechnique: result.advancedTechnique,
    toneDriftNote: result.toneDriftNote,
  };
}

// Grammar & Vocabulary learning

export interface IdentifyItExercise {
  sentence: string;
  targetPhrase: string;
  targetIndex: number;
  confirmation: string;
  hint: string;
  explanation: string;
}

export interface FillBlankExercise {
  stem: string;
  hint: string;
}

export interface FillBlankResult {
  correct: boolean;
  feedback: string;
  correctAnswer: string;
  explanation: string;
}

export interface TransformItExercise {
  originalSentence: string;
  prompt: string;
  modelAnswer: string;
}

export interface TransformItResult {
  correct: boolean;
  feedback: string;
  modelAnswer: string;
  explanation: string;
}

export interface UseItExercise {
  context: string;
  prompt: string;
}

export interface UseItResult {
  correct: boolean;
  feedback: string;
  exampleSentence: string;
  explanation: string;
}

export interface PickMeaningExercise {
  sentence: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WordForm {
  form: string;
  partOfSpeech: string;
  example: string;
}

export interface SynonymAntonym {
  word: string;
  note: string;
}

export interface WordDetailLevel1 {
  definition: string;
  examples: string[];
  mnemonic: string;
}

export interface WordDetailLevel2 {
  wordForms: WordForm[];
  synonyms: SynonymAntonym[];
  antonyms: SynonymAntonym[];
}

export interface WordDetailLevel3 {
  collocations: string[];
  register: string;
  commonMistake: string;
  usageContext: string;
}

export interface WordDetailLevel4 {
  etymology: string;
  connotation: string;
  nuanceComparison: string;
  famousUsage: string;
}

export interface WordDetail {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  level1: WordDetailLevel1;
  level2: WordDetailLevel2;
  level3: WordDetailLevel3;
  level4: WordDetailLevel4;
}

export interface WordPracticeFillBlank {
  sentence: string;
  answer: string;
}

export interface WordPracticeUseIt {
  prompt: string;
  register: string;
}

export interface WordPracticeExercise {
  fillBlank: WordPracticeFillBlank;
  useItYourself: WordPracticeUseIt;
}

export interface WordUsageResult {
  correct: boolean;
  feedback: string;
  exampleSentence: string;
}

export type CollectionQuizType = "identify" | "fill-blank" | "match";

export interface CollectionQuizItem {
  type: CollectionQuizType;
  question: string;
  answer: string;
  explanation: string;
  options?: string[];
}

export interface GrammarExerciseResult {
  label: string;
  passed: boolean;
  reviewNote: string;
}

