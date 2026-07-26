BEGIN;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS icon text;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS short_description text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS website_url text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS favicon_url text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS company_name text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS founder text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS launch_date date;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS pricing_type text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS pricing_url text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS affiliate_url text;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS tool_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE tools
SET
  website_url = COALESCE(website_url, website, official_url),
  website = COALESCE(website, website_url, official_url),
  short_description = COALESCE(short_description, description, summary),
  description = COALESCE(description, summary, ''),
  normalized_domain = COALESCE(normalized_domain, canonical_domain),
  pricing_type = COALESCE(pricing_type, pricing_model),
  category_id = COALESCE(category_id, primary_category_id),
  is_verified = CASE
    WHEN verification_status IN ('human_verified', 'owner_verified') THEN true
    ELSE is_verified
  END
WHERE true;

CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE IF NOT EXISTS features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tool_features (
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tool_id, feature_id)
);

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS plan_name text;

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS price numeric(14, 4);

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS currency text;

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS billing_period text;

UPDATE pricing_plans
SET
  plan_name = COALESCE(plan_name, name),
  price = COALESCE(price, price_amount),
  currency = COALESCE(currency, trim(currency::text))
WHERE true;

CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
CREATE INDEX IF NOT EXISTS tools_category_id_idx ON tools(category_id);
CREATE INDEX IF NOT EXISTS tools_pricing_type_idx ON tools(pricing_type);
CREATE INDEX IF NOT EXISTS tools_verified_idx ON tools(is_verified);
CREATE INDEX IF NOT EXISTS tools_metadata_gin_idx ON tools USING gin(tool_metadata);
CREATE INDEX IF NOT EXISTS tool_categories_category_idx ON tool_categories(category_id, tool_id);
CREATE INDEX IF NOT EXISTS features_slug_idx ON features(slug);
CREATE UNIQUE INDEX IF NOT EXISTS features_name_lower_unique ON features(lower(name));
CREATE INDEX IF NOT EXISTS tool_features_feature_idx ON tool_features(feature_id, tool_id);
CREATE INDEX IF NOT EXISTS pricing_plans_tool_plan_idx ON pricing_plans(tool_id, plan_name);

DROP TRIGGER IF EXISTS features_set_updated_at ON features;
CREATE TRIGGER features_set_updated_at
BEFORE UPDATE ON features
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
