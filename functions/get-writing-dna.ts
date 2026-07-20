import { getAuthenticatedClient } from "./_shared/auth.ts";
import { handleOptions, jsonResponse } from "./_shared/cors.ts";
import { ACHIEVEMENT_DEFS, GRAMMAR_HEATMAP_CATEGORIES } from "./_shared/writingDnaAnalysis.ts";
import { isPremiumUser } from "./_shared/premium.ts";

const SESSION_PAGE_SIZE = 20;
const VOCAB_PAGE_SIZE = 30;

function formatCategoryLabel(category: string): string {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCalendar(sessions: Array<{ created_at: string; word_count: number }>) {
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { client, userId, error: authError } = await getAuthenticatedClient(req);
  if (!client || !userId) {
    return jsonResponse({ error: authError }, 401);
  }

  if (!isPremiumUser(userId)) {
    return jsonResponse({ error: "Premium subscription required." }, 403);
  }

  try {
    let sessionPage = 0;
    let vocabPage = 0;

    if (req.method === "POST") {
      const body = (await req.json()) as { sessionPage?: number; vocabPage?: number };
      sessionPage = Math.max(0, body.sessionPage ?? 0);
      vocabPage = Math.max(0, body.vocabPage ?? 0);
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
      client.database.from("writing_dna_profiles").select("*").eq("user_id", userId).maybeSingle(),
      client.database
        .from("writing_dna_sessions")
        .select("id, created_at, source_tool, word_count, unique_words, dna_score, metrics, dimensions, personality, personality_badge, insights")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(sessionFrom, sessionFrom + SESSION_PAGE_SIZE - 1),
      client.database
        .from("writing_dna_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      client.database
        .from("writing_dna_vocabulary")
        .select("word, frequency, cefr_level, difficulty, last_used, first_used")
        .eq("user_id", userId)
        .order("frequency", { ascending: false })
        .range(vocabFrom, vocabFrom + VOCAB_PAGE_SIZE - 1),
      client.database
        .from("writing_dna_vocabulary")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      client.database
        .from("writing_dna_grammar_stats")
        .select("category, mistake_count, session_hits, last_seen")
        .eq("user_id", userId)
        .order("mistake_count", { ascending: false }),
      client.database
        .from("writing_dna_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      client.database
        .from("writing_dna_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false }),
      client.database
        .from("writing_dna_weekly_reports")
        .select("week_start, report, created_at")
        .eq("user_id", userId)
        .order("week_start", { ascending: false })
        .limit(4),
      client.database
        .from("writing_dna_monthly_reports")
        .select("month_start, report, created_at")
        .eq("user_id", userId)
        .order("month_start", { ascending: false })
        .limit(6),
      client.database
        .from("writing_dna_sessions")
        .select("created_at, word_count")
        .eq("user_id", userId)
        .gte("created_at", yearAgo.toISOString()),
    ]);

    const sessions = sessionsResult.data ?? [];
    const grammarStats = grammarResult.data ?? [];
    const grammarHeatmap = GRAMMAR_HEATMAP_CATEGORIES.map((category) => {
      const row = grammarStats.find((entry) => entry.category === category);
      return {
        category,
        label: formatCategoryLabel(category),
        mistakeCount: row?.mistake_count ?? 0,
        sessionHits: row?.session_hits ?? 0,
        lastSeen: row?.last_seen ?? null,
      };
    });

    const unlockedIds = new Set((achievementsResult.data ?? []).map((a) => a.achievement_id));
    const achievements = ACHIEVEMENT_DEFS.map((def) => ({
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

    const scoreHistory = (calendarResult.data ?? []).map((session) => ({
      created_at: session.created_at,
      dna_score: 0,
    }));

    const { data: scoreSessions } = await client.database
      .from("writing_dna_sessions")
      .select("created_at, dna_score, dimensions")
      .eq("user_id", userId)
      .gte("created_at", monthStart.toISOString())
      .order("created_at", { ascending: true });

    const weeklyScores = aggregateWeeklyScores(scoreSessions ?? []);
    const monthlyScores = (scoreSessions ?? []).map((session) => ({
      date: session.created_at.slice(0, 10),
      score: session.dna_score,
      grammar: (session.dimensions as { grammar?: number })?.grammar ?? 0,
      vocabulary: (session.dimensions as { vocabulary?: number })?.vocabulary ?? 0,
    }));

    const vocabulary = vocabResult.data ?? [];
    const monthVocabStart = monthStart.toISOString();
    const newVocabThisMonth = vocabulary.filter(
      (word) => word.first_used && word.first_used >= monthVocabStart,
    ).length;

    return jsonResponse({
      profile: profileResult.data ?? null,
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
      goals: goalsResult.data ?? [],
      achievements,
      weeklyReports: weeklyReportResult.data ?? [],
      monthlyReports: monthlyReportResult.data ?? [],
      streak: {
        current: profileResult.data?.streak_current ?? 0,
        best: profileResult.data?.streak_best ?? 0,
        wordsToday: todayStats.words,
        wordsWeek: weekWords,
        wordsMonth: monthWords,
        wordsYear: yearWords,
      },
      calendar,
      progress: {
        weeklyScores,
        monthlyScores,
        scoreHistory,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load Writing DNA.";
    return jsonResponse({ error: message }, 500);
  }
}
