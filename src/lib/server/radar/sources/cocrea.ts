/**
 * [INPUT]: Cocrea 公开项目 API（fetchImpl 注入）
 * [OUTPUT]: 对外提供 fetchCocreaRadarSignals → cocrea 浏览器游戏信号
 * [POS]: src/lib/server/radar/sources 的 Cocrea 源，由 pipeline settleSource 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { RadarSignal } from '../types';

const UA = 'AppSearchlyRadar/1.0 (+https://www.appsearchly.com; game-opportunity-radar)';

export async function fetchCocreaRadarSignals(
  fetchImpl: typeof fetch,
  { limit = 30 }: { limit?: number } = {}
): Promise<RadarSignal[]> {
  const response = await fetchImpl('https://cocrea.world/api/projects/public?limit=30', {
    headers: { 'User-Agent': UA, Accept: 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Cocrea returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const list: Array<Record<string, unknown>> = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown }).data)
      ? ((payload as { data: Array<Record<string, unknown>> }).data)
      : [];

  const capturedAt = new Date().toISOString();
  const signals: RadarSignal[] = list.slice(0, limit).map((item, index) => {
    const id = String(item.id ?? item._id ?? index);
    const title = String(item.title ?? item.name ?? 'Untitled Project');
    return {
      id: `cocrea-${id}`,
      source: 'cocrea' as const,
      title,
      url: String(item.url ?? `https://cocrea.world/project/${id}`),
      metricLabel: 'popularity',
      metricValue: limit - index,
      platforms: ['browser'],
      tags: ['cocrea', 'scratch-like', ...(Array.isArray(item.tags) ? item.tags.map(String) : [])],
      capturedAt,
      raw: { externalId: id }
    };
  });

  if (signals.length === 0) {
    throw new Error('Cocrea returned no usable projects');
  }
  return signals;
}
