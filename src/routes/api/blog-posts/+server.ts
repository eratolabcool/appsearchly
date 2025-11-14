import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const category = url.searchParams.get('category') || 'all';

  const blogPosts = [
    {
      id: '1',
      title: '10 AI Tools That Will Transform Your Workflow in 2024',
      excerpt: 'Discover the cutting-edge AI applications that are revolutionizing productivity and creativity in the modern workplace.',
      author: 'Sarah Chen',
      authorAvatar: '👩‍💼',
      authorRole: 'Tech Writer',
      date: '2024-01-15',
      readTime: 8,
      category: 'productivity',
      tags: ['AI', 'Productivity', 'Tools'],
      image: '/images/blog/ai-tools-2024.jpg',
      featured: true
    },
    {
      id: '2',
      title: 'The Ultimate Guide to Choosing Design Software in 2024',
      excerpt: 'A comprehensive comparison of the best design tools available, from Figma to Adobe Creative Suite.',
      author: 'Alex Rivera',
      authorAvatar: '👨‍🎨',
      authorRole: 'Design Expert',
      date: '2024-01-12',
      readTime: 12,
      category: 'design',
      tags: ['Design', 'Software', 'Comparison'],
      image: '/images/blog/design-software-guide.jpg',
      featured: false
    }
  ];

  return json(blogPosts);
}