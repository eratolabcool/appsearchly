import { writeFile } from 'node:fs/promises';

const OUTPUT_PATH = process.env.WRANGLER_PRODUCTION_CONFIG || 'wrangler.production.generated.jsonc';
const ALLOWED_MODES = new Set(['dual', 'postgres']);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateSiteUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') {
    throw new Error('PUBLIC_SITE_URL must use HTTPS in production.');
  }
  return url.origin;
}

function validateHyperdriveId(value) {
  if (!/^[a-f0-9-]{32,36}$/i.test(value)) {
    throw new Error('CLOUDFLARE_HYPERDRIVE_ID must look like a Cloudflare resource ID.');
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

const config = {
  $schema: 'node_modules/wrangler/config-schema.json',
  name: validateWorkerName(process.env.APPSEARCHLY_WORKER_NAME?.trim() || 'appsearchly'),
  main: '.svelte-kit/cloudflare/_worker.js',
  compatibility_date: '2026-07-23',
  compatibility_flags: ['nodejs_compat'],
  assets: {
    directory: '.svelte-kit/cloudflare',
    binding: 'ASSETS'
  },
  observability: {
    enabled: true
  },
  vars: {
    APP_ENV: 'production',
    DATA_SOURCE_MODE: mode,
    PUBLIC_SITE_URL: validateSiteUrl(required('PUBLIC_SITE_URL'))
  },
  hyperdrive: [
    {
      binding: 'HYPERDRIVE',
      id: validateHyperdriveId(required('CLOUDFLARE_HYPERDRIVE_ID'))
    }
  ]
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
console.log(`Generated ${OUTPUT_PATH} for Worker ${config.name} in ${mode} mode.`);
