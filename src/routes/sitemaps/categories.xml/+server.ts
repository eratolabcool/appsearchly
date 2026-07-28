import { withDatabase } from '$lib/server/db';
import { SITE_URL, escapeXml, xmlResponse } from '$lib/server/seo/xml';

export const prerender = false;

export async function GET({ platform }) {
  const categories = await withDatabase(platform, async (client) => {
    const result = await client.query<{ slug: string; updated_at: string }>(
      `SELECT c.slug, c.updated_at
       FROM categories c
       WHERE EXISTS (
         SELECT 1
         FROM tool_categories tc
         JOIN tools t ON t.id = tc.tool_id
         WHERE tc.category_id = c.id AND t.status = 'published'
       )
       ORDER BY c.slug`
    );
    return result.rows;
  }).catch(() => []);

  const staticUrls = [
    { loc: SITE_URL, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_URL}/categories`, priority: '0.8', changefreq: 'weekly' }
  ];

  const urls = [
    ...staticUrls.map(
      (item) => `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`
    ),
    ...categories.map(
      (category) => `  <url>\n    <loc>${escapeXml(`${SITE_URL}/category/${category.slug}`)}</loc>\n    <lastmod>${new Date(category.updated_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
  ];

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
}
