import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { getAlternativesPage } from '$lib/server/seo/content';

export const prerender = false;

export async function load({ params, platform }) {
  const result = await withDatabase(platform, (client) => getAlternativesPage(client, params.slug)).catch((cause) => {
    console.error('Alternatives page load failed:', cause);
    throw error(503, 'Database unavailable');
  });
  if (!result) throw error(404, 'Tool not found');
  return result;
}
