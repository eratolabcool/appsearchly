import { writable, derived } from 'svelte/store';
import { iTunesApiService } from '../services/itunes-api';

export interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  platform: 'ios' | 'android';
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  icon: string;
  screenshots: string[];
  developer: string;
  size: string;
  version: string;
  lastUpdated: string;
  downloadUrl: string;
  affiliateUrl?: string;
  tags: string[];
  isFree: boolean;
  inAppPurchases: boolean;
}

export interface SearchFilters {
  platform?: 'ios' | 'android' | 'all';
  category?: string;
  priceRange?: 'free' | 'paid' | 'all';
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'price' | 'name';
}

// 模拟应用数据
const mockApps: App[] = [
  {
    id: '1',
    name: 'Notion',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
    category: 'Productivity',
    platform: 'ios',
    price: 0,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 45231,
    icon: '/assets/icons/notion.png',
    screenshots: ['/assets/screenshots/notion-1.png', '/assets/screenshots/notion-2.png'],
    developer: 'Notion Labs, Inc.',
    size: '124.5 MB',
    version: '2.0.27',
    lastUpdated: '2024-01-15',
    downloadUrl: 'https://apps.apple.com/app/notion/id1232780281',
    affiliateUrl: 'https://apps.apple.com/app/notion/id1232780281?ct=appsearch&mt=8',
    tags: ['productivity', 'notes', 'tasks', 'wiki'],
    isFree: true,
    inAppPurchases: true
  },
  {
    id: '2',
    name: 'Procreate',
    description: 'Powerful illustration and drawing app for artists.',
    category: 'Design',
    platform: 'ios',
    price: 12.99,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 128456,
    icon: '/assets/icons/procreate.png',
    screenshots: ['/assets/screenshots/procreate-1.png', '/assets/screenshots/procreate-2.png'],
    developer: 'Savage Interactive Pty Ltd',
    size: '856.2 MB',
    version: '5.3.1',
    lastUpdated: '2024-01-20',
    downloadUrl: 'https://apps.apple.com/app/procreate/id425073498',
    affiliateUrl: 'https://apps.apple.com/app/procreate/id425073498?ct=appsearch&mt=8',
    tags: ['drawing', 'illustration', 'art', 'design'],
    isFree: false,
    inAppPurchases: false
  },
  {
    id: '3',
    name: 'Spotify',
    description: 'Music and podcast streaming service.',
    category: 'Music',
    platform: 'android',
    price: 0,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 892345,
    icon: '/assets/icons/spotify.png',
    screenshots: ['/assets/screenshots/spotify-1.png', '/assets/screenshots/spotify-2.png'],
    developer: 'Spotify AB',
    size: '156.8 MB',
    version: '8.8.56',
    lastUpdated: '2024-01-18',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.spotify.music',
    affiliateUrl: 'https://play.google.com/store/apps/details?id=com.spotify.music&referrer=appsearch',
    tags: ['music', 'podcast', 'streaming'],
    isFree: true,
    inAppPurchases: true
  },
  {
    id: '4',
    name: 'Figma',
    description: 'Collaborative interface design tool.',
    category: 'Design',
    platform: 'web',
    price: 0,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 23456,
    icon: '/assets/icons/figma.png',
    screenshots: ['/assets/screenshots/figma-1.png', '/assets/screenshots/figma-2.png'],
    developer: 'Figma, Inc.',
    size: '234.1 MB',
    version: '116.15.8',
    lastUpdated: '2024-01-19',
    downloadUrl: 'https://www.figma.com/downloads/',
    affiliateUrl: 'https://www.figma.com/downloads/?ref=appsearch',
    tags: ['design', 'collaboration', 'ui', 'prototyping'],
    isFree: true,
    inAppPurchases: true
  },
  {
    id: '5',
    name: 'VS Code',
    description: 'Code editor and development environment.',
    category: 'Developer Tools',
    platform: 'desktop',
    price: 0,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 56789,
    icon: '/assets/icons/vscode.png',
    screenshots: ['/assets/screenshots/vscode-1.png', '/assets/screenshots/vscode-2.png'],
    developer: 'Microsoft',
    size: '456.7 MB',
    version: '1.85.1',
    lastUpdated: '2024-01-17',
    downloadUrl: 'https://code.visualstudio.com/download',
    affiliateUrl: 'https://code.visualstudio.com/download?ref=appsearch',
    tags: ['code', 'development', 'programming', 'editor'],
    isFree: true,
    inAppPurchases: false
  }
];

// Store for all apps
export const appsStore = writable<App[]>(mockApps);

// Store for search results
export const searchResultsStore = writable<App[]>([]);

// Store for search query
export const searchQueryStore = writable<string>('');

// Store for search filters
export const searchFiltersStore = writable<SearchFilters>({
  platform: 'all',
  category: undefined,
  priceRange: 'all',
  minRating: undefined,
  sortBy: 'relevance'
});

// Store for loading state
export const isLoadingStore = writable<boolean>(false);

// Store for selected app
export const selectedAppStore = writable<App | null>(null);

// Derived store for filtered and sorted results
export const filteredAppsStore = derived(
  [searchResultsStore, searchFiltersStore],
  ([$apps, $filters]) => {
    let filtered = [...$apps];

    // Apply platform filter
    if ($filters.platform && $filters.platform !== 'all') {
      filtered = filtered.filter(app => app.platform === $filters.platform);
    }

    // Apply category filter
    if ($filters.category) {
      filtered = filtered.filter(app => app.category === $filters.category);
    }

    // Apply price filter
    if ($filters.priceRange === 'free') {
      filtered = filtered.filter(app => app.isFree);
    } else if ($filters.priceRange === 'paid') {
      filtered = filtered.filter(app => !app.isFree);
    }

    // Apply minimum rating filter
    if ($filters.minRating) {
      filtered = filtered.filter(app => app.rating >= $filters.minRating);
    }

    // Apply sorting
    switch ($filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }
);

// Search function with iTunes API integration
export const searchApps = async (query: string): Promise<void> => {
  isLoadingStore.set(true);

  try {
    if (query.trim() === '') {
      // Get popular apps when no search query
      const popularResponse = await iTunesApiService.getPopularApps();
      const transformedApps = popularResponse.results.map(app =>
        iTunesApiService.transformToAppFormat(app)
      );
      searchResultsStore.set(transformedApps);
    } else {
      // Search for specific apps
      const searchResponse = await iTunesApiService.searchApps(query);
      const transformedApps = searchResponse.results.map(app =>
        iTunesApiService.transformToAppFormat(app)
      );
      searchResultsStore.set(transformedApps);
    }
  } catch (error) {
    console.error('iTunes API search failed, falling back to mock data:', error);
    // Fallback to mock data if API fails
    const allApps = mockApps;
    const results = query
      ? allApps.filter(app =>
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          app.description.toLowerCase().includes(query.toLowerCase()) ||
          app.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
          app.category.toLowerCase().includes(query.toLowerCase())
        )
      : allApps;
    searchResultsStore.set(results);
  } finally {
    isLoadingStore.set(false);
  }
};

// Get app by ID
export const getAppById = (id: string): App | undefined => {
  return mockApps.find(app => app.id === id);
};

// Get all categories
export const getCategories = (): string[] => {
  const categories = new Set(mockApps.map(app => app.category));
  return Array.from(categories);
};