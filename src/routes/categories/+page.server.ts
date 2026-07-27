import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listCategories } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

export async function load({ platform }) {
  const categories = await withDatabase(platform, (client) => listCategories(client)).catch((cause) => {
    console.error('Categories load failed:', cause);
    throw error(503, 'Database unavailable');
  });

  return { categories };
}
