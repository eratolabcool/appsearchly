import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BLOCKED_AGGREGATOR_HOSTS = new Set([
  'toolify.ai',
  'www.toolify.ai',
  'futurepedia.io',
  'www.futurepedia.io',
  'theresanaiforthat.com',
  'www.theresanaiforthat.com'
]);

const RESERVED_PLACEHOLDER_HOSTS = new Set([
  'example.com',
  'www.example.com',
  'example.net',
  'www.example.net',
  'example.org',
  'www.example.org',
  'localhost',
  '127.0.0.1',
  '0.0.0.0'
]);

const UNSUPPORTED_LEGACY_METRICS = [
  'rating',
  'reviewCount',
  'monthlyVisits',
  'growth',
  'downloads',
  'conversions'
];

function argumentValue(name, fallback) {
  const exact = process.argv.find((value) => value.startsWith(`${name}=`));
  return exact ? exact.slice(name.length + 1) : fallback;
}

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function hostnameOf(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function canonicalDomain(value) {
  const hostname = hostnameOf(value);
  return hostname ? hostname.replace(/^www\./, '') : null;
}

function isPlaceholderHost(hostname) {
  if (!hostname) return false;
  return (
    RESERVED_PLACEHOLDER_HOSTS.has(hostname) ||
    hostname.endsWith('.example') ||
    hostname.endsWith('.test') ||
    hostname.endsWith('.invalid') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  );
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function stringArray(value) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
}

function checksum(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function classify(reasons) {
  if (reasons.some((reason) => reason.severity === 'quarantine')) return 'quarantined';
  if (reasons.some((reason) => reason.severity === 'review')) return 'needs_review';
  return 'ready';
}

const sourcePath = path.resolve(argumentValue('--source', 'data/apps.json'));
const outputPath = path.resolve(argumentValue('--output', 'tmp/tool-import-preview.json'));
const strict = process.argv.includes('--strict');

const raw = await readFile(sourcePath, 'utf8');
const records = JSON.parse(raw);

if (!Array.isArray(records)) {
  throw new Error(`Expected ${sourcePath} to contain a JSON array.`);
}

const seenDomains = new Map();
const items = records.map((record, index) => {
  const reasons = [];
  const legacyId = firstText(record.id) ?? `legacy-row-${index + 1}`;
  const name = firstText(record.appName, record.name);
  const summary = firstText(record.description, record.summary);
  const rawOfficialUrl = firstText(
    record.officialUrl,
    record.official_url,
    record.developerWebsite,
    record.websiteUrl,
    record.downloadUrl
  );
  const normalizedUrl = normalizeUrl(rawOfficialUrl);
  const normalizedHost = hostnameOf(normalizedUrl);
  const domain = canonicalDomain(normalizedUrl);
  const sourceUrl = normalizeUrl(firstText(record.sourceUrl, record.source_url, record.websiteUrl));
  const sourceCheckedAt = normalizeDate(
    firstText(record.sourceCheckedAt, record.source_checked_at, record.lastUpdated, record.submittedAt)
  );
  const tags = stringArray(record.tags).slice(0, 20);
  const platforms = stringArray(record.platforms ?? record.platform).map((value) => value.toLowerCase());
  const categoryName = firstText(record.category);
  const metricsDropped = UNSUPPORTED_LEGACY_METRICS.filter(
    (field) => record[field] !== undefined && record[field] !== null
  );

  if (!name || name.length < 2) {
    reasons.push({ code: 'missing_name', severity: 'quarantine' });
  }

  if (!normalizedUrl || !domain) {
    reasons.push({ code: 'missing_or_invalid_official_url', severity: 'quarantine' });
  } else if (BLOCKED_AGGREGATOR_HOSTS.has(normalizedHost)) {
    reasons.push({ code: 'aggregator_url_is_not_official', severity: 'quarantine', host: normalizedHost });
  } else if (isPlaceholderHost(normalizedHost)) {
    reasons.push({ code: 'placeholder_url_is_not_publishable', severity: 'quarantine', host: normalizedHost });
  } else if (seenDomains.has(domain)) {
    reasons.push({
      code: 'duplicate_canonical_domain',
      severity: 'quarantine',
      duplicateOf: seenDomains.get(domain)
    });
  } else {
    seenDomains.set(domain, legacyId);
  }

  if (!summary || summary.length < 20) {
    reasons.push({ code: 'summary_too_short', severity: 'review' });
  }

  if (!categoryName) {
    reasons.push({ code: 'missing_category', severity: 'review' });
  }

  if (tags.length < 3) {
    reasons.push({ code: 'insufficient_tags', severity: 'review' });
  }

  if (!sourceUrl) {
    reasons.push({ code: 'missing_source_url', severity: 'review' });
  }

  if (!sourceCheckedAt) {
    reasons.push({ code: 'missing_source_checked_at', severity: 'review' });
  }

  if (metricsDropped.length > 0) {
    reasons.push({
      code: 'unsupported_metrics_dropped',
      severity: 'info',
      fields: metricsDropped
    });
  }

  const classification = classify(reasons);
  const officialUrl = classification === 'quarantined' ? null : normalizedUrl;

  const candidate = {
    legacyId,
    slug: slugify(firstText(record.seo?.slug, name, legacyId)),
    name,
    summary,
    officialUrl,
    canonicalDomain: officialUrl ? domain : null,
    category: categoryName
      ? { name: categoryName, slug: slugify(categoryName) }
      : null,
    tags: tags.map((tag) => ({ name: tag, slug: slugify(tag) })),
    pricingModel: firstText(record.pricingModel, record.priceType, 'unknown')?.toLowerCase(),
    platforms: {
      web: platforms.length === 0 || platforms.includes('web'),
      ios: platforms.includes('ios'),
      android: platforms.includes('android'),
      macos: platforms.includes('macos'),
      windows: platforms.includes('windows'),
      linux: platforms.includes('linux')
    },
    primarySourceUrl: sourceUrl,
    primarySourceType: 'legacy_import',
    sourceCheckedAt,
    dataConfidence: classification === 'ready' ? 70 : classification === 'needs_review' ? 45 : 20,
    verificationStatus: 'unverified',
    status: 'needs_review'
  };

  return {
    index,
    legacyId,
    classification,
    reasons,
    metricsDropped,
    candidate,
    sourceChecksum: checksum(record)
  };
});

const counts = items.reduce(
  (result, item) => {
    result[item.classification] += 1;
    result.metricsDropped += item.metricsDropped.length;
    return result;
  },
  { ready: 0, needs_review: 0, quarantined: 0, metricsDropped: 0 }
);

const preview = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceFile: path.relative(process.cwd(), sourcePath),
  total: records.length,
  counts,
  policy: {
    blockedAggregatorHosts: [...BLOCKED_AGGREGATOR_HOSTS].sort(),
    reservedPlaceholderHosts: [...RESERVED_PLACEHOLDER_HOSTS].sort(),
    unsupportedLegacyMetrics: UNSUPPORTED_LEGACY_METRICS
  },
  items
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(preview, null, 2)}\n`, 'utf8');

console.log(`Legacy tool migration preview: ${records.length} records`);
console.log(`  ready: ${counts.ready}`);
console.log(`  needs review: ${counts.needs_review}`);
console.log(`  quarantined: ${counts.quarantined}`);
console.log(`  unsupported metric fields dropped: ${counts.metricsDropped}`);
console.log(`Preview written to ${path.relative(process.cwd(), outputPath)}`);

if (strict) {
  const unsafeReadyItems = items.filter((item) => {
    if (item.classification !== 'ready') return false;
    const host = hostnameOf(item.candidate.officialUrl);
    return (
      !host ||
      BLOCKED_AGGREGATOR_HOSTS.has(host) ||
      isPlaceholderHost(host) ||
      item.metricsDropped.length > 0
    );
  });

  if (unsafeReadyItems.length > 0) {
    console.error(`Strict validation failed: ${unsafeReadyItems.length} unsafe ready records.`);
    process.exitCode = 1;
  }
}
