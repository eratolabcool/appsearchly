import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DATA_FILE = path.join(process.cwd(), 'data', 'apps.json');
const STRICT = process.argv.includes('--strict');
const AGGREGATOR_DOMAINS = new Set([
  'toolify.ai',
  'futurepedia.io',
  'theresanaiforthat.com',
  'topai.tools',
  'aitools.fyi'
]);

function canonicalDomain(input) {
  const url = new URL(input);
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function percentage(value, total) {
  if (total === 0) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

let records;
try {
  records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (error) {
  console.error(`Unable to read ${DATA_FILE}:`, error instanceof Error ? error.message : error);
  process.exit(1);
}

if (!Array.isArray(records)) {
  console.error('data/apps.json must contain an array.');
  process.exit(1);
}

const report = {
  total: records.length,
  missingId: 0,
  missingName: 0,
  missingSlug: 0,
  missingDescription: 0,
  invalidOfficialUrl: 0,
  aggregatorOfficialUrl: 0,
  missingCategory: 0,
  missingTags: 0,
  missingLastUpdated: 0,
  unsupportedRatings: 0,
  unsupportedTrafficMetrics: 0,
  directOfficialUrls: 0
};

const ids = [];
const slugs = [];
const domains = [];
const examples = {
  invalidOfficialUrl: [],
  aggregatorOfficialUrl: [],
  unsupportedMetrics: []
};

for (const record of records) {
  const id = typeof record.id === 'string' ? record.id.trim() : '';
  const name = typeof record.name === 'string'
    ? record.name.trim()
    : typeof record.appName === 'string'
      ? record.appName.trim()
      : '';
  const slug = typeof record.seo?.slug === 'string' ? record.seo.slug.trim() : '';
  const websiteUrl = typeof record.websiteUrl === 'string' ? record.websiteUrl.trim() : '';

  if (!id) report.missingId += 1;
  if (!name) report.missingName += 1;
  if (!slug) report.missingSlug += 1;
  if (typeof record.description !== 'string' || !record.description.trim()) report.missingDescription += 1;
  if (typeof record.category !== 'string' || !record.category.trim()) report.missingCategory += 1;
  if (!Array.isArray(record.tags) || record.tags.length === 0) report.missingTags += 1;
  if (typeof record.lastUpdated !== 'string' || Number.isNaN(Date.parse(record.lastUpdated))) {
    report.missingLastUpdated += 1;
  }

  if (id) ids.push(id);
  if (slug) slugs.push(slug);

  if (!websiteUrl) {
    report.invalidOfficialUrl += 1;
    if (examples.invalidOfficialUrl.length < 5) examples.invalidOfficialUrl.push(name || id || '(unnamed)');
  } else {
    try {
      const domain = canonicalDomain(websiteUrl);
      domains.push(domain);
      if (AGGREGATOR_DOMAINS.has(domain)) {
        report.aggregatorOfficialUrl += 1;
        if (examples.aggregatorOfficialUrl.length < 5) {
          examples.aggregatorOfficialUrl.push(`${name || id}: ${websiteUrl}`);
        }
      } else {
        report.directOfficialUrls += 1;
      }
    } catch {
      report.invalidOfficialUrl += 1;
      if (examples.invalidOfficialUrl.length < 5) {
        examples.invalidOfficialUrl.push(`${name || id}: ${websiteUrl}`);
      }
    }
  }

  if (typeof record.rating === 'number' || typeof record.reviewCount === 'number') {
    report.unsupportedRatings += 1;
  }

  if (typeof record.monthlyVisits === 'number' || typeof record.growth === 'number') {
    report.unsupportedTrafficMetrics += 1;
  }

  if (
    examples.unsupportedMetrics.length < 5 &&
    (typeof record.rating === 'number' ||
      typeof record.reviewCount === 'number' ||
      typeof record.monthlyVisits === 'number' ||
      typeof record.growth === 'number')
  ) {
    examples.unsupportedMetrics.push(name || id || '(unnamed)');
  }
}

const duplicateIds = duplicateValues(ids);
const duplicateSlugs = duplicateValues(slugs);
const duplicateDomains = duplicateValues(domains);

console.log('\nAppSearchly data audit');
console.log('=======================');
console.log(`Records:                    ${report.total}`);
console.log(`Direct official URLs:       ${report.directOfficialUrls} (${percentage(report.directOfficialUrls, report.total)})`);
console.log(`Aggregator URLs:            ${report.aggregatorOfficialUrl}`);
console.log(`Invalid or missing URLs:    ${report.invalidOfficialUrl}`);
console.log(`Missing IDs:                ${report.missingId}`);
console.log(`Missing names:              ${report.missingName}`);
console.log(`Missing slugs:              ${report.missingSlug}`);
console.log(`Missing descriptions:       ${report.missingDescription}`);
console.log(`Missing categories:         ${report.missingCategory}`);
console.log(`Missing tags:               ${report.missingTags}`);
console.log(`Missing verification dates: ${report.missingLastUpdated}`);
console.log(`Records with rating data:   ${report.unsupportedRatings}`);
console.log(`Records with traffic data:  ${report.unsupportedTrafficMetrics}`);
console.log(`Duplicate IDs:              ${duplicateIds.length}`);
console.log(`Duplicate slugs:            ${duplicateSlugs.length}`);
console.log(`Duplicate domains:          ${duplicateDomains.length}`);

for (const [label, values] of Object.entries(examples)) {
  if (values.length > 0) {
    console.log(`\n${label} examples:`);
    for (const value of values) console.log(`- ${value}`);
  }
}

const hardErrorCount =
  report.missingId +
  report.missingName +
  report.missingSlug +
  report.invalidOfficialUrl +
  report.aggregatorOfficialUrl +
  duplicateIds.length +
  duplicateSlugs.length;

if (STRICT && hardErrorCount > 0) {
  console.error(`\nStrict audit failed with ${hardErrorCount} blocking issue(s).`);
  process.exit(1);
}

console.log(
  STRICT
    ? '\nStrict audit passed.'
    : '\nReport-only audit complete. Use --strict after the legacy dataset has been cleaned.'
);