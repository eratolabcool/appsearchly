export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
};

export function checkSubmissionRateLimit(currentCount: number, limit = 10): RateLimitResult {
  return {
    allowed: currentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentCount),
  };
}
