/**
 * [INPUT]: 依赖 ../db 的 queryRows/isDatabaseConfigured，radar_games / radar_reports 表
 * [OUTPUT]: 对外提供 load — hub 页数据（最新日报摘要 + top5 机会）
 * [POS]: routes/radar 的 hub 数据层，DB-only 无 JSON 回退，DB 不可用渲染空态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { isDatabaseConfigured, queryRows } from '$lib/server/db';
import type { RadarGameDisplay, RadarReportDisplay } from './display';

export const prerender = false;

export type RadarPageData = {
  configured: boolean;
  report: RadarReportDisplay | null;
  top: RadarGameDisplay[];
};

export const load = async ({ platform }): Promise<RadarPageData> => {
  if (!isDatabaseConfigured(platform)) {
    return { configured: false, report: null, top: [] };
  }

  try {
    const reports = await queryRows<RadarReportDisplay>(
      platform,
      `SELECT report_date, status, digest, sources_health, opportunity_count, created_at
       FROM radar_reports ORDER BY report_date DESC LIMIT 1`
    );
    const games = await queryRows<RadarGameDisplay>(
      platform,
      `SELECT slug, display_title, platforms, score, decision, gates, seo_gap, velocity, events, last_seen_at
       FROM radar_games WHERE is_opportunity ORDER BY score DESC LIMIT 5`
    );
    return { configured: true, report: reports[0] ?? null, top: games };
  } catch (error) {
    console.warn('Radar hub query failed, rendering empty state:', error);
    return { configured: true, report: null, top: [] };
  }
};
