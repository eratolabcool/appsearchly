/**
 * [INPUT]: 无运行时依赖
 * [OUTPUT]: 对外提供 RadarSignal/RadarOpportunity/SourceHealth/RadarDigest 等雷达领域类型
 * [POS]: src/lib/server/radar 的类型真相源，被 sources/score/gates/pipeline 与页面消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export type RadarSourceId =
  | 'steam-top'
  | 'steam-growth'
  | 'roblox-trending'
  | 'roblox-upcoming'
  | 'itch'
  | 'cocrea'
  | 'playhop';

export type MonetizationChannel = 'ads' | 'affiliate' | 'membership' | 'ugc' | 'sponsorship';
export type AssetGap = 'wiki' | 'database' | 'calculator' | 'tier-list' | 'guides';
export type SeoDifficulty = 'low' | 'medium' | 'high';
export type GateStatus = 'PASS' | 'PARTIAL' | 'FAIL';
export type RadarDecision = 'BUILD_NOW' | 'PRE_BUILD' | 'HIGH_PRIORITY' | 'WATCH_7D' | 'IGNORE';
export type RadarEventType =
  | 'NEW_GAME'
  | 'VELOCITY_BREAKOUT'
  | 'CROSS_PLATFORM'
  | 'WIKI_GAP'
  | 'GUIDE_GAP'
  | 'TOOL_GAP'
  | 'DATABASE_GAP';

export type RadarSignal = {
  id: string;
  source: RadarSourceId;
  title: string;
  url?: string;
  metricLabel: string;
  metricValue: number;
  rank?: number;
  rankDelta?: number;
  /** ISO 日期 YYYY-MM-DD（Steam 发售 / Roblox 创建 / itch 发布） */
  releaseDate?: string;
  comingSoon?: boolean;
  platforms: string[];
  tags: string[];
  capturedAt: string;
  raw?: Record<string, unknown>;
};

export type SeoGapAnalysis = {
  entity: string;
  slug: string;
  allintitleEstimate: number;
  seoDifficulty: SeoDifficulty;
  existingAssets: AssetGap[];
  missingAssets: AssetGap[];
  notes: string[];
};

export type VelocitySummary = {
  v24h: number | null;
  v72h: number | null;
  v7d: number | null;
  v14d: number | null;
  v30d: number | null;
};

export type GateSummary = { g1: GateStatus; g2: GateStatus; g3: GateStatus };

export type RadarRecommendations = { actions: string[]; sections: string[]; tools: string[] };

export type RadarOpportunity = {
  id: string;
  slug: string;
  title: string;
  sources: RadarSourceId[];
  platforms: string[];
  score: number;
  velocity: VelocitySummary | null;
  thesis: string;
  whyNow: string;
  allintitleEstimate: number;
  seoDifficulty: SeoDifficulty;
  existingAssets: AssetGap[];
  missingAssets: AssetGap[];
  monetization: MonetizationChannel[];
  gates: GateSummary;
  decision: RadarDecision;
  events: RadarEventType[];
  recommendations: RadarRecommendations;
  url?: string;
  steamAppId?: number;
  robloxUniverseId?: number;
  releaseDate?: string;
  daysSinceRelease?: number;
  latestMetric?: number;
  latestRank?: number;
  rankDelta?: number;
};

export type SourceHealth = {
  id: RadarSourceId;
  ok: boolean;
  count: number;
  error?: string;
};

export type RadarDigest = {
  generatedAt: string;
  status: 'success' | 'partial' | 'failed';
  sources: SourceHealth[];
  opportunities: RadarOpportunity[];
  headlines: string[];
};

export type RadarSnapshotRow = {
  source_id: string;
  metric: string | number | null;
  rank: number | null;
  captured_at: Date | string;
};
