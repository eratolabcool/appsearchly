import { json } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';
import { approveAndPublishToolInTransaction } from '$lib/server/repositories/admin-submission-repository';

export async function POST({ request, platform, params }) {
  if (!isAdminAuthorized(request, platform)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!params.id) {
    return json({ error: 'missing_submission_id' }, { status: 400 });
  }

  try {
    const { submission, tool } = await withDatabase(platform, (client) =>
      approveAndPublishToolInTransaction(client, params.id!)
    );

    return json({
      success: true,
      submission,
      tool,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Submission not found') {
      return json({ error: 'submission_not_found' }, { status: 404 });
    }
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
}
