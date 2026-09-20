/**
 * [INPUT]: radar_games / radar_reports 行结构（jsonb 列原样透传）
 * [OUTPUT]: 对外提供 RadarGameDisplay / RadarReportDisplay 及 DECISION_BADGES/DECISION_LABELS
 * [POS]: routes/radar 的展示类型层，hub 与 games 两页共用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export type RadarGameDisplay = {
  slug: string;
  display_title: string;
  platforms: string[] | null;
  score: number;
  decision: string;
  gates: { g1: string; g2: string; g3: string } | null;
  seo_gap: {
    allintitleEstimate?: number;
    seoDifficulty?: string;
    existingAssets?: string[];
    missingAssets?: string[];
    thesis?: string;
    whyNow?: string;
    url?: string;
    releaseDate?: string;
    daysSinceRelease?: number;
  } | null;
  velocity: Record<string, number | null> | null;
  events: string[] | null;
  last_seen_at: string | Date | null;
};

export type RadarReportDisplay = {
  report_date: string;
  status: string;
  digest: { generatedAt?: string; headlines?: string[] } | null;
  sources_health: { id: string; ok: boolean; count: number; error?: string }[] | null;
  opportunity_count: number;
  created_at: string | Date;
};

export const DECISION_LABELS: Record<string, string> = {
  BUILD_NOW: 'Build now',
  PRE_BUILD: 'Pre-build',
  HIGH_PRIORITY: 'High priority',
  WATCH_7D: 'Watch 7d',
  IGNORE: 'Ignore'
};

export const DECISION_BADGES: Record<string, string> = {
  BUILD_NOW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  PRE_BUILD: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  HIGH_PRIORITY: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  WATCH_7D: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  IGNORE: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
};
