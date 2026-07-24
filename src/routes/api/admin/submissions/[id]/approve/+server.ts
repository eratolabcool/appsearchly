import { json } from '@sveltejs/kit';
import { approveSubmission } from '$lib/server/repositories/admin-submission-repository';

export async function POST({ locals, params }) {
  const pool = locals.db;

  if (!pool) {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }

  if (!params.id) {
    return json({ error: 'missing_submission_id' }, { status: 400 });
  }

  const submission = await approveSubmission(pool, params.id);

  if (!submission) {
    return json({ error: 'submission_not_found' }, { status: 404 });
  }

  return json({
    success: true,
    submission
  });
}
