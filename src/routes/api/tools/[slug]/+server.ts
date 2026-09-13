import { json, type RequestHandler } from '@sveltejs/kit';
import { getToolBySlugData } from '$lib/server/data-access';

export const prerender = false;

export const GET: RequestHandler = async ({ params, platform }) => {
  if (!params.slug) {
    return json({ error: 'tool_not_found' }, { status: 404 });
  }
  const slug = params.slug;

  try {
    const tool = await getToolBySlugData(platform, slug);

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
