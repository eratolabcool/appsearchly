import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for the PostgreSQL runtime test.');
}

const client = new Client({ connectionString, connectionTimeoutMillis: 3_000 });
await client.connect();

try {
  await client.query('BEGIN');

  const insert = await client.query(
    `
      INSERT INTO submissions (
        submitted_url,
        submitted_name,
        submitter_email,
        submitter_name,
        normalized_domain,
        raw_payload,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'pending')
      RETURNING id, status, created_at
    `,
    [
      'https://runtime-test.invalid/',
      'Runtime Test Tool',
      'runtime-test@appsearchly.invalid',
      'CI Runtime',
      'runtime-test.invalid',
      JSON.stringify({ source: 'ci', destructive: false })
    ]
  );

  if (insert.rowCount !== 1 || insert.rows[0]?.status !== 'pending') {
    throw new Error('Submission insert contract failed.');
  }

  const read = await client.query(
    'SELECT id, submitted_url, normalized_domain FROM submissions WHERE id = $1',
    [insert.rows[0].id]
  );

  if (
    read.rowCount !== 1 ||
    read.rows[0]?.submitted_url !== 'https://runtime-test.invalid/' ||
    read.rows[0]?.normalized_domain !== 'runtime-test.invalid'
  ) {
    throw new Error('Submission read contract failed.');
  }

  const catalog = await client.query(
    "SELECT count(*)::int AS count FROM tools WHERE status = 'published'"
  );

  if (typeof catalog.rows[0]?.count !== 'number') {
    throw new Error('Published tool catalog query contract failed.');
  }

  await client.query('ROLLBACK');
  console.log('PostgreSQL runtime write/read contract passed.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
