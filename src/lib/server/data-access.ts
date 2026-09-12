/**
 * Unified data access layer.
 *
 * Production path: PostgreSQL through Cloudflare Hyperdrive.
 * Local / degraded path: legacy JSON datasets (data/apps.json + data/categories.json).
 *
 * Every public read that renders a page or an API response should go through
 * `withData` so the site is fully browsable without a database connection.
 */
import type { Client } from 'pg';
import { withDatabase, isDatabaseConfigured } from './db';
import {
  listTools as dbListTools,
  getToolBySlug as dbGetToolBySlug,
  listCategories as dbListCategories,
  type ToolListFilters,
  type ToolListItem,
  type ToolDetail,
  type CategoryRecord,
  type ToolSort
} from './repositories/tool-entity-repository';

/**
 * ToolListItem plus optional display fields carried only by the legacy
 * fallback dataset (scraped traffic metrics, emoji icon). DB-backed rows
 * simply omit them; UI should render conditionally.
 */
export type ToolCardDisplay = ToolListItem & {
  monthlyVisits?: number;
  growth?: number;
  rating?: number;
  reviewCount?: number;
  icon?: string | null;
  /** 编辑点评（AI 榜单文章用），guide 渲染时可显示 */
  comment?: string;
};

/** Tool detail plus optional display fields (legacy fallback only). */
export type ToolDetailDisplay = ToolDetail & {
  monthlyVisits?: number;
  growth?: number;
  rating?: number;
  reviewCount?: number;
  icon?: string | null;
};

// Legacy JSON datasets (bundled at build time so the Worker stays self-contained).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import appsJson from '../../../data/apps.json' with { type: 'json' };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import categoriesJson from '../../../data/categories.json' with { type: 'json' };

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function domainOf(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normalizePricing(model: string | null | undefined): string | null {
  if (!model) return null;
  const m = model.toLowerCase().trim();
  if (m === 'free') return 'free';
  if (m === 'freemium') return 'freemium';
  if (m === 'paid') return 'paid';
  if (m === 'subscription') return 'subscription';
  if (m === 'one-time' || m === 'one_time' || m === 'one_time_purchase') return 'one_time';
  return null;
}

function pricingPlanName(model: string | null | undefined): string {
  const type = normalizePricing(model);
  if (type === 'free') return 'Free';
  if (type === 'paid') return 'Paid';
  if (type === 'subscription') return 'Subscription';
  if (type === 'one_time') return 'One-time';
  return 'Free'; // freemium / unknown → show a free entry point
}

function parseDate(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return fallback;
}

const LEGACY_EPOCH = '2025-01-01T00:00:00.000Z';

/* ------------------------------------------------------------------ */
/* Legacy JSON -> domain mapping                                       */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyApp = Record<string, any>;

function isPublished(app: LegacyApp): boolean {
  return (app.status ?? 'approved') === 'approved';
}

function legacyApps(): LegacyApp[] {
  return (appsJson as LegacyApp[]).filter(isPublished);
}

function mapTool(app: LegacyApp): ToolCardDisplay {
  const categoryName = String(app.category ?? 'Uncategorized').trim();
  const categorySlug = slugify(categoryName);
  const slug = app.seo?.slug ?? slugify(String(app.appName ?? ''));

  return {
    id: String(app.id ?? `legacy-${slug}`),
    name: String(app.appName ?? app.name ?? 'Unnamed tool'),
    slug,
    description: String(app.description ?? ''),
    shortDescription: String(app.description ?? ''),
    websiteUrl: app.websiteUrl ?? '',
    normalizedDomain: domainOf(app.websiteUrl),
    logoUrl: null,
    faviconUrl: null,
    pricingType: normalizePricing(app.pricingModel),
    status: 'published',
    isVerified: false,
    createdAt: parseDate(app.submittedAt, LEGACY_EPOCH),
    updatedAt: parseDate(app.lastUpdated, LEGACY_EPOCH),
    categories: [{ id: categorySlug, name: categoryName, slug: categorySlug, icon: null }],
    features: [],
    // Display-only enrichment (absent in DB-backed results)
    monthlyVisits: typeof app.monthlyVisits === 'number' ? app.monthlyVisits : undefined,
    growth: typeof app.growth === 'number' ? app.growth : undefined,
    rating: typeof app.rating === 'number' ? app.rating : undefined,
    reviewCount: typeof app.reviewCount === 'number' ? app.reviewCount : undefined,
    icon: typeof app.icon === 'string' && app.icon.trim() ? app.icon : null
  };
}

/** Match a legacy app against a category slug (root or subcategory). */
function appMatchesCategory(app: LegacyApp, categorySlug: string): boolean {
  const root = slugify(String(app.category ?? ''));
  const sub = slugify(String(app.subcategory ?? ''));
  return root === categorySlug || sub === categorySlug;
}

function matchQuery(app: LegacyApp, q: string): boolean {
  const needle = q.toLowerCase();
  const haystack = [
    app.appName,
    app.description,
    app.category,
    app.subcategory,
    ...(Array.isArray(app.tags) ? app.tags : [])
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ');
  return haystack.includes(needle);
}

/* ------------------------------------------------------------------ */
/* Fallback implementations (same contract as the repository layer)    */
/* ------------------------------------------------------------------ */

export async function fallbackListTools(filters: ToolListFilters = {}) {
  const page = Number.isFinite(filters.page) && filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
  const pageSizeRaw = filters.pageSize;
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw && pageSizeRaw > 0
      ? Math.min(Math.max(Math.floor(pageSizeRaw), 1), 100)
      : 24;

  const q = filters.q?.trim().toLowerCase();
  const categorySlug = filters.category?.trim().toLowerCase();
  const pricing = filters.pricing?.trim().toLowerCase();

  let tools = legacyApps().map(mapTool);

  if (q) {
    const apps = legacyApps();
    const slugs = new Set(apps.filter((app) => matchQuery(app, q)).map((app) => app.seo?.slug ?? slugify(String(app.appName ?? ''))));
    tools = tools.filter((tool) => slugs.has(tool.slug));
  }

  if (categorySlug) {
    const apps = legacyApps();
    const slugs = new Set(apps.filter((app) => appMatchesCategory(app, categorySlug)).map((app) => app.seo?.slug ?? slugify(String(app.appName ?? ''))));
    tools = tools.filter((tool) => slugs.has(tool.slug));
  }

  if (pricing) {
    tools = tools.filter((tool) => {
      const type = tool.pricingType ?? 'unknown';
      if (pricing === 'free') return type === 'free' || type === 'freemium';
      if (pricing === 'paid') return type === 'paid' || type === 'subscription' || type === 'one_time';
      return type === pricing;
    });
  }

  const sort: ToolSort = filters.sort ?? 'latest';
  const sorted = [...tools];
  switch (sort) {
    case 'popular':
      sorted.sort((a, b) => (a.isVerified === b.isVerified ? a.name.localeCompare(b.name) : a.isVerified ? -1 : 1));
      break;
    case 'trending':
      // Fallback "trending" = most visited. (DB mode uses updated_at; revisit
      // when a metrics table lands in the acquisition engine.)
      sorted.sort(
        (a, b) =>
          (b.monthlyVisits ?? 0) - (a.monthlyVisits ?? 0) ||
          b.updatedAt.localeCompare(a.updatedAt) ||
          a.name.localeCompare(b.name)
      );
      break;
    case 'latest':
    default:
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));
  }

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  return {
    tools: paged,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

export async function fallbackGetToolBySlug(slug: string): Promise<ToolDetail | null> {
  const app = legacyApps().find((candidate) => (candidate.seo?.slug ?? slugify(String(candidate.appName ?? ''))) === slug);
  if (!app) return null;

  const base = mapTool(app);
  const rootCategorySlug = base.categories[0]?.slug ?? '';

  const alternatives = await fallbackListTools({
    page: 1,
    pageSize: 4,
    category: rootCategorySlug,
    sort: 'popular'
  });

  const platformList = Array.isArray(app.platforms) ? app.platforms.map(String) : [];
  const tagList = Array.isArray(app.tags) ? app.tags.map(String) : [];

  return {
    ...base,
    companyName: app.developerName ? String(app.developerName) : null,
    founder: null,
    launchDate: null,
    pricingUrl: null,
    affiliateUrl: null,
    metadata: {
      use_cases: tagList,
      target_users: [],
      platforms: platformList,
      integrations: []
    },
    pricing:
      app.price != null || app.pricingModel
        ? [
            {
              id: `${base.slug}-plan`,
              planName: app.price != null && Number(app.price) > 0 ? 'Standard' : pricingPlanName(app.pricingModel),
              price: app.price != null && app.price !== '' ? Number(app.price) : null,
              currency: app.currency ?? 'USD',
              billingPeriod: null,
              features: []
            }
          ]
        : [],
    alternatives: alternatives.tools.filter((candidate) => candidate.id !== base.id).slice(0, 3)
  };
}

export async function fallbackListCategories(): Promise<CategoryRecord[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories: Record<string, any> = (categoriesJson as any)?.categories ?? {};
  const apps = legacyApps();
  const records: CategoryRecord[] = [];

  for (const [name, category] of Object.entries(categories)) {
    const parentSlug = slugify(name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subcategories: Record<string, any> = category?.subcategories ?? {};
    let parentCount = 0;

    for (const [subName, sub] of Object.entries(subcategories)) {
      const subSlug = slugify(subName);
      const count = apps.filter((app) => slugify(String(app.subcategory ?? '')) === subSlug).length;
      parentCount += count;
      records.push({
        id: subSlug,
        name: String(subName),
        slug: subSlug,
        description: sub?.description ? String(sub.description) : null,
        parentId: parentSlug,
        icon: null,
        toolCount: count
      });
    }

    const unmatched = apps.filter((app) => slugify(String(app.category ?? '')) === parentSlug).length;
    records.push({
      id: parentSlug,
      name: String(name),
      slug: parentSlug,
      description: category?.description ? String(category.description) : null,
      parentId: null,
      icon: category?.icon ? String(category.icon) : null,
      toolCount: Math.max(parentCount, unmatched)
    });
  }

  // Root categories first, then subcategories, matching the DB ordering.
  records.sort((a, b) => (a.parentId === null ? 0 : 1) - (b.parentId === null ? 0 : 1) || a.name.localeCompare(b.name));
  return records;
}

/* ------------------------------------------------------------------ */
/* Unified entry points                                                */
/* ------------------------------------------------------------------ */

export async function withData<T>(
  platform: App.Platform | undefined,
  dbOperation: (client: QueryableLike) => Promise<T>,
  fallback: () => Promise<T> | T
): Promise<T> {
  if (!isDatabaseConfigured(platform)) {
    return await fallback();
  }

  try {
    return await withDatabase(platform, dbOperation as (client: Client) => Promise<T>);
  } catch (cause) {
    console.warn('[data-access] Database unavailable; serving local dataset.', cause);
    return await fallback();
  }
}

// Structural alias so callers don't need to import pg types.
export type QueryableLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query<T extends import('pg').QueryResultRow = import('pg').QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<import('pg').QueryResult<T>>;
};

/** Convenience wrappers used by pages and API routes. */
export type ToolPagination = { page: number; pageSize: number; total: number; totalPages: number };

export async function listToolsData(
  platform: App.Platform | undefined,
  filters: ToolListFilters = {}
): Promise<{ tools: ToolCardDisplay[]; pagination: ToolPagination }> {
  const result = await withData(
    platform,
    (client) => dbListTools(client, filters),
    () => fallbackListTools(filters)
  );
  return result as { tools: ToolCardDisplay[]; pagination: ToolPagination };
}

export async function getToolBySlugData(
  platform: App.Platform | undefined,
  slug: string
): Promise<ToolDetailDisplay | null> {
  return withData(platform, (client) => dbGetToolBySlug(client, slug), () => fallbackGetToolBySlug(slug)) as Promise<ToolDetailDisplay | null>;
}

export async function listCategoriesData(platform: App.Platform | undefined): Promise<CategoryRecord[]> {
  return withData(platform, (client) => dbListCategories(client), () => fallbackListCategories());
}
