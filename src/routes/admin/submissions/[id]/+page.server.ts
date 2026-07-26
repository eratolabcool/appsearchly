import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { getSubmissionDetail } from '$lib/server/repositories/admin-submission-repository';

export async function load({ params, platform }) {
  const detail = await withDatabase(platform, (client) => getSubmissionDetail(client, params.id))
    .catch(() => {
      throw error(503, 'Database unavailable');
    });

  if (!detail.submission) {
    throw error(404, 'Submission not found');
  }

  return detail;
}
