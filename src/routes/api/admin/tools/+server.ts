import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';

export const prerender = false;

export const GET: RequestHandler = async ({ platform, request, url }) => {
  if (!isAdminAuthorized(request, platform)) return json({ error: 'unauthorized' }, { status: 401 });
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '100'), 200);

  try {
    const items = await withDatabase(platform, async (client) => {
      const result = await client.query(
        `
          SELECT
            t.id,
            t.name,
            t.slug,
            COALESCE(t.website_url, t.website, t.official_url) AS website_url,
            COALESCE(t.pricing_type, t.pricing_model) AS pricing_type,
            t.status,
            t.is_verified,
            t.data_confidence,
            t.updated_at,
            COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS categories
          FROM tools t
          LEFT JOIN tool_categories tc ON tc.tool_id = t.id
          LEFT JOIN categories c ON c.id = tc.category_id
          GROUP BY t.id
          ORDER BY t.updated_at DESC
          LIMIT $1
        `,
        [limit]
      );
      return result.rows;
    });

    return json({ items });
  } catch (error) {
    console.error('Admin tools API failed:', error);
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
};
