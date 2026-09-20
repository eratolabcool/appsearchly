/**
 * [INPUT]: 依赖 ./db 的 withDatabase/isDatabaseConfigured，依赖 ./notify 的 createLarkNotifier，依赖 ./radar/* 的信号源/评分/报告
 * [OUTPUT]: 对外提供 runRadarCron（游戏机会雷达定时编排：多源发现→实体归并→快照落库→评分→决策→日报）
 * [POS]: src/lib/server/radar 的编排入口，由 write-worker-entry 生成的 scheduled handler 与 /api/admin/cron?job=radar 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { isDatabaseConfigured, withDatabase } from '../db';
import { createLarkNotifier, type Notifier } from '../notify';
import { normalizeEntityKey, slugifyTitle } from './normalize';
import { scoreGameOpportunities, OPPORTUNITY_LIMIT, SEO_PROBE_LIMIT } from './score';
import { formatRadarLarkReport } from './report';
import { fetchSteamRadarSignals } from './sources/steam';
import { fetchRobloxRadarSignals } from './sources/roblox';
import { fetchItchRadarSignals } from './sources/itch';
import { fetchCocreaRadarSignals } from './sources/cocrea';
import { fetchPlayhopRadarSignals } from './sources/playhop';
import type { Queryable } from '../repositories/tool-entity-repository';
import type { RadarDigest, RadarOpportunity, RadarSignal, SourceHealth } from './types';

export type RadarDeps = {
  fetchImpl?: typeof fetch;
  notifier?: Notifier;
  now?: () => Date;
};

const SNAPSHOT_RETENTION_DAYS = 35;

type QueryablePlatform = Parameters<typeof withDatabase>[0];

function toPlatform(env: App.Platform['env']): QueryablePlatform {
  return { env } as QueryablePlatform;
}

/** 单源失败降级为 sources_health 记录，绝不中断整个 run */
async function settleSource<T>(
  id: SourceHealth['id'],
  task: () => Promise<T[]>
): Promise<{ id: SourceHealth['id']; ok: boolean; count: number; error?: string; items: T[] }> {
  try {
    const items = await task();
    return { id, ok: true, count: items.length, items };
  } catch (error) {
    return {
      id,
      ok: false,
      count: 0,
      error: error instanceof Error ? error.message : String(error),
      items: []
    };
  }
}

async function upsertRadarGame(client: Queryable, opp: RadarOpportunity, now: Date) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO radar_games (
        slug, normalized_title, display_title, platforms,
        first_seen_at, last_seen_at,
        latest_metric, latest_rank, rank_delta, latest_source_id,
        score, decision, gates, seo_gap, velocity, monetization, events, recommendations,
        is_opportunity, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16::jsonb,$17::jsonb,$18,$5)
      ON CONFLICT (slug) DO UPDATE SET
        display_title = EXCLUDED.display_title,
        platforms = EXCLUDED.platforms,
        last_seen_at = EXCLUDED.last_seen_at,
        latest_metric = EXCLUDED.latest_metric,
        latest_rank = EXCLUDED.latest_rank,
        rank_delta = EXCLUDED.rank_delta,
        latest_source_id = EXCLUDED.latest_source_id,
        score = EXCLUDED.score,
        decision = EXCLUDED.decision,
        gates = EXCLUDED.gates,
        seo_gap = EXCLUDED.seo_gap,
        velocity = EXCLUDED.velocity,
        monetization = EXCLUDED.monetization,
        events = EXCLUDED.events,
        recommendations = EXCLUDED.recommendations,
        is_opportunity = EXCLUDED.is_opportunity,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `,
    [
      opp.slug,
      normalizeEntityKey(opp.title),
      opp.title,
      opp.platforms,
      now,
      opp.latestMetric ?? null,
      opp.latestRank ?? null,
      opp.rankDelta ?? null,
      opp.sources[0] ?? null,
      opp.score,
      opp.decision,
      JSON.stringify(opp.gates),
      JSON.stringify({
        allintitleEstimate: opp.allintitleEstimate,
        seoDifficulty: opp.seoDifficulty,
        existingAssets: opp.existingAssets,
        missingAssets: opp.missingAssets,
        thesis: opp.thesis,
        whyNow: opp.whyNow,
        url: opp.url,
        releaseDate: opp.releaseDate,
        daysSinceRelease: opp.daysSinceRelease
      }),
      JSON.stringify(opp.velocity ?? {}),
      JSON.stringify(opp.monetization),
      JSON.stringify(opp.events),
      JSON.stringify(opp.recommendations),
      opp.decision !== 'IGNORE'
    ]
  );
  return result.rows[0]?.id;
}

async function insertRadarEvents(client: Queryable, gameId: string | undefined, opp: RadarOpportunity, now: Date) {
  if (!gameId || opp.events.length === 0) return;
  for (const eventType of opp.events) {
    await client.query(
      `INSERT INTO radar_events (game_id, event_type, payload, detected_at)
       VALUES ($1, $2, '{}'::jsonb, $3)
       ON CONFLICT DO NOTHING`,
      [gameId, eventType, now]
    );
  }
}

async function insertSnapshot(client: Queryable, gameId: string | undefined, opp: RadarOpportunity, now: Date) {
  if (!gameId) return;
  await client.query(
    `INSERT INTO radar_snapshots (game_id, source_id, metric, rank, captured_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [gameId, opp.sources[0] ?? 'unknown', opp.latestMetric ?? null, opp.latestRank ?? null, now]
  );
}

async function loadSnapshotsBySlug(
  client: Queryable,
  slugs: string[],
  since: Date
): Promise<Map<string, import('./types').RadarSnapshotRow[]>> {
  const map = new Map<string, import('./types').RadarSnapshotRow[]>();
  if (slugs.length === 0) return map;
  const result = await client.query<{
    slug: string;
    source_id: string;
    metric: string | null;
    rank: number | null;
    captured_at: Date;
  }>(
    `
      SELECT g.slug, s.source_id, s.metric, s.rank, s.captured_at
      FROM radar_snapshots s
      JOIN radar_games g ON g.id = s.game_id
      WHERE g.slug = ANY($1) AND s.captured_at >= $2
      ORDER BY s.captured_at ASC
    `,
    [slugs, since]
  );
  for (const row of result.rows) {
    const list = map.get(row.slug) ?? [];
    list.push({ source_id: row.source_id, metric: row.metric, rank: row.rank, captured_at: row.captured_at });
    map.set(row.slug, list);
  }
  return map;
}

async function upsertRadarReport(client: Queryable, digest: RadarDigest, markdownReport: string, now: Date) {
  const reportDate = digest.generatedAt.slice(0, 10);
  await client.query(
    `
      INSERT INTO radar_reports (report_date, status, digest, sources_health, markdown_report, opportunity_count, created_at, updated_at)
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $7)
      ON CONFLICT (report_date) DO UPDATE SET
        status = EXCLUDED.status,
        digest = EXCLUDED.digest,
        sources_health = EXCLUDED.sources_health,
        markdown_report = EXCLUDED.markdown_report,
        opportunity_count = EXCLUDED.opportunity_count,
        updated_at = EXCLUDED.updated_at
    `,
    [
      reportDate,
      digest.status,
      JSON.stringify({ generatedAt: digest.generatedAt, headlines: digest.headlines, opportunities: digest.opportunities }),
      JSON.stringify(digest.sources),
      markdownReport,
      digest.opportunities.length,
      now
    ]
  );
}

async function pruneOldSnapshots(client: Queryable) {
  await client.query(
    `DELETE FROM radar_snapshots WHERE captured_at < now() - ($1 || ' days')::interval`,
    [String(SNAPSHOT_RETENTION_DAYS)]
  );
}

/** 读取已有实体的首见时间（NEW_GAME 事件判定用），必须在落本次快照前查询 */
async function loadFirstSeenBySlug(client: Queryable, slugs: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (slugs.length === 0) return map;
  const result = await client.query<{ slug: string; first_seen_at: Date }>(
    'SELECT slug, first_seen_at FROM radar_games WHERE slug = ANY($1)',
    [slugs]
  );
  for (const row of result.rows) map.set(row.slug, new Date(row.first_seen_at).toISOString());
  return map;
}

export async function runRadarCron(
  env: App.Platform['env'],
  deps: RadarDeps = {}
): Promise<RadarDigest> {
  const now = deps.now ?? (() => new Date());
  const runAt = now();
  const fetchImpl = deps.fetchImpl ?? fetch;
  const notifier = deps.notifier ?? createLarkNotifier({ webhookUrl: env?.LARK_WEBHOOK_URL });

  const skippedDigest: RadarDigest = {
    generatedAt: runAt.toISOString(),
    status: 'failed',
    sources: [],
    opportunities: [],
    headlines: []
  };

  if (!isDatabaseConfigured(toPlatform(env))) {
    console.warn('AppSearchly radar cron skipped: database is not configured.');
    return skippedDigest;
  }

  try {
    const digest = await withDatabase(toPlatform(env), async (client) => {
      // 1. 多源并发发现（单源失败降级）
      const [steam, roblox, itch, cocrea, playhop] = await Promise.all([
        settleSource('steam-top', async () => {
          const { top, growth } = await fetchSteamRadarSignals(fetchImpl, { limit: 40 });
          return [...top, ...growth];
        }),
        settleSource('roblox-trending', async () => {
          const { trending, upcoming } = await fetchRobloxRadarSignals(fetchImpl, { limit: 24 });
          return [...trending, ...upcoming];
        }),
        settleSource('itch', () => fetchItchRadarSignals(fetchImpl, { limit: 25 })),
        settleSource('cocrea', () => fetchCocreaRadarSignals(fetchImpl, { limit: 30 })),
        settleSource('playhop', () => fetchPlayhopRadarSignals(fetchImpl, { limit: 25 }))
      ]);

      const sources: SourceHealth[] = [steam, roblox, itch, cocrea, playhop].map(
        ({ id, ok, count, error }) => ({ id, ok, count, error })
      );
      const signals: RadarSignal[] = [steam, roblox, itch, cocrea, playhop].flatMap((s) => s.items);
      const okSources = sources.filter((s) => s.ok).length;

      if (signals.length === 0) {
        throw new Error(`All radar sources failed: ${sources.map((s) => `${s.id}: ${s.error}`).join('; ')}`);
      }

      // 2. 实体 slug 集合（评分前的 DB 状态查询用）
      const slugs = Array.from(
        new Set(
          signals
            .map((s) => slugifyTitle(s.title))
            .filter((slug) => slug && slug !== 'game')
        )
      );
      const firstSeenBySlug = await loadFirstSeenBySlug(client, slugs);

      // 3. 载入 30 天快照历史（velocity 真数据），再评分
      const historySince = new Date(runAt.getTime() - 30 * 86_400_000);
      const snapshotsBySlug = await loadSnapshotsBySlug(client, slugs, historySince);

      const opportunities = await scoreGameOpportunities(signals, {
        fetchImpl,
        probeSeoLimit: SEO_PROBE_LIMIT,
        limit: OPPORTUNITY_LIMIT,
        snapshotsBySlug,
        firstSeenBySlug,
        now: runAt
      });

      // 4. 持久化：upsert 实体 + 追加快照 + 事件（幂等）
      for (const opp of opportunities) {
        const gameId = await upsertRadarGame(client, opp, runAt);
        await insertSnapshot(client, gameId, opp, runAt);
        await insertRadarEvents(client, gameId, opp, runAt);
      }

      // 5. 日报入库 + 快照保留期清理
      const digest: RadarDigest = {
        generatedAt: runAt.toISOString(),
        status: okSources === sources.length ? 'success' : 'partial',
        sources,
        opportunities,
        headlines: opportunities.slice(0, 3).map((o) => `${o.title} (${o.score})`)
      };
      await upsertRadarReport(client, digest, formatRadarLarkReport(digest), runAt);
      await pruneOldSnapshots(client);

      return digest;
    });

    await notifier(formatRadarLarkReport(digest));
    console.log(
      'AppSearchly radar cron completed:',
      JSON.stringify({ status: digest.status, opportunities: digest.opportunities.length })
    );
    return digest;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error('AppSearchly radar cron failed:', error);
    await notifier(`[AppSearchly] 游戏雷达 cron 失败：${reason}`);
    return { ...skippedDigest, status: 'failed' };
  }
}
