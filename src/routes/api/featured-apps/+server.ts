import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const featuredApps = [
    {
      id: '1',
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, and wikis.',
      icon: '📝',
      rating: 4.8,
      reviewCount: 15000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'Productivity',
      url: 'https://notion.so'
    },
    {
      id: '2',
      name: 'Figma',
      description: 'Collaborative interface design tool.',
      icon: '🎨',
      rating: 4.9,
      reviewCount: 25000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'Design',
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
      category: 'Development',
      url: 'https://linear.app'
    },
    {
      id: '4',
      name: 'Canva',
      description: 'Graphic design platform for everyone.',
      icon: '🎨',
      rating: 4.7,
      reviewCount: 32000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'Design',
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
      category: 'Productivity',
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
      category: 'Communication',
      url: 'https://zoom.us'
    }
  ];

  return json(featuredApps);
}