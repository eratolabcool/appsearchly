import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { deleteArticle } from '$lib/server/articles';

export const DELETE: RequestHandler = async ({ request, params, platform }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!id) return json({ error: 'article_not_found' }, { status: 404 });

  try {
    const deleted = await withDatabase(platform, (client) => deleteArticle(client, id));
    if (!deleted) return json({ error: 'article_not_found' }, { status: 404 });
    return json({ deleted: true });
  } catch (error) {
    console.error('Article delete failed:', error);
    return json({ error: 'delete_failed' }, { status: 503 });
  }
};
