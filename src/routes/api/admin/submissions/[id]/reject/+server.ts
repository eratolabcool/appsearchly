import { json } from '@sveltejs/kit';
import { rejectSubmission } from '$lib/server/repositories/admin-submission-repository';

export async function POST({ locals, params, request }) {
  const pool = locals.db;

  if (!pool) {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }

  if (!params.id) {
    return json({ error: 'missing_submission_id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason : 'Rejected during review';

  await rejectSubmission(pool, params.id, reason);

  return json({ success: true, status: 'rejected' });
}
