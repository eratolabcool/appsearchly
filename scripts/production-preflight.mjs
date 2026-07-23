import { access, readdir, readFile } from 'node:fs/promises';

const deploymentMode = process.argv.includes('--deployment');
const allowedModes = new Set(['legacy', 'dual', 'postgres']);
const errors = [];

function value(name) {
  return process.env[name]?.trim() || '';
}

function requireValue(name) {
  const current = value(name);
  if (!current) errors.push(`${name} is required.`);
  return current;
}

const siteUrl = requireValue('PUBLIC_SITE_URL');
const databaseUrl = requireValue('DATABASE_URL');
const hyperdriveId = requireValue('CLOUDFLARE_HYPERDRIVE_ID');
const adminToken = requireValue('ADMIN_API_TOKEN');
const mode = value('DATA_SOURCE_MODE') || 'dual';

if (siteUrl) {
  try {
    const parsed = new URL(siteUrl);
    if (parsed.protocol !== 'https:') errors.push('PUBLIC_SITE_URL must use HTTPS.');
  } catch {
    errors.push('PUBLIC_SITE_URL must be a valid URL.');
  }
}

if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      errors.push('DATABASE_URL must use postgres:// or postgresql://.');
    }
    if (['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
      errors.push('DATABASE_URL must not target localhost for production deployment.');
    }
  } catch {
    errors.push('DATABASE_URL must be a valid PostgreSQL URL.');
  }
}

if (hyperdriveId && !/^[a-f0-9-]{32,36}$/i.test(hyperdriveId)) {
  errors.push('CLOUDFLARE_HYPERDRIVE_ID does not look like a Cloudflare resource ID.');
}

if (adminToken && (adminToken.length < 32 || /replace|change-me|example/i.test(adminToken))) {
  errors.push('ADMIN_API_TOKEN must be a non-placeholder value of at least 32 characters.');
}

if (!allowedModes.has(mode)) {
  errors.push('DATA_SOURCE_MODE must be legacy, dual, or postgres.');
}

if (mode === 'postgres' && value('ALLOW_POSTGRES_CUTOVER') !== 'true') {
  errors.push('Set ALLOW_POSTGRES_CUTOVER=true to acknowledge a postgres-only cutover.');
}

if (deploymentMode) {
  requireValue('CLOUDFLARE_API_TOKEN');
  requireValue('CLOUDFLARE_ACCOUNT_ID');
}

try {
  const migrations = (await readdir('db/migrations')).filter((file) => file.endsWith('.sql')).sort();
  if (migrations.length === 0) errors.push('No SQL migrations were found.');
  for (const migration of migrations) {
    const sql = await readFile(`db/migrations/${migration}`, 'utf8');
    if (!sql.trim()) errors.push(`Migration ${migration} is empty.`);
  }
} catch {
  errors.push('db/migrations is missing or unreadable.');
}

try {
  await access('wrangler.jsonc');
} catch {
  errors.push('wrangler.jsonc is missing.');
}

if (errors.length > 0) {
  console.error('Production preflight failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Production preflight passed for ${new URL(siteUrl).origin} in ${mode} mode.`);
