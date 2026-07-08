import type { AnalyzedSentenceRow, SkillPatternRow } from "../types";

export interface DailyActivityPoint {
  label: string;
  count: number;
  dateKey: string;
}

export interface RegisterTrendPoint {
  label: string;
  score: number;
}

export interface PatternSlice {
  label: string;
  value: number;
  color: string;
}

const PATTERN_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function buildDailyActivity(
  sentences: AnalyzedSentenceRow[],
  days = 7,
): DailyActivityPoint[] {
  const today = startOfDay(new Date());
  const buckets: DailyActivityPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const dateKey = day.toISOString().slice(0, 10);
    buckets.push({ label: formatDayLabel(day), count: 0, dateKey });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.dateKey, bucket]));

  for (const sentence of sentences) {
    const key = startOfDay(new Date(sentence.created_at)).toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (bucket) bucket.count += 1;
  }

  return buckets;
}

export function buildRegisterTrend(
  sentences: AnalyzedSentenceRow[],
  limit = 12,
): RegisterTrendPoint[] {
  const recent = [...sentences]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-limit);

  return recent.map((sentence, index) => ({
    label: `${index + 1}`,
    score: sentence.register_score,
  }));
}

export function buildPatternDistribution(
  skillPatterns: SkillPatternRow[],
  limit = 6,
): PatternSlice[] {
  const sorted = [...skillPatterns]
    .sort((a, b) => b.occurrence_count - a.occurrence_count)
    .slice(0, limit);

  return sorted.map((pattern, index) => ({
    label: pattern.category,
    value: pattern.occurrence_count,
    color: PATTERN_COLORS[index % PATTERN_COLORS.length],
  }));
}

export function computeRegisterDelta(sentences: AnalyzedSentenceRow[]): number | null {
  if (sentences.length < 2) return null;
  const sorted = [...sentences].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const recent = sorted.slice(-5);
  const prior = sorted.slice(-10, -5);
  if (recent.length === 0 || prior.length === 0) return null;

  const recentAvg = recent.reduce((sum, row) => sum + row.register_score, 0) / recent.length;
  const priorAvg = prior.reduce((sum, row) => sum + row.register_score, 0) / prior.length;
  return Math.round(recentAvg - priorAvg);
}

export const DEMO_ACTIVITY: DailyActivityPoint[] = [
  { label: "Mon", count: 2, dateKey: "demo-1" },
  { label: "Tue", count: 4, dateKey: "demo-2" },
  { label: "Wed", count: 1, dateKey: "demo-3" },
  { label: "Thu", count: 5, dateKey: "demo-4" },
  { label: "Fri", count: 3, dateKey: "demo-5" },
  { label: "Sat", count: 6, dateKey: "demo-6" },
  { label: "Sun", count: 4, dateKey: "demo-7" },
];

export const DEMO_REGISTER: RegisterTrendPoint[] = [
  { label: "1", score: 42 },
  { label: "2", score: 48 },
  { label: "3", score: 45 },
  { label: "4", score: 52 },
  { label: "5", score: 58 },
  { label: "6", score: 55 },
  { label: "7", score: 61 },
  { label: "8", score: 64 },
];

export const DEMO_PATTERNS: PatternSlice[] = [
  { label: "Tone", value: 12, color: PATTERN_COLORS[0] },
  { label: "Punctuation", value: 9, color: PATTERN_COLORS[1] },
  { label: "Word Choice", value: 7, color: PATTERN_COLORS[2] },
  { label: "Structure", value: 5, color: PATTERN_COLORS[3] },
];
