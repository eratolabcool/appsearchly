import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL?.trim();
const requiredTables = [
  'categories',
  'tools',
  'tags',
  'tool_tags',
  'pricing_plans',
  'tool_snapshots',
  'submissions',
  'outbound_clicks'
];

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

function checksum(sql) {
  return createHash('sha256').update(sql).digest('hex');
}

function stripOuterTransaction(sql) {
  const trimmed = sql.trim();
  return trimmed.replace(/^BEGIN;\s*/i, '').replace(/\s*COMMIT;\s*$/i, '').trim();
}

async function countRequiredTables(client) {
  const result = await client.query(
    `SELECT count(*)::int AS count
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])`,
    [requiredTables]
  );
  return result.rows[0]?.count ?? 0;
}

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 10_000,
  query_timeout: 60_000,
  application_name: 'appsearchly-migrator'
});

await client.connect();

try {
  await client.query("SELECT pg_advisory_lock(hashtext('appsearchly:schema-migrations'))");
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now(),
      applied_by text NOT NULL,
      execution_ms integer NOT NULL CHECK (execution_ms >= 0)
    )
  `);

  const files = (await readdir('db/migrations')).filter((file) => file.endsWith('.sql')).sort();
  if (files.length === 0) throw new Error('No SQL migrations found.');

  for (const filename of files) {
    const rawSql = await readFile(`db/migrations/${filename}`, 'utf8');
    const migrationChecksum = checksum(rawSql);
    const existing = await client.query(
      'SELECT checksum FROM schema_migrations WHERE filename = $1',
      [filename]
    );

    if (existing.rowCount > 0) {
      if (existing.rows[0].checksum !== migrationChecksum) {
        throw new Error(`Checksum mismatch for already-applied migration ${filename}.`);
      }
      console.log(`Skipping ${filename}; already applied.`);
      continue;
    }

    if (filename === '0001_initial.sql' && (await countRequiredTables(client)) === requiredTables.length) {
      await client.query(
        `INSERT INTO schema_migrations (filename, checksum, applied_by, execution_ms)
         VALUES ($1, $2, $3, 0)`,
        [filename, migrationChecksum, 'baseline-existing-schema']
      );
      console.log(`Recorded ${filename} as an existing schema baseline.`);
      continue;
    }

    const startedAt = Date.now();
    await client.query('BEGIN');
    try {
      await client.query(stripOuterTransaction(rawSql));
      await client.query(
        `INSERT INTO schema_migrations (filename, checksum, applied_by, execution_ms)
         VALUES ($1, $2, $3, $4)`,
        [filename, migrationChecksum, process.env.GITHUB_SHA || process.env.USER || 'manual', Date.now() - startedAt]
      );
      await client.query('COMMIT');
      console.log(`Applied ${filename}.`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  const tableCount = await countRequiredTables(client);
  if (tableCount !== requiredTables.length) {
    throw new Error(`Schema verification failed: found ${tableCount}/${requiredTables.length} required tables.`);
  }

  const migrationCount = await client.query('SELECT count(*)::int AS count FROM schema_migrations');
  console.log(`Database migration complete: ${tableCount} required tables, ${migrationCount.rows[0].count} tracked migration(s).`);
} finally {
  await client.query("SELECT pg_advisory_unlock(hashtext('appsearchly:schema-migrations'))").catch(() => undefined);
  await client.end();
}
