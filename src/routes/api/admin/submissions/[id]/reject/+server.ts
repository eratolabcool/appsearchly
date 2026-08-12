import { json } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { rejectSubmission } from '$lib/server/repositories/admin-submission-repository';

export async function POST({ platform, params, request }) {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!params.id) {
    return json({ error: 'missing_submission_id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason : 'Rejected during review';

  try {
    await withDatabase(platform, (client) => rejectSubmission(client, params.id!, reason));
  } catch {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }

  return json({ success: true, status: 'rejected' });
}
