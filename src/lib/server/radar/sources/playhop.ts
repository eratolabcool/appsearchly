/**
 * [INPUT]: Playhop 公开游戏目录 API（fetchImpl 注入）
 * [OUTPUT]: 对外提供 fetchPlayhopRadarSignals → playhop 热门浏览器游戏信号
 * [POS]: src/lib/server/radar/sources 的 Playhop 源，由 pipeline settleSource 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { RadarSignal } from '../types';

const UA = 'AppSearchlyRadar/1.0 (+https://www.appsearchly.com; game-opportunity-radar)';

export async function fetchPlayhopRadarSignals(
  fetchImpl: typeof fetch,
  { limit = 25 }: { limit?: number } = {}
): Promise<RadarSignal[]> {
  const response = await fetchImpl('https://playhop.com/api/games/popular?limit=25', {
    headers: { 'User-Agent': UA, Accept: 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Playhop returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const games: Array<Record<string, unknown>> = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { games?: unknown }).games)
      ? ((payload as { games: Array<Record<string, unknown>> }).games)
      : [];

  const capturedAt = new Date().toISOString();
  const signals: RadarSignal[] = games.slice(0, limit).map((g, index) => {
    const id = String(g.id ?? g.app_id ?? index);
    const title = String(g.title ?? g.name ?? 'Playhop Game');
    return {
      id: `playhop-${id}`,
      source: 'playhop' as const,
      title,
      url: String(g.url ?? `https://playhop.com/app/${id}`),
      metricLabel: 'popularity',
      metricValue: limit - index,
      platforms: ['browser'],
      tags: ['playhop', 'casual', String(g.category ?? 'game')],
      capturedAt,
      raw: { externalId: id, developer: g.developer ?? null }
    };
  });

  if (signals.length === 0) {
    throw new Error('Playhop returned no usable games');
  }
  return signals;
}
