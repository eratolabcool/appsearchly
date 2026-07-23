import legacyApps from '../../../data/apps.json';

export type LegacyToolRecord = Record<string, unknown> & {
  id?: string;
  appName?: string;
  websiteUrl?: string;
  seo?: { slug?: string };
};

const records = legacyApps as LegacyToolRecord[];

export function getLegacyTools(): LegacyToolRecord[] {
  return records.map((record) => ({ ...record }));
}

export function legacyToolSummary(): {
  total: number;
  slugs: Set<string>;
  domains: Set<string>;
} {
  const slugs = new Set<string>();
  const domains = new Set<string>();

  for (const record of records) {
    const slug = record.seo?.slug;
    if (typeof slug === 'string' && slug) slugs.add(slug.toLowerCase());

    if (typeof record.websiteUrl === 'string') {
      try {
        domains.add(new URL(record.websiteUrl).hostname.toLowerCase().replace(/^www\./, ''));
      } catch {
        // Invalid legacy URLs remain visible to the migration audit, not runtime.
      }
    }
  }

  return { total: records.length, slugs, domains };
}
