const baseUrlValue = process.env.APP_BASE_URL?.trim();
const adminToken = process.env.ADMIN_API_TOKEN?.trim();
const expectedMode = process.env.DATA_SOURCE_MODE?.trim() || 'dual';
const allowedModes = new Set(['legacy', 'dual', 'postgres']);
const maxAttempts = 5;

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

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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

async function retry(label, check) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await check();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const delayMs = attempt * 2_000;
      console.warn(`${label} attempt ${attempt}/${maxAttempts} failed; retrying in ${delayMs}ms.`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

const health = await retry('/api/health', async () => {
  const result = await request('/api/health');
  if (!result.response.ok) {
    throw new Error(`/api/health failed with status ${result.response.status}.`);
  }
  if (result.body?.status !== 'ok' || result.body?.runtime !== 'cloudflare-workers') {
    throw new Error('/api/health did not confirm the production Cloudflare Worker.');
  }
  if (result.body?.dataMode !== expectedMode) {
    throw new Error(`/api/health reported mode ${result.body?.dataMode ?? 'unknown'}, expected ${expectedMode}.`);
  }

  if (expectedMode === 'legacy') {
    if (result.body?.dataStore !== 'legacy-json' || result.body?.databaseRequired !== false) {
      throw new Error('/api/health did not confirm the controlled legacy rollback state.');
    }
  } else if (
    result.body?.dataStore !== 'postgresql-hyperdrive' ||
    result.body?.databaseConfigured !== true ||
    result.body?.databaseRequired !== true
  ) {
    throw new Error('/api/health did not confirm the production Hyperdrive database.');
  }

  return result;
});

const catalog = await retry('/api/apps.json', async () => {
  const result = await request('/api/apps.json');
  if (!result.response.ok || !Array.isArray(result.body)) {
    throw new Error('/api/apps.json did not return a JSON array.');
  }

  const sourceMode = result.response.headers.get('x-appsearchly-data-mode');
  const source = result.response.headers.get('x-appsearchly-data-source');
  if (!sourceMode || !source) {
    throw new Error('/api/apps.json is missing AppSearchly data-source headers.');
  }
  if (sourceMode !== expectedMode) {
    throw new Error(`/api/apps.json reported mode ${sourceMode}, expected ${expectedMode}.`);
  }

  return { ...result, sourceMode, source };
});

if (adminToken && expectedMode !== 'legacy') {
  const parity = await retry('/api/internal/data-parity', async () => {
    const result = await request('/api/internal/data-parity', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!result.response.ok || result.body?.status !== 'ok') {
      throw new Error(`/api/internal/data-parity failed with status ${result.response.status}.`);
    }
    return result;
  });
  console.log(`Parity endpoint passed in ${parity.body.mode} mode.`);
} else if (!adminToken) {
  console.warn('ADMIN_API_TOKEN is not set; protected parity smoke test was skipped.');
} else {
  console.log('Parity endpoint skipped during controlled legacy rollback.');
}

console.log(
  `Production smoke tests passed for ${baseUrl.origin}; catalog source=${catalog.source}, mode=${catalog.sourceMode}; health=${health.body.status}.`
);
