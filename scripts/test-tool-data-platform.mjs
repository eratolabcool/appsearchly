import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { Client } from 'pg';
import { buildSeedTools } from './seed-tools.ts';
import {
  getToolBySlug,
  listCategories,
  listTools,
  validateToolEntity
} from '../src/lib/server/repositories/tool-entity-repository.ts';

const execFileAsync = promisify(execFile);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function testMigrationContract() {
  const sql = await readFile('db/migrations/0006_tool_entity.sql', 'utf8');
  assert(!/CREATE TABLE\s+(?!IF NOT EXISTS)/i.test(sql), 'P1 migration must use CREATE TABLE IF NOT EXISTS.');
  assert(!/CREATE INDEX\s+(?!IF NOT EXISTS)/i.test(sql), 'P1 migration must use CREATE INDEX IF NOT EXISTS.');
  assert(sql.includes('tool_metadata jsonb'), 'P1 migration must add tool_metadata JSONB.');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS tool_categories'), 'P1 migration must create tool_categories.');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS features'), 'P1 migration must create features.');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS tool_features'), 'P1 migration must create tool_features.');
}

async function testStaticSeedContract() {
  const tools = buildSeedTools();
  assert(tools.length >= 100, 'Seed data must include at least 100 tools.');
  assert(new Set(tools.map((tool) => tool.slug)).size === tools.length, 'Seed slugs must be unique.');
  assert(tools.every((tool) => tool.categories.length > 0), 'Every seed tool needs a category.');
  assert(tools.every((tool) => tool.features.length > 0), 'Every seed tool needs features.');
  assert(tools.every((tool) => tool.metadata.platforms.length > 0), 'Every seed tool needs platforms metadata.');
}

function testValidator() {
  const invalid = validateToolEntity({
    name: '',
    websiteUrl: 'notaurl',
    slug: '',
    description: 'short',
    categoryIds: []
  });
  assert(!invalid.valid, 'Invalid tool payload must fail validation.');

  const valid = validateToolEntity({
    name: 'Validation Tool',
    websiteUrl: 'https://example.com',
    slug: 'validation-tool',
    description: 'A sufficiently descriptive tool record for validation.',
    categoryIds: ['category-id']
  });
  assert(valid.valid, 'Valid tool payload must pass validation.');
}

async function testDatabaseContracts() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('DATABASE_URL not set; skipped DB-backed P1 tests.');
    return;
  }

  await execFileAsync(process.execPath, ['--import', 'tsx', 'scripts/seed-tools.ts'], {
    env: process.env,
    maxBuffer: 1024 * 1024 * 4
  });

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const counts = await client.query(`
      SELECT
        (SELECT count(*)::int FROM tools WHERE status = 'published') AS tools,
        (SELECT count(*)::int FROM categories WHERE status = 'active') AS categories,
        (SELECT count(*)::int FROM features) AS features,
        (SELECT count(*)::int FROM tool_categories) AS tool_categories,
        (SELECT count(*)::int FROM tool_features) AS tool_features,
        (SELECT count(*)::int FROM pricing_plans) AS pricing
    `);
    const row = counts.rows[0];
    assert(row.tools >= 100, 'Database must contain at least 100 published tools.');
    assert(row.categories >= 8, 'Database must contain AI categories.');
    assert(row.features >= 20, 'Database must contain features.');
    assert(row.tool_categories >= 100, 'Database must contain tool category relations.');
    assert(row.tool_features >= 100, 'Database must contain tool feature relations.');
    assert(row.pricing >= 100, 'Database must contain pricing plans.');

    const categories = await listCategories(client);
    assert(categories.some((category) => category.slug === 'ai-writing'), 'Category API contract must include AI Writing.');

    const imageSearch = await listTools(client, { q: 'image', pageSize: 10 });
    assert(imageSearch.tools.length > 0, 'Search must return image-related tools.');

    const filtered = await listTools(client, { category: 'ai-coding', feature: 'code-generation', pageSize: 10 });
    assert(filtered.tools.length > 0, 'Category + feature filtering must return tools.');

    const detail = await getToolBySlug(client, 'chatgpt');
    assert(detail, 'Tool detail API contract must return ChatGPT.');
    assert(detail.categories.length > 0, 'Tool detail must include categories.');
    assert(detail.features.length > 0, 'Tool detail must include features.');
    assert(detail.pricing.length > 0, 'Tool detail must include pricing.');
    assert(Array.isArray(detail.metadata.platforms), 'Tool detail must include metadata.');

    await client.query('BEGIN');
    try {
      const category = await client.query(
        `
          INSERT INTO categories (name, slug, description, icon, status)
          VALUES ('CRUD Test Category', 'crud-test-category', 'Temporary category for P1 tests.', 'test', 'active')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
      );
      const tool = await client.query(
        `
          INSERT INTO tools (
            slug, name, summary, official_url, canonical_domain, primary_category_id,
            status, pricing_model, primary_source_url, primary_source_type, source_checked_at,
            data_confidence, verification_status, published_at, website, normalized_domain,
            description, short_description, website_url, category_id, pricing_type, is_verified, tool_metadata
          )
          VALUES (
            'crud-test-tool', 'CRUD Test Tool', 'Temporary CRUD test AI tool record.',
            'https://crud-test.example.com', 'crud-test.example.com', $1,
            'published', 'free', 'https://crud-test.example.com', 'manual_research', now(),
            70, 'human_verified', now(), 'https://crud-test.example.com', 'crud-test.example.com',
            'Temporary CRUD test AI tool record used for AppSearchly P1 verification.',
            'Temporary CRUD test AI tool record.', 'https://crud-test.example.com', $1,
            'free', true, '{"platforms":["Web"],"features":["CRUD"]}'::jsonb
          )
          RETURNING id
        `,
        [category.rows[0].id]
      );
      await client.query('INSERT INTO tool_categories (tool_id, category_id) VALUES ($1, $2)', [tool.rows[0].id, category.rows[0].id]);
      const loaded = await getToolBySlug(client, 'crud-test-tool');
      assert(loaded?.categories[0]?.slug === 'crud-test-category', 'CRUD relation test must load category relation.');
    } finally {
      await client.query('ROLLBACK');
    }
  } finally {
    await client.end();
  }
}

async function testSeoPageContract() {
  const page = await readFile('src/routes/tools/[slug]/+page.svelte', 'utf8');
  assert(page.includes('SoftwareApplication'), 'Tool detail page must include SoftwareApplication schema.');
  assert(page.includes('FAQ'), 'Tool detail page must include FAQ section.');
  assert(page.includes('Visit Website'), 'Tool detail page must include website CTA.');
}

await testMigrationContract();
await testStaticSeedContract();
testValidator();
await testDatabaseContracts();
await testSeoPageContract();

console.log('P1 tool data platform tests passed.');
