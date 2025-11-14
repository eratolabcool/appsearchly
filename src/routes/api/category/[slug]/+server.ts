import { json } from '@sveltejs/kit';

export async function GET({ params, url }) {
  const { slug } = params;
  const subcategory = url.searchParams.get('subcategory') || 'all';
  const sort = url.searchParams.get('sort') || 'popular';

  const categoryData = {
    'education': {
      name: 'Education',
      description: 'Educational apps and learning tools',
      totalApps: 2847
    },
    'business': {
      name: 'Business',
      description: 'Professional business tools and software',
      totalApps: 1932
    },
    'design-creative': {
      name: 'Design & Creative',
      description: 'Creative tools and design software',
      totalApps: 1654
    },
    'development-tools': {
      name: 'Development Tools',
      description: 'Software development and programming tools',
      totalApps: 2109
    },
    'productivity': {
      name: 'Productivity',
      description: 'Productivity and workflow optimization apps',
      totalApps: 3456
    },
    'utilities': {
      name: 'Utilities',
      description: 'System utilities and optimization tools',
      totalApps: 1287
    }
  };

  const categoryInfo = categoryData[slug] || categoryData['education'];

  // Generate mock apps based on category
  const generateApps = (categoryName, count = 12) => {
    const apps = [];
    const icons = ['🎯', '🚀', '💡', '🎨', '🔧', '📊', '⭐', '💎', '🛠️', '📚', '🔍', '💰'];
    const platforms = ['web', 'desktop', 'mobile'];

    for (let i = 1; i <= count; i++) {
      apps.push({
        id: `${slug}-${i}`,
        name: `${categoryName} Pro ${i}`,
        description: `Leading ${categoryName.toLowerCase()} application with advanced features and professional capabilities.`,
        icon: icons[Math.floor(Math.random() * icons.length)],
        rating: 4.2 + Math.random() * 0.7,
        reviewCount: Math.floor(Math.random() * 50000) + 1000,
        price: Math.random() > 0.4 ? Math.floor(Math.random() * 80) + 10 : 0,
        currency: 'USD',
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        category: categoryName,
        url: `https://example.com/${slug}-${i}`,
        trendingRank: i,
        downloads: Math.floor(Math.random() * 1000000) + 10000,
        features: [
          'Advanced features',
          'Modern interface',
          'Cloud sync',
          'Multi-device support'
        ]
      });
    }

    // Sort based on the sort parameter
    switch (sort) {
      case 'rating':
        return apps.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return apps.sort((a, b) => b.id.localeCompare(a.id));
      case 'trending':
        return apps.sort((a, b) => b.downloads - a.downloads);
      case 'popular':
      default:
        return apps.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  };

  const apps = generateApps(categoryInfo.name);

  return json({
    category: categoryInfo,
    apps: apps,
    subcategory: subcategory,
    sort: sort,
    total: apps.length
  });
}