export const TOOL_STATUSES = [
  'draft',
  'pending_review',
  'published',
  'rejected',
  'archived'
] as const;

export type ToolStatus = (typeof TOOL_STATUSES)[number];

export const PRICING_MODELS = [
  'free',
  'freemium',
  'subscription',
  'usage_based',
  'one_time',
  'contact_sales',
  'open_source',
  'unknown'
] as const;

export type PricingModel = (typeof PRICING_MODELS)[number];

export const SOURCE_TYPES = [
  'official_website',
  'owner_submission',
  'verified_store',
  'public_repository',
  'licensed_provider',
  'editorial_research',
  'unknown'
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export type DataConfidence = 'low' | 'medium' | 'high' | 'verified';

export interface ToolSource {
  type: SourceType;
  url: string | null;
  checkedAt: string;
  confidence: DataConfidence;
  notes?: string | null;
}

export interface ToolPricingSummary {
  model: PricingModel;
  currency: string | null;
  startingPrice: number | null;
  billingInterval: 'month' | 'year' | 'usage' | 'one_time' | null;
  sourceUrl: string | null;
  observedAt: string | null;
}

export interface ToolMetricObservation {
  metric: 'monthly_visits' | 'rating' | 'review_count' | 'growth_rate';
  value: number;
  sourceType: SourceType;
  sourceUrl: string | null;
  observedAt: string;
  confidence: DataConfidence;
  methodology?: string | null;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  summary: string;
  officialUrl: string;
  canonicalDomain: string;
  logoUrl: string | null;
  screenshotUrls: string[];
  primaryCategory: string;
  subcategory: string | null;
  tags: string[];
  platforms: string[];
  pricing: ToolPricingSummary;
  status: ToolStatus;
  source: ToolSource;
  lastVerifiedAt: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyToolRecord {
  id?: unknown;
  appName?: unknown;
  name?: unknown;
  description?: unknown;
  websiteUrl?: unknown;
  category?: unknown;
  subcategory?: unknown;
  tags?: unknown;
  platforms?: unknown;
  pricingModel?: unknown;
  price?: unknown;
  currency?: unknown;
  screenshots?: unknown;
  status?: unknown;
  submittedAt?: unknown;
  lastUpdated?: unknown;
  seo?: {
    slug?: unknown;
  } | null;
}

export function normalizeCanonicalDomain(input: string): string {
  const url = new URL(input);
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

export function isAggregatorUrl(input: string): boolean {
  try {
    const domain = normalizeCanonicalDomain(input);
    return [
      'toolify.ai',
      'futurepedia.io',
      'theresanaiforthat.com',
      'topai.tools',
      'aitools.fyi'
    ].includes(domain);
  } catch {
    return false;
  }
}

export function isValidIsoDate(input: string): boolean {
  return !Number.isNaN(Date.parse(input));
}

export function validateTool(tool: Tool): string[] {
  const errors: string[] = [];

  if (!tool.id.trim()) errors.push('id is required');
  if (!tool.slug.trim()) errors.push('slug is required');
  if (!tool.name.trim()) errors.push('name is required');
  if (!tool.summary.trim()) errors.push('summary is required');
  if (!tool.primaryCategory.trim()) errors.push('primaryCategory is required');

  try {
    const domain = normalizeCanonicalDomain(tool.officialUrl);
    if (domain !== tool.canonicalDomain) {
      errors.push('canonicalDomain must match officialUrl');
    }
    if (isAggregatorUrl(tool.officialUrl)) {
      errors.push('officialUrl must not point to an aggregator');
    }
  } catch {
    errors.push('officialUrl must be a valid URL');
  }

  if (!isValidIsoDate(tool.lastVerifiedAt)) {
    errors.push('lastVerifiedAt must be an ISO-compatible date');
  }

  if (!isValidIsoDate(tool.source.checkedAt)) {
    errors.push('source.checkedAt must be an ISO-compatible date');
  }

  if (tool.tags.length > 12) {
    errors.push('tags must contain no more than 12 entries');
  }

  return errors;
}