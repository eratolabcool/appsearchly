import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { SITE_URL, TOOL_SITEMAP_PAGE_SIZE, escapeXml, xmlResponse } from '$lib/server/seo/xml';

export const prerender = false;

export async function GET({ params, platform }) {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 1) throw error(404, 'Sitemap not found');

  const offset = (page - 1) * TOOL_SITEMAP_PAGE_SIZE;
  const tools = await withDatabase(platform, async (client) => {
    const result = await client.query<{ slug: string; updated_at: string }>(
      `SELECT slug, updated_at
       FROM tools
       WHERE status = 'published'
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [TOOL_SITEMAP_PAGE_SIZE, offset]
    );
    return result.rows;
  }).catch(() => []);

  if (page > 1 && tools.length === 0) throw error(404, 'Sitemap not found');

  const urls = tools.map(
    (tool) => `  <url>\n    <loc>${escapeXml(`${SITE_URL}/tools/${tool.slug}`)}</loc>\n    <lastmod>${new Date(tool.updated_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  );

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
}
