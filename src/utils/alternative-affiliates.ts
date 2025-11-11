/**
 * Alternative Affiliate Networks for App Monetization
 * Apple affiliate is restricted, so we use these alternatives
 */

export interface AffiliateNetwork {
  name: string;
  type: 'app' | 'software' | 'subscription' | 'tech';
  commission: string;
  trackingMethod: string;
  signupUrl: string;
  status: 'available' | 'restricted' | 'invitation';
}

export const AFFILIATE_NETWORKS: AffiliateNetwork[] = [
  {
    name: 'Microsoft Store',
    type: 'app',
    commission: '5-15%',
    trackingMethod: 'Microsoft Partner Center',
    signupUrl: 'https://partner.microsoft.com/dashboard',
    status: 'available'
  },
  {
    name: 'Google Play Affiliate',
    type: 'app',
    commission: 'Variable',
    trackingMethod: 'Google Play Console',
    signupUrl: 'https://play.google.com/console',
    status: 'restricted'
  },
  {
    name: 'Amazon Appstore',
    type: 'app',
    commission: '3-10%',
    trackingMethod: 'Amazon Associates',
    signupUrl: 'https://affiliate-program.amazon.com',
    status: 'available'
  },
  {
    name: 'Digital River',
    type: 'software',
    commission: '10-30%',
    trackingMethod: 'Custom tracking',
    signupUrl: 'https://partners.digitalriver.com',
    status: 'available'
  },
  {
    name: 'ShareASale',
    type: 'tech',
    commission: '20-50%',
    trackingMethod: 'Network tracking',
    signupUrl: 'https://www.shareasale.com',
    status: 'available'
  },
  {
    name: 'Rakuten Advertising',
    type: 'tech',
    commission: '5-25%',
    trackingMethod: 'Network tracking',
    signupUrl: 'https://rakutenadvertising.com',
    status: 'available'
  },
  {
    name: 'Impact Radius',
    type: 'subscription',
    commission: '10-40%',
    trackingMethod: 'Partnerize integration',
    signupUrl: 'https://impact.com',
    status: 'available'
  },
  {
    name: 'CJ Affiliate',
    type: 'tech',
    commission: '5-30%',
    trackingMethod: 'Network tracking',
    signupUrl: 'https://www.cj.com',
    status: 'available'
  }
];

export class AlternativeAffiliateManager {
  private networks: Map<string, any> = new Map();

  constructor() {
    this.initializeNetworks();
  }

  private initializeNetworks() {
    // Initialize tracking for each network
    AFFILIATE_NETWORKS.forEach(network => {
      this.networks.set(network.name, {
        enabled: false,
        trackingId: null,
        commissionRate: 0
      });
    });
  }

  /**
   * Generate affiliate link for alternative networks
   */
  generateAffiliateLink(appUrl: string, appStore: string, appDetails: any): string {
    const baseUrl = this.getNetworkBaseUrl(appStore);

    // Fallback to non-affiliate link if no network available
    if (!baseUrl) {
      return this.addUTMParameters(appUrl, appDetails);
    }

    return this.buildNetworkLink(baseUrl, appUrl, appDetails);
  }

  private getNetworkBaseUrl(appStore: string): string {
    const networkMap: Record<string, string> = {
      'microsoft': 'https://partner.microsoft.com/dashboard',
      'amazon': 'https://www.amazon.com',
      'google': 'https://play.google.com'
    };

    return networkMap[appStore.toLowerCase()] || '';
  }

  private buildNetworkLink(baseUrl: string, appUrl: string, appDetails: any): string {
    // Add UTM parameters for tracking
    const utmParams = new URLSearchParams({
      utm_source: 'appsearchly',
      utm_medium: 'affiliate',
      utm_campaign: 'app_discovery',
      utm_content: appDetails.name || 'unknown_app'
    });

    const separator = appUrl.includes('?') ? '&' : '?';
    return `${appUrl}${separator}${utmParams.toString()}`;
  }

  private addUTMParameters(url: string, appDetails: any): string {
    const utmParams = new URLSearchParams({
      utm_source: 'appsearchly',
      utm_medium: 'referral',
      utm_campaign: 'app_discovery',
      utm_content: appDetails.name || 'unknown_app'
    });

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${utmParams.toString()}`;
  }

  /**
   * Track click for analytics
   */
  trackClick(appDetails: any, store: string) {
    const clickData = {
      appName: appDetails.name,
      appId: appDetails.id,
      store: store,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      referrer: typeof window !== 'undefined' ? document.referrer : 'direct'
    };

    // Store click data for analytics
    this.storeClickData(clickData);

    // Send to analytics if available
    this.sendToAnalytics(clickData);
  }

  private storeClickData(clickData: any) {
    if (typeof localStorage === 'undefined') return;

    try {
      const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
      clicks.push(clickData);

      // Keep only last 1000 clicks
      if (clicks.length > 1000) {
        clicks.splice(0, clicks.length - 1000);
      }

      localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
    } catch (error) {
      console.error('Failed to store click data:', error);
    }
  }

  private sendToAnalytics(clickData: any) {
    // Send to your analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'app_click', {
        app_name: clickData.appName,
        app_store: clickData.store,
        custom_map: { custom_parameter_1: 'app_id' }
      });
    }
  }

  /**
   * Calculate potential earnings
   */
  calculateEarnings(clicks: number, commissionRate: number, averageValue: number): number {
    const conversionRate = 0.02; // 2% industry average
    return clicks * conversionRate * averageValue * commissionRate;
  }

  /**
   * Get click statistics
   */
  getClickStats() {
    if (typeof localStorage === 'undefined') {
      return {
        totalClicks: 0,
        topApps: [],
        recentClicks: [],
        todayClicks: 0,
        thisWeekClicks: 0
      };
    }

    try {
      const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');

      const topApps = this.getTopApps(clicks);
      const recentClicks = clicks.slice(-10).reverse();
      const todayClicks = this.getTodayClicks(clicks);
      const thisWeekClicks = this.getWeekClicks(clicks);

      return {
        totalClicks: clicks.length,
        topApps,
        recentClicks,
        todayClicks,
        thisWeekClicks
      };
    } catch (error) {
      console.error('Failed to get click stats:', error);
      return {
        totalClicks: 0,
        topApps: [],
        recentClicks: [],
        todayClicks: 0,
        thisWeekClicks: 0
      };
    }
  }

  private getTopApps(clicks: any[]) {
    const appCounts: Record<string, number> = {};

    clicks.forEach(click => {
      appCounts[click.appName] = (appCounts[click.appName] || 0) + 1;
    });

    return Object.entries(appCounts)
      .map(([appName, clicks]) => ({ appName, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }

  private getTodayClicks(clicks: any[]) {
    const today = new Date().toDateString();
    return clicks.filter(click =>
      new Date(click.timestamp).toDateString() === today
    ).length;
  }

  private getWeekClicks(clicks: any[]) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return clicks.filter(click =>
      new Date(click.timestamp) >= weekAgo
    ).length;
  }
}

// Global instance
export const alternativeAffiliateManager = new AlternativeAffiliateManager();