// iTunes/Apple App Store Affiliate Link Generator

export interface AffiliateConfig {
  // Apple Affiliate Program settings
  affiliateToken?: string;
  campaignId?: string;
  providerToken?: string;
}

class ITunesAffiliateManager {
  private config: AffiliateConfig;

  constructor() {
    this.config = {
      affiliateToken: import.meta.env.VITE_APPLE_AFFILIATE_TOKEN || 'appsearch',
      campaignId: import.meta.env.VITE_APPLE_CAMPAIGN_ID || 'appsearch-web',
      providerToken: import.meta.env.VITE_APPLE_PROVIDER_TOKEN || undefined
    };
  }

  /**
   * Convert an iTunes App Store URL to an affiliate URL
   */
  createAffiliateUrl(originalUrl: string): string {
    try {
      const url = new URL(originalUrl);

      // Add affiliate parameters
      const params = new URLSearchParams(url.search);

      // Add campaign tracking
      params.set('at', this.config.affiliateToken || 'appsearch');
      params.set('ct', this.config.campaignId || 'appsearch-web');

      // Add device identifier
      params.set('mt', '8'); // Mobile tracking
      params.set('uo', '4'); // Affiliate partner code

      // Reconstruct URL
      url.search = params.toString();

      return url.toString();
    } catch (error) {
      console.warn('Failed to create affiliate URL:', error);
      return originalUrl;
    }
  }

  /**
   * Generate a deep link for iOS devices
   */
  generateDeepLink(appId: string): string {
    return `https://apps.apple.com/app/id${appId}?pt=117887903&ct=appsearch-web&mt=8`;
  }

  /**
   * Create a universal link that works across platforms
   */
  createUniversalLink(appId: string, appName: string): string {
    const affiliateParams = `at=${this.config.affiliateToken}&ct=${this.config.campaignId}&mt=8`;

    // Try universal link first, fallback to regular link
    return `https://apps.apple.com/app/${appName.toLowerCase().replace(/\s+/g, '-')}/id${appId}?${affiliateParams}`;
  }

  /**
   * Track click events for analytics
   */
  trackClick(appId: string, appName: string, platform: string, position?: number): void {
    // Google Analytics tracking
    if (typeof (globalThis as any).gtag !== 'undefined') {
      (globalThis as any).gtag('event', 'app_download_click', {
        app_id: appId,
        app_name: appName,
        platform: platform,
        position: position,
        event_category: 'app_discovery',
        event_label: appName
      });
    }

    // Custom analytics tracking
    console.log('Affiliate click tracked:', {
      appId,
      appName,
      platform,
      position,
      timestamp: new Date().toISOString()
    });

    // Store click data for analytics
    this.storeClickEvent({
      appId,
      appName,
      platform,
      position,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Store click events for analytics
   */
  private storeClickEvent(event: {
    appId: string;
    appName: string;
    platform: string;
    position?: number;
    timestamp: string;
  }): void {
    // Store in localStorage for analytics
    try {
      const existingEvents = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
      existingEvents.push(event);

      // Keep only last 100 events
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }

      localStorage.setItem('affiliate_clicks', JSON.stringify(existingEvents));
    } catch (error) {
      console.warn('Failed to store click event:', error);
    }
  }

  /**
   * Get click statistics
   */
  getClickStats(): {
    totalClicks: number;
    topApps: Array<{ appName: string; clicks: number }>;
    recentClicks: Array<{ appName: string; timestamp: string }>;
  } {
    try {
      const events = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');

      const totalClicks = events.length;

      // Count clicks per app
      const appClicks: { [key: string]: number } = {};
      events.forEach(event => {
        appClicks[event.appName] = (appClicks[event.appName] || 0) + 1;
      });

      // Sort by clicks and get top 5
      const topApps = Object.entries(appClicks)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([appName, clicks]) => ({ appName, clicks }));

      // Get recent clicks (last 10)
      const recentClicks = events
        .slice(-10)
        .reverse()
        .map(event => ({
          appName: event.appName,
          timestamp: event.timestamp
        }));

      return { totalClicks, topApps, recentClicks };
    } catch (error) {
      console.warn('Failed to get click stats:', error);
      return { totalClicks: 0, topApps: [], recentClicks: [] };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AffiliateConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AffiliateConfig {
    return { ...this.config };
  }

  /**
   * Check if affiliate is enabled
   */
  isAffiliateEnabled(): boolean {
    return !!(this.config.affiliateToken && this.config.affiliateToken !== '');
  }

  /**
   * Generate QR code data for mobile scanning
   */
  generateQRCodeData(appId: string, appName: string): string {
    const affiliateUrl = this.createUniversalLink(appId, appName);
    return affiliateUrl;
  }
}

// Create singleton instance
export const itunesAffiliateManager = new ITunesAffiliateManager();

// Export types and utilities
export type { AffiliateConfig };
export { ITunesAffiliateManager };

// Initialize with environment variables if available
if (typeof import.meta !== 'undefined' && import.meta.env) {
  itunesAffiliateManager.updateConfig({
    affiliateToken: import.meta.env.VITE_APPLE_AFFILIATE_TOKEN,
    campaignId: import.meta.env.VITE_APPLE_CAMPAIGN_ID,
    providerToken: import.meta.env.VITE_APPLE_PROVIDER_TOKEN
  });
}