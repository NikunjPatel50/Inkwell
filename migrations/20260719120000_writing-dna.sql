-- Writing DNA™ — permanent writing profile and analytics

CREATE TABLE IF NOT EXISTS writing_dna_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  source_tool text NOT NULL DEFAULT 'write' CHECK (source_tool IN ('write', 'coach', 'pte')),
  original_text text NOT NULL,
  word_count integer NOT NULL DEFAULT 0,
  unique_words integer NOT NULL DEFAULT 0,
  time_spent_seconds integer,
  dna_score integer NOT NULL DEFAULT 0 CHECK (dna_score >= 0 AND dna_score <= 100),
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  grammar_mistakes jsonb NOT NULL DEFAULT '[]'::jsonb,
  personality text,
  personality_badge text,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  analyzed_sentence_id uuid REFERENCES analyzed_sentences(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS writing_dna_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dna_score integer NOT NULL DEFAULT 0 CHECK (dna_score >= 0 AND dna_score <= 100),
  personality text,
  personality_badge text,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  streak_current integer NOT NULL DEFAULT 0,
  streak_best integer NOT NULL DEFAULT 0,
  total_words bigint NOT NULL DEFAULT 0,
  total_sessions integer NOT NULL DEFAULT 0,
  last_submission_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS writing_dna_vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word text NOT NULL,
  frequency integer NOT NULL DEFAULT 1,
  difficulty text,
  cefr_level text,
  synonyms jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_used timestamptz NOT NULL DEFAULT now(),
  first_used timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word)
);

CREATE TABLE IF NOT EXISTS writing_dna_grammar_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  mistake_count integer NOT NULL DEFAULT 0,
  session_hits integer NOT NULL DEFAULT 0,
  last_seen timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

CREATE TABLE IF NOT EXISTS writing_dna_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  title text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS writing_dna_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS writing_dna_weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS writing_dna_monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start date NOT NULL,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_start)
);

CREATE INDEX IF NOT EXISTS idx_writing_dna_sessions_user_created
  ON writing_dna_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_writing_dna_vocabulary_user_freq
  ON writing_dna_vocabulary (user_id, frequency DESC);

CREATE INDEX IF NOT EXISTS idx_writing_dna_grammar_stats_user
  ON writing_dna_grammar_stats (user_id, mistake_count DESC);

CREATE INDEX IF NOT EXISTS idx_writing_dna_goals_user
  ON writing_dna_goals (user_id, completed, created_at DESC);

ALTER TABLE writing_dna_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_grammar_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_dna_monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY writing_dna_sessions_select_own ON writing_dna_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_sessions_insert_own ON writing_dna_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY writing_dna_profiles_select_own ON writing_dna_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_profiles_insert_own ON writing_dna_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY writing_dna_profiles_update_own ON writing_dna_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY writing_dna_vocabulary_select_own ON writing_dna_vocabulary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_vocabulary_insert_own ON writing_dna_vocabulary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY writing_dna_vocabulary_update_own ON writing_dna_vocabulary FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY writing_dna_grammar_stats_select_own ON writing_dna_grammar_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_grammar_stats_insert_own ON writing_dna_grammar_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY writing_dna_grammar_stats_update_own ON writing_dna_grammar_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY writing_dna_goals_select_own ON writing_dna_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_goals_insert_own ON writing_dna_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY writing_dna_goals_update_own ON writing_dna_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY writing_dna_goals_delete_own ON writing_dna_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY writing_dna_achievements_select_own ON writing_dna_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_achievements_insert_own ON writing_dna_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY writing_dna_weekly_reports_select_own ON writing_dna_weekly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_weekly_reports_insert_own ON writing_dna_weekly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY writing_dna_weekly_reports_update_own ON writing_dna_weekly_reports FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY writing_dna_monthly_reports_select_own ON writing_dna_monthly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY writing_dna_monthly_reports_insert_own ON writing_dna_monthly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY writing_dna_monthly_reports_update_own ON writing_dna_monthly_reports FOR UPDATE USING (auth.uid() = user_id);
