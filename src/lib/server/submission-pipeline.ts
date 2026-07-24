import { withDatabase } from '$lib/server/db';
import { checkSubmissionUrl } from '$lib/services/submission-checker';
import { calculateToolQualityScore } from '$lib/services/tool-quality-score';
import { verifyTurnstileToken } from '$lib/services/turnstile';
import { isSubmissionRateLimited } from '$lib/services/submission-rate-limit';
import {
  countRecentSubmissions,
  hasDuplicateDomain,
  isDomainBlocked,
  persistSubmission
} from '$lib/server/repositories/submission-repository';

export type SubmissionInput = {
  name: string;
  website: string;
  description?: string;
  email?: string;
  category?: string;
  turnstileToken?: string;
};

export type SubmissionPipelineResult = {
  success: boolean;
  status?: 'pending_review';
  submissionId?: string;
  qualityScore?: number;
  recommendation?: 'reject' | 'manual_review' | 'approve_candidate';
  error?: 'invalid_payload' | 'captcha_failed' | 'invalid_url' | 'duplicate_domain' | 'rate_limited' | 'security_check_failed' | 'database_error';
};

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validEmail(email?: string): boolean {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function processSubmission(
  input: SubmissionInput,
  context: { platform: App.Platform | undefined; remoteIp: string; fetchImpl?: typeof fetch }
): Promise<SubmissionPipelineResult> {
  const name = input.name?.trim();
  const website = input.website?.trim();
  const description = input.description?.trim();
  const email = input.email?.trim().toLowerCase();
  const category = input.category?.trim();

  if (!name || name.length < 2 || name.length > 120 || !website || !validEmail(email) || (description?.length ?? 0) > 2_000) {
    return { success: false, error: 'invalid_payload' };
  }

  const env = context.platform?.env;
  const turnstileSecret = env?.TURNSTILE_SECRET_KEY;
  const production = env?.APP_ENV === 'production';
  if (production || turnstileSecret) {
    const verified = await verifyTurnstileToken({
      token: input.turnstileToken ?? '',
      secret: turnstileSecret ?? '',
      remoteIp: context.remoteIp,
      fetchImpl: context.fetchImpl
    });
    if (!verified) return { success: false, error: 'captcha_failed' };
  }

  const inspected = await checkSubmissionUrl(website, context.fetchImpl);
  if (!inspected.domain) return { success: false, error: 'invalid_url' };
  const securityFailed = inspected.checks.some((check) => check.status === 'failed');
  const ipHash = await sha256(context.remoteIp || 'unknown');

  try {
    return await withDatabase(context.platform, async (client) => {
      await client.query('BEGIN');
      try {
        const [blocked, duplicate, ipCount, emailCount] = await Promise.all([
          isDomainBlocked(client, inspected.domain!),
          hasDuplicateDomain(client, inspected.domain!),
          countRecentSubmissions(client, 'ip_hash', ipHash, '1 day'),
          email ? countRecentSubmissions(client, 'email', email, '30 days') : Promise.resolve(0)
        ]);

        if (duplicate) {
          await client.query('ROLLBACK');
          return { success: false, error: 'duplicate_domain' } as const;
        }
        if (isSubmissionRateLimited({ ipDailyCount: ipCount, emailMonthlyCount: emailCount })) {
          await client.query('ROLLBACK');
          return { success: false, error: 'rate_limited' } as const;
        }

        const quality = calculateToolQualityScore({ name, description, email, category, checks: inspected.checks, blocked });
        if (blocked || securityFailed || quality.securityScore === 0) {
          await client.query('ROLLBACK');
          return { success: false, error: 'security_check_failed' } as const;
        }

        const submissionId = await persistSubmission(client, {
          name, website, description, email, category, domain: inspected.domain!, ipHash,
          checks: inspected.checks, quality
        });
        await client.query('COMMIT');
        return {
          success: true,
          status: 'pending_review',
          submissionId,
          qualityScore: quality.overall,
          recommendation: quality.recommendation
        } as const;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      }
    });
  } catch {
    return { success: false, error: 'database_error' };
  }
}
