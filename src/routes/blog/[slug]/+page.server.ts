import { error } from '@sveltejs/kit';
import { getGuide } from '$lib/server/guides';
import { listToolsData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ params, platform }) {
  const guide = getGuide(params.slug);
  if (!guide) {
    throw error(404, 'Guide not found');
  }

  const result = await listToolsData(platform, {
    category: guide.category ?? undefined,
    sort: guide.sort,
    pageSize: 24
  });

  return { guide, tools: result.tools, toolCount: result.pagination.total };
}
