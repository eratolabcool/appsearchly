import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { rejectImport } from '$lib/server/acquisition/pipeline';

export const POST: RequestHandler = async ({ params, request, platform }) => {
  if (!isAdminAuthorized(request, platform)) return json({ error: 'unauthorized' }, { status: 401 });
  const id = params.id;
  if (!id) return json({ error: 'import_not_found' }, { status: 404 });
  const body = await request.json().catch(() => ({}));

  try {
    const item = await withDatabase(platform, (client) => rejectImport(client, id, body.reason));
    if (!item) return json({ error: 'import_not_found' }, { status: 404 });
    return json({ item });
  } catch (error) {
    console.error('Import reject failed:', error);
    return json({ error: 'reject_failed' }, { status: 503 });
  }
};
