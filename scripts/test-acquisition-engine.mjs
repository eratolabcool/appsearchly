import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';
import { ProductHuntConnector } from '../src/lib/connectors/producthunt';
import { GitHubConnector } from '../src/lib/connectors/github';
import { HackerNewsConnector } from '../src/lib/connectors/hackernews';
import { RssConnector } from '../src/lib/connectors/rss';
import { crawlToolWebsite, createRateLimiter } from '../src/lib/server/acquisition/crawler';
import { normalizeDomain, nameSimilarity } from '../src/lib/server/acquisition/dedupe';
import { extractToolData, validateExtractedTool } from '../src/lib/server/acquisition/extractor';
import { runDiscovery, listImports, approveImport, rejectImport } from '../src/lib/server/acquisition/pipeline';

process.env.E2E_TEST_MODE = 'true';

const { Client } = pg;

function assertNoBareCreate(sql, filename) {
  const stripped = sql
    .replace(/--.*$/gm, '')
    .replace(/CREATE TRIGGER/gi, 'CREATE_TRIGGER')
    .replace(/CREATE EXTENSION IF NOT EXISTS/gi, '')
    .replace(/CREATE TABLE IF NOT EXISTS/gi, '')
    .replace(/CREATE UNIQUE INDEX IF NOT EXISTS/gi, '')
    .replace(/CREATE INDEX IF NOT EXISTS/gi, '');
  assert.equal(/CREATE\s+TABLE/i.test(stripped), false, `${filename} has non-idempotent CREATE TABLE`);
  assert.equal(/CREATE\s+(UNIQUE\s+)?INDEX/i.test(stripped), false, `${filename} has non-idempotent CREATE INDEX`);
}

async function testMigrationContracts() {
  const files = (await readdir('db/migrations')).filter((file) => file.endsWith('.sql'));
  for (const file of files) {
    const sql = await readFile(`db/migrations/${file}`, 'utf8');
    assertNoBareCreate(sql, file);
  }

  const acquisition = await readFile('db/migrations/0007_acquisition_engine.sql', 'utf8');
  for (const table of ['data_sources', 'tool_discovery_jobs', 'tool_import_queue']) {
    assert.match(acquisition, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.doesNotMatch(acquisition, /\bcitext\b/i);
}

async function testConnectors() {
  const connectors = [new ProductHuntConnector(), new GitHubConnector(), new HackerNewsConnector(), new RssConnector()];
  for (const connector of connectors) {
    const tools = await connector.fetchTools({ limit: 1 });
    assert.equal(tools.length, 1);
    assert.ok(tools[0].name);
    assert.match(tools[0].url, /^https:\/\//);
    assert.ok(tools[0].source);
  }
}

function htmlFor(url) {
  const host = new URL(url).hostname;
  return `<!doctype html>
    <html>
      <head>
        <title>${host} AI Platform</title>
        <meta name="description" content="A production-ready AI automation platform for teams with workflow agents and analytics." />
        <meta property="og:image" content="/logo.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <a href="/pricing">Pricing</a>
        <a href="/docs">API docs</a>
        Free and paid monthly plans for AI automation, chatbot agents, workflow integration, analytics, image generation, and API teams.
      </body>
    </html>`;
}

async function mockFetch(input) {
  const url = typeof input === 'string' ? input : input.url;
  if (url.endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /\n', { status: 200 });
  return new Response(htmlFor(url), {
    status: 200,
    headers: { 'content-type': 'text/html' }
  });
}

async function testCrawlerExtractorAndDedupe() {
  const page = await crawlToolWebsite('https://crawler-fixture.example.com', {
    fetchImpl: mockFetch,
    timeoutMs: 500,
    retries: 1
  });
  assert.equal(page.robotsAllowed, true);
  assert.match(page.title, /AI Platform/);
  assert.equal(page.logoUrl, 'https://crawler-fixture.example.com/logo.png');
  assert.ok(page.features.includes('automation'));
  assert.ok(page.links.includes('https://crawler-fixture.example.com/pricing'));

  const extracted = await extractToolData({
    name: 'Crawler Fixture',
    url: 'https://crawler-fixture.example.com',
    description: 'AI automation test fixture',
    source: 'test'
  }, page);
  assert.equal(validateExtractedTool(extracted).valid, true);
  assert.equal(validateExtractedTool({ name: 'bad' }).valid, false);
  assert.equal(normalizeDomain('https://www.chat.openai.com/chat'), 'openai.com');
  assert.ok(nameSimilarity('AI Agent Builder', 'Agent Builder AI') > 0.6);

  const release = createRateLimiter(1);
  await release();
  await release();
}

async function testImportPipeline() {
  const connectionString = process.env.DATABASE_URL?.trim();
  assert.ok(connectionString, 'DATABASE_URL is required for import pipeline tests');

  const client = new Client({ connectionString, application_name: 'appsearchly-acquisition-test' });
  await client.connect();
  try {
    await client.query(`
      DELETE FROM tool_import_queue
      WHERE raw_data->>'url' IN (
        'https://product-hunt-studio.example.com/',
        'https://product-hunt-agents.example.com/'
      )
    `);
    await client.query(`
      DELETE FROM tools
      WHERE canonical_domain IN ('product-hunt-studio.example.com', 'product-hunt-agents.example.com')
    `);
    await client.query(`
      UPDATE data_sources
      SET enabled = (type = 'product_hunt'), last_sync_at = NULL
      WHERE type IN ('product_hunt', 'github', 'hacker_news', 'rss', 'ai_directory', 'manual_import')
    `);

    const summary = await runDiscovery(client, {
      fetchImpl: mockFetch,
      sourceLimit: 1,
      itemLimit: 2,
      crawlDelayMs: 0
    });
    assert.equal(summary.jobsStarted, 1);
    assert.equal(summary.itemsFound, 2);
    assert.equal(summary.itemsProcessed, 2);
    assert.equal(summary.queued, 2);
    assert.deepEqual(summary.errors, []);

    const pending = await listImports(client, 'pending');
    const testImports = pending.filter((item) => String(item.raw_data?.url ?? '').includes('product-hunt-'));
    assert.equal(testImports.length, 2);
    assert.ok(testImports.every((item) => Number(item.quality_score) >= 80));

    const approved = await approveImport(client, testImports[0].id);
    assert.ok(approved?.id);
    assert.equal(approved.status, 'published');
    assert.match(approved.slug, /product-hunt/);

    const tool = await client.query('SELECT id, status FROM tools WHERE id = $1', [approved.id]);
    assert.equal(tool.rows[0]?.status, 'published');

    const rejected = await rejectImport(client, testImports[1].id, 'Acquisition engine E2E rejection test');
    assert.equal(rejected?.status, 'rejected');
  } finally {
    await client.end();
  }
}

await testMigrationContracts();
await testConnectors();
await testCrawlerExtractorAndDedupe();
await testImportPipeline();

console.log('Acquisition engine tests passed.');
