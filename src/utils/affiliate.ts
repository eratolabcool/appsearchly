/**
 * Affiliate marketing utilities for app download links
 */

export interface AffiliateConfig {
  // Apple App Store
  appleAffiliateToken?: string;
  appleCampaignId?: string;

  // Google Play Store
  googleAffiliateId?: string;
  googleCampaignId?: string;

  // Amazon Appstore
  amazonAffiliateTag?: string;

  // Microsoft Store
  microsoftAffiliateId?: string;
}

export interface AffiliateLink {
  originalUrl: string;
  affiliateUrl: string;
  platform: string;
}

class AffiliateManager {
  private config: AffiliateConfig;

  constructor(config: AffiliateConfig = {}) {
    this.config = {
      appleAffiliateToken: config.appleAffiliateToken || 'appsearch', // Default placeholder
      appleCampaignId: config.appleCampaignId || 'appsearch-web',
      googleAffiliateId: config.googleAffiliateId || 'appsearch',
      googleCampaignId: config.googleCampaignId || 'appsearch_web',
      amazonAffiliateTag: config.amazonAffiliateTag || 'appsearch-20',
      microsoftAffiliateId: config.microsoftAffiliateId || 'appsearch',
      ...config
    };
  }

  /**
   * Convert a regular app store URL to an affiliate URL
   */
  public createAffiliateUrl(originalUrl: string, platform: string): string {
    try {
      const url = new URL(originalUrl);

      switch (platform.toLowerCase()) {
        case 'ios':
        case 'ipados':
          return this.createAppleAffiliateUrl(url);

        case 'android':
          return this.createGoogleAffiliateUrl(url);

        case 'amazon':
          return this.createAmazonAffiliateUrl(url);

        case 'windows':
        case 'microsoft':
          return this.createMicrosoftAffiliateUrl(url);

        default:
          return originalUrl;
      }
    } catch (error) {
      console.warn('Failed to create affiliate URL:', error);
      return originalUrl;
    }
  }

  /**
   * Create Apple App Store affiliate URL
   */
  private createAppleAffiliateUrl(url: URL): string {
    const params = new URLSearchParams(url.search);

    // Add affiliate parameters
    params.set('ct', this.config.appleCampaignId || 'appsearch-web');
    params.set('mt', '8'); // Mobile tracking

    if (this.config.appleAffiliateToken) {
      params.set('at', this.config.appleAffiliateToken);
    }

    // Reconstruct URL with affiliate parameters
    url.search = params.toString();
    return url.toString();
  }

  /**
   * Create Google Play Store affiliate URL
   */
  private createGoogleAffiliateUrl(url: URL): string {
    const params = new URLSearchParams(url.search);

    // Add referral parameters
    if (this.config.googleAffiliateId) {
      params.set('referrer', `utm_source=${this.config.googleAffiliateId}&utm_campaign=${this.config.googleCampaignId || 'appsearch_web'}`);
    }

    url.search = params.toString();
    return url.toString();
  }

  /**
   * Create Amazon Appstore affiliate URL
   */
  private createAmazonAffiliateUrl(url: URL): string {
    const params = new URLSearchParams(url.search);

    if (this.config.amazonAffiliateTag) {
      params.set('tag', this.config.amazonAffiliateTag);
    }

    url.search = params.toString();
    return url.toString();
  }

  /**
   * Create Microsoft Store affiliate URL
   */
  private createMicrosoftAffiliateUrl(url: URL): string {
    const params = new URLSearchParams(url.search);

    if (this.config.microsoftAffiliateId) {
      params.set('cid', this.config.microsoftAffiliateId);
    }

    url.search = params.toString();
    return url.toString();
  }

  /**
   * Track click events for analytics
   */
  public trackClick(appId: string, platform: string, position?: number): void {
    // Send click tracking data to analytics
    if (typeof (globalThis as any).gtag !== 'undefined') {
      (globalThis as any).gtag('event', 'app_download_click', {
        app_id: appId,
        platform: platform,
        position: position,
        custom_map: {
          'custom_parameter_1': 'app_id',
          'custom_parameter_2': 'platform',
          'custom_parameter_3': 'position'
        }
      });
    }

    // Custom analytics tracking
    console.log('Affiliate click tracked:', {
      appId,
      platform,
      position,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate tracking parameters for UTM campaigns
   */
  public generateUTMParams(source: string, medium: string, campaign: string, content?: string): string {
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign
    });

    if (content) {
      params.set('utm_content', content);
    }

    return params.toString();
  }

  /**
   * Get platform from URL
   */
  public getPlatformFromUrl(url: string): string {
    if (url.includes('apps.apple.com')) return 'ios';
    if (url.includes('play.google.com')) return 'android';
    if (url.includes('amazon.com')) return 'amazon';
    if (url.includes('microsoft.com')) return 'microsoft';
    return 'web';
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AffiliateConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AffiliateConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const affiliateManager = new AffiliateManager();

// Export types and utilities
export { AffiliateManager };
export type { AffiliateConfig, AffiliateLink };

// Initialize with environment variables if available
if (typeof import.meta !== 'undefined' && import.meta.env) {
  affiliateManager.updateConfig({
    appleAffiliateToken: import.meta.env.VITE_APPLE_AFFILIATE_TOKEN,
    appleCampaignId: import.meta.env.VITE_APPLE_CAMPAIGN_ID,
    googleAffiliateId: import.meta.env.VITE_GOOGLE_AFFILIATE_ID,
    googleCampaignId: import.meta.env.VITE_GOOGLE_CAMPAIGN_ID,
    amazonAffiliateTag: import.meta.env.VITE_AMAZON_AFFILIATE_TAG,
    microsoftAffiliateId: import.meta.env.VITE_MICROSOFT_AFFILIATE_ID
  });
}