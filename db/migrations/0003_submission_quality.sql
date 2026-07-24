BEGIN;

CREATE TABLE IF NOT EXISTS submission_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  check_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'warning', 'failed')),
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submission_checks_submission_idx ON submission_checks(submission_id, created_at);

CREATE TABLE IF NOT EXISTS submission_quality_scores (
  submission_id uuid PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  website_score integer NOT NULL CHECK (website_score BETWEEN 0 AND 30),
  trust_score integer NOT NULL CHECK (trust_score BETWEEN 0 AND 25),
  content_score integer NOT NULL CHECK (content_score BETWEEN 0 AND 20),
  seo_score integer NOT NULL CHECK (seo_score BETWEEN 0 AND 15),
  security_score integer NOT NULL CHECK (security_score BETWEEN 0 AND 10),
  recommendation text NOT NULL CHECK (recommendation IN ('reject', 'manual_review', 'approve_candidate')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain citext NOT NULL UNIQUE,
  reason text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('ip', 'email')),
  subject_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  submission_count integer NOT NULL DEFAULT 0 CHECK (submission_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subject_type, subject_hash, window_start)
);
CREATE INDEX IF NOT EXISTS submission_rate_limits_lookup_idx ON submission_rate_limits(subject_type, subject_hash, window_start DESC);

COMMIT;
