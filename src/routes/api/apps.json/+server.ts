import { json, type RequestHandler } from '@sveltejs/kit';
import { getCatalog } from '$lib/server/tool-repository';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
  try {
    const catalog = await getCatalog(platform);
    const parity = catalog.parity;

    return json(catalog.tools, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'X-AppSearchly-Data-Source': catalog.source,
        'X-AppSearchly-Fallback': String(catalog.fallbackUsed),
        ...(parity
          ? {
              'X-AppSearchly-Postgres-Count': String(parity.postgresTotal),
              'X-AppSearchly-Legacy-Count': String(parity.legacyTotal)
            }
          : {})
      }
    });
  } catch (error) {
    console.error('Tool catalog read failed:', error);

    return json(
      {
        error: 'catalog_unavailable',
        message: 'The tool catalog is temporarily unavailable.'
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }
};
