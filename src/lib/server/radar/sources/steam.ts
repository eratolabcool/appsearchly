/**
 * [INPUT]: Steam Charts 公开 API + Store appdetails（fetchImpl 注入）
 * [OUTPUT]: 对外提供 fetchSteamRadarSignals → steam-top / steam-growth 信号
 * [POS]: src/lib/server/radar/sources 的 Steam 源（无 API Key），由 pipeline settleSource 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { parseReleaseDate } from '../normalize';
import type { RadarSignal } from '../types';

type SteamRank = { rank: number; appid: number; last_week_rank?: number; peak_in_game?: number };

type SteamAppMeta = { name: string; releaseDate?: string; comingSoon?: boolean };

const UA = 'AppSearchlyRadar/1.0 (+https://www.appsearchly.com; game-opportunity-radar)';

async function fetchJson<T>(fetchImpl: typeof fetch, url: string): Promise<T> {
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json', 'User-Agent': UA }
  });
  if (!response.ok) {
    throw new Error(`Steam fetch failed ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
}

async function resolveAppMeta(fetchImpl: typeof fetch, appId: number): Promise<SteamAppMeta> {
  try {
    const data = await fetchJson<Record<string, { data?: { name?: string; release_date?: { coming_soon?: boolean; date?: string } } }>>(
      fetchImpl,
      `https://store.steampowered.com/api/appdetails?appids=${appId}`
    );
    const app = data[String(appId)]?.data;
    return {
      name: app?.name || `Steam App ${appId}`,
      releaseDate: parseReleaseDate(app?.release_date?.date),
      comingSoon: Boolean(app?.release_date?.coming_soon)
    };
  } catch {
    return { name: `Steam App ${appId}` };
  }
}

export async function fetchSteamRadarSignals(
  fetchImpl: typeof fetch,
  { limit = 40, nameLimit = 30 }: { limit?: number; nameLimit?: number } = {}
): Promise<{ top: RadarSignal[]; growth: RadarSignal[] }> {
  const payload = await fetchJson<{ response?: { ranks?: SteamRank[] } }>(
    fetchImpl,
    'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/'
  );

  const ranks = (payload.response?.ranks || []).slice(0, limit);
  if (ranks.length === 0) {
    throw new Error('Steam most-played chart returned empty ranks');
  }

  const capturedAt = new Date().toISOString();
  const growthCandidates = [...ranks]
    .filter((row) => typeof row.last_week_rank === 'number' && row.last_week_rank - row.rank > 0)
    .sort((a, b) => b.last_week_rank! - b.rank - (a.last_week_rank! - a.rank))
    .slice(0, 15);

  // 名称补全按 5 并发批量，控制子请求预算
  const nameIdSet = new Set<number>();
  ranks.slice(0, nameLimit).forEach((r) => nameIdSet.add(r.appid));
  growthCandidates.forEach((r) => nameIdSet.add(r.appid));
  const metaById = new Map<number, SteamAppMeta>();
  const nameTargets = Array.from(nameIdSet);
  for (let i = 0; i < nameTargets.length; i += 5) {
    const batch = nameTargets.slice(i, i + 5);
    const resolved = await Promise.all(
      batch.map(async (appid) => [appid, await resolveAppMeta(fetchImpl, appid)] as const)
    );
    resolved.forEach(([id, meta]) => metaById.set(id, meta));
  }

  const top: RadarSignal[] = ranks.map((row) => {
    const meta = metaById.get(row.appid);
    const title = meta?.name || `Steam App ${row.appid}`;
    const peak = row.peak_in_game || 0;
    return {
      id: `steam-top-${row.appid}`,
      source: 'steam-top',
      title,
      url: `https://store.steampowered.com/app/${row.appid}`,
      metricLabel: 'peak_players',
      metricValue: peak,
      rank: row.rank,
      rankDelta:
        typeof row.last_week_rank === 'number' ? row.last_week_rank - row.rank : undefined,
      releaseDate: meta?.releaseDate,
      comingSoon: meta?.comingSoon,
      platforms: ['steam'],
      tags: ['steam', 'top-played'],
      capturedAt,
      raw: { appid: row.appid, peak_in_game: peak }
    };
  });

  const growth = [...top]
    .filter((s) => typeof s.rankDelta === 'number' && (s.rankDelta || 0) > 0)
    .sort((a, b) => (b.rankDelta || 0) - (a.rankDelta || 0))
    .slice(0, 20)
    .map((s) => ({
      ...s,
      id: `steam-growth-${s.raw?.appid || s.id}`,
      source: 'steam-growth' as const,
      metricLabel: 'rank_jump',
      metricValue: s.rankDelta || 0,
      tags: ['steam', 'growth']
    }));

  return { top, growth };
}
