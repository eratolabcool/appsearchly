import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const category = url.searchParams.get('category') || 'all';
  const sort = url.searchParams.get('sort') || 'latest';

  const reviews = [
    {
      id: '1',
      appName: 'Notion',
      appIcon: '📝',
      appUrl: 'https://notion.so',
      category: 'Productivity',
      author: 'Sarah Chen',
      authorAvatar: '👩‍💼',
      rating: 5,
      title: 'The Ultimate All-in-One Workspace',
      content: 'Notion has completely transformed how I organize my work and personal life. The flexibility of combining notes, tasks, databases, and wikis in one platform is incredible.',
      pros: ['Highly customizable', 'Excellent collaboration', 'Versatile functionality'],
      cons: ['Can be overwhelming for beginners', 'Offline mode limited'],
      helpfulCount: 245,
      verified: true,
      date: '2024-01-15',
      images: []
    },
    {
      id: '2',
      appName: 'Figma',
      appIcon: '🎨',
      appUrl: 'https://figma.com',
      category: 'Design',
      author: 'Alex Rivera',
      authorAvatar: '👨‍🎨',
      rating: 4.5,
      title: 'Game-Changer for Collaborative Design',
      content: 'As a UI/UX designer, Figma has become my go-to tool. The real-time collaboration features are unmatched.',
      pros: ['Excellent real-time collaboration', 'Powerful design tools', 'Great for teams'],
      cons: ['Can be resource-intensive', 'Limited offline capabilities'],
      helpfulCount: 189,
      verified: true,
      date: '2024-01-12',
      images: []
    }
  ];

  return json(reviews);
}