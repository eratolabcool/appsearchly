export type SubmissionCheckResult = {
  checkType: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details?: Record<string, unknown>;
};

export async function checkSubmissionUrl(url: string): Promise<SubmissionCheckResult[]> {
  const results: SubmissionCheckResult[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return [{ checkType: 'url_format', status: 'failed', score: 0 }];
  }

  results.push({
    checkType: 'https',
    status: parsed.protocol === 'https:' ? 'passed' : 'failed',
    score: parsed.protocol === 'https:' ? 10 : 0,
    details: { protocol: parsed.protocol },
  });

  try {
    const response = await fetch(parsed.toString(), {
      method: 'HEAD',
      redirect: 'follow',
    });

    results.push({
      checkType: 'website_accessibility',
      status: response.ok || response.status < 400 ? 'passed' : 'warning',
      score: response.ok || response.status < 400 ? 20 : 5,
      details: { status: response.status },
    });
  } catch (error) {
    results.push({
      checkType: 'website_accessibility',
      status: 'failed',
      score: 0,
      details: { error: String(error) },
    });
  }

  return results;
}
