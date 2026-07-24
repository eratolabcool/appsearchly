-- P0.5.2: submission security checks and tool quality scoring

CREATE TABLE IF NOT EXISTS submission_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  check_type text NOT NULL,
  status text NOT NULL,
  score integer,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_checks_submission_id
  ON submission_checks(submission_id);

CREATE TABLE IF NOT EXISTS tool_quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  website_score integer NOT NULL DEFAULT 0,
  trust_score integer NOT NULL DEFAULT 0,
  content_score integer NOT NULL DEFAULT 0,
  seo_score integer NOT NULL DEFAULT 0,
  security_score integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_quality_scores_tool_id
  ON tool_quality_scores(tool_id);

CREATE TABLE IF NOT EXISTS blocked_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
