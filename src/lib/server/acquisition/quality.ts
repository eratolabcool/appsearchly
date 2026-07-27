import type { CrawledPage } from './crawler';
import type { ExtractedTool } from './extractor';

export type AcquisitionQualityBreakdown = {
  websiteAvailable: number;
  descriptionQuality: number;
  logoExists: number;
  categoryConfidence: number;
  featureCompleteness: number;
  pricingDetected: number;
};

export function scoreAcquiredTool(page: CrawledPage, extracted: ExtractedTool): { score: number; breakdown: AcquisitionQualityBreakdown } {
  const breakdown: AcquisitionQualityBreakdown = {
    websiteAvailable: page.robotsAllowed && Boolean(page.contentText || page.title) ? 20 : 0,
    descriptionQuality: extracted.description.length >= 80 ? 20 : extracted.description.length >= 40 ? 12 : 0,
    logoExists: page.logoUrl || page.faviconUrl ? 15 : 0,
    categoryConfidence: extracted.category ? 15 : 0,
    featureCompleteness: Math.min(extracted.features.length, 5) * 4,
    pricingDetected: extracted.pricing && extracted.pricing !== 'unknown' ? 10 : 0
  };

  return {
    score: Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    breakdown
  };
}
