import { listCategoriesData, listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ platform }) {
  const [categories, trendingResult] = await Promise.all([
    listCategoriesData(platform),
    listToolsData(platform, { sort: 'trending', pageSize: 12 })
  ]);

  const rootCategories = categories.filter((category) => !category.parentId && category.toolCount > 0);
  const subCategories = categories.filter((category) => category.parentId);

  return {
    rootCategories,
    subCategories,
    trendingTools: trendingResult.tools,
    toolCount: trendingResult.pagination.total
  };
}
