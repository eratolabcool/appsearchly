BEGIN;

CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  website text NOT NULL,
  normalized_domain text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  source_submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tools_status_idx ON tools(status);
CREATE INDEX IF NOT EXISTS tools_category_idx ON tools(category);

COMMIT;
