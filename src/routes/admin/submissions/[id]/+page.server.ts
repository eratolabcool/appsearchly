import { error } from '@sveltejs/kit';
import { getSubmissionDetail } from '$lib/server/repositories/admin-submission-repository';

export async function load({ params, locals }) {
  const pool = locals.db;

  if (!pool) {
    throw error(503, 'Database unavailable');
  }

  const detail = await getSubmissionDetail(pool, params.id);

  if (!detail.submission) {
    throw error(404, 'Submission not found');
  }

  return detail;
}
