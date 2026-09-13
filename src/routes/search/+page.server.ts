import { listCategoriesData, listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ url, platform }) {
  const q = url.searchParams.get('q') ?? '';
  const category = url.searchParams.get('category') ?? '';
  const pricing = url.searchParams.get('pricing') ?? '';
  const sortParam = url.searchParams.get('sort');
  const sort = sortParam === 'popular' || sortParam === 'trending' || sortParam === 'latest' ? sortParam : 'popular';

  const [categories, result] = await Promise.all([
    listCategoriesData(platform),
    listToolsData(platform, {
      q: q || undefined,
      category: category || undefined,
      pricing: pricing || undefined,
      sort,
      page: 1,
      pageSize: 60
    })
  ]);

  return {
    q,
    category,
    pricing,
    sort,
    rootCategories: categories.filter((item) => !item.parentId && item.toolCount > 0),
    tools: result.tools,
    total: result.pagination.total
  };
}
