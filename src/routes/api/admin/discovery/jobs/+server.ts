import { json, type RequestHandler } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listDiscoveryJobs, runDiscovery } from '$lib/server/acquisition/pipeline';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
  try {
    const jobs = await withDatabase(platform, listDiscoveryJobs);
    return json({ jobs });
  } catch (error) {
    console.error('Discovery jobs API failed:', error);
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
};

export const POST: RequestHandler = async ({ platform, fetch }) => {
  try {
    const summary = await withDatabase(platform, (client) => runDiscovery(client, {
      fetchImpl: fetch,
      sourceLimit: 6,
      itemLimit: 100
    }));
    return json({ summary }, { status: 202 });
  } catch (error) {
    console.error('Discovery run API failed:', error);
    return json({ error: 'discovery_failed' }, { status: 503 });
  }
};
