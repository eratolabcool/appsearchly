import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
  const pool = locals.db;

  if (!pool) {
    throw error(503, 'Database unavailable');
  }

  const result = await pool.query(
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
  );

  const tool = result.rows[0];

  if (!tool) {
    throw error(404, 'Tool not found');
  }

  return {
    tool,
  };
}
