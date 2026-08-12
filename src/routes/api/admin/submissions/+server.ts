import { json } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { getPendingSubmissions } from '$lib/server/repositories/admin-submission-repository';

export async function GET({ request, platform }) {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const items = await withDatabase(platform, getPendingSubmissions);
    return json({ items });
  } catch {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
}
