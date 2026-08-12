/**
 * Resolves real official domains for legacy tools that point at toolify.ai
 * aggregator pages instead of their own websites.
 *
 * Pipeline per tool:
 *   1. Fetch the toolify page through the Jina Reader proxy (bypasses anti-bot).
 *   2. Extract the official website URL from the "Open site" / "Visit Website" links.
 *   3. Crawl the resolved URL to verify it is reachable and real.
 *   4. Update data/apps.json (websiteUrl + richer description when available).
 *
 * Usage:
 *   node --import tsx scripts/resolve-official-domains.ts [--limit=N] [--dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { crawlToolWebsite, createRateLimiter } from '../src/lib/server/acquisition/crawler';

const DATA_DIR = join(process.cwd(), 'data');
const APPS_FILE = join(DATA_DIR, 'apps.json');

const AGGREGATOR_DOMAINS = new Set([
  'toolify.ai', 'futurepedia.io', 'theresanaiforthat.com', 'topai.tools',
  'aitools.fyi', 'aitoolnet.com', 'aitoolsarena.com', 'aitoolz.com',
  'aitop100.com', 'toolfinder.ai', 'aitoolfinder.com', 'gptools.com', 'aitoolbox.org'
]);

const BLOCKED_DOMAINS = new Set([
  'example.com', 'localhost', 'github.com', 'github.io', 'medium.com', 'linkedin.com',
  'youtube.com', 'reddit.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
  'discord.com', 'discord.gg', 'telegram.org', 'whatsapp.com', 'tiktok.com', 'pinterest.com',
  'amazon.com', 'apple.com', 'google.com', 'wikipedia.org', 'quora.com', 'zhihu.com'
]);

function parseArgs(argv: string[]): { limit: number; dryRun: boolean } {
  const limitArg = argv.find((arg) => arg.startsWith('--limit='));
  return {
    limit: Number(limitArg?.split('=')[1] ?? '0'),
    dryRun: argv.includes('--dry-run')
  };
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function cleanUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    // Drop tracking params
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('utm_') || key === 'ref' || key === 'code') url.searchParams.delete(key);
    }
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

async function resolveFromToolify(toolifyUrl: string, fetchImpl: typeof fetch): Promise<string | null> {
  const proxyUrl = `https://r.jina.ai/${encodeURI(toolifyUrl)}`;
  const response = await fetchImpl(proxyUrl, {
    headers: { 'user-agent': 'AppSearchlyBot/1.0 (+https://appsearchly.com)' }
  });
  if (!response.ok) return null;
  const text = await response.text();
  if (text.length < 200) return null;

  // "Open site (url)" or "Visit Website](url)" patterns from Jina markdown
  const patterns = [
    /\[Open site\]\((https?:\/\/[^)]+)\)/i,
    /Visit Website\]\((https?:\/\/[^)]+)\)/i,
    /\[Visit Website\]\((https?:\/\/[^)]+)\)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = cleanUrl(match[1]);
      if (candidate) return candidate;
    }
  }
  return null;
}

function isAcceptableDomain(url: string): boolean {
  const domain = domainOf(url);
  if (!domain) return false;
  if (AGGREGATOR_DOMAINS.has(domain) || BLOCKED_DOMAINS.has(domain)) return false;
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyApp = Record<string, any>;

async function main() {
  const { limit, dryRun } = parseArgs(process.argv.slice(2));
  const apps: LegacyApp[] = JSON.parse(readFileSync(APPS_FILE, 'utf8'));
  const candidates = apps.filter((app) => String(app.websiteUrl ?? '').includes('toolify'));

  // Resume support: resolved URLs are checkpointed so interrupted runs can continue.
  const backupDir = join(DATA_DIR, 'backups');
  mkdirSync(backupDir, { recursive: true });
  const checkpointFile = join(backupDir, 'official-domains.jsonl');
  let checkpoint: Record<string, string> = {};
  try {
    for (const line of readFileSync(checkpointFile, 'utf8').split('\n').filter(Boolean)) {
      const [name, url] = line.split('\t');
      checkpoint[name] = url;
    }
  } catch {
    // no checkpoint yet
  }
  const pending = candidates.filter((app) => !(String(app.appName) in checkpoint));
  const selected = limit > 0 ? pending.slice(0, limit) : pending;
  console.log(`[start] ${apps.length} tools, ${candidates.length} toolify-linked, ${Object.keys(checkpoint).length} resolved so far, processing ${selected.length}`);

  const rateLimiter = createRateLimiter(2000);
  let resolved = 0;
  let verified = 0;
  let skipped = 0;
  const appended: string[] = [];

  for (const app of selected) {
    await rateLimiter();
    const oldUrl = String(app.websiteUrl ?? '');

    try {
      const official = await resolveFromToolify(oldUrl, fetch);
      if (!official || !isAcceptableDomain(official)) {
        appended.push(`${app.appName}\t`);
        console.log(`[-] ${app.appName}: no official link found`);
        skipped += 1;
        continue;
      }
      resolved += 1;

      // Verify the official site is reachable and extract a better description
      const page = await crawlToolWebsite(official, { timeoutMs: 6000, retries: 1 });
      if (!page.robotsAllowed || !page.title || page.title.length < 3) {
        appended.push(`${app.appName}\t`);
        console.log(`[?] ${app.appName}: official ${official} unreachable, keeping toolify link`);
        skipped += 1;
        continue;
      }
      verified += 1;

      const note = app.adminNotes ? `${app.adminNotes}; ` : '';
      app.websiteUrl = official;
      app.adminNotes = `${note}Official domain resolved ${new Date().toISOString().slice(0, 10)} (via Jina/toolify)`;
      if (page.description && page.description.trim().length >= 30) {
        app.description = page.description.trim().slice(0, 2000);
        if (app.seo?.description) app.seo.description = page.description.trim().slice(0, 160);
      }
      appended.push(`${app.appName}\t${official}`);
      console.log(`[+] ${app.appName}: ${oldUrl.slice(0, 50)} -> ${official} (${page.title.slice(0, 40)})`);
    } catch (error) {
      appended.push(`${app.appName}\t`);
      console.warn(`[!] ${app.appName}: ${String(error).slice(0, 100)}`);
      skipped += 1;
    }

    // Checkpoint after every tool so a timeout can be resumed
    if (appended.length > 0) {
      const existing = existsSync(checkpointFile) ? readFileSync(checkpointFile, 'utf8').trimEnd() : '';
      writeFileSync(checkpointFile, `${existing}\n${appended.join('\n')}\n`);
      appended.length = 0;
    }
  }

  console.log(`[result] processed ${selected.length}, resolved ${resolved}, verified ${verified}, skipped ${skipped}`);

  if (dryRun || verified === 0) {
    console.log('[write] dry-run or nothing verified — dataset unchanged');
    return;
  }

  mkdirSync(join(DATA_DIR, 'backups'), { recursive: true });
  const backupFile = join(DATA_DIR, 'backups', `apps.json.bak-${Date.now()}`);
  writeFileSync(backupFile, JSON.stringify(apps, null, 2));
  writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2));
  console.log(`[write] backup ${backupFile}`);
  console.log(`[write] data/apps.json updated (${apps.length} tools, ${apps.filter((a) => !String(a.websiteUrl ?? '').includes('toolify')).length} now point to official domains)`);
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exit(1);
});
