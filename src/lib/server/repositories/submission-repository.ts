import type { Client } from 'pg';
import type { SubmissionCheckResult } from '$lib/services/submission-checker';
import type { ToolQualityScore } from '$lib/services/tool-quality-score';

export async function isDomainBlocked(client: Client, domain: string): Promise<boolean> {
  const result = await client.query(
    'SELECT 1 FROM blocked_domains WHERE domain = $1 AND active = true LIMIT 1',
    [domain]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function hasDuplicateDomain(client: Client, domain: string): Promise<boolean> {
  const result = await client.query(
    `SELECT 1 FROM submissions
     WHERE normalized_domain = $1 AND status NOT IN ('rejected', 'spam')
     LIMIT 1`,
    [domain]
  );
  if ((result.rowCount ?? 0) > 0) return true;
  const tool = await client.query('SELECT 1 FROM tools WHERE canonical_domain = $1 LIMIT 1', [domain]);
  return (tool.rowCount ?? 0) > 0;
}

export async function countRecentSubmissions(
  client: Client,
  field: 'ip_hash' | 'email',
  value: string,
  interval: '1 day' | '30 days'
): Promise<number> {
  const expression = field === 'email'
    ? `lower(submitter_email::text) = lower($1)`
    : `raw_payload->>'ipHash' = $1`;
  const result = await client.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM submissions
     WHERE ${expression} AND created_at >= now() - interval '${interval}'`,
    [value]
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function persistSubmission(
  client: Client,
  input: {
    name: string;
    website: string;
    description?: string;
    email?: string;
    category?: string;
    domain: string;
    ipHash: string;
    checks: SubmissionCheckResult[];
    quality: ToolQualityScore;
  }
): Promise<string> {
  const status = input.quality.recommendation === 'reject' ? 'needs_review' : 'pending';
  const inserted = await client.query<{ id: string }>(
    `INSERT INTO submissions
      (submitted_url, submitted_name, submitter_email, raw_payload, status, normalized_domain)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6)
     RETURNING id`,
    [
      input.website,
      input.name,
      input.email || null,
      JSON.stringify({ description: input.description ?? '', category: input.category ?? '', ipHash: input.ipHash }),
      status,
      input.domain
    ]
  );
  const submissionId = inserted.rows[0]?.id;
  if (!submissionId) throw new Error('submission_insert_failed');

  for (const check of input.checks) {
    await client.query(
      `INSERT INTO submission_checks (submission_id, check_type, status, score, details)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [submissionId, check.checkType, check.status, check.score, JSON.stringify(check.details)]
    );
  }

  await client.query(
    `INSERT INTO submission_quality_scores
      (submission_id, overall_score, website_score, trust_score, content_score, seo_score, security_score, recommendation, details)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
    [
      submissionId,
      input.quality.overall,
      input.quality.websiteScore,
      input.quality.trustScore,
      input.quality.contentScore,
      input.quality.seoScore,
      input.quality.securityScore,
      input.quality.recommendation,
      JSON.stringify({ version: 1 })
    ]
  );

  return submissionId;
}
