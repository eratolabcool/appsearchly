export type SubmissionCheckResult = {
  checkType: 'url_format' | 'https' | 'website_accessibility' | 'redirect_domain';
  status: 'passed' | 'warning' | 'failed';
  score: number;
  details: Record<string, unknown>;
};

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '::1' || host.endsWith('.local') ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

export function normalizeDomain(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
}

export async function checkSubmissionUrl(
  url: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ domain?: string; checks: SubmissionCheckResult[] }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { checks: [{ checkType: 'url_format', status: 'failed', score: 0, details: {} }] };
  }

  if (isPrivateHost(parsed.hostname)) {
    return { checks: [{ checkType: 'url_format', status: 'failed', score: 0, details: { reason: 'private_host' } }] };
  }

  const domain = normalizeDomain(parsed.toString());
  const checks: SubmissionCheckResult[] = [{
    checkType: 'https',
    status: parsed.protocol === 'https:' ? 'passed' : 'failed',
    score: parsed.protocol === 'https:' ? 10 : 0,
    details: { protocol: parsed.protocol }
  }];

  if (parsed.protocol !== 'https:') return { domain, checks };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    const response = await fetchImpl(parsed.toString(), {
      method: 'GET', redirect: 'follow', signal: controller.signal,
      headers: { 'user-agent': 'AppSearchlySubmissionVerifier/1.0', range: 'bytes=0-65535' }
    });
    clearTimeout(timer);
    const finalDomain = normalizeDomain(response.url || parsed.toString());
    checks.push({
      checkType: 'website_accessibility',
      status: response.status < 400 ? 'passed' : 'failed',
      score: response.status < 400 ? 20 : 0,
      details: { status: response.status }
    });
    checks.push({
      checkType: 'redirect_domain',
      status: finalDomain === domain || finalDomain.endsWith(`.${domain}`) ? 'passed' : 'warning',
      score: finalDomain === domain || finalDomain.endsWith(`.${domain}`) ? 5 : 0,
      details: { submittedDomain: domain, finalDomain }
    });
  } catch (error) {
    checks.push({
      checkType: 'website_accessibility', status: 'failed', score: 0,
      details: { error: error instanceof Error ? error.name : 'fetch_failed' }
    });
  }

  return { domain, checks };
}
