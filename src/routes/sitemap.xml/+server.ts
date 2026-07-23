import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RequestHandler } from './$types';

export const prerender = true;

const SITE_URL = 'https://appsearchly.org';

interface LegacySitemapTool {
  status?: string;
  lastUpdated?: string;
  seo?: {
    slug?: string;
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function urlEntry(pathname: string, lastModified?: string): string {
  const lastmod = lastModified && !Number.isNaN(Date.parse(lastModified))
    ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>`
    : '';

  return `<url><loc>${escapeXml(`${SITE_URL}${pathname}`)}</loc>${lastmod}</url>`;
}

export const GET: RequestHandler = () => {
  const staticPaths = [
    '/',
    '/categories',
    '/alternatives',
    '/blog',
    '/submit-app',
    '/about',
    '/contact'
  ];

  let tools: LegacySitemapTool[] = [];

  try {
    const source = readFileSync(join(process.cwd(), 'data', 'apps.json'), 'utf8');
    const parsed: unknown = JSON.parse(source);
    if (Array.isArray(parsed)) tools = parsed as LegacySitemapTool[];
  } catch (error) {
    console.warn('Unable to load tool records for sitemap generation:', error);
  }

  const staticEntries = staticPaths.map((pathname) => urlEntry(pathname));
  const toolEntries = tools
    .filter((tool) =>
      ['approved', 'featured', 'sponsored', 'published'].includes(tool.status ?? '') &&
      typeof tool.seo?.slug === 'string' &&
      tool.seo.slug.length > 0
    )
    .map((tool) => urlEntry(`/tool/${encodeURIComponent(tool.seo!.slug!)}`, tool.lastUpdated));

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