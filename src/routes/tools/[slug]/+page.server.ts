import { error } from '@sveltejs/kit';
import { withDatabase } from '$lib/server/db';
import { getToolBySlug } from '$lib/server/repositories/tool-entity-repository';

export const prerender = false;

const SITE_URL = 'https://appsearchly.com';

export async function load({ params, platform }) {
  const tool = await withDatabase(platform, (client) => getToolBySlug(client, params.slug)).catch((cause) => {
    console.error('Tool detail load failed:', cause);
    throw error(503, 'Database unavailable');
  });

  if (!tool) {
    throw error(404, 'Tool not found');
  }

  return {
    tool,
    seo: {
      canonical: `${SITE_URL}/tools/${encodeURIComponent(tool.slug)}`,
      siteUrl: SITE_URL,
      title: `${tool.name} Review, Features, Pricing & Alternatives | AppSearchly`,
      description: (tool.shortDescription || tool.description).slice(0, 160)
    }
  };
}
