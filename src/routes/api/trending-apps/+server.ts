/**
 * [INPUT]: 依赖 @sveltejs/kit
 * [OUTPUT]: 对外提供 +server 模块
 * [POS]: src/routes/api/trending-apps/+server 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const period = url.searchParams.get('period') || 'today';
  const category = url.searchParams.get('category') || 'all';

  const trendingApps = [
    {
      id: '1',
      name: 'ChatGPT',
      description: 'Advanced AI assistant for conversations and tasks.',
      icon: '🤖',
      rating: 4.8,
      reviewCount: 125000,
      price: 0,
      currency: 'USD',
      platform: 'multi',
      category: 'Productivity',
      trendingRank: 1,
      trendChange: '+15%',
      url: 'https://openai.com/chatgpt'
    },
    {
      id: '2',
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, and wikis.',
      icon: '📝',
      rating: 4.8,
      reviewCount: 15000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'Productivity',
      trendingRank: 2,
      trendChange: '+8%',
      url: 'https://notion.so'
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
      trendingRank: 3,
      trendChange: '+22%',
      url: 'https://linear.app'
    },
    {
      id: '4',
      name: 'Figma',
      description: 'Collaborative interface design tool.',
      icon: '🎨',
      rating: 4.9,
      reviewCount: 25000,
      price: 0,
      currency: 'USD',
      platform: 'web',
      category: 'Design',
      trendingRank: 4,
      trendChange: '+5%',
      url: 'https://figma.com'
    },
    {
      id: '5',
      name: 'Cursor',
      description: 'AI-powered code editor for developers.',
      icon: '💻',
      rating: 4.7,
      reviewCount: 3200,
      price: 20,
      currency: 'USD',
      platform: 'desktop',
      category: 'Development',
      trendingRank: 5,
      trendChange: '+45%',
      url: 'https://cursor.sh'
    }
  ];

  return json(trendingApps);
}