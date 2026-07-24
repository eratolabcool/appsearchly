import { json } from '@sveltejs/kit';
import { getPendingSubmissions } from '$lib/server/repositories/admin-submission-repository';

export async function GET({ locals }) {
  const pool = locals.db;

  if (!pool) {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }

  const items = await getPendingSubmissions(pool);
  return json({ items });
}
