import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { getDataParity } from '$lib/server/tool-repository';

export const prerender = false;

export const GET: RequestHandler = async ({ request, platform }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json(
      { status: 'error', error: 'unauthorized' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store',
          'WWW-Authenticate': 'Bearer realm="AppSearchly Admin"'
        }
      }
    );
  }

  try {
    const parity = await getDataParity(platform);

    return json(
      {
        status: 'ok',
        mode: platform?.env?.DATA_SOURCE_MODE ?? 'legacy',
        parity,
        checkedAt: new Date().toISOString()
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Data parity check failed:', error);
    return json(
      {
        status: 'error',
        error: 'parity_check_unavailable',
        checkedAt: new Date().toISOString()
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
};
