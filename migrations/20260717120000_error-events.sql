-- Premium error-pattern tracking (Write + Coach)

CREATE TABLE IF NOT EXISTS error_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_tool text NOT NULL CHECK (source_tool IN ('write', 'coach')),
  category text NOT NULL,
  subcategory text,
  example_text text NOT NULL,
  session_id uuid REFERENCES practice_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_events_user_created
  ON error_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_events_user_category_created
  ON error_events (user_id, category, created_at DESC);

ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY error_events_select_own ON error_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY error_events_insert_own ON error_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
