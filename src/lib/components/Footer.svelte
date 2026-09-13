<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Heart } from 'lucide-svelte';

  let currentYear: number = new Date().getFullYear();
  let currentPath: string = '';

  // Get current path for active state
  onMount(() => {
    if (browser) {
      currentPath = window.location.pathname;
    }
  });
</script>

<footer class="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-auto border-t border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Main Footer Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-16">

      <!-- About Section -->
      <div class="lg:col-span-2 space-y-6">
        <h3>
          <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">AppSearchly</span>
        </h3>
        <p class="text-slate-400 leading-relaxed max-w-sm">
          Your AI tool discovery platform. Find, compare, and use the best AI tools across every category.
        </p>
      </div>

      <!-- Navigation Links -->
      <div class="space-y-6">
        <h4 class="text-white font-semibold tracking-wide">Discover</h4>
        <nav class="flex flex-col space-y-3">
          <a href="/" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/' ? 'text-blue-400' : ''}">Home</a>
          <a href="/categories" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/categories' ? 'text-blue-400' : ''}">Categories</a>
          <a href="/trending" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/trending' ? 'text-blue-400' : ''}">Trending AI Tools</a>
          <a href="/alternatives" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/alternatives' ? 'text-blue-400' : ''}">Alternatives</a>
          <a href="/reviews" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/reviews' ? 'text-blue-400' : ''}">Reviews</a>
        </nav>
      </div>

      <!-- Categories -->
      <div class="space-y-6">
        <h4 class="text-white font-semibold tracking-wide">Categories</h4>
        <nav class="flex flex-col space-y-3">
          <a href="/category/design-creative" class="text-slate-400 hover:text-blue-400 transition-colors">Design & Creative</a>
          <a href="/category/productivity" class="text-slate-400 hover:text-blue-400 transition-colors">Productivity</a>
          <a href="/category/music-audio" class="text-slate-400 hover:text-blue-400 transition-colors">Music & Audio</a>
          <a href="/category/video-animation" class="text-slate-400 hover:text-blue-400 transition-colors">Video & Animation</a>
          <a href="/category/entertainment" class="text-slate-400 hover:text-blue-400 transition-colors">Entertainment</a>
        </nav>
      </div>

      <!-- Resources & Legal -->
      <div class="space-y-6">
        <h4 class="text-white font-semibold tracking-wide">Resources</h4>
        <nav class="flex flex-col space-y-3">
          <a href="/blog" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/blog' ? 'text-blue-400' : ''}">Blog</a>
          <a href="/about" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/about' ? 'text-blue-400' : ''}">About Us</a>
          <a href="/submit" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/submit' ? 'text-blue-400' : ''}">Submit a Tool</a>
          <a href="/privacy" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/privacy' ? 'text-blue-400' : ''}">Privacy Policy</a>
          <a href="/terms" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/terms' ? 'text-blue-400' : ''}">Terms of Service</a>
          <a href="/contact" class="text-slate-400 hover:text-blue-400 transition-colors {currentPath === '/contact' ? 'text-blue-400' : ''}">Contact</a>
        </nav>
      </div>

    </div>

    <!-- Bottom Footer -->
    <div class="border-t border-slate-800 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-slate-500 text-sm">
        © {currentYear} Appsearchly.org. All rights reserved.
      </p>
      <div class="flex items-center gap-1.5 text-sm text-slate-500">
        <span>Made with</span>
        <Heart size={14} class="text-rose-500 fill-current" />
        <span>for AI tool discovery</span>
      </div>
    </div>
  </div>
</footer>
