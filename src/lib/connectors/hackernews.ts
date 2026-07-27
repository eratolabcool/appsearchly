import { fixtureTools, normalizeRawTool, type RawTool, type ToolSourceConnector } from './types';

export class HackerNewsConnector implements ToolSourceConnector {
  readonly sourceType = 'hacker_news' as const;

  async fetchTools(options: { fetchImpl?: typeof fetch; limit?: number; endpoint?: string } = {}): Promise<RawTool[]> {
    if (process.env.E2E_TEST_MODE === 'true' || !options.endpoint) {
      return fixtureTools('Hacker News').slice(0, options.limit ?? 20).map(normalizeRawTool);
    }

    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(options.endpoint, {
      headers: { accept: 'application/json', 'user-agent': 'appsearchly-acquisition-engine' }
    });
    if (!response.ok) throw new Error(`Hacker News fetch failed: ${response.status}`);
    const payload = await response.json() as {
      hits?: Array<{ title?: string; url?: string; story_url?: string; objectID?: string }>;
    };

    return (payload.hits ?? [])
      .filter((hit) => Boolean(hit.title && (hit.url || hit.story_url)))
      .slice(0, options.limit ?? 20)
      .map((hit) => normalizeRawTool({
        name: hit.title!.replace(/^Show HN:\s*/i, '').slice(0, 120),
        url: hit.url ?? hit.story_url!,
        description: `AI tool discussed on Hacker News: ${hit.title}`,
        source: 'Hacker News',
        sourceUrl: hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : undefined,
        tags: ['hacker-news', 'ai']
      }));
  }
}

export const hackerNewsConnector = new HackerNewsConnector();
