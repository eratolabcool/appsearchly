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
  qualityScore?: number;
  error?: string;
};

/**
 * Central orchestration point for tool submissions.
 * Individual checks remain isolated in their own services.
 */
export async function processSubmission(
  input: SubmissionInput,
): Promise<SubmissionPipelineResult> {
  if (!input.name || !input.website) {
    return {
      success: false,
      error: 'invalid_payload',
    };
  }

  // Integration points:
  // 1. verifyTurnstileToken()
  // 2. checkSubmissionRateLimit()
  // 3. checkSubmissionUrl()
  // 4. calculateToolQualityScore()
  // 5. persist submission + checks + score

  return {
    success: true,
    status: 'pending_review',
    qualityScore: 0,
  };
}
