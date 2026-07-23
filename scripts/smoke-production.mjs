const baseUrlValue = process.env.APP_BASE_URL?.trim();
const adminToken = process.env.ADMIN_API_TOKEN?.trim();

if (!baseUrlValue) {
  throw new Error('APP_BASE_URL is required.');
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
if (
  health.body?.status !== 'ok' ||
  health.body?.runtime !== 'cloudflare-workers' ||
  health.body?.dataStore !== 'postgresql-hyperdrive' ||
  health.body?.databaseConfigured !== true
) {
  throw new Error('/api/health did not confirm the production Worker and Hyperdrive database.');
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

if (adminToken) {
  const parity = await request('/api/internal/data-parity', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (!parity.response.ok || parity.body?.status !== 'ok') {
    throw new Error(`/api/internal/data-parity failed with status ${parity.response.status}.`);
  }
  console.log(`Parity endpoint passed in ${parity.body.mode} mode.`);
} else {
  console.warn('ADMIN_API_TOKEN is not set; protected parity smoke test was skipped.');
}

console.log(`Production smoke tests passed for ${baseUrl.origin}; catalog source=${source}, mode=${sourceMode}.`);
