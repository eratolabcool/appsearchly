BEGIN;

CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  website text,
  normalized_domain text,
  description text NOT NULL DEFAULT '',
  category text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  source_submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS website text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS normalized_domain text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS source_submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS tools_normalized_domain_unique_idx
  ON tools(normalized_domain)
  WHERE normalized_domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS tools_published_status_idx ON tools(status);
CREATE INDEX IF NOT EXISTS tools_published_category_idx ON tools(category);

COMMIT;
