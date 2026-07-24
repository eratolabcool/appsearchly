export type ToolQualityInput = {
  https?: boolean;
  reachable?: boolean;
  hasPricing?: boolean;
  hasContact?: boolean;
  hasDescription?: boolean;
  hasLogo?: boolean;
  hasMeta?: boolean;
};

export type ToolQualityScore = {
  overall: number;
  websiteScore: number;
  trustScore: number;
  contentScore: number;
  seoScore: number;
  securityScore: number;
};

export function calculateToolQualityScore(input: ToolQualityInput): ToolQualityScore {
  const securityScore = input.https ? 5 : 0;
  const websiteScore = (input.reachable ? 15 : 0) + (input.hasLogo ? 5 : 0) + (input.hasMeta ? 5 : 0) + securityScore;
  const trustScore = (input.hasPricing ? 10 : 0) + (input.hasContact ? 10 : 0);
  const contentScore = input.hasDescription ? 20 : 0;
  const seoScore = input.hasMeta ? 15 : 0;
  const finalSecurity = input.https && input.reachable ? 10 : 0;

  return {
    overall: Math.min(100, websiteScore + trustScore + contentScore + seoScore + finalSecurity),
    websiteScore,
    trustScore,
    contentScore,
    seoScore,
    securityScore: finalSecurity
  };
}
