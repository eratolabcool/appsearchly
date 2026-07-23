const baseUrlValue = process.env.APP_BASE_URL?.trim();
const adminToken = process.env.ADMIN_API_TOKEN?.trim();
const expectedMode = process.env.DATA_SOURCE_MODE?.trim() || 'dual';
const allowedModes = new Set(['legacy', 'dual', 'postgres']);

if (!baseUrlValue) {
  throw new Error('APP_BASE_URL is required.');
}
if (!allowedModes.has(expectedMode)) {
  throw new Error('DATA_SOURCE_MODE must be legacy, dual, or postgres.');
}

const baseUrl = new URL(baseUrlValue);
if (baseUrl.protocol !== 'https:') {
  throw new Error('APP_BASE_URL must use HTTPS.');
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(new URL(path, baseUrl), {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`${path} returned non-JSON content with status ${response.status}.`);
    }
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

const health = await request('/api/health');
if (!health.response.ok) {
  throw new Error(`/api/health failed with status ${health.response.status}.`);
}
if (health.body?.status !== 'ok' || health.body?.runtime !== 'cloudflare-workers') {
  throw new Error('/api/health did not confirm the production Cloudflare Worker.');
}
if (health.body?.dataMode !== expectedMode) {
  throw new Error(`/api/health reported mode ${health.body?.dataMode ?? 'unknown'}, expected ${expectedMode}.`);
}

if (expectedMode === 'legacy') {
  if (health.body?.dataStore !== 'legacy-json' || health.body?.databaseRequired !== false) {
    throw new Error('/api/health did not confirm the controlled legacy rollback state.');
  }
} else if (
  health.body?.dataStore !== 'postgresql-hyperdrive' ||
  health.body?.databaseConfigured !== true ||
  health.body?.databaseRequired !== true
) {
  throw new Error('/api/health did not confirm the production Hyperdrive database.');
}

const catalog = await request('/api/apps.json');
if (!catalog.response.ok || !Array.isArray(catalog.body)) {
  throw new Error('/api/apps.json did not return a JSON array.');
}

const sourceMode = catalog.response.headers.get('x-appsearchly-data-mode');
const source = catalog.response.headers.get('x-appsearchly-data-source');
if (!sourceMode || !source) {
  throw new Error('/api/apps.json is missing AppSearchly data-source headers.');
}
if (sourceMode !== expectedMode) {
  throw new Error(`/api/apps.json reported mode ${sourceMode}, expected ${expectedMode}.`);
}

if (adminToken && expectedMode !== 'legacy') {
  const parity = await request('/api/internal/data-parity', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (!parity.response.ok || parity.body?.status !== 'ok') {
    throw new Error(`/api/internal/data-parity failed with status ${parity.response.status}.`);
  }
  console.log(`Parity endpoint passed in ${parity.body.mode} mode.`);
} else if (!adminToken) {
  console.warn('ADMIN_API_TOKEN is not set; protected parity smoke test was skipped.');
} else {
  console.log('Parity endpoint skipped during controlled legacy rollback.');
}

console.log(`Production smoke tests passed for ${baseUrl.origin}; catalog source=${source}, mode=${sourceMode}.`);
