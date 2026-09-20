/**
 * Game Opportunity Radar 测试协议：node:assert + tsx + 真 Postgres + fetchImpl stub。
 * 覆盖：normalize / V1 评分公式 / velocity 真快照窗口 / gates 决策矩阵 /
 * pipeline happy path（幂等 + 快照追加 + prune）/ 单源 500 降级 / 报告体积 / DB 未配置 skip。
 */
import assert from 'node:assert/strict';
import pg from 'pg';
import { normalizeEntityKey, normalizeTitle, slugifyTitle } from '../src/lib/server/radar/normalize';
import { scoreGameOpportunities } from '../src/lib/server/radar/score';
import { computeVelocity } from '../src/lib/server/radar/velocity';
import { evaluateGates } from '../src/lib/server/radar/gates';
import { classifyRadarEvents } from '../src/lib/server/radar/events';
import { buildRecommendations } from '../src/lib/server/radar/recommendations';
import { formatRadarLarkReport } from '../src/lib/server/radar/report';
import { runRadarCron } from '../src/lib/server/radar/pipeline';

process.env.E2E_TEST_MODE = 'true';

const NOW = new Date('2026-09-20T02:00:00Z');
const DAY = 86_400_000;

// ==================== fetchImpl stub（fixture route map） ====================

const STEAM_CHARTS_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/';
const ROBLOX_SORTS_URL = 'https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=appsearchly-radar&device=computer';
const ROBLOX_GAMES_URL = 'https://games.roblox.com/v1/games?universeIds=9001,9002';
const ITCH_URL = 'https://itch.io/games/new-and-popular/platform-web.xml';
const COCREA_URL = 'https://cocrea.world/api/projects/public?limit=30';
const PLAYHOP_URL = 'https://playhop.com/api/games/popular?limit=25';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function radarFetchStub({ failPlayhop = false } = {}) {
  return async (url, init = {}) => {
    const method = init.method || 'GET';
    if (method === 'HEAD') return new Response(null, { status: 404 }); // fandom/wiki.gg 探测 → 无 wiki
    if (url === STEAM_CHARTS_URL) {
      return jsonResponse({
        response: {
          ranks: [
            { rank: 1, appid: 1001, last_week_rank: 1, peak_in_game: 120000 },
            { rank: 2, appid: 1002, last_week_rank: 8, peak_in_game: 45000 }
          ]
        }
      });
    }
    if (url.startsWith('https://store.steampowered.com/api/appdetails')) {
      const appId = new URL(url).searchParams.get('appids');
      const meta = {
        1001: { name: 'Star Valleys', release_date: { coming_soon: false, date: '1 Mar, 2026' } },
        1002: { name: 'Dupont Quest', release_date: { coming_soon: false, date: '10 Sep, 2026' } }
      }[appId];
      return jsonResponse({ [appId]: { success: true, data: meta } });
    }
    if (url === ROBLOX_SORTS_URL) {
      return jsonResponse({
        sorts: [
          {
            id: 'trending', sortDisplayName: 'Top Trending',
            games: [{ universeId: 9001, rootPlaceId: 7001, name: 'Star Valleys', playerCount: 5000 }]
          },
          {
            id: 'upcoming', sortDisplayName: 'Up-and-Coming',
            games: [{ universeId: 9002, rootPlaceId: 7002, name: 'Dupont Quest', playerCount: 800 }]
          }
        ]
      });
    }
    if (url === ROBLOX_GAMES_URL) {
      return jsonResponse({
        data: [
          { id: 9001, created: '2026-05-01T00:00:00Z' },
          { id: 9002, created: '2026-08-01T00:00:00Z' }
        ]
      });
    }
    if (url === ITCH_URL) {
      const xml = `<?xml version="1.0"?><rss><channel>
        <item><title><![CDATA[Browser Hero]]></title><link>https://bro-itch.example.itch.io/browser-hero</link><pubDate>Tue, 15 Sep 2026 10:00:00 GMT</pubDate></item>
        <item><title><![CDATA[Pixel Forge]]></title><link>https://pix-itch.example.itch.io/pixel-forge</link><pubDate>Wed, 16 Sep 2026 10:00:00 GMT</pubDate></item>
      </channel></rss>`;
      return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/rss+xml' } });
    }
    if (url === COCREA_URL) {
      return jsonResponse({ data: [{ id: 'c1', title: 'Star Valleys', tags: ['sim'] }] });
    }
    if (url === PLAYHOP_URL) {
      if (failPlayhop) return new Response('boom', { status: 500 });
      return jsonResponse({ games: [{ id: 'p1', title: 'Hop Runner', category: 'arcade' }] });
    }
    return new Response('not found', { status: 404 });
  };
}

const noopNotifier = async () => true;

// ==================== 1. normalize ====================

function testNormalize() {
  assert.equal(normalizeEntityKey('  Dupont  Quest! '), 'dupont quest');
  assert.equal(normalizeEntityKey(''), '');
  assert.equal(normalizeTitle('Crôno-Trigger: Édition'), 'crono trigger edition');
  assert.equal(slugifyTitle('Star Valleys: Rise'), 'star-valleys-rise');
  console.log('1. normalize passed');
}

// ==================== 2. V1 评分公式 ====================

function signal(overrides) {
  return {
    id: 'test-1',
    source: 'steam-top',
    title: 'Dupont Quest',
    url: 'https://store.steampowered.com/app/1001',
    metricLabel: 'peak_players',
    metricValue: 100000,
    rank: 1,
    platforms: ['steam'],
    tags: ['steam'],
    capturedAt: NOW.toISOString(),
    ...overrides
  };
}

async function testScoreFormula() {
  const failingFetch = async () => new Response('nf', { status: 404 });

  // 单源：heat 35 + missing 4×8=32 + freshness(10d) 8 = 75（难度 high → seoBonus 0）
  const single = await scoreGameOpportunities([signal({ releaseDate: '2026-09-10' })], {
    fetchImpl: failingFetch,
    now: NOW
  });
  assert.equal(single.length, 1);
  assert.equal(single[0].score, 75);
  assert.equal(single[0].missingAssets.length, 4);
  assert.equal(single[0].seoDifficulty, 'high');
  assert.deepEqual(single[0].sources, ['steam-top']);

  // 双源：+multiSource 10 = 85，事件含 CROSS_PLATFORM
  const dual = await scoreGameOpportunities(
    [
      signal({ releaseDate: '2026-09-10' }),
      signal({
        id: 'test-2', source: 'roblox-trending', metricValue: 500, rank: 3,
        platforms: ['roblox'], tags: ['roblox']
      })
    ],
    { fetchImpl: failingFetch, now: NOW }
  );
  assert.equal(dual[0].score, 85);
  assert.ok(dual[0].events.includes('CROSS_PLATFORM'));
  console.log('2. score formula passed');
}

// ==================== 3. velocity 多窗口 ====================

function testVelocity() {
  const pts = (days, metric) => ({ capturedAt: NOW.getTime() - days * DAY, metric, rank: null });
  const rows = [pts(0, 11000), pts(1, 10000), pts(6, 9000), pts(29, 5000)];
  const v = computeVelocity(rows, NOW.getTime());
  assert.equal(v.v24h, 1000);
  assert.equal(v.v7d, 2000);
  assert.equal(v.v30d, 6000);

  // 数据不足 → null（严格 null ≠ 0）
  const vThin = computeVelocity([pts(0, 100)], NOW.getTime());
  assert.equal(vThin.v24h, null);
  console.log('3. velocity passed');
}

// ==================== 4. gates 决策矩阵（5 种决策） ====================

function testGatesMatrix() {
  const base = {
    peakMetric: 60000, sourceCount: 1, comingSoon: false, hasSteamSource: true,
    velocity: { v24h: null, v72h: null, v7d: 500, v14d: null, v30d: null },
    daysSinceRelease: 30, seoDifficulty: 'low', wikiPresent: false, missingCount: 4
  };
  const decisionOf = (over) => evaluateGates({ ...base, ...over }).decision;

  assert.equal(decisionOf({}), 'BUILD_NOW');
  assert.equal(decisionOf({ velocity: null }), 'PRE_BUILD'); // 冷启动数据不足降级
  assert.equal(
    decisionOf({ wikiPresent: true, missingCount: 1, peakMetric: 60000, sourceCount: 1 }),
    'HIGH_PRIORITY' // g1 PARTIAL + g2 PASS → 2 passes
  );
  assert.equal(
    decisionOf({ peakMetric: 100, sourceCount: 1, wikiPresent: true, missingCount: 1, velocity: null }),
    'WATCH_7D' // 仅 g2 PASS，g1/g3 FAIL，partials 0
  );
  assert.equal(
    decisionOf({ peakMetric: 10, sourceCount: 1, wikiPresent: true, missingCount: 1, velocity: null, daysSinceRelease: 900 }),
    'IGNORE'
  );
  console.log('4. gates matrix passed');
}

// ==================== 5. events + recommendations ====================

function testEventsAndRecommendations() {
  const events = classifyRadarEvents({
    slug: 'star-valleys',
    firstSeenAt: new Date(NOW.getTime() - 24 * 3600_000).toISOString(),
    sources: ['steam-top', 'roblox-trending'],
    velocity: { v24h: 300, v72h: null, v7d: null, v14d: null, v30d: null },
    missingAssets: ['wiki', 'calculator'],
    now: NOW
  });
  for (const e of ['NEW_GAME', 'VELOCITY_BREAKOUT', 'CROSS_PLATFORM', 'WIKI_GAP', 'TOOL_GAP']) {
    assert.ok(events.includes(e), `expected event ${e}`);
  }

  const rec = buildRecommendations({
    decision: 'BUILD_NOW',
    events,
    missingAssets: ['wiki', 'calculator'],
    tags: ['idle', 'roguelike']
  });
  assert.ok(rec.actions.length > 0);
  assert.ok(rec.sections.includes('wiki') && rec.sections.includes('calculators'));
  assert.ok(rec.tools.includes('idle-calculator') && rec.tools.includes('build-planner'));
  console.log('5. events + recommendations passed');
}

// ==================== 6. 报告体积 ====================

function testReportSize() {
  const digest = {
    generatedAt: NOW.toISOString(),
    status: 'partial',
    sources: [
      { id: 'steam-top', ok: true, count: 40 },
      { id: 'playhop', ok: false, count: 0, error: 'HTTP 500' }
    ],
    opportunities: [
      {
        title: 'Star Valleys', score: 93, decision: 'BUILD_NOW',
        sources: ['steam-top', 'roblox-trending'],
        missingAssets: ['wiki', 'database', 'calculator'],
        events: ['NEW_GAME', 'CROSS_PLATFORM'],
        velocity: { v24h: 300, v72h: null, v7d: 2000, v14d: null, v30d: null }
      }
    ],
    headlines: []
  };
  const text = formatRadarLarkReport(digest);
  assert.ok(text.length < 4096, `report too big: ${text.length}`);
  assert.match(text, /游戏机会雷达日报/);
  assert.match(text, /Star Valleys/);
  assert.match(text, /playhop:err/);
  console.log('6. report size passed');
}

// ==================== DB pipeline 测试 ====================

function testPlatform(connectionString) {
  return { env: { HYPERDRIVE: { connectionString } } };
}

async function seedRadarHistory(client) {
  const game = await client.query(
    `INSERT INTO radar_games (slug, normalized_title, display_title, platforms, first_seen_at, last_seen_at, is_opportunity)
     VALUES ('star-valleys', 'star valleys', 'Star Valleys', '{steam}', $1, $1, true)
     ON CONFLICT (slug) DO UPDATE SET first_seen_at = EXCLUDED.first_seen_at
     RETURNING id`,
    [new Date(NOW.getTime() - DAY)]
  );
  const gameId = game.rows[0].id;
  // 30 天快照：每天 +1000 → v24h = 1000 ≥ 200 → VELOCITY_BREAKOUT
  for (let i = 30; i >= 1; i--) {
    await client.query(
      `INSERT INTO radar_snapshots (game_id, source_id, metric, rank, captured_at)
       VALUES ($1, 'steam-top', $2, NULL, $3::timestamptz::date + interval '2 hours')`,
      [gameId, 88000 + (30 - i) * 1000, new Date(NOW.getTime() - i * DAY).toISOString().slice(0, 10)]
    );
  }
  return gameId;
}

async function testPipeline(connectionString) {
  const { Client } = pg;
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query('TRUNCATE radar_games, radar_snapshots, radar_reports, radar_events CASCADE');
    await seedRadarHistory(client);

    const env = testPlatform(connectionString).env;
    const deps = { fetchImpl: radarFetchStub(), notifier: noopNotifier, now: () => NOW };

    // --- happy path run 1 ---
    const digest1 = await runRadarCron(env, deps);
    assert.equal(digest1.status, 'success');
    assert.equal(digest1.sources.length, 5);
    assert.ok(digest1.opportunities.length > 0, 'expected opportunities');

    const star = digest1.opportunities.find((o) => o.slug === 'star-valleys');
    assert.ok(star, 'star-valleys should be scored');
    assert.ok(star.velocity && star.velocity.v24h >= 200, 'velocity from seeded snapshots');
    assert.ok(star.events.includes('NEW_GAME') && star.events.includes('VELOCITY_BREAKOUT'));

    const reports = await client.query('SELECT opportunity_count, status FROM radar_reports WHERE report_date = $1', [NOW.toISOString().slice(0, 10)]);
    assert.equal(reports.rows.length, 1);
    assert.equal(reports.rows[0].status, 'success');
    assert.equal(reports.rows[0].opportunity_count, digest1.opportunities.length);

    const run1Games = await client.query('SELECT count(*)::int AS n FROM radar_games');
    const run1Snaps = await client.query('SELECT count(*)::int AS n FROM radar_snapshots');
    // 40 天旧快照 → 下一次 run 应被 prune
    await client.query(
      `INSERT INTO radar_snapshots (game_id, source_id, metric, captured_at)
       SELECT id, 'steam-top', 1000, now() - interval '40 days' FROM radar_games LIMIT 1`
    );
    const withOld = await client.query('SELECT count(*)::int AS n FROM radar_snapshots');

    // --- 幂等 run 2：games 不重复、快照追加、旧快照被清理 ---
    const digest2 = await runRadarCron(env, deps);
    assert.equal(digest2.status, 'success');

    const run2Games = await client.query('SELECT count(*)::int AS n FROM radar_games');
    assert.equal(run2Games.rows[0].n, run1Games.rows[0].n, 'games must not duplicate across runs');

    const run2Snaps = await client.query('SELECT count(*)::int AS n FROM radar_snapshots');
    assert.equal(run2Snaps.rows[0].n, withOld.rows[0].n - 1 + Number(reports.rows[0].opportunity_count), 'snapshots append + old pruned');

    // --- 单源 500 → 降级 partial，不中断 ---
    const digest3 = await runRadarCron(env, {
      ...deps,
      fetchImpl: radarFetchStub({ failPlayhop: true })
    });
    assert.equal(digest3.status, 'partial');
    const playhop = digest3.sources.find((s) => s.id === 'playhop');
    assert.equal(playhop.ok, false);
    assert.ok(digest3.opportunities.length > 0, 'other sources still produce opportunities');

    console.log('7. pipeline happy path + idempotency + prune + degradation passed');
  } finally {
    await client.end();
  }
}

async function testUnconfiguredSkip() {
  const digest = await runRadarCron({ env: {} }, { notifier: noopNotifier });
  assert.equal(digest.status, 'failed');
  assert.deepEqual(digest.opportunities, []);
  console.log('8. DB-unconfigured skip passed');
}

// ==================== main ====================

async function main() {
  testNormalize();
  await testScoreFormula();
  testVelocity();
  testGatesMatrix();
  testEventsAndRecommendations();
  testReportSize();

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for radar pipeline tests');
  }
  await testPipeline(connectionString);
  await testUnconfiguredSkip();

  console.log('Radar tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
