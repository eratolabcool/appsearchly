import { json, type RequestHandler } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { listImports } from '$lib/server/acquisition/pipeline';

export const prerender = false;

export const GET: RequestHandler = async ({ platform, url }) => {
  try {
    const imports = await withDatabase(platform, (client) => listImports(client, url.searchParams.get('status') ?? 'pending'));
    return json({ imports });
  } catch (error) {
    console.error('Imports API failed:', error);
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
};
