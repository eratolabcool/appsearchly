-- 0008: AI 榜单文章表
-- body 为结构化 JSON（非 HTML/markdown）：零 XSS 面、零解析依赖，与 /blog 榜单卡渲染对齐
BEGIN;

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon text NOT NULL DEFAULT '🤖',
  generated_model text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  reviewed_by text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(body) = 'object')
);

CREATE INDEX IF NOT EXISTS articles_status_published_idx
  ON articles(status, published_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_unique ON articles(slug);

DROP TRIGGER IF EXISTS articles_set_updated_at ON articles;
CREATE TRIGGER articles_set_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
