import { listArticles } from '$lib/server/articles';

export const prerender = false;

export async function load({ platform }) {
  try {
    const articles = await listArticles(platform);
    return { articles };
  } catch {
    return { articles: [] };
  }
}
