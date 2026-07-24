import { json } from '@sveltejs/kit';
import { rejectSubmission } from '$lib/server/repositories/admin-submission-repository';

export async function POST({ params, request }) {
  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason : 'Rejected during review';

  await rejectSubmission(params.id, reason);

  return json({ success: true, status: 'rejected' });
}
