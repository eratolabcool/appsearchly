import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listCategories, listTools } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

const SITE_URL = 'https://appsearchly.com';

export async function load({ params, url, platform }) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const sort = (url.searchParams.get('sort') as 'latest' | 'popular' | 'trending') ?? 'popular';

  const result = await withDatabase(platform, async (client) => {
    const categories = await listCategories(client);
    const category = categories.find((item) => item.slug === params.slug);
    const tools = await listTools(client, {
      category: params.slug,
      sort,
      page,
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

  const pageSuffix = page > 1 ? ` – Page ${page}` : '';
  const canonical = `${SITE_URL}/category/${encodeURIComponent(result.category.slug)}${page > 1 ? `?page=${page}` : ''}`;

  return {
    ...result,
    seo: {
      canonical,
      title: `Best ${result.category.name} Tools${pageSuffix} | AppSearchly`,
      description: (result.category.description || `Discover and compare the best ${result.category.name} AI tools, features, pricing and alternatives.`).slice(0, 160),
      page,
      sort
    }
  };
}
