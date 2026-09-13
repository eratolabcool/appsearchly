/**
 * Trending AI tools, ranked by traffic (fallback) or recency (DB mode).
 * [OUTPUT]: real data from the unified data-access layer.
 */
import { json } from '@sveltejs/kit';
import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function GET({ url, platform }) {
  const category = url.searchParams.get('category') || null;
  const sortParam = url.searchParams.get('sort');
  const sort = sortParam === 'popular' || sortParam === 'latest' ? sortParam : 'trending';

  const result = await listToolsData(platform, {
    sort,
    category,
    page: 1,
    pageSize: 30
  });

  return json(result.tools, {
    headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800' }
  });
}
