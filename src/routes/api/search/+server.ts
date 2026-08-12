import { json, type RequestHandler } from '@sveltejs/kit';
import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export const GET: RequestHandler = async ({ url, platform }) => {
  const q = url.searchParams.get('q') ?? '';

  try {
    const result = await listToolsData(platform, {
      q,
      category: url.searchParams.get('category'),
      feature: url.searchParams.get('feature'),
      pricing: url.searchParams.get('pricing') ?? url.searchParams.get('price'),
      sort: 'popular',
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('limit') ?? '20')
    });

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
