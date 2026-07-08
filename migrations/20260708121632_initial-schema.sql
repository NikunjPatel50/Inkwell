-- Inkwell practice history schema

CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  sentence_count integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS analyzed_sentences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES practice_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  original_text text NOT NULL,
  register_score integer NOT NULL,
  simple_version text NOT NULL,
  intermediate_version text NOT NULL,
  advanced_version text NOT NULL,
  error_count integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skill_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  occurrence_count integer NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word text NOT NULL,
  definition text NOT NULL,
  source_sentence text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_created
  ON practice_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analyzed_sentences_user_created
  ON analyzed_sentences (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_patterns_user_count
  ON skill_patterns (user_id, occurrence_count DESC);

CREATE INDEX IF NOT EXISTS idx_vocabulary_words_user_created
  ON vocabulary_words (user_id, created_at DESC);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY practice_sessions_select_own ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY practice_sessions_insert_own ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY practice_sessions_update_own ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY analyzed_sentences_select_own ON analyzed_sentences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY analyzed_sentences_insert_own ON analyzed_sentences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY skill_patterns_select_own ON skill_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY skill_patterns_insert_own ON skill_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY skill_patterns_update_own ON skill_patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY vocabulary_words_select_own ON vocabulary_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY vocabulary_words_insert_own ON vocabulary_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);
