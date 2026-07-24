import { json } from '@sveltejs/kit';
import { approveAndPublishTool } from '$lib/server/repositories/admin-submission-repository';

export async function POST({ locals, params }) {
  const pool = locals.db;

  if (!pool) {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }

  if (!params.id) {
    return json({ error: 'missing_submission_id' }, { status: 400 });
  }

  try {
    const { submission, tool } = await approveAndPublishTool(pool, params.id);

    return json({
      success: true,
      submission,
      tool,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Submission not found') {
      return json({ error: 'submission_not_found' }, { status: 404 });
    }
    throw error; // 其他错误继续抛出，由上层处理
  }
}
