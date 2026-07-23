import { queryRows, isDatabaseConfigured } from '$lib/server/db';
import { getLegacyTools, legacyToolSummary, type LegacyToolRecord } from '$lib/server/legacy-tools';

export interface CanonicalToolRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  officialUrl: string;
  canonicalDomain: string;
  category: string | null;
  pricingModel: string | null;
  logoUrl: string | null;
  verificationStatus: string;
  dataConfidence: number;
  sourceCheckedAt: string;
}

export interface CatalogResult {
  source: 'legacy' | 'postgres';
  fallbackUsed: boolean;
  tools: LegacyToolRecord[] | CanonicalToolRecord[];
  parity?: {
    legacyTotal: number;
    postgresTotal: number;
    matchingSlugs: number;
    matchingDomains: number;
  };
}

function dataSourceMode(platform: App.Platform | undefined): 'legacy' | 'dual' | 'postgres' {
  return platform?.env?.DATA_SOURCE_MODE ?? 'legacy';
}

export async function listPublishedTools(
  platform: App.Platform | undefined
): Promise<CanonicalToolRecord[]> {
  const rows = await queryRows<{
    id: string;
    slug: string;
    name: string;
    summary: string;
    official_url: string;
    canonical_domain: string;
    category_name: string | null;
    pricing_model: string | null;
    logo_url: string | null;
    verification_status: string;
    data_confidence: number;
    source_checked_at: Date;
  }>(
    platform,
    `
      SELECT
        tools.id,
        tools.slug::text,
        tools.name,
        tools.summary,
        tools.official_url,
        tools.canonical_domain::text,
        categories.name AS category_name,
        tools.pricing_model,
        tools.logo_url,
        tools.verification_status,
        tools.data_confidence,
        tools.source_checked_at
      FROM tools
      LEFT JOIN categories ON categories.id = tools.primary_category_id
      WHERE tools.status = 'published'
      ORDER BY tools.name ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    officialUrl: row.official_url,
    canonicalDomain: row.canonical_domain,
    category: row.category_name,
    pricingModel: row.pricing_model,
    logoUrl: row.logo_url,
    verificationStatus: row.verification_status,
    dataConfidence: row.data_confidence,
    sourceCheckedAt: new Date(row.source_checked_at).toISOString()
  }));
}

function parityReport(postgresTools: CanonicalToolRecord[]) {
  const legacy = legacyToolSummary();
  const postgresSlugs = new Set(postgresTools.map((tool) => tool.slug.toLowerCase()));
  const postgresDomains = new Set(postgresTools.map((tool) => tool.canonicalDomain.toLowerCase()));

  return {
    legacyTotal: legacy.total,
    postgresTotal: postgresTools.length,
    matchingSlugs: [...postgresSlugs].filter((slug) => legacy.slugs.has(slug)).length,
    matchingDomains: [...postgresDomains].filter((domain) => legacy.domains.has(domain)).length
  };
}

export async function getCatalog(platform: App.Platform | undefined): Promise<CatalogResult> {
  const mode = dataSourceMode(platform);
  const legacyTools = getLegacyTools();

  if (mode === 'legacy' || !isDatabaseConfigured(platform)) {
    return {
      source: 'legacy',
      fallbackUsed: mode !== 'legacy',
      tools: legacyTools
    };
  }

  try {
    const postgresTools = await listPublishedTools(platform);

    if (mode === 'dual') {
      return {
        source: 'legacy',
        fallbackUsed: false,
        tools: legacyTools,
        parity: parityReport(postgresTools)
      };
    }

    return {
      source: 'postgres',
      fallbackUsed: false,
      tools: postgresTools
    };
  } catch (error) {
    if (mode === 'postgres') throw error;

    return {
      source: 'legacy',
      fallbackUsed: true,
      tools: legacyTools
    };
  }
}

export async function getDataParity(platform: App.Platform | undefined) {
  const postgresTools = await listPublishedTools(platform);
  return parityReport(postgresTools);
}
