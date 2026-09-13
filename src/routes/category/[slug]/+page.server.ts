import { error } from '@sveltejs/kit';
import { listCategoriesData, listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ params, url, platform }) {
  const categories = await listCategoriesData(platform).catch((cause) => {
    console.error('Category page load failed:', cause);
    throw error(503, 'Category data unavailable');
  });

  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    throw error(404, 'Category not found');
  }

  const tools = await listToolsData(platform, {
    category: params.slug,
    sort: (url.searchParams.get('sort') as 'latest' | 'popular' | 'trending') ?? 'popular',
    page: Number(url.searchParams.get('page') ?? '1'),
    pageSize: 24
  }).catch((cause) => {
    console.error('Category tools load failed:', cause);
    throw error(503, 'Category data unavailable');
  });

  // Navigation context: parent + subcategory siblings (chips row)
  const parent = category.parentId ? categories.find((item) => item.slug === category.parentId) ?? null : null;
  const siblings = (parent ? categories.filter((item) => item.parentId === parent.slug) : categories.filter((item) => item.parentId === category.slug))
    .filter((item) => item.toolCount > 0);

  return {
    category,
    parent,
    siblings,
    tools: tools.tools,
    pagination: tools.pagination
  };
}
