import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { approveImport } from '$lib/server/acquisition/pipeline';

export const POST: RequestHandler = async ({ params, request, platform }) => {
  if (!isAdminAuthorized(request, platform)) return json({ error: 'unauthorized' }, { status: 401 });
  const id = params.id;
  if (!id) return json({ error: 'import_not_found' }, { status: 404 });

  try {
    const tool = await withDatabase(platform, (client) => approveImport(client, id));
    if (!tool) return json({ error: 'import_not_found' }, { status: 404 });
    return json({ tool });
  } catch (error) {
    console.error('Import approve failed:', error);
    return json({ error: 'approve_failed' }, { status: 503 });
  }
};
