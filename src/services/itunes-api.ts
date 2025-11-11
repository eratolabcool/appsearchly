// iTunes Search API integration - Free and reliable
import { itunesAffiliateManager } from '../utils/itunes-affiliate';
import { POPULAR_APPS_CONFIG, FEATURED_APPS, getPopularApps } from '../config/popular-apps';

export interface ITunesApp {
  trackId: number;
  trackName: string;
  description: string;
  primaryGenreName: string;
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
  kind: string;
}

export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesApp[];
}

class ITunesApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://itunes.apple.com/search';
  }

  async searchApps(query: string, limit: number = 20): Promise<ITunesSearchResponse> {
    try {
      const params = new URLSearchParams({
        term: query,
        country: 'US',
        media: 'software',
        entity: 'software',
        limit: limit.toString(),
        lang: 'en_us'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`iTunes API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('iTunes API search error:', error);
      throw error;
    }
  }

  async getPopularApps(): Promise<ITunesSearchResponse> {
    try {
      const allApps: ITunesApp[] = [];

      // 按优先级搜索配置的应用类别
      for (const config of POPULAR_APPS_CONFIG.slice(0, 4)) { // 取前4个高优先级类别
        try {
          for (const searchTerm of config.searchTerms.slice(0, 2)) { // 每个类别取前2个搜索词
            const response = await this.searchApps(searchTerm, Math.min(config.limit / config.searchTerms.length, 3));
            if (response.results && response.results.length > 0) {
              // 为每个应用添加配置信息
              const appsWithConfig = response.results.map(app => ({
                ...app,
                category: config.category,
                priority: config.priority,
                searchTerm: searchTerm
              }));
              allApps.push(...appsWithConfig);
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch apps for category ${config.category}:`, error);
        }
      }

      // 添加手动推荐的应用
      for (const featuredApp of FEATURED_APPS) {
        try {
          const response = await this.searchApps(featuredApp.searchTerms[0], 1);
          if (response.results && response.results.length > 0) {
            const appWithConfig = {
              ...response.results[0],
              category: 'featured',
              priority: 999, // 最高优先级
              searchTerm: featuredApp.searchTerms[0],
              featured: true,
              description: featuredApp.description
            };
            allApps.push(appWithConfig);
          }
        } catch (error) {
          console.warn(`Failed to fetch featured app ${featuredApp.name}:`, error);
        }
      }

      // 按优先级排序，优先级数字越大越靠前
      allApps.sort((a, b) => {
        // Featured apps first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        // Then by priority
        return b.priority - a.priority;
      });

      // 移除重复应用
      const uniqueApps = allApps.filter((app, index, self) =>
        index === self.findIndex((a) => a.trackId === app.trackId)
      );

      return {
        resultCount: uniqueApps.length,
        results: uniqueApps.slice(0, 20) // 限制显示20个应用
      };
    } catch (error) {
      console.error('Failed to get popular apps:', error);
      throw error;
    }
  }

  transformToAppFormat(itunesApp: ITunesApp) {
    return {
      id: itunesApp.trackId.toString(),
      name: itunesApp.trackName,
      description: itunesApp.description?.substring(0, 200) + '...' || 'No description available',
      category: itunesApp.primaryGenreName || 'Unknown',
      platform: 'ios', // iTunes is iOS only
      price: itunesApp.price || 0,
      currency: itunesApp.currency || 'USD',
      rating: itunesApp.averageUserRating || 0,
      reviewCount: itunesApp.userRatingCount || 0,
      icon: itunesApp.artworkUrl100 || '/assets/icons/app-placeholder.png',
      screenshots: itunesApp.screenshotUrls || [],
      developer: itunesApp.artistName || 'Unknown Developer',
      size: this.formatFileSize(itunesApp.fileSizeBytes),
      version: itunesApp.version || '1.0',
      lastUpdated: itunesApp.currentVersionReleaseDate || new Date().toISOString().split('T')[0],
      downloadUrl: itunesApp.trackViewUrl || '#',
      affiliateUrl: itunesApp.trackViewUrl ? itunesAffiliateManager.createAffiliateUrl(itunesApp.trackViewUrl) : '#',
      tags: this.extractTags(itunesApp),
      isFree: itunesApp.price === 0,
      inAppPurchases: false // iTunes API doesn't provide this info directly
    };
  }

  private formatFileSize(size?: string): string {
    if (!size) return 'Unknown';
    const bytes = parseInt(size);
    if (isNaN(bytes)) return 'Unknown';

    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  private extractTags(itunesApp: ITunesApp): string[] {
    const tags = [];

    // Add category as tag
    if (itunesApp.primaryGenreName) {
      tags.push(itunesApp.primaryGenreName.toLowerCase());
    }

    // Extract keywords from name and description
    const text = `${itunesApp.trackName} ${itunesApp.description || ''}`.toLowerCase();
    const keywords = [
      'productivity', 'social', 'game', 'photo', 'music', 'business',
      'health', 'education', 'video', 'shopping', 'travel', 'finance'
    ];

    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)].slice(0, 5); // Limit to 5 tags
  }
}

export const iTunesApiService = new ITunesApiService();