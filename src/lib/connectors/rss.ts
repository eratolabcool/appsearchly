import { fixtureTools, normalizeRawTool, type RawTool, type ToolSourceConnector } from './types';

function textBetween(value: string, tag: string): string | undefined {
  const match = value.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

export class RssConnector implements ToolSourceConnector {
  readonly sourceType = 'rss' as const;

  async fetchTools(options: { fetchImpl?: typeof fetch; limit?: number; endpoint?: string; url?: string } = {}): Promise<RawTool[]> {
    const endpoint = options.endpoint ?? options.url;
    if (process.env.E2E_TEST_MODE === 'true' || !endpoint) {
      return fixtureTools('RSS').slice(0, options.limit ?? 20).map(normalizeRawTool);
    }

    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(endpoint, {
      headers: { accept: 'application/rss+xml, application/xml, text/xml', 'user-agent': 'appsearchly-acquisition-engine' }
    });
    if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);

    return items
      .map((item) => ({
        name: textBetween(item, 'title'),
        url: textBetween(item, 'link'),
        description: textBetween(item, 'description')
      }))
      .filter((item): item is { name: string; url: string; description: string | undefined } => Boolean(item.name && item.url))
      .slice(0, options.limit ?? 20)
      .map((item) => normalizeRawTool({
        name: item.name,
        url: item.url,
        description: item.description,
        source: 'RSS',
        sourceUrl: endpoint,
        tags: ['rss', 'ai']
      }));
  }
}

export const rssConnector = new RssConnector();
