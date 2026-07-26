export type RawTool = {
  name: string;
  url: string;
  description?: string;
  source: string;
  sourceUrl?: string;
  tags?: string[];
  discoveredAt?: string;
};

export type ToolSourceConnector = {
  readonly sourceType: 'product_hunt' | 'github' | 'hacker_news' | 'rss' | 'ai_directory' | 'manual_import';
  fetchTools(options?: { fetchImpl?: typeof fetch; limit?: number; endpoint?: string; url?: string }): Promise<RawTool[]>;
};

export function normalizeRawTool(input: RawTool): RawTool {
  const url = new URL(input.url);
  return {
    ...input,
    name: input.name.trim(),
    url: url.toString(),
    description: input.description?.trim(),
    discoveredAt: input.discoveredAt ?? new Date().toISOString()
  };
}

export function fixtureTools(source: string): RawTool[] {
  return [
    {
      name: `${source} AI Studio`,
      url: `https://${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-studio.example.com`,
      description: `AI tool discovered from ${source} for AppSearchly acquisition tests.`,
      source,
      tags: ['ai', 'automation', 'productivity']
    },
    {
      name: `${source} Agent Builder`,
      url: `https://${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-agents.example.com`,
      description: `Agent workflow builder discovered from ${source}.`,
      source,
      tags: ['ai', 'agents']
    }
  ];
}
