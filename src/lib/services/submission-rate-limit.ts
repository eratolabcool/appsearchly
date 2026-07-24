export const SUBMISSION_RATE_LIMITS = {
  ipPerDay: 10,
  emailPerMonth: 20
} as const;

export function isSubmissionRateLimited(input: {
  ipDailyCount: number;
  emailMonthlyCount: number;
}): boolean {
  return input.ipDailyCount >= SUBMISSION_RATE_LIMITS.ipPerDay ||
    input.emailMonthlyCount >= SUBMISSION_RATE_LIMITS.emailPerMonth;
}
