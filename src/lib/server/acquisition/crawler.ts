export type CrawledPage = {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaTags: Record<string, string>;
  pricing: string[];
  features: string[];
  links: string[];
  contentText: string;
  robotsAllowed: boolean;
};

export type CrawlOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retries?: number;
  userAgent?: string;
};

export function createRateLimiter(intervalMs: number) {
  let nextAllowedAt = 0;

  return async () => {
    const now = Date.now();
    const waitMs = Math.max(0, nextAllowedAt - now);
    nextAllowedAt = Math.max(now, nextAllowedAt) + Math.max(0, intervalMs);
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  };
}

function absoluteUrl(value: string | null | undefined, base: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

function firstMatch(html: string, pattern: RegExp): string | null {
  return html.match(pattern)?.[1]?.trim() ?? null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20_000);
}

async function fetchWithTimeout(fetchImpl: typeof fetch, url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function robotsAllows(fetchImpl: typeof fetch, url: URL, userAgent: string, timeoutMs: number): Promise<boolean> {
  const robotsUrl = new URL('/robots.txt', url.origin);
  try {
    const response = await fetchWithTimeout(fetchImpl, robotsUrl.toString(), { headers: { 'user-agent': userAgent } }, timeoutMs);
    if (!response.ok) return true;
    const robots = await response.text();
    const relevant = robots
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => /^user-agent:|^disallow:/i.test(line));
    let applies = false;
    for (const line of relevant) {
      const [, key, value] = line.match(/^(user-agent|disallow):\s*(.*)$/i) ?? [];
      if (!key) continue;
      if (key.toLowerCase() === 'user-agent') applies = value === '*' || value.toLowerCase() === userAgent.toLowerCase();
      if (applies && key.toLowerCase() === 'disallow' && value && url.pathname.startsWith(value)) return false;
    }
  } catch {
    return true;
  }
  return true;
}

export async function crawlToolWebsite(url: string, options: CrawlOptions = {}): Promise<CrawledPage> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 5_000;
  const retries = options.retries ?? 2;
  const userAgent = options.userAgent ?? 'AppSearchlyBot/1.0 (+https://appsearchly.com)';
  const parsed = new URL(url);
  const robotsAllowed = await robotsAllows(fetchImpl, parsed, userAgent, timeoutMs);

  if (!robotsAllowed) {
    return {
      url,
      finalUrl: url,
      title: '',
      description: '',
      logoUrl: null,
      faviconUrl: null,
      metaTags: {},
      pricing: [],
      features: [],
      links: [],
      contentText: '',
      robotsAllowed: false
    };
  }

  let response: Response | null = null;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      response = await fetchWithTimeout(fetchImpl, url, { headers: { 'user-agent': userAgent, accept: 'text/html' } }, timeoutMs);
      if (response.ok) break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response?.ok) throw new Error(`Crawler failed for ${url}: ${response?.status ?? String(lastError)}`);

  const html = await response.text();
  const finalUrl = response.url || url;
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? '';
  const description =
    firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ??
    firstMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ??
    '';
  const logoUrl = absoluteUrl(firstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i), finalUrl);
  const faviconUrl = absoluteUrl(firstMatch(html, /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i), finalUrl);
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => absoluteUrl(match[1], finalUrl))
    .filter((value): value is string => Boolean(value))
    .slice(0, 100);
  const contentText = stripHtml(html);
  const pricing = contentText.match(/\b(free|freemium|enterprise|pricing|monthly|yearly|\$\d+)\b/gi)?.slice(0, 12) ?? [];
  const features = contentText.match(/\b(ai|automation|chatbot|image|video|audio|agent|workflow|integration|api|analytics|generation)\b/gi)?.slice(0, 20) ?? [];

  return {
    url,
    finalUrl,
    title,
    description,
    logoUrl,
    faviconUrl,
    metaTags: { description },
    pricing,
    features: [...new Set(features.map((item) => item.toLowerCase()))],
    links,
    contentText,
    robotsAllowed
  };
}
