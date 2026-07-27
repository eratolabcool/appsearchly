import type { QueryResult, QueryResultRow } from 'pg';

export type Queryable = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
};

export type ToolSort = 'latest' | 'popular' | 'trending';

export type ToolListFilters = {
  page?: number;
  pageSize?: number;
  sort?: ToolSort;
  category?: string | null;
  feature?: string | null;
  pricing?: string | null;
  q?: string | null;
};

export type ToolListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  websiteUrl: string;
  normalizedDomain: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  pricingType: string | null;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Array<{ id: string; name: string; slug: string; icon: string | null }>;
  features: Array<{ id: string; name: string; slug: string }>;
};

export type ToolDetail = ToolListItem & {
  companyName: string | null;
  founder: string | null;
  launchDate: string | null;
  pricingUrl: string | null;
  affiliateUrl: string | null;
  metadata: Record<string, unknown>;
  pricing: Array<{
    id: string;
    planName: string;
    price: number | null;
    currency: string | null;
    billingPeriod: string | null;
    features: unknown[];
  }>;
  alternatives: ToolListItem[];
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
  toolCount: number;
};

function clampPage(value: number | undefined): number {
  return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 1;
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value) || !value) return 24;
  return Math.min(Math.max(Math.floor(value), 1), 100);
}

function sortSql(sort: ToolSort | undefined): string {
  switch (sort) {
    case 'popular':
      return 'is_verified DESC, name ASC';
    case 'trending':
      return 'updated_at DESC, name ASC';
    case 'latest':
    default:
      return 'created_at DESC, name ASC';
  }
}

function mapTool(row: ToolRow): ToolListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    websiteUrl: row.website_url,
    normalizedDomain: row.normalized_domain,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    pricingType: row.pricing_type,
    status: row.status,
    isVerified: row.is_verified,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    categories: row.categories ?? [],
    features: row.features ?? []
  };
}

type ToolRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  website_url: string;
  normalized_domain: string;
  logo_url: string | null;
  favicon_url: string | null;
  pricing_type: string | null;
  status: string;
  is_verified: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  categories: Array<{ id: string; name: string; slug: string; icon: string | null }>;
  features: Array<{ id: string; name: string; slug: string }>;
};

const TOOL_SELECT = `
  SELECT
    t.id,
    t.name,
    t.slug,
    COALESCE(t.description, t.summary, '') AS description,
    COALESCE(t.short_description, t.description, t.summary, '') AS short_description,
    COALESCE(t.website_url, t.website, t.official_url) AS website_url,
    COALESCE(t.normalized_domain, t.canonical_domain) AS normalized_domain,
    t.logo_url,
    t.favicon_url,
    COALESCE(t.pricing_type, t.pricing_model) AS pricing_type,
    t.status,
    t.is_verified,
    t.created_at,
    t.updated_at,
    COALESCE(category_data.categories, '[]'::json) AS categories,
    COALESCE(feature_data.features, '[]'::json) AS features,
    t.company_name,
    t.founder,
    t.launch_date,
    t.pricing_url,
    t.affiliate_url,
    t.tool_metadata
  FROM tools t
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon) ORDER BY c.name) AS categories
    FROM tool_categories tc
    JOIN categories c ON c.id = tc.category_id
    WHERE tc.tool_id = t.id
  ) category_data ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object('id', f.id, 'name', f.name, 'slug', f.slug) ORDER BY f.name) AS features
    FROM tool_features tf
    JOIN features f ON f.id = tf.feature_id
    WHERE tf.tool_id = t.id
  ) feature_data ON true
`;

export async function listTools(db: Queryable, filters: ToolListFilters = {}) {
  const values: unknown[] = [];
  const where = [`t.status = 'published'`];
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);

  if (filters.q?.trim()) {
    values.push(`%${filters.q.trim().toLowerCase()}%`);
    where.push(`(
      lower(t.name) LIKE $${values.length}
      OR lower(COALESCE(t.description, t.summary, '')) LIKE $${values.length}
      OR lower(COALESCE(t.short_description, '')) LIKE $${values.length}
      OR lower(COALESCE(t.normalized_domain, t.canonical_domain, '')) LIKE $${values.length}
      OR EXISTS (
        SELECT 1
        FROM tool_categories search_tc
        JOIN categories search_c ON search_c.id = search_tc.category_id
        WHERE search_tc.tool_id = t.id
          AND (lower(search_c.name) LIKE $${values.length} OR lower(search_c.slug) LIKE $${values.length})
      )
      OR EXISTS (
        SELECT 1
        FROM tool_features search_tf
        JOIN features search_f ON search_f.id = search_tf.feature_id
        WHERE search_tf.tool_id = t.id
          AND (lower(search_f.name) LIKE $${values.length} OR lower(search_f.slug) LIKE $${values.length})
      )
    )`);
  }

  if (filters.category?.trim()) {
    values.push(filters.category.trim().toLowerCase());
    where.push(`EXISTS (
      SELECT 1
      FROM tool_categories tc
      JOIN categories c ON c.id = tc.category_id
      WHERE tc.tool_id = t.id AND lower(c.slug) = $${values.length}
    )`);
  }

  if (filters.feature?.trim()) {
    values.push(filters.feature.trim().toLowerCase());
    where.push(`EXISTS (
      SELECT 1
      FROM tool_features tf
      JOIN features f ON f.id = tf.feature_id
      WHERE tf.tool_id = t.id AND lower(f.slug) = $${values.length}
    )`);
  }

  if (filters.pricing?.trim()) {
    values.push(filters.pricing.trim().toLowerCase());
    where.push(`lower(COALESCE(t.pricing_type, t.pricing_model, '')) = $${values.length}`);
  }

  values.push(pageSize);
  const limitRef = `$${values.length}`;
  values.push((page - 1) * pageSize);
  const offsetRef = `$${values.length}`;

  const result = await db.query<ToolRow & { total_count: string }>(
    `
      WITH filtered AS (
        ${TOOL_SELECT}
        WHERE ${where.join(' AND ')}
      )
      SELECT filtered.*, count(*) OVER()::text AS total_count
      FROM filtered
      ORDER BY ${sortSql(filters.sort)}
      LIMIT ${limitRef} OFFSET ${offsetRef}
    `,
    values
  );

  const tools = result.rows.map(mapTool);

  return {
    tools,
    pagination: {
      page,
      pageSize,
      total: Number(result.rows[0]?.total_count ?? 0),
      totalPages: Math.ceil(Number(result.rows[0]?.total_count ?? 0) / pageSize)
    }
  };
}

export async function getToolBySlug(db: Queryable, slug: string): Promise<ToolDetail | null> {
  const result = await db.query<ToolRow & {
    company_name: string | null;
    founder: string | null;
    launch_date: Date | string | null;
    pricing_url: string | null;
    affiliate_url: string | null;
    tool_metadata: Record<string, unknown>;
  }>(
    `
      ${TOOL_SELECT}
      WHERE t.slug = $1 AND t.status = 'published'
      LIMIT 1
    `,
    [slug]
  );

  const row = result.rows[0];
  if (!row) return null;

  const tool = mapTool(row);
  const pricing = await db.query<{
    id: string;
    plan_name: string;
    price: string | null;
    currency: string | null;
    billing_period: string | null;
    features: unknown[];
  }>(
    `
      SELECT
        id,
        COALESCE(plan_name, name) AS plan_name,
        COALESCE(price, price_amount)::text AS price,
        trim(currency::text) AS currency,
        billing_period,
        features
      FROM pricing_plans
      WHERE tool_id = $1
      ORDER BY COALESCE(price, price_amount) NULLS LAST, COALESCE(plan_name, name)
    `,
    [tool.id]
  );

  const alternatives = await listTools(db, {
    page: 1,
    pageSize: 4,
    category: tool.categories[0]?.slug ?? null,
    sort: 'popular'
  });

  return {
    ...tool,
    companyName: row.company_name,
    founder: row.founder,
    launchDate: row.launch_date ? new Date(row.launch_date).toISOString().slice(0, 10) : null,
    pricingUrl: row.pricing_url,
    affiliateUrl: row.affiliate_url,
    metadata: row.tool_metadata ?? {},
    pricing: pricing.rows.map((plan) => ({
      id: plan.id,
      planName: plan.plan_name,
      price: plan.price === null ? null : Number(plan.price),
      currency: plan.currency,
      billingPeriod: plan.billing_period,
      features: plan.features ?? []
    })),
    alternatives: alternatives.tools.filter((candidate) => candidate.id !== tool.id).slice(0, 3)
  };
}

export async function listCategories(db: Queryable): Promise<CategoryRecord[]> {
  const result = await db.query<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_id: string | null;
    icon: string | null;
    tool_count: string;
  }>(`
    SELECT
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      c.icon,
      count(DISTINCT t.id)::text AS tool_count
    FROM categories c
    LEFT JOIN tool_categories tc ON tc.category_id = c.id
    LEFT JOIN tools t ON t.id = tc.tool_id AND t.status = 'published'
    WHERE c.status = 'active'
    GROUP BY c.id
    ORDER BY c.parent_id NULLS FIRST, c.sort_order ASC, c.name ASC
  `);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parent_id,
    icon: row.icon,
    toolCount: Number(row.tool_count)
  }));
}

export function validateToolEntity(input: {
  name?: string;
  websiteUrl?: string;
  slug?: string;
  description?: string;
  categoryIds?: string[];
}) {
  const errors: string[] = [];

  if (!input.name?.trim()) errors.push('name required');
  if (!input.websiteUrl?.trim()) {
    errors.push('website required');
  } else {
    try {
      const parsed = new URL(input.websiteUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) errors.push('domain valid');
    } catch {
      errors.push('domain valid');
    }
  }
  if (!input.slug?.trim()) errors.push('slug required');
  if ((input.description?.trim().length ?? 0) < 20) errors.push('description length');
  if (!input.categoryIds || input.categoryIds.length === 0) errors.push('category exists');

  return {
    valid: errors.length === 0,
    errors
  };
}
