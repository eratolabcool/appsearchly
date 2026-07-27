import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listCategories, listTools } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

export async function load({ params, url, platform }) {
  const result = await withDatabase(platform, async (client) => {
    const categories = await listCategories(client);
    const category = categories.find((item) => item.slug === params.slug);
    const tools = await listTools(client, {
      category: params.slug,
      sort: (url.searchParams.get('sort') as 'latest' | 'popular' | 'trending') ?? 'popular',
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: 24
    });

    return { category, ...tools };
  }).catch((cause) => {
    console.error('Category page load failed:', cause);
    throw error(503, 'Database unavailable');
  });

  if (!result.category) {
    throw error(404, 'Category not found');
  }

  return result;
}
