/**
 * [INPUT]: 依赖 @sveltejs/kit
 * [OUTPUT]: 对外提供 +server 模块
 * [POS]: src/routes/api/search/+server 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const searchQuery = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || 'all';
  const platform = url.searchParams.get('platform') || 'all';
  const priceFilter = url.searchParams.get('price') || 'all';

  // Mock database of apps
  const mockApps = [
    {
      id: '1',
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
      icon: '📝',
      rating: 4.8,
      reviewCount: 15000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'productivity',
      tags: ['notes', 'tasks', 'database', 'collaboration', 'productivity', 'workspace'],
      url: 'https://notion.so'
    },
    {
      id: '2',
      name: 'Figma',
      description: 'Collaborative interface design tool for teams.',
      icon: '🎨',
      rating: 4.9,
      reviewCount: 25000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'design',
      tags: ['design', 'ui', 'ux', 'collaboration', 'prototyping', 'vector'],
      url: 'https://figma.com'
    },
    {
      id: '3',
      name: 'Linear',
      description: 'Modern issue tracking for software teams.',
      icon: '🚀',
      rating: 4.9,
      reviewCount: 8500,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'development',
      tags: ['issue tracking', 'project management', 'development', 'bug tracking', 'agile'],
      url: 'https://linear.app'
    },
    {
      id: '4',
      name: 'Canva',
      description: 'Graphic design platform for social media and marketing.',
      icon: '🎨',
      rating: 4.7,
      reviewCount: 32000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'design',
      tags: ['graphic design', 'social media', 'marketing', 'templates', 'photos'],
      url: 'https://canva.com'
    },
    {
      id: '5',
      name: 'Slack',
      description: 'Team communication and collaboration platform.',
      icon: '💬',
      rating: 4.3,
      reviewCount: 45000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'productivity',
      tags: ['communication', 'team chat', 'collaboration', 'messaging', 'video calls'],
      url: 'https://slack.com'
    },
    {
      id: '6',
      name: 'Zoom',
      description: 'Video conferencing and online meetings.',
      icon: '📹',
      rating: 4.5,
      reviewCount: 28000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'productivity',
      tags: ['video conferencing', 'meetings', 'screen sharing', 'webinar', 'remote work'],
      url: 'https://zoom.us'
    },
    {
      id: '7',
      name: 'Trello',
      description: 'Visual project management with boards and cards.',
      icon: '📌',
      rating: 4.4,
      reviewCount: 18000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'productivity',
      tags: ['project management', 'kanban', 'boards', 'collaboration', 'task management'],
      url: 'https://trello.com'
    },
    {
      id: '8',
      name: '1Password',
      description: 'Secure password manager and digital wallet.',
      icon: '🔐',
      rating: 4.6,
      reviewCount: 12000,
      price: 2.99,
      currency: 'USD',
      platform: 'desktop',
      category: 'utilities',
      tags: ['password manager', 'security', 'authentication', 'encryption', 'digital wallet'],
      url: 'https://1password.com'
    },
    {
      id: '9',
      name: 'Visual Studio Code',
      description: 'Lightweight but powerful source code editor.',
      icon: '💻',
      rating: 4.7,
      reviewCount: 85000,
      price: 0,
      currency: 'USD',
      platform: 'desktop',
      category: 'development',
      tags: ['code editor', 'development', 'programming', 'ide', 'debugging', 'extensions'],
      url: 'https://code.visualstudio.com'
    },
    {
      id: '10',
      name: 'Adobe Photoshop',
      description: 'Professional photo editing and design software.',
      icon: '🖼️',
      rating: 4.6,
      reviewCount: 45000,
      price: 20.99,
      currency: 'USD',
      platform: 'desktop',
      category: 'design',
      tags: ['photo editing', 'graphic design', 'image editing', 'retouching', 'layers'],
      url: 'https://adobe.com/photoshop'
    },
    {
      id: '11',
      name: 'Zoom',
      description: 'Video conferencing and online meetings.',
      icon: '📹',
      rating: 4.5,
      reviewCount: 28000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'productivity',
      tags: ['video conferencing', 'meetings', 'screen sharing', 'webinar', 'remote work'],
      url: 'https://zoom.us'
    },
    {
      id: '12',
      name: 'Duolingo',
      description: 'Free language learning platform.',
      icon: '🗣️',
      rating: 4.5,
      reviewCount: 125000,
      price: 0,
      currency: 'USD',
      platform: 'mobile',
      category: 'education',
      tags: ['language learning', 'education', 'free', 'games', 'vocabulary', 'speaking'],
      url: 'https://duolingo.com'
    }
  ];

  // Filter apps based on search criteria
  let filteredApps = mockApps.filter(app => {
    // Category filter
    if (category !== 'all' && app.category !== category) {
      return false;
    }

    // Platform filter
    if (platform !== 'all' && app.platform !== platform) {
      return false;
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'free':
          if (app.price !== 0) return false;
          break;
        case 'paid':
          if (app.price === 0) return false;
          break;
        case 'under10':
          if (app.price >= 10) return false;
          break;
        case '10to50':
          if (app.price < 10 || app.price > 50) return false;
          break;
        case 'over50':
          if (app.price <= 50) return false;
          break;
      }
    }

    return true;
  });

  // Calculate relevance score for search
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    filteredApps = filteredApps.map(app => {
      let relevanceScore = 0;

      // Check name match
      if (app.name.toLowerCase().includes(queryLower)) {
        relevanceScore += 100;
      }

      // Check description match
      if (app.description.toLowerCase().includes(queryLower)) {
        relevanceScore += 80;
      }

      // Check tags match
      app.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          relevanceScore += 60;
        }
      });

      // Check category match
      if (app.category.toLowerCase().includes(queryLower)) {
        relevanceScore += 40;
      }

      // Partial name match bonus
      const nameWords = app.name.toLowerCase().split(' ');
      const queryWords = queryLower.split(' ');
      queryWords.forEach(queryWord => {
        nameWords.forEach(nameWord => {
          if (nameWord.includes(queryWord) && queryWord.length > 2) {
            relevanceScore += 30;
          }
        });
      });

      return {
        ...app,
        relevanceScore: Math.min(relevanceScore, 100)
      };
    }).filter(app => app.relevanceScore > 20)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else {
    // If no search query, sort by rating and review count
    filteredApps = filteredApps.map(app => ({
      ...app,
      relevanceScore: 50
    })).sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
  }

  return json({
    query: searchQuery,
    filters: {
      category,
      platform,
      price: priceFilter
    },
    results: filteredApps,
    total: filteredApps.length
  });
}