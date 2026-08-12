import { error } from '@sveltejs/kit';
import { listCategoriesData } from '$lib/server/data-access';

export const prerender = false;

export async function load({ platform }) {
  const categories = await listCategoriesData(platform).catch((cause) => {
    console.error('Categories load failed:', cause);
    throw error(503, 'Categories unavailable');
  });

  return { categories };
}
