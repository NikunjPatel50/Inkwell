import type { InsForgeClient } from "@insforge/sdk";
import { insforge } from "./insforge";
import { ensureInsforgeUserSession } from "./insforgeAuth";
import {
  ACHIEVEMENT_DEFS,
  GRAMMAR_HEATMAP_CATEGORIES,
  analyzeWritingDnaMetrics,
  checkAchievements,
  computeDnaScore,
  estimateCefr,
  generateInsights,
  inferPersonality,
  type GrammarMistakeEntry,
  type WritingDnaDimensions,
  type WritingDnaMetrics,
} from "./writingDnaAnalysis";
import type {
  GrammarHeatmapCell,
  WritingDnaAchievement,
  WritingDnaCalendarDay,
  WritingDnaDashboard,
  WritingDnaDimensions as DashboardDimensions,
  WritingDnaGoal,
  WritingDnaProfile,
  WritingDnaSession,
  WritingDnaVocabItem,
  WritingDnaWeeklyReport,
} from "../types/writingDna";

const SESSION_PAGE_SIZE = 20;
const VOCAB_PAGE_SIZE = 30;

let activeClient: InsForgeClient = insforge;

function database() {
  return activeClient.database;
}

export async function runWithInsforgeClient<T>(
  client: InsForgeClient,
  fn: () => Promise<T>,
): Promise<T> {
  const previous = activeClient;
  activeClient = client;
  try {
    return await fn();
  } finally {
    activeClient = previous;
  }
}

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

function tokenizeWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function formatCategoryLabel(category: string): string {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function syntheticErrors(errorCount: number): Array<{ issue: string; explanation: string }> {
  return Array.from({ length: errorCount }, (_, index) => ({
    issue: `Grammar issue ${index + 1}`,
    explanation: "Flagged during a previous analysis session.",
  }));
}

function mapSession(row: Record<string, unknown>): WritingDnaSession {
  return {
    id: String(row.id),
    created_at: String(row.created_at),
    source_tool: row.source_tool as WritingDnaSession["source_tool"],
    word_count: Number(row.word_count ?? 0),
    unique_words: Number(row.unique_words ?? 0),
    dna_score: Number(row.dna_score ?? 0),
    metrics: row.metrics as WritingDnaSession["metrics"],
    dimensions: row.dimensions as DashboardDimensions,
    personality: (row.personality as string) ?? null,
    personality_badge: (row.personality_badge as string) ?? null,
    insights: Array.isArray(row.insights) ? (row.insights as string[]) : [],
    original_text: (row.original_text as string) ?? undefined,
  };
}

function mapProfile(row: Record<string, unknown> | null): WritingDnaProfile | null {
  if (!row) return null;
  return {
    user_id: String(row.user_id),
    dna_score: Number(row.dna_score ?? 0),
    personality: (row.personality as string) ?? null,
    personality_badge: (row.personality_badge as string) ?? null,
    dimensions: row.dimensions as DashboardDimensions,
    insights: Array.isArray(row.insights) ? (row.insights as string[]) : [],
    streak_current: Number(row.streak_current ?? 0),
    streak_best: Number(row.streak_best ?? 0),
    total_words: Number(row.total_words ?? 0),
    total_sessions: Number(row.total_sessions ?? 0),
    last_submission_at: (row.last_submission_at as string) ?? null,
    updated_at: String(row.updated_at),
  };
}

function buildCalendar(sessions: Array<{ created_at: string; word_count: number }>): WritingDnaCalendarDay[] {
  const byDay = new Map<string, { words: number; sessions: number }>();
  for (const session of sessions) {
    const day = session.created_at.slice(0, 10);
    const existing = byDay.get(day) ?? { words: 0, sessions: 0 };
    existing.words += session.word_count ?? 0;
    existing.sessions += 1;
    byDay.set(day, existing);
  }
  return [...byDay.entries()]
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateDailyScores(
  sessions: Array<{ created_at: string; dna_score: number; dimensions: unknown }>,
): Array<{ date: string; score: number; grammar: number; vocabulary: number }> {
  const byDay = new Map<string, { scores: number[]; grammar: number[]; vocabulary: number[] }>();

  for (const session of sessions) {
    const date = session.created_at.slice(0, 10);
    const bucket = byDay.get(date) ?? { scores: [], grammar: [], vocabulary: [] };
    bucket.scores.push(session.dna_score);
    bucket.grammar.push((session.dimensions as { grammar?: number })?.grammar ?? 0);
    bucket.vocabulary.push((session.dimensions as { vocabulary?: number })?.vocabulary ?? 0);
    byDay.set(date, bucket);
  }

  return [...byDay.entries()]
    .map(([date, bucket]) => ({
      date,
      score: Math.round(bucket.scores.reduce((sum, value) => sum + value, 0) / bucket.scores.length),
      grammar: Math.round(bucket.grammar.reduce((sum, value) => sum + value, 0) / bucket.grammar.length),
      vocabulary: Math.round(
        bucket.vocabulary.reduce((sum, value) => sum + value, 0) / bucket.vocabulary.length,
      ),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateWeeklyScores(
  sessions: Array<{ created_at: string; dna_score: number }>,
): Array<{ week: string; score: number }> {
  const buckets = new Map<string, number[]>();
  for (const session of sessions) {
    const date = new Date(session.created_at);
    const week = `${date.getUTCFullYear()}-W${String(Math.ceil(date.getUTCDate() / 7)).padStart(2, "0")}`;
    const list = buckets.get(week) ?? [];
    list.push(session.dna_score);
    buckets.set(week, list);
  }
  return [...buckets.entries()]
    .map(([week, scores]) => ({
      week,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .slice(-8);
}

export function buildWritingFingerprint(
  profile: WritingDnaProfile | null,
  sessions: WritingDnaSession[],
): string {
  const personality = profile?.personality ?? sessions[0]?.personality ?? "Writer";
  const score = profile?.dna_score ?? sessions[0]?.dna_score ?? 0;
  const slug = personality.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const sessionCount = profile?.total_sessions ?? sessions.length;
  return `DNA-${slug}-${score}-${sessionCount}`;
}

async function upsertVocabulary(userId: string, text: string): Promise<void> {
  const words = [...new Set(tokenizeWords(text).filter((w) => w.length > 2))];
  if (words.length === 0) return;

  const now = new Date().toISOString();

  for (const word of words) {
    const { data: existing } = await database()
      .from("writing_dna_vocabulary")
      .select("id, frequency")
      .eq("user_id", userId)
      .eq("word", word)
      .maybeSingle();

    if (existing?.id) {
      await database()
        .from("writing_dna_vocabulary")
        .update({ frequency: (existing.frequency ?? 0) + 1, last_used: now })
        .eq("id", existing.id);
    } else {
      await database().from("writing_dna_vocabulary").insert([
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

async function upsertGrammarStats(userId: string, mistakes: GrammarMistakeEntry[]): Promise<void> {
  const counts = new Map<string, number>();
  for (const mistake of mistakes) {
    counts.set(mistake.category, (counts.get(mistake.category) ?? 0) + 1);
  }

  const now = new Date().toISOString();

  for (const [category, count] of counts) {
    const { data: existing } = await database()
      .from("writing_dna_grammar_stats")
      .select("id, mistake_count, session_hits")
      .eq("user_id", userId)
      .eq("category", category)
      .maybeSingle();

    if (existing?.id) {
      await database()
        .from("writing_dna_grammar_stats")
        .update({
          mistake_count: (existing.mistake_count ?? 0) + count,
          session_hits: (existing.session_hits ?? 0) + 1,
          last_seen: now,
        })
        .eq("id", existing.id);
    } else {
      await database().from("writing_dna_grammar_stats").insert([
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

async function loadProfile(userId: string) {
  const { data } = await database()
    .from("writing_dna_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

function computeStreak(
  profile: { last_submission_at?: string | null; streak_current?: number; streak_best?: number } | null,
  today: string,
): { current: number; best: number } {
  const previousCurrent = profile?.streak_current ?? 0;
  const previousBest = profile?.streak_best ?? 0;

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

async function unlockAchievements(userId: string, achievementIds: string[]): Promise<void> {
  if (achievementIds.length === 0) return;

  const { data: existing } = await database()
    .from("writing_dna_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const existingIds = new Set((existing ?? []).map((row) => row.achievement_id));
  const toInsert = achievementIds
    .filter((id) => !existingIds.has(id))
    .map((achievement_id) => ({ user_id: userId, achievement_id }));

  if (toInsert.length > 0) {
    await database().from("writing_dna_achievements").insert(toInsert);
  }
}

async function updateGoals(
  userId: string,
  metrics: WritingDnaMetrics,
  dimensions: WritingDnaDimensions,
  streakCurrent: number,
): Promise<void> {
  const { data: goals } = await database()
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

    await database()
      .from("writing_dna_goals")
      .update({ current_value: current, completed, updated_at: now })
      .eq("id", goal.id);
  }
}

function buildWeeklyReport(
  sessions: Array<{ dna_score: number; metrics: WritingDnaMetrics; dimensions: WritingDnaDimensions }>,
): WritingDnaWeeklyReport["report"] {
  if (sessions.length === 0) {
    return {
      biggestImprovement: "Submit your first piece to start your weekly coach report.",
      biggestWeakness: "Not enough data yet.",
      exercises: [
        "Write 150 words on a topic you care about.",
        "Revise one paragraph for clarity.",
        "Replace three weak verbs.",
      ],
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
    wordsToLearn: ["therefore", "demonstrate", "nuanced", "coherent", "precise"],
    grammarTopic: weakest.includes("grammar") ? "verb tense consistency" : "transition quality",
    estimatedProgress: `${Math.round(sessions.reduce((sum, s) => sum + s.dna_score, 0) / sessions.length)}% DNA score average`,
  };
}

async function ensureReports(userId: string): Promise<void> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const { data: weekSessions } = await database()
    .from("writing_dna_sessions")
    .select("dna_score, metrics, dimensions")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());

  const { data: existingWeek } = await database()
    .from("writing_dna_weekly_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!existingWeek?.id && (weekSessions?.length ?? 0) > 0) {
    await database().from("writing_dna_weekly_reports").insert([
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

  const { data: monthSessions } = await database()
    .from("writing_dna_sessions")
    .select("dna_score, word_count")
    .eq("user_id", userId)
    .gte("created_at", monthAgo.toISOString());

  const { data: existingMonth } = await database()
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

    await database().from("writing_dna_monthly_reports").insert([
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

export async function persistWritingDnaSession(
  userId: string,
  input: PersistWritingDnaInput,
  options: { skipAuthCheck?: boolean } = {},
): Promise<{ dnaScore: number; sessionId: string | null }> {
  if (!options.skipAuthCheck) {
    ensureInsforgeUserSession(userId);
  }

  const text = input.text.trim();
  if (!text) return { dnaScore: 0, sessionId: null };

  if (input.analyzedSentenceId) {
    const { data: existing } = await database()
      .from("writing_dna_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("analyzed_sentence_id", input.analyzedSentenceId)
      .maybeSingle();
    if (existing?.id) {
      return { dnaScore: 0, sessionId: existing.id };
    }
  }

  const errors = input.errors ?? [];
  const registerScore = input.registerScore ?? 50;
  const { metrics, dimensions, grammarMistakes } = analyzeWritingDnaMetrics(text, errors, registerScore);

  const profile = await loadProfile(userId);
  const previousAvg =
    profile?.dimensions && typeof profile.dimensions === "object"
      ? (profile.dimensions as WritingDnaDimensions).vocabulary ?? null
      : null;

  const insights = generateInsights(metrics, dimensions, previousAvg);
  const { personality, personalityBadge } = inferPersonality(metrics, dimensions);
  const dnaScore = computeDnaScore(dimensions);
  const today = utcDateKey(new Date());
  const streak = computeStreak(profile, today);
  const totalWords = Number(profile?.total_words ?? 0) + metrics.wordCount;
  const totalSessions = Number(profile?.total_sessions ?? 0) + 1;
  const now = new Date().toISOString();

  const { data: sessionRow, error: sessionError } = await database()
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

  if (sessionError) {
    throw new Error(sessionError.message ?? "Could not save Writing DNA session.");
  }

  await upsertVocabulary(userId, text);
  await upsertGrammarStats(userId, grammarMistakes);

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
    const { error } = await database()
      .from("writing_dna_profiles")
      .update(profilePayload)
      .eq("user_id", userId);
    if (error) throw new Error(error.message ?? "Could not update Writing DNA profile.");
  } else {
    const { error } = await database().from("writing_dna_profiles").insert([profilePayload]);
    if (error) throw new Error(error.message ?? "Could not create Writing DNA profile.");
  }

  await unlockAchievements(
    userId,
    checkAchievements(dimensions, metrics, personality, streak.best, totalWords, errors.length),
  );
  await updateGoals(userId, metrics, dimensions, streak.current);
  await ensureReports(userId);

  return { dnaScore, sessionId: sessionRow?.id ?? null };
}

async function linkLatestAnalyzedSentence(userId: string, text: string): Promise<string | null> {
  const { data } = await database()
    .from("analyzed_sentences")
    .select("id, original_text")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.id || data.original_text?.trim() !== text.trim()) return null;
  return data.id;
}

export async function backfillWritingDnaFromHistory(
  userId: string,
  options: { skipAuthCheck?: boolean } = {},
): Promise<number> {
  if (!options.skipAuthCheck) {
    ensureInsforgeUserSession(userId);
  }

  const { data: existingSessions } = await database()
    .from("writing_dna_sessions")
    .select("analyzed_sentence_id")
    .eq("user_id", userId);

  const linkedIds = new Set(
    (existingSessions ?? [])
      .map((row) => row.analyzed_sentence_id)
      .filter((id): id is string => Boolean(id)),
  );

  const { data: sentences, error } = await database()
    .from("analyzed_sentences")
    .select("id, original_text, register_score, error_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message ?? "Could not load analyzed sentences for backfill.");
  }

  let created = 0;
  for (const sentence of sentences ?? []) {
    if (linkedIds.has(sentence.id)) continue;
    await persistWritingDnaSession(
      userId,
      {
        text: sentence.original_text,
        sourceTool: "write",
        errors: syntheticErrors(sentence.error_count ?? 0),
        registerScore: sentence.register_score ?? 50,
        analyzedSentenceId: sentence.id,
      },
      { skipAuthCheck: options.skipAuthCheck },
    );
    created += 1;
  }

  return created;
}

export async function loadWritingDnaDashboard(
  userId: string,
  options: { sessionPage?: number; vocabPage?: number; skipBackfill?: boolean; skipAuthCheck?: boolean } = {},
): Promise<WritingDnaDashboard> {
  if (!options.skipAuthCheck) {
    ensureInsforgeUserSession(userId);
  }

  const sessionPage = options.sessionPage ?? 0;
  const vocabPage = options.vocabPage ?? 0;

  const { count: sessionCount } = await database()
    .from("writing_dna_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!options.skipBackfill && (sessionCount ?? 0) === 0) {
    await backfillWritingDnaFromHistory(userId, { skipAuthCheck: options.skipAuthCheck });
  }

  const sessionFrom = sessionPage * SESSION_PAGE_SIZE;
  const vocabFrom = vocabPage * VOCAB_PAGE_SIZE;
  const yearAgo = new Date();
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);

  const [
    profileResult,
    sessionsResult,
    sessionCountResult,
    vocabResult,
    vocabCountResult,
    grammarResult,
    goalsResult,
    achievementsResult,
    weeklyReportResult,
    monthlyReportResult,
    calendarResult,
  ] = await Promise.all([
    database().from("writing_dna_profiles").select("*").eq("user_id", userId).maybeSingle(),
    database()
      .from("writing_dna_sessions")
      .select(
        "id, created_at, source_tool, word_count, unique_words, dna_score, metrics, dimensions, personality, personality_badge, insights, original_text",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(sessionFrom, sessionFrom + SESSION_PAGE_SIZE - 1),
    database()
      .from("writing_dna_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    database()
      .from("writing_dna_vocabulary")
      .select("word, frequency, cefr_level, difficulty, last_used, first_used")
      .eq("user_id", userId)
      .order("frequency", { ascending: false })
      .range(vocabFrom, vocabFrom + VOCAB_PAGE_SIZE - 1),
    database()
      .from("writing_dna_vocabulary")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    database()
      .from("writing_dna_grammar_stats")
      .select("category, mistake_count, session_hits, last_seen")
      .eq("user_id", userId)
      .order("mistake_count", { ascending: false }),
    database()
      .from("writing_dna_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    database()
      .from("writing_dna_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false }),
    database()
      .from("writing_dna_weekly_reports")
      .select("week_start, report, created_at")
      .eq("user_id", userId)
      .order("week_start", { ascending: false })
      .limit(4),
    database()
      .from("writing_dna_monthly_reports")
      .select("month_start, report, created_at")
      .eq("user_id", userId)
      .order("month_start", { ascending: false })
      .limit(6),
    database()
      .from("writing_dna_sessions")
      .select("created_at, word_count")
      .eq("user_id", userId)
      .gte("created_at", yearAgo.toISOString()),
  ]);

  const sessions = (sessionsResult.data ?? []).map((row) => mapSession(row as Record<string, unknown>));
  const profile = mapProfile((profileResult.data as Record<string, unknown>) ?? null);

  const grammarHeatmap: GrammarHeatmapCell[] = GRAMMAR_HEATMAP_CATEGORIES.map((category) => {
    const row = (grammarResult.data ?? []).find((entry) => entry.category === category);
    return {
      category,
      label: formatCategoryLabel(category),
      mistakeCount: row?.mistake_count ?? 0,
      sessionHits: row?.session_hits ?? 0,
      lastSeen: row?.last_seen ?? null,
    };
  });

  const unlockedIds = new Set((achievementsResult.data ?? []).map((a) => a.achievement_id));
  const achievements: WritingDnaAchievement[] = ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: unlockedIds.has(def.id),
    unlockedAt:
      achievementsResult.data?.find((a) => a.achievement_id === def.id)?.unlocked_at ?? null,
  }));

  const calendar = buildCalendar(calendarResult.data ?? []);
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = calendar.find((day) => day.date === today) ?? { words: 0, sessions: 0 };

  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const monthStart = new Date();
  monthStart.setUTCMonth(monthStart.getUTCMonth() - 1);

  const weekWords = calendar
    .filter((day) => day.date >= weekStart.toISOString().slice(0, 10))
    .reduce((sum, day) => sum + day.words, 0);
  const monthWords = calendar
    .filter((day) => day.date >= monthStart.toISOString().slice(0, 10))
    .reduce((sum, day) => sum + day.words, 0);
  const yearWords = calendar.reduce((sum, day) => sum + day.words, 0);

  const { data: scoreSessions } = await database()
    .from("writing_dna_sessions")
    .select("created_at, dna_score, dimensions")
    .eq("user_id", userId)
    .gte("created_at", monthStart.toISOString())
    .order("created_at", { ascending: true });

  const weeklyScores = aggregateWeeklyScores(scoreSessions ?? []);
  const monthlyScores = aggregateDailyScores(scoreSessions ?? []);

  const vocabulary = (vocabResult.data ?? []) as WritingDnaVocabItem[];
  const monthVocabStart = monthStart.toISOString();
  const newVocabThisMonth = vocabulary.filter(
    (word) => word.first_used && word.first_used >= monthVocabStart,
  ).length;

  return {
    profile,
    sessions,
    sessionPagination: {
      page: sessionPage,
      pageSize: SESSION_PAGE_SIZE,
      total: sessionCountResult.count ?? 0,
      hasMore: sessionFrom + SESSION_PAGE_SIZE < (sessionCountResult.count ?? 0),
    },
    vocabulary: {
      items: vocabulary,
      pagination: {
        page: vocabPage,
        pageSize: VOCAB_PAGE_SIZE,
        total: vocabCountResult.count ?? 0,
        hasMore: vocabFrom + VOCAB_PAGE_SIZE < (vocabCountResult.count ?? 0),
      },
      mostUsed: vocabulary.slice(0, 8),
      rareWords: [...vocabulary].sort((a, b) => a.frequency - b.frequency).slice(0, 8),
      academicWords: vocabulary.filter((w) => w.difficulty === "advanced").slice(0, 8),
      businessWords: vocabulary.filter((w) => (w.frequency ?? 0) >= 2).slice(0, 8),
      newThisMonth: newVocabThisMonth,
    },
    grammarHeatmap,
    goals: (goalsResult.data ?? []) as WritingDnaGoal[],
    achievements,
    weeklyReports: (weeklyReportResult.data ?? []) as WritingDnaWeeklyReport[],
    monthlyReports: (monthlyReportResult.data ?? []) as WritingDnaDashboard["monthlyReports"],
    streak: {
      current: profile?.streak_current ?? 0,
      best: profile?.streak_best ?? 0,
      wordsToday: todayStats.words,
      wordsWeek: weekWords,
      wordsMonth: monthWords,
      wordsYear: yearWords,
    },
    calendar,
    progress: {
      weeklyScores,
      monthlyScores,
      scoreHistory: (scoreSessions ?? []).map((session) => ({
        created_at: session.created_at,
        dna_score: session.dna_score,
      })),
    },
    fingerprint: buildWritingFingerprint(profile, sessions),
  };
}

export async function createWritingDnaGoalRecord(
  userId: string,
  goal: { goalType: string; title: string; targetValue: number; unit?: string },
): Promise<WritingDnaGoal> {
  ensureInsforgeUserSession(userId);

  const { data, error } = await database()
    .from("writing_dna_goals")
    .insert([
      {
        user_id: userId,
        goal_type: goal.goalType,
        title: goal.title,
        target_value: goal.targetValue,
        current_value: 0,
        unit: goal.unit ?? "",
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create goal.");
  }

  return data as WritingDnaGoal;
}

export async function deleteWritingDnaGoalRecord(userId: string, goalId: string): Promise<void> {
  ensureInsforgeUserSession(userId);

  const { error } = await database()
    .from("writing_dna_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message ?? "Could not delete goal.");
  }
}

export async function recordWritingDnaForUser(
  userId: string,
  payload: PersistWritingDnaInput,
): Promise<{ dnaScore: number; sessionId: string | null }> {
  const analyzedSentenceId =
    payload.analyzedSentenceId ?? (await linkLatestAnalyzedSentence(userId, payload.text));
  return persistWritingDnaSession(userId, { ...payload, analyzedSentenceId });
}
