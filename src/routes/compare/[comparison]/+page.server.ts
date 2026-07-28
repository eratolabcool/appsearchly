import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { getComparisonPage } from '$lib/server/seo/content';

export const prerender = false;

export async function load({ params, platform }) {
  const match = params.comparison.match(/^(.+)-vs-(.+)$/);
  if (!match) throw error(404, 'Comparison not found');
  const result = await withDatabase(platform, (client) => getComparisonPage(client, match[1], match[2])).catch((cause) => {
    console.error('Comparison page load failed:', cause);
    throw error(503, 'Database unavailable');
  });
  if (!result) throw error(404, 'Comparison not found');
  return result;
}
