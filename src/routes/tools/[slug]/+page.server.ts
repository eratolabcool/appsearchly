import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';

export async function load({ params, platform }) {
  const result = await withDatabase(platform, (client) => client.query(
    `SELECT
      id,
      slug,
      name,
      website,
      description,
      category,
      status,
      created_at
     FROM tools
     WHERE slug = $1
       AND status = 'published'
     LIMIT 1`,
    [params.slug],
  )).catch(() => {
    throw error(503, 'Database unavailable');
  });

  const tool = result.rows[0];

  if (!tool) {
    throw error(404, 'Tool not found');
  }

  return {
    tool,
  };
}
