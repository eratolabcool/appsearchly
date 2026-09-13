import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { publishArticle } from '$lib/server/articles';

export const POST: RequestHandler = async ({ request, params, platform }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!id) return json({ error: 'article_not_found' }, { status: 404 });

  try {
    const published = await withDatabase(platform, (client) => publishArticle(client, id, 'admin'));
    if (!published) return json({ error: 'article_not_found' }, { status: 404 });
    return json({ published: true });
  } catch (error) {
    console.error('Article publish failed:', error);
    return json({ error: 'publish_failed' }, { status: 503 });
  }
};
