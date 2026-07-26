import { fixtureTools, normalizeRawTool, type RawTool, type ToolSourceConnector } from './types';

export class ProductHuntConnector implements ToolSourceConnector {
  readonly sourceType = 'product_hunt' as const;

  async fetchTools(options: { fetchImpl?: typeof fetch; limit?: number; endpoint?: string } = {}): Promise<RawTool[]> {
    if (process.env.E2E_TEST_MODE === 'true' || !options.endpoint) {
      return fixtureTools('Product Hunt').slice(0, options.limit ?? 20).map(normalizeRawTool);
    }

    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(options.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query { posts(first: ${Math.min(options.limit ?? 20, 50)}, topic: "artificial-intelligence") { edges { node { name tagline url website } } } }`
      })
    });
    if (!response.ok) throw new Error(`Product Hunt fetch failed: ${response.status}`);
    const payload = await response.json() as {
      data?: { posts?: { edges?: Array<{ node?: { name?: string; tagline?: string; url?: string; website?: string } }> } };
    };

    return (payload.data?.posts?.edges ?? [])
      .map((edge) => edge.node)
      .filter((node): node is { name: string; tagline?: string; url?: string; website?: string } => Boolean(node?.name && (node.website || node.url)))
      .map((node) => normalizeRawTool({
        name: node.name,
        url: node.website ?? node.url!,
        description: node.tagline,
        source: 'Product Hunt',
        sourceUrl: node.url,
        tags: ['product-hunt', 'ai']
      }));
  }
}

export const productHuntConnector = new ProductHuntConnector();
