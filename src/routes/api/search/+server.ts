import { json, type RequestHandler } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listTools } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

export const GET: RequestHandler = async ({ url, platform }) => {
  const q = url.searchParams.get('q') ?? '';

  try {
    const result = await withDatabase(platform, (client) =>
      listTools(client, {
        q,
        category: url.searchParams.get('category'),
        feature: url.searchParams.get('feature'),
        pricing: url.searchParams.get('pricing') ?? url.searchParams.get('price'),
        sort: 'popular',
        page: Number(url.searchParams.get('page') ?? '1'),
        pageSize: Number(url.searchParams.get('limit') ?? '20')
      })
    );

    return json({
      query: q,
      results: result.tools,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Search API failed:', error);
    return json({ error: 'search_unavailable', results: [] }, { status: 503 });
  }
};
