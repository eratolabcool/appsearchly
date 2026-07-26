import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listDiscoveryJobs, listImports, pipelineMetrics } from '$lib/server/acquisition/pipeline';

export const prerender = false;

export async function load({ platform }) {
  const data = await withDatabase(platform, async (client) => ({
    metrics: await pipelineMetrics(client),
    jobs: await listDiscoveryJobs(client),
    imports: await listImports(client, 'pending')
  })).catch((cause) => {
    console.error('Pipeline dashboard load failed:', cause);
    throw error(503, 'Database unavailable');
  });

  return data;
}
