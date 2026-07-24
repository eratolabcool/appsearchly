import type { SubmissionCheckResult } from './submission-checker';

export type ToolQualityScore = {
  overall: number;
  websiteScore: number;
  trustScore: number;
  contentScore: number;
  seoScore: number;
  securityScore: number;
  recommendation: 'reject' | 'manual_review' | 'approve_candidate';
};

export function calculateToolQualityScore(input: {
  name: string;
  description?: string;
  email?: string;
  category?: string;
  checks: SubmissionCheckResult[];
  blocked: boolean;
}): ToolQualityScore {
  const passed = new Set(input.checks.filter((check) => check.status === 'passed').map((check) => check.checkType));
  const https = passed.has('https');
  const reachable = passed.has('website_accessibility');
  const safeRedirect = passed.has('redirect_domain');

  const websiteScore = Math.min(30, (reachable ? 20 : 0) + (safeRedirect ? 5 : 0) + (input.name.trim().length >= 2 ? 5 : 0));
  const trustScore = Math.min(25, (input.email ? 10 : 0) + (input.category ? 5 : 0) + (safeRedirect ? 10 : 0));
  const descriptionLength = input.description?.trim().length ?? 0;
  const contentScore = descriptionLength >= 80 ? 20 : descriptionLength >= 30 ? 12 : descriptionLength > 0 ? 5 : 0;
  const seoScore = Math.min(15, (input.name.trim().length <= 80 ? 5 : 0) + (descriptionLength >= 50 && descriptionLength <= 300 ? 10 : 0));
  const securityScore = https && reachable && !input.blocked ? 10 : 0;
  const overall = websiteScore + trustScore + contentScore + seoScore + securityScore;
  const recommendation = input.blocked || securityScore === 0 || overall < 50
    ? 'reject'
    : overall >= 90
      ? 'approve_candidate'
      : 'manual_review';

  return { overall, websiteScore, trustScore, contentScore, seoScore, securityScore, recommendation };
}
