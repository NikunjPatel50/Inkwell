-- practiced_skills for Learn tab progress

CREATE TABLE IF NOT EXISTS practiced_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  exercises_completed integer NOT NULL DEFAULT 0,
  average_score integer NOT NULL DEFAULT 0,
  last_practiced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_practiced_skills_user
  ON practiced_skills (user_id);

ALTER TABLE practiced_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY practiced_skills_select_own ON practiced_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY practiced_skills_insert_own ON practiced_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY practiced_skills_update_own ON practiced_skills
  FOR UPDATE USING (auth.uid() = user_id);
