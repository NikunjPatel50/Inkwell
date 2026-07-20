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

export const DNA_DIMENSION_LABELS: Record<DnaDimension, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  clarity: "Clarity",
  structure: "Structure",
  flow: "Flow",
  style: "Style",
  confidence: "Confidence",
  consistency: "Consistency",
};

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

export interface WritingDnaProfile {
  user_id: string;
  dna_score: number;
  personality: string | null;
  personality_badge: string | null;
  dimensions: WritingDnaDimensions;
  insights: string[];
  streak_current: number;
  streak_best: number;
  total_words: number;
  total_sessions: number;
  last_submission_at: string | null;
  updated_at: string;
}

export interface WritingDnaSession {
  id: string;
  created_at: string;
  source_tool: "write" | "coach" | "pte";
  word_count: number;
  unique_words: number;
  dna_score: number;
  metrics: WritingDnaMetrics;
  dimensions: WritingDnaDimensions;
  personality: string | null;
  personality_badge: string | null;
  insights: string[];
  original_text?: string;
}

export interface WritingDnaVocabItem {
  word: string;
  frequency: number;
  cefr_level: string | null;
  difficulty: string | null;
  last_used: string;
  first_used: string;
}

export interface GrammarHeatmapCell {
  category: string;
  label: string;
  mistakeCount: number;
  sessionHits: number;
  lastSeen: string | null;
}

export interface WritingDnaGoal {
  id: string;
  goal_type: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WritingDnaAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface WritingDnaWeeklyReport {
  week_start: string;
  report: {
    biggestImprovement: string;
    biggestWeakness: string;
    exercises: string[];
    wordsToLearn: string[];
    grammarTopic: string;
    estimatedProgress: string;
  };
  created_at: string;
}

export interface WritingDnaCalendarDay {
  date: string;
  words: number;
  sessions: number;
}

export interface WritingDnaDashboard {
  profile: WritingDnaProfile | null;
  sessions: WritingDnaSession[];
  sessionPagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
  vocabulary: {
    items: WritingDnaVocabItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    };
    mostUsed: WritingDnaVocabItem[];
    rareWords: WritingDnaVocabItem[];
    academicWords: WritingDnaVocabItem[];
    businessWords: WritingDnaVocabItem[];
    newThisMonth: number;
  };
  grammarHeatmap: GrammarHeatmapCell[];
  goals: WritingDnaGoal[];
  achievements: WritingDnaAchievement[];
  weeklyReports: WritingDnaWeeklyReport[];
  monthlyReports: Array<{
    month_start: string;
    report: Record<string, unknown>;
    created_at: string;
  }>;
  streak: {
    current: number;
    best: number;
    wordsToday: number;
    wordsWeek: number;
    wordsMonth: number;
    wordsYear: number;
  };
  calendar: WritingDnaCalendarDay[];
  progress: {
    weeklyScores: Array<{ week: string; score: number }>;
    monthlyScores: Array<{
      date: string;
      score: number;
      grammar: number;
      vocabulary: number;
    }>;
    scoreHistory: Array<{ created_at: string; dna_score: number }>;
  };
  fingerprint?: string;
}

export const GOAL_PRESETS = [
  { goalType: "daily_words", title: "Write 500 words daily", targetValue: 500, unit: "words" },
  { goalType: "grammar_score", title: "Reach Grammar Score 95", targetValue: 95, unit: "score" },
  { goalType: "passive_voice", title: "Reduce passive voice below 5%", targetValue: 5, unit: "%" },
  { goalType: "new_words", title: "Learn 20 new words", targetValue: 20, unit: "words" },
  { goalType: "streak", title: "Finish 7-day streak", targetValue: 7, unit: "days" },
] as const;
