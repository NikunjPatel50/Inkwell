import {
  analyzeWritingDnaMetrics,
  checkAchievements,
  computeDnaScore,
  estimateCefr,
  generateInsights,
  inferPersonality,
  type GrammarMistakeEntry,
  type WritingDnaDimensions,
  type WritingDnaMetrics,
} from "./writingDnaAnalysis.ts";

type DbClient = ReturnType<typeof import("npm:@insforge/sdk@latest").createClient>;

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

async function upsertVocabulary(client: DbClient, userId: string, text: string): Promise<void> {
  const words = [...new Set(tokenizeWords(text).filter((w) => w.length > 2))];
  if (words.length === 0) return;

  const now = new Date().toISOString();

  for (const word of words) {
    const { data: existing } = await client.database
      .from("writing_dna_vocabulary")
      .select("id, frequency")
      .eq("user_id", userId)
      .eq("word", word)
      .maybeSingle();

    if (existing?.id) {
      await client.database
        .from("writing_dna_vocabulary")
        .update({
          frequency: (existing.frequency ?? 0) + 1,
          last_used: now,
        })
        .eq("id", existing.id);
    } else {
      await client.database.from("writing_dna_vocabulary").insert([
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

async function upsertGrammarStats(
  client: DbClient,
  userId: string,
  mistakes: GrammarMistakeEntry[],
): Promise<void> {
  const counts = new Map<string, number>();
  for (const mistake of mistakes) {
    counts.set(mistake.category, (counts.get(mistake.category) ?? 0) + 1);
  }

  const now = new Date().toISOString();

  for (const [category, count] of counts) {
    const { data: existing } = await client.database
      .from("writing_dna_grammar_stats")
      .select("id, mistake_count, session_hits")
      .eq("user_id", userId)
      .eq("category", category)
      .maybeSingle();

    if (existing?.id) {
      await client.database
        .from("writing_dna_grammar_stats")
        .update({
          mistake_count: (existing.mistake_count ?? 0) + count,
          session_hits: (existing.session_hits ?? 0) + 1,
          last_seen: now,
        })
        .eq("id", existing.id);
    } else {
      await client.database.from("writing_dna_grammar_stats").insert([
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

async function loadProfile(client: DbClient, userId: string) {
  const { data } = await client.database
    .from("writing_dna_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

function computeStreak(
  profile: { last_submission_at?: string | null; streak_current?: number } | null,
  today: string,
): { current: number; best: number } {
  const previousCurrent = profile?.streak_current ?? 0;
  const previousBest = (profile as { streak_best?: number } | null)?.streak_best ?? 0;

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

async function unlockAchievements(
  client: DbClient,
  userId: string,
  achievementIds: string[],
): Promise<void> {
  if (achievementIds.length === 0) return;

  const { data: existing } = await client.database
    .from("writing_dna_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const existingIds = new Set((existing ?? []).map((row) => row.achievement_id));
  const toInsert = achievementIds
    .filter((id) => !existingIds.has(id))
    .map((achievement_id) => ({ user_id: userId, achievement_id }));

  if (toInsert.length > 0) {
    await client.database.from("writing_dna_achievements").insert(toInsert);
  }
}

async function updateGoals(
  client: DbClient,
  userId: string,
  metrics: WritingDnaMetrics,
  dimensions: WritingDnaDimensions,
  streakCurrent: number,
): Promise<void> {
  const { data: goals } = await client.database
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

    await client.database
      .from("writing_dna_goals")
      .update({
        current_value: current,
        completed,
        updated_at: now,
      })
      .eq("id", goal.id);
  }
}

function buildWeeklyReport(
  sessions: Array<{ dna_score: number; metrics: WritingDnaMetrics; dimensions: WritingDnaDimensions }>,
): Record<string, unknown> {
  if (sessions.length === 0) {
    return {
      biggestImprovement: "Submit your first piece to start your weekly coach report.",
      biggestWeakness: "Not enough data yet.",
      exercises: ["Write 150 words on a topic you care about.", "Revise one paragraph for clarity.", "Replace three weak verbs."],
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
    wordsToLearn: ["therefore", "demonstrate", "nuanced", "coherent", "precise"].slice(0, 5),
    grammarTopic: weakest.includes("grammar") ? "verb tense consistency" : "transition quality",
    estimatedProgress: `${Math.round(sessions.reduce((sum, s) => sum + s.dna_score, 0) / sessions.length)}% DNA score average`,
  };
}

async function ensureReports(
  client: DbClient,
  userId: string,
): Promise<void> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const { data: weekSessions } = await client.database
    .from("writing_dna_sessions")
    .select("dna_score, metrics, dimensions")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());

  const { data: existingWeek } = await client.database
    .from("writing_dna_weekly_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!existingWeek?.id && (weekSessions?.length ?? 0) > 0) {
    await client.database.from("writing_dna_weekly_reports").insert([
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

  const { data: monthSessions } = await client.database
    .from("writing_dna_sessions")
    .select("dna_score, word_count, metrics, dimensions, created_at")
    .eq("user_id", userId)
    .gte("created_at", monthAgo.toISOString());

  const { data: existingMonth } = await client.database
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

    await client.database.from("writing_dna_monthly_reports").insert([
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

export async function persistWritingDna(
  client: DbClient,
  userId: string,
  input: PersistWritingDnaInput,
): Promise<{ dnaScore: number; sessionId: string | null }> {
  const text = input.text.trim();
  if (!text) return { dnaScore: 0, sessionId: null };

  const errors = input.errors ?? [];
  const registerScore = input.registerScore ?? 50;
  const { metrics, dimensions, grammarMistakes } = analyzeWritingDnaMetrics(
    text,
    errors,
    registerScore,
  );

  const profile = await loadProfile(client, userId);
  const previousAvg =
    profile?.dimensions && typeof profile.dimensions === "object"
      ? (profile.dimensions as WritingDnaDimensions).vocabulary ?? null
      : null;

  const insights = generateInsights(metrics, dimensions, previousAvg);
  const { personality, personalityBadge } = inferPersonality(metrics, dimensions);
  const dnaScore = computeDnaScore(dimensions);
  const today = utcDateKey(new Date());
  const streak = computeStreak(profile, today);
  const totalWords = (profile?.total_words ?? 0) + metrics.wordCount;
  const totalSessions = (profile?.total_sessions ?? 0) + 1;
  const now = new Date().toISOString();

  const { data: sessionRow } = await client.database
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

  await upsertVocabulary(client, userId, text);
  await upsertGrammarStats(client, userId, grammarMistakes);

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
    await client.database.from("writing_dna_profiles").update(profilePayload).eq("user_id", userId);
  } else {
    await client.database.from("writing_dna_profiles").insert([profilePayload]);
  }

  const achievements = checkAchievements(
    dimensions,
    metrics,
    personality,
    streak.best,
    totalWords,
    errors.length,
  );

  await unlockAchievements(client, userId, achievements);
  await updateGoals(client, userId, metrics, dimensions, streak.current);
  await ensureReports(client, userId);

  return { dnaScore, sessionId: sessionRow?.id ?? null };
}
