import { json } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { getPendingSubmissions } from '$lib/server/repositories/admin-submission-repository';

export async function GET({ platform }) {
  try {
    const items = await withDatabase(platform, getPendingSubmissions);
    return json({ items });
  } catch {
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
}
