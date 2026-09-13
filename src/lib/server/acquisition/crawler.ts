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

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;

export function createRateLimiter(intervalMs: number) {
  let nextAllowedAt = 0;
  return async () => {
    const now = Date.now();
    const waitMs = Math.max(0, nextAllowedAt - now);
    nextAllowedAt = Math.max(now, nextAllowedAt) + Math.max(0, intervalMs);
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  };
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
}

export function assertSafePublicUrl(value: string): URL {
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Crawler only supports HTTP(S) URLs');
  if (parsed.username || parsed.password) throw new Error('Crawler URLs must not contain credentials');

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname === '::1' || hostname === '0:0:0:0:0:0:0:1' || hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe80:') || isPrivateIpv4(hostname)) {
    throw new Error('Crawler blocked a private or local network target');
  }
  return parsed;
}

function absoluteUrl(value: string | null | undefined, base: string): string | null {
  if (!value) return null;
  try {
    const result = new URL(value, base).toString();
    assertSafePublicUrl(result);
    return result;
  } catch {
    return null;
  }
}

function firstMatch(html: string, pattern: RegExp): string | null {
  return html.match(pattern)?.[1]?.trim() ?? null;
}

function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 20_000);
}

async function fetchWithTimeout(fetchImpl: typeof fetch, url: string, options: RequestInit, timeoutMs: number) {
  let currentUrl = assertSafePublicUrl(url).toString();
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(currentUrl, { ...options, redirect: 'manual', signal: controller.signal });
      if (response.status < 300 || response.status >= 400) return response;
      const location = response.headers.get('location');
      if (!location) return response;
      currentUrl = assertSafePublicUrl(new URL(location, currentUrl).toString()).toString();
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error('Crawler exceeded redirect limit');
}

async function robotsAllows(fetchImpl: typeof fetch, url: URL, userAgent: string, timeoutMs: number): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(fetchImpl, new URL('/robots.txt', url.origin).toString(), { headers: { 'user-agent': userAgent } }, timeoutMs);
    if (!response.ok) return true;
    const robots = await response.text();
    const relevant = robots.split(/\n/).map((line) => line.trim()).filter((line) => /^user-agent:|^disallow:/i.test(line));
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
  const parsed = assertSafePublicUrl(url);
  const robotsAllowed = await robotsAllows(fetchImpl, parsed, userAgent, timeoutMs);

  if (!robotsAllowed) return { url, finalUrl: url, title: '', description: '', logoUrl: null, faviconUrl: null, metaTags: {}, pricing: [], features: [], links: [], contentText: '', robotsAllowed: false };

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

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) throw new Error('Crawler rejected a non-HTML response');
  const contentLength = Number(response.headers.get('content-length') ?? '0');
  if (contentLength > MAX_RESPONSE_BYTES) throw new Error('Crawler response exceeded size limit');

  const html = (await response.text()).slice(0, MAX_RESPONSE_BYTES);
  const finalUrl = response.url || url;
  assertSafePublicUrl(finalUrl);
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? '';
  const description = firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ?? firstMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ?? '';
  const logoUrl = absoluteUrl(firstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i), finalUrl);
  const faviconUrl = absoluteUrl(firstMatch(html, /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i), finalUrl);
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((match) => absoluteUrl(match[1], finalUrl)).filter((value): value is string => Boolean(value)).slice(0, 100);
  const contentText = stripHtml(html);
  const pricing = contentText.match(/\b(free|freemium|enterprise|pricing|monthly|yearly|\$\d+)\b/gi)?.slice(0, 12) ?? [];
  const features = contentText.match(/\b(ai|automation|chatbot|image|video|audio|agent|workflow|integration|api|analytics|generation)\b/gi)?.slice(0, 20) ?? [];

  return { url, finalUrl, title, description, logoUrl, faviconUrl, metaTags: { description }, pricing, features: [...new Set(features.map((item) => item.toLowerCase()))], links, contentText, robotsAllowed };
}
