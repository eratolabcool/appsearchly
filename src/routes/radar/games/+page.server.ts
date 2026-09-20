/**
 * [INPUT]: 依赖 ../db 的 queryRows/isDatabaseConfigured，radar_games 表
 * [OUTPUT]: 对外提供 load — 完整机会榜单数据（top 50）
 * [POS]: routes/radar/games 的数据层，DB-only 无 JSON 回退，DB 不可用渲染空态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { isDatabaseConfigured, queryRows } from '$lib/server/db';
import type { RadarGameDisplay } from '../display';

export const prerender = false;

export type RadarGamesPageData = {
  configured: boolean;
  games: RadarGameDisplay[];
};

export const load = async ({ platform }): Promise<RadarGamesPageData> => {
  if (!isDatabaseConfigured(platform)) {
    return { configured: false, games: [] };
  }

  try {
    const games = await queryRows<RadarGameDisplay>(
      platform,
      `SELECT slug, display_title, platforms, score, decision, gates, seo_gap, velocity, events, last_seen_at
       FROM radar_games WHERE is_opportunity ORDER BY score DESC LIMIT 50`
    );
    return { configured: true, games };
  } catch (error) {
    console.warn('Radar games query failed, rendering empty state:', error);
    return { configured: true, games: [] };
  }
};
