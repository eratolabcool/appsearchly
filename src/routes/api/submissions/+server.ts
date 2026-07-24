import { json, type RequestHandler } from '@sveltejs/kit';
import { processSubmission, type SubmissionInput } from '$lib/server/submission-pipeline';

const STATUS_BY_ERROR = {
  invalid_payload: 400,
  invalid_url: 400,
  captcha_failed: 403,
  duplicate_domain: 409,
  rate_limited: 429,
  security_check_failed: 422,
  database_error: 503
} as const;

export const POST: RequestHandler = async ({ request, platform, getClientAddress, fetch }) => {
  let body: SubmissionInput;
  try {
    body = (await request.json()) as SubmissionInput;
  } catch {
    return json({ success: false, error: 'invalid_payload' }, { status: 400 });
  }

  const result = await processSubmission(body, {
    platform,
    remoteIp: getClientAddress(),
    fetchImpl: fetch
  });

  if (!result.success) {
    return json(result, { status: STATUS_BY_ERROR[result.error ?? 'database_error'] });
  }

  return json(result, { status: 201 });
};
