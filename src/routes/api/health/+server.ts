import { json, type RequestHandler } from '@sveltejs/kit';

// P0 transition: this endpoint is prerendered while the site still uses the
// static adapter. It becomes a live dependency check when the Cloudflare
// adapter and Hyperdrive connection are enabled in a later batch.
export const prerender = true;

export const GET: RequestHandler = ({ platform }) => {
  const hyperdriveConfigured = Boolean(platform?.env?.HYPERDRIVE?.connectionString);

  return json(
    {
      status: hyperdriveConfigured ? 'ok' : 'transition',
      service: 'appsearchly',
      runtimeTarget: 'cloudflare-workers',
      currentDataStore: 'legacy-json',
      targetDataStore: 'postgresql-hyperdrive',
      hyperdriveConfigured,
      schemaVersion: 1,
      generatedAt: new Date().toISOString()
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
};
