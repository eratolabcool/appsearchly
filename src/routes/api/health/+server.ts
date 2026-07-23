import { json, type RequestHandler } from '@sveltejs/kit';
import {
  DatabaseUnavailableError,
  isDatabaseConfigured,
  probeDatabase
} from '$lib/server/db';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
  const appEnv = platform?.env?.APP_ENV ?? 'development';
  const dataMode = platform?.env?.DATA_SOURCE_MODE ?? 'legacy';
  const databaseConfigured = isDatabaseConfigured(platform);

  if (dataMode === 'legacy') {
    return json(
      {
        status: 'ok',
        service: 'appsearchly',
        runtime: 'cloudflare-workers',
        dataMode,
        dataStore: 'legacy-json',
        databaseConfigured,
        databaseRequired: false,
        schemaVersion: 1,
        checkedAt: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }

  if (!databaseConfigured) {
    const production = appEnv === 'production';

    return json(
      {
        status: production ? 'error' : 'transition',
        service: 'appsearchly',
        runtime: 'cloudflare-workers',
        dataMode,
        dataStore: 'legacy-json',
        databaseConfigured: false,
        databaseRequired: true,
        schemaVersion: 1,
        checkedAt: new Date().toISOString()
      },
      {
        status: production ? 503 : 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }

  try {
    const database = await probeDatabase(platform);

    return json(
      {
        status: 'ok',
        service: 'appsearchly',
        runtime: 'cloudflare-workers',
        dataMode,
        dataStore: 'postgresql-hyperdrive',
        databaseConfigured: true,
        databaseRequired: true,
        database,
        schemaVersion: 1,
        checkedAt: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  } catch (error) {
    const unavailable = error instanceof DatabaseUnavailableError;

    console.error('Database health check failed:', error);

    return json(
      {
        status: 'error',
        service: 'appsearchly',
        runtime: 'cloudflare-workers',
        dataMode,
        dataStore: 'postgresql-hyperdrive',
        databaseConfigured: !unavailable,
        databaseRequired: true,
        error: unavailable ? 'database_not_configured' : 'database_unreachable',
        checkedAt: new Date().toISOString()
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
