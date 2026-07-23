import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: false
    }),
    prerender: {
      // Crawl real links from the homepage. Machine-readable routes are
      // explicit because browsers do not link to them during the crawl.
      entries: ['/', '/robots.txt', '/sitemap.xml', '/api/health'],
      crawl: true,
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    }
  }
};

export default config;
