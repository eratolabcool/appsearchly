import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ platform }) {
  // Pull a wide trending set; the page ranks by rating when present.
  const result = await listToolsData(platform, { sort: 'trending', pageSize: 40 });
  return { tools: result.tools };
}
