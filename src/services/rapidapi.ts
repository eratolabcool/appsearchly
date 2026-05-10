/**
 * [INPUT]: 依赖 无外部依赖
 * [OUTPUT]: 对外提供 RapidApp, RapidSearchResponse, rapidApiService
 * [POS]: src/services/rapidapi 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// RapidAPI integration service for real app data

export interface RapidApp {
  trackId: number;
  trackName: string;
  description: string;
  primaryGenreName: string;
  genre: string;
  price: number;
  currency: string;
  averageUserRating: number;
  userRatingCount: number;
  artworkUrl100: string;
  screenshotUrls: string[];
  artistName: string;
  fileSizeBytes: string;
  version: string;
  currentVersionReleaseDate: string;
  trackViewUrl: string;
  inAppPurchases: boolean;
  kind: string;
}

export interface RapidSearchResponse {
  resultCount: number;
  results: RapidApp[];
}

class RapidApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    this.baseUrl = 'https://app-store-scraper.p.rapidapi.com';
  }

  async searchApps(query: string): Promise<RapidSearchResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/term=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'app-store-scraper.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RapidAPI search error:', error);
      throw error;
    }
  }

  async getPopularApps(): Promise<RapidSearchResponse> {
    try {
      // Search for popular apps in different categories
      const queries = ['productivity', 'social', 'games', 'photo', 'music'];
      const allApps: RapidApp[] = [];

      for (const query of queries.slice(0, 2)) { // Limit to 2 queries for demo
        try {
          const response = await this.searchApps(query);
          if (response.results && response.results.length > 0) {
            allApps.push(...response.results.slice(0, 3)); // Take top 3 from each category
          }
        } catch (error) {
          console.warn(`Failed to fetch apps for ${query}:`, error);
        }
      }

      return {
        resultCount: allApps.length,
        results: allApps
      };
    } catch (error) {
      console.error('Failed to get popular apps:', error);
      throw error;
    }
  }

  transformToAppFormat(rapidApp: RapidApp) {
    return {
      id: rapidApp.trackId.toString(),
      name: rapidApp.trackName,
      description: rapidApp.description?.substring(0, 200) + '...' || 'No description available',
      category: rapidApp.primaryGenreName || rapidApp.genre || 'Unknown',
      platform: rapidApp.kind?.includes('ios') || rapidApp.kind?.includes('software') ? 'ios' : 'web',
      price: rapidApp.price || 0,
      currency: rapidApp.currency || 'USD',
      rating: rapidApp.averageUserRating || 0,
      reviewCount: rapidApp.userRatingCount || 0,
      icon: rapidApp.artworkUrl100 || '/assets/icons/app-placeholder.png',
      screenshots: rapidApp.screenshotUrls || [],
      developer: rapidApp.artistName || 'Unknown Developer',
      size: this.formatFileSize(rapidApp.fileSizeBytes),
      version: rapidApp.version || '1.0',
      lastUpdated: rapidApp.currentVersionReleaseDate || new Date().toISOString().split('T')[0],
      downloadUrl: rapidApp.trackViewUrl || '#',
      affiliateUrl: rapidApp.trackViewUrl || '#',
      tags: this.extractTags(rapidApp),
      isFree: rapidApp.price === 0,
      inAppPurchases: rapidApp.inAppPurchases || false
    };
  }

  private formatFileSize(size?: string): string {
    if (!size) return 'Unknown';
    const bytes = parseInt(size);
    if (isNaN(bytes)) return 'Unknown';

    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  private extractTags(rapidApp: RapidApp): string[] {
    const tags = [];

    // Add category as tag
    if (rapidApp.primaryGenreName) {
      tags.push(rapidApp.primaryGenreName.toLowerCase());
    }

    // Extract keywords from description
    if (rapidApp.description) {
      const keywords = ['productivity', 'social', 'game', 'photo', 'music', 'business', 'health', 'education'];
      const description = rapidApp.description.toLowerCase();

      keywords.forEach(keyword => {
        if (description.includes(keyword)) {
          tags.push(keyword);
        }
      });
    }

    return [...new Set(tags)].slice(0, 5); // Limit to 5 tags
  }
}

export const rapidApiService = new RapidApiService();