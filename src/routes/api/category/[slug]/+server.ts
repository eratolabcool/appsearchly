import { json, type RequestHandler } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listCategories, listTools } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

export const GET: RequestHandler = async ({ params, url, platform }) => {
  try {
    const result = await withDatabase(platform, async (client) => {
      const categories = await listCategories(client);
      const category = categories.find((item) => item.slug === params.slug);
      const tools = await listTools(client, {
        category: params.slug,
        sort: (url.searchParams.get('sort') as 'latest' | 'popular' | 'trending') ?? 'popular',
        page: Number(url.searchParams.get('page') ?? '1'),
        pageSize: Number(url.searchParams.get('limit') ?? '24')
      });

      return { category, ...tools };
    });

    if (!result.category) {
      return json({ error: 'category_not_found' }, { status: 404 });
    }

    return json(result);
  } catch (error) {
    console.error('Category API failed:', error);
    return json({ error: 'category_unavailable' }, { status: 503 });
  }
};
