import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { listArticles } from '$lib/server/articles';

export const GET: RequestHandler = async ({ url, request, platform }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  const status = url.searchParams.get('status');
  try {
    const articles = await listArticles(platform, {
      status: status === 'draft' || status === 'published' ? status : undefined
    });
    return json({ articles });
  } catch (error) {
    console.error('Article list failed:', error);
    return json({ error: 'list_failed' }, { status: 503 });
  }
};
