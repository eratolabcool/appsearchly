/**
 * Featured (popular) AI tools.
 * [OUTPUT]: real data from the unified data-access layer.
 */
import { json } from '@sveltejs/kit';
import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function GET({ url, platform }) {
  const category = url.searchParams.get('category') || null;

  const result = await listToolsData(platform, {
    sort: 'popular',
    category,
    page: 1,
    pageSize: Number(url.searchParams.get('limit') ?? '12')
  });

  return json(result.tools, {
    headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800' }
  });
}
