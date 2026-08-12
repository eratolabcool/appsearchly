import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { listDiscoveryJobs, runDiscovery } from '$lib/server/acquisition/pipeline';

export const prerender = false;

export const GET: RequestHandler = async ({ request, platform }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const jobs = await withDatabase(platform, listDiscoveryJobs);
    return json({ jobs });
  } catch (error) {
    console.error('Discovery jobs API failed:', error);
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
};

export const POST: RequestHandler = async ({ request, platform, fetch }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
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
