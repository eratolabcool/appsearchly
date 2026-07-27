import { json, type RequestHandler } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { getToolBySlug } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

export const GET: RequestHandler = async ({ params, platform }) => {
  if (!params.slug) {
    return json({ error: 'tool_not_found' }, { status: 404 });
  }
  const slug = params.slug;

  try {
    const tool = await withDatabase(platform, (client) => getToolBySlug(client, slug));

    if (!tool) {
      return json({ error: 'tool_not_found' }, { status: 404 });
    }

    return json(tool, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Tool detail API failed:', error);
    return json({ error: 'tool_unavailable' }, { status: 503 });
  }
};
