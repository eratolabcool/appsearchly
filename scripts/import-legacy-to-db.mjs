/**
 * Bulk-imports data/apps.json (legacy dataset) into the production PostgreSQL schema.
 *
 * Uses UNNEST batch inserts to minimize round-trips (Neon serverless friendly).
 *
 * Usage: DATABASE_URL=postgresql://... node scripts/import-legacy-to-db.mjs
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) throw new Error('DATABASE_URL is required.');

const apps = JSON.parse(readFileSync(new URL('../data/apps.json', import.meta.url), 'utf8'));
const categoriesJson = JSON.parse(readFileSync(new URL('../data/categories.json', import.meta.url), 'utf8'));

function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function normalizePricing(model) {
  const m = String(model ?? '').toLowerCase();
  if (m === 'free') return 'free';
  if (m === 'freemium') return 'freemium';
  if (m === 'paid') return 'paid';
  if (m === 'subscription') return 'subscription';
  return m || null;
}

const client = new Client({ connectionString, connectionTimeoutMillis: 30_000, query_timeout: 120_000 });

function v(value) { return value === undefined ? null : value; }
await client.connect();

try {
  const now = new Date().toISOString();

  // 1. Clear existing entity data
  await client.query('TRUNCATE tool_features, tool_categories, tool_tags, tool_snapshots, pricing_plans CASCADE');
  await client.query('DELETE FROM features');
  await client.query('DELETE FROM tools');
  await client.query('DELETE FROM categories');

  // 2. Batch insert categories: roots first (get ids), then subcategories (uuid parent)
  const rootRows = [];
  const subRows = [];
  const roots = Object.entries(categoriesJson.categories ?? {});
  roots.forEach(([rootName, root], rootIndex) => {
    const rootSlug = slugify(rootName);
    rootRows.push([v(rootSlug), v(root.name ?? rootName), v(root.description), v(root.icon), 'active', 0]);
    Object.entries(root.subcategories ?? {}).forEach(([subName, sub]) => {
      subRows.push([v(slugify(subName)), v(sub.name ?? subName), v(sub.description), null, 'active', v(rootSlug), 1]);
    });
  });
  if (rootRows.length > 0) {
    await client.query(
      `INSERT INTO categories (slug, name, description, icon, status, sort_order)
       SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::int[])
       ON CONFLICT (slug) DO NOTHING`,
      [rootRows.map((r) => r[0]), rootRows.map((r) => r[1]), rootRows.map((r) => r[2]), rootRows.map((r) => r[3]), rootRows.map((r) => r[4]), rootRows.map((r) => r[5])]
    );
  }
  const rootIdResult = await client.query(`SELECT slug, id FROM categories WHERE parent_id IS NULL`);
  const rootCategoryIds = new Map(rootIdResult.rows.map((r) => [r.slug, r.id]));
  if (subRows.length > 0) {
    const subUuidRows = subRows
      .filter((r) => rootCategoryIds.has(r[5]))
      .map((r) => [r[0], r[1], r[2], r[3], r[4], rootCategoryIds.get(r[5]), r[6]]);
    await client.query(
      `INSERT INTO categories (slug, name, description, icon, status, parent_id, sort_order)
       SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::uuid[], $7::int[])
       ON CONFLICT (slug) DO NOTHING`,
      [subUuidRows.map((r) => r[0]), subUuidRows.map((r) => r[1]), subUuidRows.map((r) => r[2]), subUuidRows.map((r) => r[3]), subUuidRows.map((r) => r[4]), subUuidRows.map((r) => r[5]), subUuidRows.map((r) => r[6])]
    );
  }
  const categoryIdResult = await client.query(`SELECT slug, id FROM categories`);
  const categoryIds = new Map(categoryIdResult.rows.map((r) => [r.slug, r.id]));
  console.log(`categories: ${categoryIds.size}`);
  console.log("  step done: categories");

  // 3. Batch insert tools
  const toolSlugRows = [];
  for (const app of apps) {
    const slug = app.seo?.slug ?? slugify(app.appName);
    const name = String(app.appName ?? '').trim();
    const websiteUrl = String(app.websiteUrl ?? '').trim();
    if (!name || !websiteUrl || !slug) continue;

    const description = String(app.description ?? '').slice(0, 4000);
    const summary = description.length >= 20 ? description.slice(0, 500) : `${name} is an AI tool.`;
    const pricingType = normalizePricing(app.pricingModel);
    toolSlugRows.push([
      slug,
      name,
      summary,
      websiteUrl,
      domainOf(websiteUrl),
      description,
      description.slice(0, 200),
      pricingType,
      websiteUrl,
      app.developerName ? String(app.developerName) : null,
      JSON.stringify({
        use_cases: Array.isArray(app.tags) ? app.tags.map(String).slice(0, 12) : [],
        platforms: Array.isArray(app.platforms) ? app.platforms.map(String) : [],
        target_users: [],
        integrations: []
      }),
      app.submittedAt ?? now,
      app.lastUpdated ?? now
    ]);
  }
  console.log("  step: inserting tools");
  const toolInsertResult = await client.query(
    `INSERT INTO tools (
       slug, name, summary, official_url, canonical_domain, description, short_description, pricing_type,
       primary_source_url, company_name, tool_metadata, created_at, updated_at, status, published_at,
       primary_source_type, source_checked_at
     )
     SELECT u.*, 'published', $14, 'legacy_import', $14
     FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::text[], $9::text[], $10::text[], $11::jsonb[], $12::timestamptz[], $13::timestamptz[])
       AS u(slug, name, summary, official_url, canonical_domain, description, short_description, pricing_type,
            primary_source_url, company_name, tool_metadata, created_at, updated_at)
     RETURNING slug, id`,
    [
      toolSlugRows.map((r) => r[0]),
      toolSlugRows.map((r) => r[1]),
      toolSlugRows.map((r) => r[2]),
      toolSlugRows.map((r) => r[3]),
      toolSlugRows.map((r) => r[4]),
      toolSlugRows.map((r) => r[5]),
      toolSlugRows.map((r) => r[6]),
      toolSlugRows.map((r) => r[7]),
      toolSlugRows.map((r) => r[8]),
      toolSlugRows.map((r) => r[9]),
      toolSlugRows.map((r) => r[10]),
      toolSlugRows.map((r) => r[11]),
      toolSlugRows.map((r) => r[12]),
      now
    ]
  );
  const toolIds = new Map(toolInsertResult.rows.map((r) => [r.slug, r.id]));
  console.log(`tools inserted: ${toolIds.size}`);

  // 4. Batch link categories (subcategory preferred, else root)
  const tcRows = [];
  for (const app of apps) {
    const slug = app.seo?.slug ?? slugify(app.appName);
    const toolId = toolIds.get(slug);
    if (!toolId) continue;
    const subSlug = slugify(app.subcategory);
    const rootSlug = slugify(app.category);
    const catSlug = categoryIds.has(subSlug) ? subSlug : categoryIds.has(rootSlug) ? rootSlug : null;
    if (catSlug && categoryIds.has(catSlug)) tcRows.push([toolId, categoryIds.get(catSlug)]);
  }
  if (tcRows.length > 0) {
    await client.query(
      `INSERT INTO tool_categories (tool_id, category_id) SELECT * FROM UNNEST($1::uuid[], $2::uuid[]) ON CONFLICT DO NOTHING`,
      [tcRows.map((r) => r[0]), tcRows.map((r) => r[1])]
    );
  }
  console.log(`tool_categories: ${tcRows.length}`);

  // 5. Batch features (dedupe across tools)
  const featureSet = new Map(); // slug -> name
  for (const app of apps) {
    for (const tag of Array.isArray(app.tags) ? app.tags : []) {
      const fs = slugify(tag);
      if (fs) featureSet.set(fs, String(tag).slice(0, 80));
    }
  }
  const featureSlugs = [...featureSet.keys()];
  await client.query(
    `INSERT INTO features (name, slug) SELECT * FROM UNNEST($1::text[], $2::text[]) ON CONFLICT (slug) DO NOTHING`,
    [featureSlugs.map((s) => featureSet.get(s)), featureSlugs]
  );
  const featureIdResult = await client.query(`SELECT slug, id FROM features`);
  const featureIds = new Map(featureIdResult.rows.map((r) => [r.slug, r.id]));
  console.log(`features: ${featureIds.size}`);

  // 6. Batch tool_features
  const tfRows = [];
  for (const app of apps) {
    const slug = app.seo?.slug ?? slugify(app.appName);
    const toolId = toolIds.get(slug);
    if (!toolId) continue;
    for (const tag of Array.isArray(app.tags) ? app.tags : []) {
      const fid = featureIds.get(slugify(tag));
      if (fid) tfRows.push([toolId, fid]);
    }
  }
  if (tfRows.length > 0) {
    await client.query(
      `INSERT INTO tool_features (tool_id, feature_id) SELECT * FROM UNNEST($1::uuid[], $2::uuid[]) ON CONFLICT DO NOTHING`,
      [tfRows.map((r) => r[0]), tfRows.map((r) => r[1])]
    );
  }
  console.log(`tool_features: ${tfRows.length}`);

  // 7. Batch pricing plans
  const planRows = [];
  for (const app of apps) {
    const slug = app.seo?.slug ?? slugify(app.appName);
    const toolId = toolIds.get(slug);
    if (!toolId) continue;
    const pricingType = normalizePricing(app.pricingModel);
    const price = app.price != null && app.price !== '' ? Number(app.price) : null;
    if (!pricingType && price == null) continue;
    const planName = price != null && price > 0 ? 'Standard' : pricingType === 'free' ? 'Free' : pricingType === 'paid' ? 'Paid' : 'Free';
    const billingPeriod = pricingType === 'free' ? 'free' : pricingType === 'one_time' ? 'one_time' : pricingType === 'subscription' ? 'monthly' : 'unknown';
    planRows.push([toolId, planName, billingPeriod, price, app.currency ?? 'USD', String(app.websiteUrl ?? ''), now]);
  }
  if (planRows.length > 0) {
    await client.query(
      `INSERT INTO pricing_plans (tool_id, name, billing_period, price_amount, currency, source_url, source_checked_at, features)
       SELECT u.*, '[]'::jsonb
       FROM UNNEST($1::uuid[], $2::text[], $3::text[], $4::numeric[], $5::char(3)[], $6::text[], $7::timestamptz[])
         AS u(tool_id, name, billing_period, price_amount, currency, source_url, source_checked_at)`,
      [planRows.map((r) => r[0]), planRows.map((r) => r[1]), planRows.map((r) => r[2]), planRows.map((r) => r[3]), planRows.map((r) => r[4]), planRows.map((r) => r[5]), planRows.map((r) => r[6])]
    );
  }
  console.log(`pricing_plans: ${planRows.length}`);

  const counts = await client.query(
    `SELECT (SELECT count(*)::int FROM tools) AS tools,
            (SELECT count(*)::int FROM categories) AS categories,
            (SELECT count(*)::int FROM features) AS features,
            (SELECT count(*)::int FROM tool_categories) AS tool_categories`
  );
  console.log('final counts:', counts.rows[0]);
} catch (error) {
  console.error('Import failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
