/**
 * Standalone acquisition run: discovers real AI tools from GitHub + Hacker News,
 * crawls their websites, extracts metadata, and merges them into data/apps.json.
 *
 * Usage:
 *   node --import tsx scripts/acquire-tools.ts [--limit=N] [--dry-run]
 *
 * Rules:
 * - Only real, reachable tools are added (crawled homepage + meaningful description).
 * - No metrics are fabricated: monthlyVisits/rating/reviewCount stay null.
 * - The original dataset is backed up before writing.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { GitHubConnector } from '../src/lib/connectors/github';
import { HackerNewsConnector } from '../src/lib/connectors/hackernews';
import { crawlToolWebsite, createRateLimiter } from '../src/lib/server/acquisition/crawler';
import { extractToolData } from '../src/lib/server/acquisition/extractor';
import type { RawTool } from '../src/lib/connectors/types';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const DATA_DIR = join(process.cwd(), 'data');
const APPS_FILE = join(DATA_DIR, 'apps.json');

const AGGREGATOR_DOMAINS = new Set([
  'toolify.ai', 'futurepedia.io', 'theresanaiforthat.com', 'topai.tools',
  'aitools.fyi', 'aitoolnet.com', 'aitoolsarena.com', 'aitoolz.com',
  'aitop100.com', 'toolfinder.ai', 'aitoolfinder.com', 'gptools.com'
]);

const BLOCKED_DOMAINS = new Set([
  'example.com', 'localhost', 'github.io', 'github.com', 'medium.com', 'linkedin.com',
  'youtube.com', 'reddit.com', 'twitter.com', 'x.com', 'zhihu.com', 'zhuanlan.zhihu.com',
  'blogspot.com', 'wordpress.com', 'substack.com', 'notion.site', 'docs.google.com'
]);

const CATEGORY_MAP: Record<string, string> = {
  'ai-image': 'Design & Creative',
  'ai-video': 'Video & Animation',
  'ai-audio': 'Music & Audio',
  'ai-coding': 'Development & Coding',
  'ai-marketing': 'Productivity',
  'ai-agents': 'Development & Coding',
  'ai-productivity': 'Productivity',
  'ai-writing': 'Productivity'
};

const GITHUB_QUERIES = [
  'ai tool in:name,description stars:>500',
  'ai generator in:name,description stars:>400',
  'ai assistant in:name,description stars:>300',
  'ai agent in:name,description stars:>300'
];

/**
 * Repo names/descriptions that read like a library/framework rather than a
 * usable product. Excluded so the directory stays product-focused.
 */
const NON_PRODUCT_PATTERNS = [
  /\b(library|framework|toolkit|sdk|cli|wrapper|package|crate|plugin|extension|npm module|api client|api wrapper|server for)\b/i,
  /\b(system prompts|prompt collection|awesome |awesome-|curated list)\b/i,
  /^nanoid|^uuid|^axios|^lodash|^express/i,
  /^(langchain|langgraph|llama-index|langfuse|autogen)$/i
];

const HN_QUERY = 'Show HN: AI';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function parseArgs(argv: string[]): { limit: number; dryRun: boolean } {
  const limitArg = argv.find((arg) => arg.startsWith('--limit='));
  return {
    limit: Number(limitArg?.split('=')[1] ?? '20'),
    dryRun: argv.includes('--dry-run')
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyApp = Record<string, any>;

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

async function discoverCandidates(options: { fetchImpl?: typeof fetch }): Promise<RawTool[]> {
  const candidates: RawTool[] = [];

  const github = new GitHubConnector();
  for (const query of GITHUB_QUERIES) {
    const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;
    try {
      const tools = await github.fetchTools({ ...options, endpoint, limit: 10 });
      candidates.push(...tools);
      console.log(`[github] ${query.split(' in:')[0]}: +${tools.length}`);
    } catch (error) {
      console.warn(`[github] query failed: ${String(error)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 4000)); // rate limit: 10 req/min unauth
  }

  return candidates;
}

function isAcceptableCandidate(candidate: RawTool, existingDomains: Set<string>): boolean {
  const domain = domainOf(candidate.url);
  if (!domain) return false;
  if (AGGREGATOR_DOMAINS.has(domain) || BLOCKED_DOMAINS.has(domain)) return false;
  if (existingDomains.has(domain)) return false;
  const description = (candidate.description ?? '').trim();
  if (description.length < 20) return false;
  // Skip library/framework-like repos
  const text = `${candidate.name} ${description}`;
  if (NON_PRODUCT_PATTERNS.some((pattern) => pattern.test(text))) {
    console.log(`[filter] non-product: ${candidate.name}`);
    return false;
  }
  return true;
}

function refineCategory(extracted: { category: string }, candidate: RawTool): string {
  const joined = `${(candidate.tags ?? []).map(String).join(' ')} ${candidate.name}`.toLowerCase();

  // Specific creative classes first (so video/presentation tools aren't
  // mis-categorized by generic 'agent'/'ai' tags).
  if (/\b(image|photo|avatar|art|logo|slide|presentation|ppt|qr|design|creative|generator)\b/.test(joined)) {
    return 'Design & Creative';
  }
  if (/\b(video|montage|drama|animation|clip|dubbing)\b/.test(joined)) {
    return 'Video & Animation';
  }
  if (/\b(audio|voice|music|speech|tts)\b/.test(joined)) {
    return 'Music & Audio';
  }
  if (/\b(agent|agents|agentic|autonomous|multiagent|workflow|automation|developer|codegen|coding|self-hosted|security|pentest|engineering|planning|spec)\b/.test(joined)) {
    return 'Development & Coding';
  }
  if (/\b(chat|assistant|chatgpt|desktop|productivity|notes|meeting|writing|copy)\b/.test(joined)) {
    return 'Productivity';
  }
  return CATEGORY_MAP[extracted.category] ?? 'Productivity';
}

async function main() {
  const { limit, dryRun } = parseArgs(process.argv.slice(2));

  const apps: LegacyApp[] = JSON.parse(readFileSync(APPS_FILE, 'utf8'));
  const existingDomains = new Set<string>();
  for (const app of apps) {
    if (app.websiteUrl) existingDomains.add(domainOf(String(app.websiteUrl)));
  }
  console.log(`[start] existing tools: ${apps.length}`);

  // 1. Discover candidates
  const candidates = await discoverCandidates({});
  console.log(`[discover] total candidates: ${candidates.length}`);

  // 2. Filter candidates
  const unique = new Map<string, RawTool>();
  for (const candidate of candidates) {
    const domain = domainOf(candidate.url);
    if (!domain || unique.has(domain)) continue;
    if (!isAcceptableCandidate(candidate, existingDomains)) continue;
    unique.set(domain, candidate);
  }
  const filtered = [...unique.values()].slice(0, limit);
  console.log(`[filter] accepted: ${filtered.length}`);

  // 3. Crawl + extract
  const rateLimiter = createRateLimiter(1200);
  const added: LegacyApp[] = [];
  let crawled = 0;

  for (const candidate of filtered) {
    await rateLimiter();
    crawled += 1;
    try {
      const page = await crawlToolWebsite(candidate.url, { timeoutMs: 8000, retries: 1 });
      if (!page.robotsAllowed || !page.title) {
        console.warn(`[crawl] skip ${candidate.url} (robots=${page.robotsAllowed}, title='${page.title}')`);
        continue;
      }

      const extracted = await extractToolData(candidate, page);
      if (!extracted.description || extracted.description.trim().length < 20) {
        console.warn(`[extract] weak description for ${candidate.name}, skip`);
        continue;
      }

      const rootCategory = refineCategory(extracted, candidate);
      const slug = slugify(extracted.name || candidate.name);
      const now = new Date().toISOString();
      const record: LegacyApp = {
        appName: extracted.name.slice(0, 120),
        description: extracted.description.trim().slice(0, 2000),
        category: rootCategory,
        subcategory: extracted.features[0] ?? '',
        icon: '🤖',
        screenshots: [],
        developerName: '',
        developerEmail: '',
        websiteUrl: candidate.url,
        downloadUrl: null,
        platforms: extracted.platforms.length ? extracted.platforms.map(String) : ['web'],
        pricingModel: extracted.pricing === 'paid' ? 'paid' : extracted.pricing === 'free' ? 'free' : 'freemium',
        price: null,
        currency: 'USD',
        rating: null,
        reviewCount: null,
        monthlyVisits: null,
        growth: null,
        tags: (extracted.features ?? []).map(String).filter(Boolean).slice(0, 8),
        status: 'approved',
        version: '1.0',
        size: null,
        requirements: null,
        privacyPolicy: '',
        termsOfService: '',
        supportEmail: '',
        socialLinks: {},
        seo: {
          slug,
          title: `${extracted.name} - App Search`,
          description: extracted.description.trim().slice(0, 160),
          keywords: (extracted.features ?? []).map(String).slice(0, 5)
        },
        id: `app_acquired_${Date.now()}_${added.length}`,
        submittedAt: now,
        lastUpdated: now,
        downloads: null,
        reviewedAt: now,
        adminNotes: `Acquired from ${candidate.source}${candidate.sourceUrl ? ` (${candidate.sourceUrl})` : ''} on ${now.slice(0, 10)}`,
        featuredUntil: null,
        analytics: {}
      };

      added.push(record);
      console.log(`[+] ${record.appName} (${rootCategory}) <${candidate.source}>`);
    } catch (error) {
      console.warn(`[crawl] failed ${candidate.url}: ${String(error).slice(0, 120)}`);
    }
  }

  console.log(`[result] crawled ${crawled}, added ${added.length}`);

  if (dryRun || added.length === 0) {
    console.log('[write] dry-run or nothing to add — dataset unchanged');
    return;
  }

  // 4. Write back with backup
  const backupDir = join(DATA_DIR, 'backups');
  mkdirSync(backupDir, { recursive: true });
  const backupFile = join(backupDir, `apps.json.bak-${Date.now()}`);
  writeFileSync(backupFile, JSON.stringify(apps, null, 2));
  console.log(`[write] backup: ${backupFile}`);

  const merged = [...apps, ...added];
  writeFileSync(APPS_FILE, JSON.stringify(merged, null, 2));
  console.log(`[write] data/apps.json now has ${merged.length} tools`);
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exit(1);
});
