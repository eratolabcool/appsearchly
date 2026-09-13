import { json, type RequestHandler } from '@sveltejs/kit';
import { listCategoriesData, listToolsData } from '$lib/server/data-access';

export const prerender = false;

export const GET: RequestHandler = async ({ params, url, platform }) => {
  try {
    const categories = await listCategoriesData(platform);
    const category = categories.find((item) => item.slug === params.slug);
    const tools = await listToolsData(platform, {
      category: params.slug,
      sort: (url.searchParams.get('sort') as 'latest' | 'popular' | 'trending') ?? 'popular',
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('limit') ?? '24')
    });

    if (!category) {
      return json({ error: 'category_not_found' }, { status: 404 });
    }

    return json({ category, ...tools });
  } catch (error) {
    console.error('Category API failed:', error);
    return json({ error: 'category_unavailable' }, { status: 503 });
  }
};
