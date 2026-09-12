import type { RequestHandler } from './$types';
import { isDatabaseConfigured, queryRows } from '$lib/server/db';

// sitemap 必须运行时查 DB：published 工具持续入库，构建期固化会脱节
export const prerender = false;

interface SitemapToolRow {
  slug: string;
  updated_at: Date | string | null;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function urlEntry(siteUrl: string, pathname: string, lastModified?: string | Date): string {
  const lastmod = lastModified && !Number.isNaN(new Date(lastModified).getTime())
    ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>`
    : '';

  return `<url><loc>${escapeXml(`${siteUrl}${pathname}`)}</loc>${lastmod}</url>`;
}

export const GET: RequestHandler = async ({ platform }) => {
  const siteUrl = platform?.env?.PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.appsearchly.com';

  const staticPaths = [
    '/',
    '/categories',
    '/trending',
    '/search',
    '/alternatives',
    '/blog',
    '/submit',
    '/about',
    '/contact'
  ];

  let tools: SitemapToolRow[] = [];

  if (isDatabaseConfigured(platform)) {
    try {
      tools = await queryRows<SitemapToolRow>(
        platform,
        "SELECT slug, updated_at FROM tools WHERE status = 'published' AND slug IS NOT NULL"
      );
    } catch (error) {
      console.warn('Sitemap falling back to static paths only:', error);
    }
  }

  const staticEntries = staticPaths.map((pathname) => urlEntry(siteUrl, pathname));
  const toolEntries = tools
    .filter((tool) => typeof tool.slug === 'string' && tool.slug.length > 0)
    .map((tool) =>
      urlEntry(siteUrl, `/tools/${encodeURIComponent(tool.slug)}`, tool.updated_at ?? undefined)
    );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...toolEntries,
    '</urlset>'
  ].join('');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
