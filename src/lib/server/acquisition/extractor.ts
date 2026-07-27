import type { CrawledPage } from './crawler';
import type { RawTool } from '$lib/connectors';

export type ExtractedTool = {
  name: string;
  description: string;
  category: string;
  features: string[];
  pricing: string;
  target_users: string[];
  use_cases: string[];
  platforms: string[];
};

export type ExtractorOptions = {
  fetchImpl?: typeof fetch;
  endpoint?: string;
  apiKey?: string;
};

const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ['ai-image', ['image', 'photo', 'avatar', 'design']],
  ['ai-video', ['video', 'clip', 'dubbing']],
  ['ai-audio', ['audio', 'voice', 'music', 'transcription']],
  ['ai-coding', ['code', 'developer', 'github', 'api']],
  ['ai-marketing', ['seo', 'marketing', 'ads', 'campaign']],
  ['ai-agents', ['agent', 'workflow', 'automation']],
  ['ai-productivity', ['meeting', 'notes', 'productivity', 'research']],
  ['ai-writing', ['writing', 'copy', 'summar', 'translate']]
];

export function validateExtractedTool(input: unknown): { valid: boolean; value?: ExtractedTool; errors: string[] } {
  const errors: string[] = [];
  const candidate = input as Partial<ExtractedTool>;

  if (!candidate || typeof candidate !== 'object') errors.push('object required');
  if (!candidate.name || typeof candidate.name !== 'string') errors.push('name required');
  if (!candidate.description || typeof candidate.description !== 'string' || candidate.description.trim().length < 20) {
    errors.push('description length');
  }
  if (!candidate.category || typeof candidate.category !== 'string') errors.push('category required');
  for (const key of ['features', 'target_users', 'use_cases', 'platforms'] as const) {
    if (!Array.isArray(candidate[key])) errors.push(`${key} array required`);
  }
  if (!candidate.pricing || typeof candidate.pricing !== 'string') errors.push('pricing required');

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    value: {
      name: candidate.name!.trim().slice(0, 120),
      description: candidate.description!.trim().slice(0, 2_000),
      category: candidate.category!.trim(),
      features: candidate.features!.map(String).filter(Boolean).slice(0, 12),
      pricing: candidate.pricing!.trim().toLowerCase(),
      target_users: candidate.target_users!.map(String).filter(Boolean).slice(0, 8),
      use_cases: candidate.use_cases!.map(String).filter(Boolean).slice(0, 8),
      platforms: candidate.platforms!.map(String).filter(Boolean).slice(0, 8)
    }
  };
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  return CATEGORY_KEYWORDS.find(([, words]) => words.some((word) => lower.includes(word)))?.[0] ?? 'ai-productivity';
}

function inferPricing(page: CrawledPage): string {
  const text = `${page.pricing.join(' ')} ${page.contentText}`.toLowerCase();
  if (text.includes('enterprise')) return 'contact_sales';
  if (text.includes('freemium')) return 'freemium';
  if (/\$\d+|monthly|yearly|pricing/.test(text)) return 'paid';
  if (text.includes('free')) return 'free';
  return 'unknown';
}

function ruleBasedExtraction(raw: RawTool, page: CrawledPage): ExtractedTool {
  const text = `${raw.name} ${raw.description ?? ''} ${page.title} ${page.description} ${page.contentText}`;
  const category = inferCategory(text);
  const features = [...new Set([...(raw.tags ?? []), ...page.features, category.replace('ai-', '').replace('-', ' ')])]
    .map((item) => item.toLowerCase())
    .slice(0, 8);

  return {
    name: raw.name || page.title,
    description: page.description || raw.description || `${raw.name} is an AI software tool discovered by AppSearchly.`,
    category,
    features,
    pricing: inferPricing(page),
    target_users: ['AI software buyers', 'Operators', 'Product teams'],
    use_cases: ['Research', 'Workflow automation', 'Content production'],
    platforms: ['Web']
  };
}

export async function extractToolData(raw: RawTool, page: CrawledPage, options: ExtractorOptions = {}): Promise<ExtractedTool> {
  if (options.endpoint && options.apiKey) {
    const response = await (options.fetchImpl ?? fetch)(options.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        task: 'extract_ai_tool',
        schema: ['name', 'description', 'category', 'features', 'pricing', 'target_users', 'use_cases', 'platforms'],
        raw,
        page: {
          title: page.title,
          description: page.description,
          contentText: page.contentText.slice(0, 8_000),
          pricing: page.pricing,
          features: page.features
        }
      })
    });
    if (response.ok) {
      const payload = await response.json();
      const parsed = validateExtractedTool(payload);
      if (parsed.valid && parsed.value) return parsed.value;
    }
  }

  const fallback = ruleBasedExtraction(raw, page);
  const parsed = validateExtractedTool(fallback);
  if (!parsed.valid || !parsed.value) throw new Error(`Extractor validation failed: ${parsed.errors.join(', ')}`);
  return parsed.value;
}
