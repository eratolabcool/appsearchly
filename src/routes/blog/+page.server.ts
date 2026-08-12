import { GUIDES } from '$lib/server/guides';
import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ platform }) {
  const guides = await Promise.all(
    GUIDES.map(async (guide) => {
      const result = await listToolsData(platform, {
        category: guide.category ?? undefined,
        sort: guide.sort,
        pageSize: 4
      });
      return { guide, previewTools: result.tools, toolCount: result.pagination.total };
    })
  );

  return { guides };
}
