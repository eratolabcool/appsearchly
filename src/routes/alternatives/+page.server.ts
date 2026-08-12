import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ platform }) {
  const trending = await listToolsData(platform, { sort: 'trending', pageSize: 10 });

  // For each popular tool, load real alternatives from the same category.
  const groups = await Promise.all(
    trending.tools.map(async (tool) => {
      const categorySlug = tool.categories?.[0]?.slug ?? null;
      if (!categorySlug) return { tool, alternatives: [] };

      const result = await listToolsData(platform, {
        category: categorySlug,
        sort: 'popular',
        pageSize: 5
      });

      return {
        tool,
        alternatives: result.tools.filter((candidate) => candidate.slug !== tool.slug).slice(0, 4)
      };
    })
  );

  return { groups };
}
