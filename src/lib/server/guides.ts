/**
 * Data-driven guides ("blog").
 *
 * Every guide is generated from real directory data: a category slug plus a
 * short editorial intro. No fabricated reviews, dates, or metrics.
 */

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  intro: string;
  category: string | null; // null = whole directory
  sort: 'popular' | 'trending' | 'latest';
  icon: string;
}

export const GUIDES: Guide[] = [
  {
    slug: 'best-ai-image-generators',
    title: 'The Best AI Image Generators',
    excerpt: 'Create stunning art, avatars, and edits from text prompts with the top-rated image generation tools.',
    intro:
      'AI image generators have become an essential creative tool. This guide ranks the most popular tools in the Design & Creative category by monthly traffic, so you can find the one that fits your workflow.',
    category: 'design-creative',
    sort: 'trending',
    icon: '🎨'
  },
  {
    slug: 'top-ai-video-tools',
    title: 'Top AI Video Creation Tools',
    excerpt: 'Turn text and images into professional video with the leading AI video generators.',
    intro:
      'From text-to-video to lip-sync and multilingual voice, AI video tools keep getting better. Here are the most visited tools in the Video & Animation category.',
    category: 'video-animation',
    sort: 'trending',
    icon: '🎬'
  },
  {
    slug: 'best-ai-voice-generators',
    title: 'Best AI Voice Generators',
    excerpt: 'Natural text-to-speech, voice cloning, and audio tools for creators and developers.',
    intro:
      'AI voice technology powers narration, podcasts, and product demos. These are the leading tools in the Music & Audio category right now.',
    category: 'music-audio',
    sort: 'trending',
    icon: '🎵'
  },
  {
    slug: 'top-ai-productivity-tools',
    title: 'Top AI Productivity Tools',
    excerpt: 'Work faster with AI assistants, business tools, and workflow automation.',
    intro:
      'AI is reshaping how we work. This guide highlights the most popular productivity tools in the directory, from AI assistants to business automation.',
    category: 'productivity',
    sort: 'trending',
    icon: '💼'
  },
  {
    slug: 'newest-ai-tools',
    title: 'Newest AI Tools in the Directory',
    excerpt: 'Freshly added tools across every category — be the first to try them.',
    intro:
      'The directory is updated continuously. Here are the newest additions across all categories.',
    category: null,
    sort: 'latest',
    icon: '✨'
  }
];

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((guide) => guide.slug === slug) ?? null;
}
