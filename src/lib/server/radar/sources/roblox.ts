/**
 * [INPUT]: Roblox explore-api + games multiget（fetchImpl 注入）
 * [OUTPUT]: 对外提供 fetchRobloxRadarSignals → roblox-trending / roblox-upcoming 信号
 * [POS]: src/lib/server/radar/sources 的 Roblox 源，由 pipeline settleSource 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { parseReleaseDate } from '../normalize';
import type { RadarSignal } from '../types';

type RobloxGame = {
  universeId?: number;
  rootPlaceId?: number;
  name?: string;
  playerCount?: number;
  genreL1?: string;
  isSponsored?: boolean;
};

type RobloxSort = { id?: string; sortDisplayName?: string; games?: RobloxGame[] };

const UA = 'AppSearchlyRadar/1.0 (+https://www.appsearchly.com; game-opportunity-radar)';

async function fetchUniverseCreated(
  fetchImpl: typeof fetch,
  universeIds: number[]
): Promise<Map<number, { created?: string }>> {
  const map = new Map<number, { created?: string }>();
  const unique = Array.from(new Set(universeIds.filter(Boolean)));
  if (unique.length === 0) return map;

  for (let i = 0; i < unique.length; i += 40) {
    const batch = unique.slice(i, i + 40);
    try {
      const response = await fetchImpl(
        `https://games.roblox.com/v1/games?universeIds=${batch.join(',')}`,
        { headers: { Accept: 'application/json', 'User-Agent': UA } }
      );
      if (!response.ok) continue;
      const payload = (await response.json()) as {
        data?: Array<{ id?: number; created?: string }>;
      };
      for (const row of payload.data || []) {
        if (typeof row.id === 'number') map.set(row.id, { created: row.created });
      }
    } catch {
      // 可选补全 — 批次失败静默忽略
    }
  }
  return map;
}

export async function fetchRobloxRadarSignals(
  fetchImpl: typeof fetch,
  { limit = 24 }: { limit?: number } = {}
): Promise<{ trending: RadarSignal[]; upcoming: RadarSignal[] }> {
  const response = await fetchImpl(
    'https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=appsearchly-radar&device=computer',
    { headers: { Accept: 'application/json', 'User-Agent': UA } }
  );
  if (!response.ok) {
    throw new Error(`Roblox explore fetch failed ${response.status}`);
  }

  const payload = (await response.json()) as { sorts?: RobloxSort[] };
  const sorts = payload.sorts || [];
  const capturedAt = new Date().toISOString();

  const collectGames = (nameMatch: RegExp) => {
    const sort = sorts.find((s) => nameMatch.test(s.sortDisplayName || s.id || ''));
    return (sort?.games || []).filter((g) => g.name && !g.isSponsored).slice(0, limit);
  };

  const trendingGames = collectGames(/top trending|trending/i);
  const upcomingGames = collectGames(/up-?and-?coming|upcoming/i);

  const createdMap = await fetchUniverseCreated(
    fetchImpl,
    [...trendingGames, ...upcomingGames]
      .map((g) => g.universeId)
      .filter((id): id is number => typeof id === 'number')
  );

  const toSignals = (games: RobloxGame[], source: 'roblox-trending' | 'roblox-upcoming'): RadarSignal[] =>
    games.map((game, index) => {
      const placeId = game.rootPlaceId;
      const meta = typeof game.universeId === 'number' ? createdMap.get(game.universeId) : undefined;
      const releaseDate = parseReleaseDate(meta?.created);
      return {
        id: `${source}-${game.universeId || placeId || index}`,
        source,
        title: game.name || 'Unknown Roblox game',
        url: placeId ? `https://www.roblox.com/games/${placeId}` : undefined,
        metricLabel: 'player_count',
        metricValue: game.playerCount || 0,
        rank: index + 1,
        releaseDate,
        platforms: ['roblox'],
        tags: ['roblox', source === 'roblox-upcoming' ? 'up-and-coming' : 'trending', game.genreL1 || 'game'],
        capturedAt,
        raw: { universeId: game.universeId, rootPlaceId: placeId }
      };
    });

  const trending = toSignals(trendingGames, 'roblox-trending');
  const upcoming = toSignals(upcomingGames, 'roblox-upcoming');

  if (trending.length === 0 && upcoming.length === 0) {
    throw new Error('Roblox explore returned no usable game sorts');
  }

  return { trending, upcoming };
}
