import { listCategoriesData, listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ url, platform }) {
  const sortParam = url.searchParams.get('sort');
  const sort = sortParam === 'popular' || sortParam === 'latest' ? sortParam : 'trending';

  const [categories, result] = await Promise.all([
    listCategoriesData(platform),
    listToolsData(platform, { sort, pageSize: 48 })
  ]);

  return {
    tools: result.tools,
    toolCount: result.pagination.total,
    sort,
    rootCategories: categories.filter((category) => !category.parentId)
  };
}
