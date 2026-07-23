BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug citext NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX categories_name_lower_unique
  ON categories (lower(name));

CREATE TABLE tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug citext NOT NULL UNIQUE,
  name text NOT NULL,
  summary text NOT NULL,
  official_url text NOT NULL,
  canonical_domain citext NOT NULL UNIQUE,
  primary_category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'needs_review', 'published', 'suspended', 'archived')),
  pricing_model text
    CHECK (pricing_model IS NULL OR pricing_model IN ('free', 'freemium', 'paid', 'subscription', 'usage_based', 'contact_sales', 'unknown')),
  has_free_plan boolean,
  logo_url text,
  og_image_url text,
  platform_web boolean NOT NULL DEFAULT true,
  platform_ios boolean NOT NULL DEFAULT false,
  platform_android boolean NOT NULL DEFAULT false,
  platform_macos boolean NOT NULL DEFAULT false,
  platform_windows boolean NOT NULL DEFAULT false,
  platform_linux boolean NOT NULL DEFAULT false,
  has_api boolean,
  is_open_source boolean,
  primary_source_url text NOT NULL,
  primary_source_type text NOT NULL
    CHECK (primary_source_type IN ('official_site', 'official_docs', 'official_store', 'owner_submission', 'manual_research', 'legacy_import')),
  source_checked_at timestamptz NOT NULL,
  data_confidence smallint NOT NULL DEFAULT 50
    CHECK (data_confidence BETWEEN 0 AND 100),
  verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'automated', 'human_verified', 'owner_verified')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (official_url ~ '^https?://'),
  CHECK (primary_source_url ~ '^https?://'),
  CHECK (length(trim(name)) >= 2),
  CHECK (length(trim(summary)) >= 20),
  CHECK ((status = 'published' AND published_at IS NOT NULL) OR status <> 'published')
);

CREATE INDEX tools_status_idx ON tools (status);
CREATE INDEX tools_category_idx ON tools (primary_category_id);
CREATE INDEX tools_source_checked_idx ON tools (source_checked_at DESC);
CREATE INDEX tools_name_trgm_idx ON tools USING gin (name gin_trgm_ops);
CREATE INDEX tools_summary_trgm_idx ON tools USING gin (summary gin_trgm_ops);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug citext NOT NULL UNIQUE,
  name text NOT NULL,
  tag_type text NOT NULL DEFAULT 'feature'
    CHECK (tag_type IN ('feature', 'use_case', 'audience', 'integration', 'platform', 'attribute')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tags_name_lower_unique ON tags (lower(name));

CREATE TABLE tool_tags (
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_checked_at timestamptz NOT NULL,
  confidence smallint NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tool_id, tag_id)
);

CREATE INDEX tool_tags_tag_idx ON tool_tags (tag_id, tool_id);

CREATE TABLE pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  name text NOT NULL,
  billing_period text NOT NULL DEFAULT 'unknown'
    CHECK (billing_period IN ('free', 'one_time', 'monthly', 'yearly', 'usage_based', 'custom', 'unknown')),
  price_amount numeric(14, 4),
  currency char(3),
  price_text text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_url text NOT NULL,
  source_checked_at timestamptz NOT NULL,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (price_amount IS NULL OR price_amount >= 0),
  CHECK (jsonb_typeof(features) = 'array'),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE INDEX pricing_plans_tool_idx ON pricing_plans (tool_id, valid_from DESC);

CREATE TABLE tool_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  snapshot_type text NOT NULL
    CHECK (snapshot_type IN ('metadata', 'pricing', 'features', 'availability', 'external_signal')),
  payload jsonb NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  checksum text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX tool_snapshots_tool_type_idx
  ON tool_snapshots (tool_id, snapshot_type, captured_at DESC);

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_url text NOT NULL,
  submitted_name text,
  submitter_email citext,
  submitter_name text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'needs_review', 'approved', 'rejected', 'duplicate', 'spam')),
  normalized_domain citext,
  matched_tool_id uuid REFERENCES tools(id) ON DELETE SET NULL,
  review_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (submitted_url ~ '^https?://'),
  CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE INDEX submissions_status_created_idx ON submissions (status, created_at);
CREATE INDEX submissions_domain_idx ON submissions (normalized_domain);

CREATE TABLE outbound_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  destination_url text NOT NULL,
  source_path text,
  session_id_hash text,
  visitor_id_hash text,
  country_code char(2),
  user_agent_family text,
  is_sponsored boolean NOT NULL DEFAULT false,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CHECK (destination_url ~ '^https?://')
);

CREATE INDEX outbound_clicks_tool_time_idx ON outbound_clicks (tool_id, occurred_at DESC);
CREATE INDEX outbound_clicks_time_idx ON outbound_clicks (occurred_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tools_set_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER submissions_set_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
