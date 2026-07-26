import { fixtureTools, normalizeRawTool, type RawTool, type ToolSourceConnector } from './types';

export class GitHubConnector implements ToolSourceConnector {
  readonly sourceType = 'github' as const;

  async fetchTools(options: { fetchImpl?: typeof fetch; limit?: number; endpoint?: string } = {}): Promise<RawTool[]> {
    if (process.env.E2E_TEST_MODE === 'true' || !options.endpoint) {
      return fixtureTools('GitHub').slice(0, options.limit ?? 20).map(normalizeRawTool);
    }

    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(options.endpoint, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'appsearchly-acquisition-engine' }
    });
    if (!response.ok) throw new Error(`GitHub fetch failed: ${response.status}`);
    const payload = await response.json() as {
      items?: Array<{ name?: string; full_name?: string; description?: string; html_url?: string; homepage?: string; topics?: string[] }>;
    };

    return (payload.items ?? [])
      .filter((item) => Boolean(item.name && (item.homepage || item.html_url)))
      .slice(0, options.limit ?? 20)
      .map((item) => normalizeRawTool({
        name: item.name!,
        url: item.homepage || item.html_url!,
        description: item.description ?? `Open-source AI project ${item.full_name ?? item.name}.`,
        source: 'GitHub',
        sourceUrl: item.html_url,
        tags: item.topics ?? ['github', 'ai']
      }));
  }
}

export const githubConnector = new GitHubConnector();
