import { error } from '@sveltejs/kit';
import { getToolBySlugData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ params, platform }) {
  const tool = await getToolBySlugData(platform, params.slug).catch((cause) => {
    console.error('Tool detail load failed:', cause);
    throw error(503, 'Tool data unavailable');
  });

  if (!tool) {
    throw error(404, 'Tool not found');
  }

  return { tool };
}
