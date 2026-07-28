import { withDatabase } from '$lib/server/db';
import { SITE_URL, TOOL_SITEMAP_PAGE_SIZE, escapeXml, xmlResponse } from '$lib/server/seo/xml';

export const prerender = false;

export async function GET({ platform }) {
  const toolCount = await withDatabase(platform, async (client) => {
    const result = await client.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM tools WHERE status = 'published'`
    );
    return result.rows[0]?.count ?? 0;
  }).catch(() => 0);

  const toolPages = Math.max(1, Math.ceil(toolCount / TOOL_SITEMAP_PAGE_SIZE));
  const locations = [
    `${SITE_URL}/sitemaps/categories.xml`,
    ...Array.from({ length: toolPages }, (_, index) => `${SITE_URL}/sitemaps/tools/${index + 1}.xml`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations
    .map((location) => `  <sitemap><loc>${escapeXml(location)}</loc></sitemap>`)
    .join('\n')}\n</sitemapindex>`;

  return xmlResponse(body);
}
