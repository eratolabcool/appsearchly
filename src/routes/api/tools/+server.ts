import { json, type RequestHandler } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listTools, type ToolSort } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

const SORTS = new Set(['latest', 'popular', 'trending']);

export const GET: RequestHandler = async ({ url, platform }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '24');
  const sortParam = url.searchParams.get('sort') ?? 'latest';
  const sort = SORTS.has(sortParam) ? (sortParam as ToolSort) : 'latest';

  try {
    const result = await withDatabase(platform, (client) =>
      listTools(client, {
        page,
        pageSize,
        sort,
        category: url.searchParams.get('category'),
        feature: url.searchParams.get('feature'),
        pricing: url.searchParams.get('pricing'),
        q: url.searchParams.get('q')
      })
    );

    return json(result, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Tool list API failed:', error);
    return json({ error: 'tools_unavailable' }, { status: 503 });
  }
};
