import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { DatabaseUnavailableError } from '$lib/server/db';
import {
  createSubmission,
  listSubmissions,
  type CreateSubmissionInput
} from '$lib/server/submission-repository';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = new Set([
  'pending',
  'needs_review',
  'approved',
  'rejected',
  'duplicate',
  'spam',
  'all'
]);

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function normalizeUrl(value: unknown): string | null {
  const candidate = text(value, 2_048);
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function normalizePayload(value: unknown): CreateSubmissionInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const payload = value as Record<string, unknown>;
  const submittedUrl = normalizeUrl(payload.websiteUrl ?? payload.submittedUrl);
  const submittedName = text(payload.appName ?? payload.submittedName, 200);
  const submitterEmail = text(payload.developerEmail ?? payload.submitterEmail, 320)?.toLowerCase() ?? null;
  const submitterName = text(payload.developerName ?? payload.submitterName, 200);
  const description = text(payload.description, 10_000);
  const category = text(payload.category, 200);

  if (
    !submittedUrl ||
    !submittedName ||
    !submitterEmail ||
    !EMAIL_PATTERN.test(submitterEmail) ||
    !submitterName ||
    !description ||
    !category
  ) {
    return null;
  }

  return {
    submittedUrl,
    submittedName,
    submitterEmail,
    submitterName,
    rawPayload: {
      submittedName,
      submittedUrl,
      submitterEmail,
      submitterName,
      description,
      category,
      subcategory: text(payload.subcategory, 200),
      pricingModel: text(payload.pricingModel ?? payload.priceType, 100),
      platforms: Array.isArray(payload.platforms)
        ? payload.platforms.slice(0, 20).map((item) => String(item).slice(0, 100))
        : text(payload.platform, 100)
          ? [text(payload.platform, 100)]
          : [],
      tags: Array.isArray(payload.tags)
        ? payload.tags.slice(0, 30).map((item) => String(item).slice(0, 100))
        : text(payload.tags, 1_000)
          ? text(payload.tags, 1_000)?.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 30)
          : [],
      privacyPolicy: normalizeUrl(payload.privacyPolicy),
      termsOfService: normalizeUrl(payload.termsOfService),
      supportEmail: text(payload.supportEmail, 320)?.toLowerCase() ?? null
    }
  };
}

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const payload = normalizePayload(await request.json());

    if (!payload) {
      return json(
        {
          success: false,
          error: 'invalid_submission',
          message: 'Name, official URL, category, description, developer name, and a valid email are required.'
        },
        { status: 400 }
      );
    }

    const submission = await createSubmission(platform, payload);

    return json(
      {
        success: true,
        message: 'Tool submitted successfully. It will remain pending until reviewed.',
        submissionId: submission.id,
        status: submission.status,
        submittedAt: submission.createdAt
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  } catch (error) {
    console.error('Tool submission failed:', error);

    const unavailable = error instanceof DatabaseUnavailableError;
    return json(
      {
        success: false,
        error: unavailable ? 'database_not_configured' : 'submission_unavailable',
        message: unavailable
          ? 'Submissions are temporarily disabled while the database connection is being configured.'
          : 'The submission could not be saved. Please try again later.'
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
};

export const GET: RequestHandler = async ({ request, url, platform }) => {
  if (!isAdminAuthorized(request, platform)) {
    return json(
      { success: false, error: 'unauthorized' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store',
          'WWW-Authenticate': 'Bearer realm="AppSearchly Admin"'
        }
      }
    );
  }

  const status = url.searchParams.get('status') ?? 'all';
  if (!ALLOWED_STATUSES.has(status)) {
    return json({ success: false, error: 'invalid_status' }, { status: 400 });
  }

  const requestedLimit = Number.parseInt(url.searchParams.get('limit') ?? '50', 10);
  const requestedPage = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;

  try {
    const result = await listSubmissions(platform, {
      status,
      limit,
      offset: (page - 1) * limit
    });

    return json(
      {
        success: true,
        submissions: result.items,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Submission list failed:', error);
    return json(
      { success: false, error: 'submission_list_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
};
