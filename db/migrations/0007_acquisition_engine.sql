BEGIN;

CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('product_hunt', 'github', 'hacker_news', 'rss', 'ai_directory', 'manual_import')),
  url text,
  api_endpoint text,
  enabled boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (url IS NULL OR url ~ '^https?://'),
  CHECK (api_endpoint IS NULL OR api_endpoint ~ '^https?://')
);

CREATE UNIQUE INDEX IF NOT EXISTS data_sources_name_type_unique
  ON data_sources (lower(name), type);

CREATE INDEX IF NOT EXISTS data_sources_enabled_idx ON data_sources(enabled, type);

CREATE TABLE IF NOT EXISTS tool_discovery_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  items_found integer NOT NULL DEFAULT 0 CHECK (items_found >= 0),
  items_processed integer NOT NULL DEFAULT 0 CHECK (items_processed >= 0),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_discovery_jobs_source_created_idx
  ON tool_discovery_jobs(source_id, created_at DESC);

CREATE INDEX IF NOT EXISTS tool_discovery_jobs_status_idx
  ON tool_discovery_jobs(status, created_at DESC);

CREATE TABLE IF NOT EXISTS tool_import_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  discovery_job_id uuid REFERENCES tool_discovery_jobs(id) ON DELETE SET NULL,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  crawled_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  quality_score integer CHECK (quality_score IS NULL OR quality_score BETWEEN 0 AND 100),
  duplicate_tool_id uuid REFERENCES tools(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  error_message text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(raw_data) = 'object'),
  CHECK (jsonb_typeof(crawled_data) = 'object'),
  CHECK (jsonb_typeof(extracted_data) = 'object')
);

CREATE INDEX IF NOT EXISTS tool_import_queue_status_created_idx
  ON tool_import_queue(status, created_at DESC);

CREATE INDEX IF NOT EXISTS tool_import_queue_source_idx
  ON tool_import_queue(source_id, created_at DESC);

CREATE INDEX IF NOT EXISTS tool_import_queue_quality_idx
  ON tool_import_queue(quality_score DESC NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS tool_import_queue_raw_url_pending_unique
  ON tool_import_queue ((lower(raw_data->>'url')))
  WHERE status = 'pending' AND raw_data ? 'url';

WITH seed_sources(name, type, url, api_endpoint, enabled) AS (
  VALUES
    ('Product Hunt AI', 'product_hunt', 'https://www.producthunt.com/topics/artificial-intelligence', 'https://api.producthunt.com/v2/api/graphql', true),
    ('GitHub AI Topics', 'github', 'https://github.com/topics/artificial-intelligence', 'https://api.github.com/search/repositories?q=topic:artificial-intelligence', true),
    ('Hacker News AI', 'hacker_news', 'https://news.ycombinator.com', 'https://hn.algolia.com/api/v1/search_by_date?query=AI%20tool', true),
    ('AppSearchly RSS Manual', 'rss', 'https://appsearchly.com', 'https://appsearchly.com/feed.xml', false),
    ('AI Directory Watchlist', 'ai_directory', 'https://www.futurepedia.io', NULL, false)
),
updated_sources AS (
  UPDATE data_sources existing
  SET
    url = seed.url,
    api_endpoint = seed.api_endpoint,
    updated_at = now()
  FROM seed_sources seed
  WHERE lower(existing.name) = lower(seed.name) AND existing.type = seed.type
  RETURNING existing.id
)
INSERT INTO data_sources (name, type, url, api_endpoint, enabled)
SELECT seed.name, seed.type, seed.url, seed.api_endpoint, seed.enabled
FROM seed_sources seed
WHERE NOT EXISTS (
  SELECT 1 FROM data_sources existing
  WHERE lower(existing.name) = lower(seed.name) AND existing.type = seed.type
);

DROP TRIGGER IF EXISTS data_sources_set_updated_at ON data_sources;
CREATE TRIGGER data_sources_set_updated_at
BEFORE UPDATE ON data_sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS tool_discovery_jobs_set_updated_at ON tool_discovery_jobs;
CREATE TRIGGER tool_discovery_jobs_set_updated_at
BEFORE UPDATE ON tool_discovery_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS tool_import_queue_set_updated_at ON tool_import_queue;
CREATE TRIGGER tool_import_queue_set_updated_at
BEFORE UPDATE ON tool_import_queue
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
