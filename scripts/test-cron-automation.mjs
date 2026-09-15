import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';
import { formatDailyReport, createLarkNotifier } from '../src/lib/server/notify';
import { autoApproveImports } from '../src/lib/server/acquisition/pipeline';
import { createPublishedTool } from '../src/lib/server/repositories/tool-repository';
import {
  validateArticleBody,
  createArticleDraft,
  publishArticle,
  getArticleBySlug
} from '../src/lib/server/articles';
import { generateWeeklyArticleDraft } from '../src/lib/server/article-generator';

process.env.E2E_TEST_MODE = 'true';

const { Client } = pg;

// 构造 Hyperdrive 形状的 platform，让统一数据层走真连接
function testPlatform(connectionString) {
  return { env: { HYPERDRIVE: { connectionString } } };
}

const QUEUE_URLS = [
  'https://auto-approve-high.example.com',
  'https://auto-approve-low.example.com',
  'https://auto-approve-existing.example.com',
  'https://github.com/test/some-ai-repo'
];
const ARTICLE_DOMAIN = 'auto-approve-existing.example.com';
const TEST_CATEGORY = 'test-automation-cat';

// ==================== 通知模块（无 DB 依赖） ====================

function testFormatDailyReport() {
  const text = formatDailyReport({
    discovered: 12,
    autoApproved: [{ name: 'Agent Builder', slug: 'agent-builder' }],
    autoRejectedDuplicates: 2,
    pendingCount: 25,
    failedJobs: 1,
    errors: ['source X: timeout'],
    alertThreshold: 20
  });
  assert.match(text, /今日采集: 12/);
  assert.match(text, /自动发布: 1/);
  assert.match(text, /Agent Builder/);
  assert.match(text, /待人工审核: 25/);
  assert.match(text, /超过阈值 20/);
  assert.match(text, /失败任务: 1/);
  assert.match(text, /source X: timeout/);
}

async function testLarkNotifier() {
  // 未配置 webhook → no-op
  const disabled = createLarkNotifier({ log: () => undefined });
  assert.equal(await disabled('hello'), false);

  // 正常推送：断言飞书消息格式
  const calls = [];
  const ok = createLarkNotifier({
    webhookUrl: 'https://hooks.example.invalid/webhook',
    fetchImpl: async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return new Response('{}', { status: 200 });
    }
  });
  assert.equal(await ok('日报内容'), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://hooks.example.invalid/webhook');
  assert.deepEqual(calls[0].body, { msg_type: 'text', content: { text: '日报内容' } });

  // 非 2xx → false 且不抛
  const failing = createLarkNotifier({
    webhookUrl: 'https://hooks.example.invalid/webhook',
    fetchImpl: async () => new Response('err', { status: 500 })
  });
  assert.equal(await failing('hello'), false);

  // 网络异常 → false 且不抛
  const throwing = createLarkNotifier({
    webhookUrl: 'https://hooks.example.invalid/webhook',
    fetchImpl: async () => {
      throw new Error('network down');
    }
  });
  assert.equal(await throwing('hello'), false);
}

// ==================== 文章 body 校验（无 DB 依赖） ====================

function testValidateArticleBody() {
  const valid = validateArticleBody({
    intro: 'Intro text',
    items: [{ toolSlug: 'tool-a', comment: 'Great pick' }],
    conclusion: 'Closing text'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.value.items[0].toolSlug, 'tool-a');

  assert.equal(validateArticleBody(null).valid, false);
  assert.equal(validateArticleBody({ intro: 'x', items: [], conclusion: 'y' }).valid, false);
  assert.equal(validateArticleBody({ intro: 'x', items: [{ toolSlug: 'a' }], conclusion: 'y' }).valid, false);
}

// ==================== 自动批准 + 文章生成（真 DB） ====================

async function testAutoApprove() {
  const connectionString = process.env.DATABASE_URL?.trim();
  assert.ok(connectionString, 'DATABASE_URL is required for cron automation tests');

  const client = new Client({ connectionString, application_name: 'appsearchly-cron-test' });
  await client.connect();
  try {
    await cleanup(client);
    // 预置已发布工具，作为重复项的碰撞目标
    const existing = await createPublishedTool(client, {
      name: 'AutoApprove Existing Tool',
      website: 'https://auto-approve-existing.example.com',
      description: 'Pre-existing published tool used as the duplicate collision target in tests.',
      category: TEST_CATEGORY
    });

    await seedQueueItem(client, {
      name: 'AutoApprove High Score Tool',
      url: 'https://auto-approve-high.example.com',
      score: 90,
      description: 'A high quality AI automation platform with workflow agents, analytics dashboards and API access.'
    });
    await seedQueueItem(client, {
      name: 'AutoApprove Low Score Tool',
      url: 'https://auto-approve-low.example.com',
      score: 40,
      description: 'Too thin to describe.'
    });
    await seedQueueItem(client, {
      name: 'AutoApprove Another Existing Tool',
      url: 'https://auto-approve-existing.example.com',
      score: 95,
      description: 'Duplicate of the pre-existing published tool, must be auto rejected.'
    });
    await seedQueueItem(client, {
      name: 'AutoApprove GitHub Repo Item',
      url: 'https://github.com/test/some-ai-repo',
      score: 95,
      description: 'A GitHub repository entry which must never be auto published.'
    });

    const summary = await autoApproveImports(client, { minScore: 80, limit: 50 });

    // 高分无重复 → 自动发布
    assert.equal(summary.approved.length, 1);
    assert.equal(summary.approved[0].name, 'AutoApprove High Score Tool');
    const published = await client.query("SELECT status FROM tools WHERE slug = $1", [summary.approved[0].slug]);
    assert.equal(published.rows[0]?.status, 'published');

    // 重复 → 自动拒绝
    assert.equal(summary.rejectedDuplicates, 1);

    // 低分 → 保持 pending
    const lowPending = await client.query(
      "SELECT status FROM tool_import_queue WHERE raw_data->>'url' = 'https://auto-approve-low.example.com'"
    );
    assert.equal(lowPending.rows[0]?.status, 'pending');

    // 聚合站条目（GitHub 仓库）→ 保持 pending 人工审，绝不自动发布
    const githubPending = await client.query(
      "SELECT status FROM tool_import_queue WHERE raw_data->>'url' = 'https://github.com/test/some-ai-repo'"
    );
    assert.equal(githubPending.rows[0]?.status, 'pending');
    assert.deepEqual(summary.errors, []);

    // ============ 文章生成 ============
    // 造 5 个同分类已发布工具，满足 pickTopCategory >= 5
    const toolSlugs = [];
    for (let i = 1; i <= 5; i++) {
      const tool = await createPublishedTool(client, {
        name: `Gen Article Tool ${i}`,
        website: `https://gen-article-tool-${i}.example.com`,
        description: `AI test fixture number ${i} for article generation with plenty of descriptive text.`,
        category: TEST_CATEGORY
      });
      toolSlugs.push(tool.slug);
    }

    // fake aiRun 与 pickTopCategory/pickTools 用同一套 SQL：CI 的 DB 里有其他测试数据，
    // 生成器可能选中非 TEST_CATEGORY 的分类，所以必须动态查当前 top 分类来构造响应
    const validAiRun = async () => {
      const top = await client.query(
        `SELECT category, count(*)::int AS count FROM tools WHERE status = 'published' AND category IS NOT NULL
         GROUP BY category HAVING count(*) >= 5 ORDER BY count DESC LIMIT 1`
      );
      const rows = await client.query(
        `SELECT slug FROM tools WHERE status = 'published' AND category = $1
         ORDER BY is_verified DESC, updated_at DESC LIMIT 5`,
        [top.rows[0].category]
      );
      const slugs = rows.rows.map((row) => row.slug);
      return {
        response: JSON.stringify({
          title: `Top 5 ${top.rows[0].category} AI Tools`,
          excerpt: 'A data-driven ranking built from verified directory entries.',
          intro: 'Here are the top tools in this category, ranked by directory data.',
          items: slugs.map((slug, index) => ({ toolSlug: slug, comment: `Rank ${index + 1} pick.` })),
          conclusion: 'All of these tools are verified directory entries worth trying.'
        })
      };
    };
    const draft = await generateWeeklyArticleDraft(client, { aiRun: validAiRun, model: 'test-model' });
    assert.ok(draft.slug?.startsWith('ai-'), `expected ai- slug, got ${JSON.stringify(draft)}`);
    assert.match(draft.title, /Top 5/);

    const page = await getArticleBySlug(testPlatform(connectionString), draft.slug);
    assert.equal(page, null, 'draft must not be publicly visible');

    // 幻觉 slug → skipped
    const hallucinated = await generateWeeklyArticleDraft(client, {
      aiRun: async () => ({
        response: JSON.stringify({
          title: 'Hallucinated Title For Article',
          excerpt: 'An excerpt that is long enough for validation.',
          intro: 'Intro text.',
          items: [{ toolSlug: 'not-a-real-slug', comment: 'Made up.' }],
          conclusion: 'Conclusion text.'
        })
      })
    });
    assert.ok('skipped' in hallucinated, 'hallucinated slugs must be skipped');

    // AI 抛异常 → skipped（不向上抛）
    const throwing = await generateWeeklyArticleDraft(client, {
      aiRun: async () => {
        throw new Error('model overloaded');
      }
    });
    assert.ok('skipped' in throwing);

    // 发布后前台可见
    const draftRow = await client.query("SELECT id FROM articles WHERE slug = $1", [draft.slug]);
    assert.equal(await publishArticle(client, draftRow.rows[0].id, 'test'), true);
    const publishedPage = await getArticleBySlug(testPlatform(connectionString), draft.slug);
    assert.ok(publishedPage);
    assert.equal(publishedPage.tools.length, 5);
    assert.equal(publishedPage.tools[0].comment, 'Rank 1 pick.');

    console.log('Cron automation DB tests passed.');
  } finally {
    await cleanup(client);
    await client.end();
  }
}

async function seedQueueItem(client, { name, url, score, description }) {
  await client.query(
    `
      INSERT INTO tool_import_queue (raw_data, crawled_data, extracted_data, quality_score, status)
      VALUES ($1::jsonb, $2::jsonb, $3::jsonb, $4, 'pending')
      ON CONFLICT ((lower(raw_data->>'url'))) WHERE status = 'pending' AND raw_data ? 'url'
      DO NOTHING
    `,
    [
      JSON.stringify({ name, url, description, source: 'test' }),
      JSON.stringify({ url, title: name }),
      JSON.stringify({ name, description, category: TEST_CATEGORY, features: ['automation'] }),
      score
    ]
  );
}

async function cleanup(client) {
  await client.query("DELETE FROM tool_import_queue WHERE raw_data->>'url' = ANY($1)", [QUEUE_URLS]);
  await client.query('DELETE FROM articles WHERE slug LIKE $1', ['ai-top-5-%']);
  await client.query('DELETE FROM tools WHERE canonical_domain = ANY($1)', [
    [ARTICLE_DOMAIN, 'auto-approve-high.example.com', 'auto-approve-low.example.com']
  ]);
  await client.query('DELETE FROM tools WHERE canonical_domain LIKE $1', ['gen-article-tool-%.example.com']);
  await client.query("DELETE FROM tools WHERE slug LIKE 'ai-top-5%'");
}

async function testMigrationContracts() {
  const files = (await readdir('db/migrations')).filter((file) => file.endsWith('.sql'));
  for (const file of files) {
    const sql = await readFile(`db/migrations/${file}`, 'utf8');
    const stripped = sql
      .replace(/--.*$/gm, '')
      .replace(/CREATE TRIGGER/gi, 'CREATE_TRIGGER')
      .replace(/CREATE EXTENSION IF NOT EXISTS/gi, '')
      .replace(/CREATE TABLE IF NOT EXISTS/gi, '')
      .replace(/CREATE UNIQUE INDEX IF NOT EXISTS/gi, '')
      .replace(/CREATE INDEX IF NOT EXISTS/gi, '');
    assert.equal(/CREATE\s+TABLE/i.test(stripped), false, `${file} has non-idempotent CREATE TABLE`);
    assert.equal(/CREATE\s+(UNIQUE\s+)?INDEX/i.test(stripped), false, `${file} has non-idempotent CREATE INDEX`);
  }

  const articles = await readFile('db/migrations/0008_articles.sql', 'utf8');
  assert.match(articles, /CREATE TABLE IF NOT EXISTS articles/);
  assert.match(articles, /status text NOT NULL DEFAULT 'draft'/);
}

await testFormatDailyReport();
await testLarkNotifier();
await testValidateArticleBody();
await testMigrationContracts();
await testAutoApprove();

console.log('Cron automation tests passed.');
