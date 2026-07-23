import { Client, type ClientConfig, type QueryResultRow } from 'pg';

const DEFAULT_CONNECTION_TIMEOUT_MS = 3_000;
const DEFAULT_QUERY_TIMEOUT_MS = 5_000;

export class DatabaseUnavailableError extends Error {
  constructor(message = 'PostgreSQL is not configured for this runtime.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

function getConnectionString(platform: App.Platform | undefined): string {
  const connectionString = platform?.env?.HYPERDRIVE?.connectionString;

  if (!connectionString) {
    throw new DatabaseUnavailableError();
  }

  return connectionString;
}

function clientConfig(platform: App.Platform | undefined): ClientConfig {
  return {
    connectionString: getConnectionString(platform),
    connectionTimeoutMillis: DEFAULT_CONNECTION_TIMEOUT_MS,
    query_timeout: DEFAULT_QUERY_TIMEOUT_MS,
    application_name: 'appsearchly-worker'
  };
}

export function isDatabaseConfigured(platform: App.Platform | undefined): boolean {
  return Boolean(platform?.env?.HYPERDRIVE?.connectionString);
}

export async function withDatabase<T>(
  platform: App.Platform | undefined,
  operation: (client: Client) => Promise<T>
): Promise<T> {
  const client = new Client(clientConfig(platform));
  await client.connect();

  try {
    await client.query(`SET statement_timeout = '${DEFAULT_QUERY_TIMEOUT_MS}ms'`);
    return await operation(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function queryRows<T extends QueryResultRow>(
  platform: App.Platform | undefined,
  text: string,
  values: unknown[] = []
): Promise<T[]> {
  return withDatabase(platform, async (client) => {
    const result = await client.query<T>(text, values);
    return result.rows;
  });
}

export interface DatabaseProbe {
  connected: boolean;
  schemaReady: boolean;
  publishedTools: number;
  pendingSubmissions: number;
  latencyMs: number;
}

export async function probeDatabase(platform: App.Platform | undefined): Promise<DatabaseProbe> {
  const startedAt = Date.now();

  return withDatabase(platform, async (client) => {
    const result = await client.query<{
      published_tools: string;
      pending_submissions: string;
    }>(`
      SELECT
        (SELECT count(*)::text FROM tools WHERE status = 'published') AS published_tools,
        (SELECT count(*)::text FROM submissions WHERE status IN ('pending', 'needs_review')) AS pending_submissions
    `);

    const row = result.rows[0];

    return {
      connected: true,
      schemaReady: true,
      publishedTools: Number(row?.published_tools ?? 0),
      pendingSubmissions: Number(row?.pending_submissions ?? 0),
      latencyMs: Date.now() - startedAt
    };
  });
}
