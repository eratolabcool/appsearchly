import { writeFile } from 'node:fs/promises';

const OUTPUT_PATH = process.env.WRANGLER_PRODUCTION_CONFIG || 'wrangler.production.generated.jsonc';
const ALLOWED_MODES = new Set(['legacy', 'dual', 'postgres']);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function validateSiteUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('PUBLIC_SITE_URL must use HTTPS in production.');
  return url.origin;
}

function validateResourceId(value, name) {
  if (!/^[a-f0-9]{32}$/i.test(value)) {
    throw new Error(`${name} must be a 32-character hexadecimal Cloudflare resource ID.`);
  }
  return value;
}

function validateWorkerName(value) {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(value)) {
    throw new Error('APPSEARCHLY_WORKER_NAME must be a valid lowercase Worker name.');
  }
  return value;
}

const mode = process.env.DATA_SOURCE_MODE?.trim() || 'dual';
if (!ALLOWED_MODES.has(mode)) {
  throw new Error(`DATA_SOURCE_MODE must be one of: ${[...ALLOWED_MODES].join(', ')}`);
}

function positiveInt(name, fallback) {
  const value = Number(process.env[name]?.trim() ?? fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return String(value);
}

const config = {
  $schema: 'node_modules/wrangler/config-schema.json',
  name: validateWorkerName(process.env.APPSEARCHLY_WORKER_NAME?.trim() || 'appsearchly'),
  account_id: validateResourceId(required('CLOUDFLARE_ACCOUNT_ID'), 'CLOUDFLARE_ACCOUNT_ID'),
  main: 'worker-entry.mjs',
  compatibility_date: '2026-07-23',
  compatibility_flags: ['nodejs_compat'],
  assets: { directory: '.svelte-kit/cloudflare', binding: 'ASSETS' },
  observability: { enabled: true },
  ai: { binding: 'AI' },
  triggers: { crons: ['0 0 * * *', '30 0 * * 1'] },
  secrets: { required: ['ADMIN_API_TOKEN', 'TURNSTILE_SECRET_KEY', 'LARK_WEBHOOK_URL'] },
  vars: {
    APP_ENV: 'production',
    DATA_SOURCE_MODE: mode,
    PUBLIC_SITE_URL: validateSiteUrl(required('PUBLIC_SITE_URL')),
    PUBLIC_TURNSTILE_SITE_KEY: required('PUBLIC_TURNSTILE_SITE_KEY'),
    AUTO_APPROVE_MIN_SCORE: positiveInt('AUTO_APPROVE_MIN_SCORE', 85),
    PENDING_ALERT_THRESHOLD: positiveInt('PENDING_ALERT_THRESHOLD', 20),
    AUTO_APPROVE_MAX_PER_DAY: positiveInt('AUTO_APPROVE_MAX_PER_DAY', 50),
    ARTICLE_MODEL: process.env.ARTICLE_MODEL?.trim() || '@cf/meta/llama-3.1-8b-instruct',
    ARTICLE_TOP_N: positiveInt('ARTICLE_TOP_N', 10)
  },
  hyperdrive: [{
    binding: 'HYPERDRIVE',
    id: validateResourceId(required('CLOUDFLARE_HYPERDRIVE_ID'), 'CLOUDFLARE_HYPERDRIVE_ID')
  }]
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
console.log(`Generated ${OUTPUT_PATH} for Worker ${config.name} in ${mode} mode.`);
