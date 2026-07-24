import { json } from '@sveltejs/kit';
import { processSubmission } from '$lib/server/submission-pipeline';

export async function POST({ request }) {
  const body = await request.json();

  const result = await processSubmission(body);

  if (!result.success) {
    return json(result, { status: 400 });
  }

  return json(result, { status: 201 });
}
