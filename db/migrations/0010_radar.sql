-- Game Opportunity Radar：游戏机会雷达数据模型
-- radar_games 为实体归并后的 canonical（每 run upsert），
-- radar_snapshots 每日追加历史（velocity 真数据的来源，findly 从未做过），
-- radar_reports 存每次 run 的完整 digest + 飞书报告文本。

BEGIN;

CREATE TABLE IF NOT EXISTS radar_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  normalized_title text NOT NULL,
  display_title text NOT NULL,
  platforms text[] NOT NULL DEFAULT '{}',
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  latest_metric numeric,
  latest_rank integer,
  rank_delta integer,
  latest_source_id text,
  score integer,
  decision text,
  gates jsonb,
  seo_gap jsonb,
  velocity jsonb,
  monetization jsonb,
  events jsonb,
  recommendations jsonb,
  is_opportunity boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS radar_games_score_idx ON radar_games (score DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS radar_snapshots (
  id bigserial PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES radar_games(id) ON DELETE CASCADE,
  source_id text NOT NULL,
  metric numeric,
  rank integer,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS radar_snapshots_game_time_idx
  ON radar_snapshots (game_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS radar_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  digest jsonb NOT NULL DEFAULT '{}'::jsonb,
  sources_health jsonb NOT NULL DEFAULT '[]'::jsonb,
  markdown_report text NOT NULL DEFAULT '',
  opportunity_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS radar_events (
  id bigserial PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES radar_games(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS radar_events_daily_unique
  ON radar_events (game_id, event_type, ((detected_at AT TIME ZONE 'UTC')::date));

COMMIT;
