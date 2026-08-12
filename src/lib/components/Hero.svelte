<script lang="ts">
  import { Search, Sparkles, Command } from 'lucide-svelte';

  export let toolCount: number = 94;

  let query = '';

  const quickSearches = [
    'Image Generation',
    'Video Editing',
    'Writing Assistant',
    'Voice & Audio',
    'Coding Tools',
    'Productivity'
  ];

  function handleSearch() {
    const q = query.trim();
    window.location.href = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
  }
</script>

<section class="relative bg-slate-900 py-16 lg:py-24 overflow-hidden">
  <!-- Layered background -->
  <div class="absolute inset-0 z-0">
    <div class="absolute -top-32 right-0 w-[36rem] h-[36rem] bg-blue-500/15 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 left-0 w-[30rem] h-[30rem] bg-indigo-500/15 rounded-full blur-3xl"></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]"></div>
    <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-3xl mx-auto text-center">
      <!-- Trust badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs sm:text-sm mb-6 sm:mb-8">
        <Sparkles size={15} class="text-amber-400 shrink-0" />
        <span class="truncate">{toolCount} AI tools · curated & verified</span>
      </div>

      <h1 class="text-[2rem] sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 sm:mb-5">
        Discover the Best{' '}
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">AI Tools</span>
      </h1>

      <p class="text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto px-2">
        Find, compare, and use the top AI tools across every category. Fast, free, and always up to date.
      </p>

      <!-- Search: full-width input, compact button on mobile -->
      <div class="relative max-w-2xl mx-auto group">
        <div class="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
          <Search size={19} />
        </div>
        <input
          type="text"
          bind:value={query}
          placeholder="Search AI tools, features, tasks..."
          onkeydown={(e) => e.key === 'Enter' && handleSearch()}
          class="block w-full pl-11 sm:pl-13 pr-28 sm:pr-40 py-3.5 sm:py-4 bg-slate-800/80 border border-slate-700 rounded-full text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
        <button
          class="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-full transition-all hover:-translate-y-[calc(50%+1px)]"
          onclick={handleSearch}
        >
          Search
        </button>
      </div>

      <!-- Popular tags -->
      <div class="mt-6 sm:mt-7 flex flex-wrap justify-center items-center gap-2 px-2">
        <span class="text-sm text-slate-500 font-medium mr-1">Popular:</span>
        {#each quickSearches as term}
          <a
            href="/search?q={encodeURIComponent(term)}"
            class="px-3 sm:px-3.5 py-1.5 text-sm text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-full transition-all hover:-translate-y-0.5"
          >
            {term}
          </a>
        {/each}
      </div>

      <!-- Real stats -->
      <div class="mt-10 sm:mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto px-2">
        <div class="text-center">
          <div class="text-xl sm:text-2xl font-bold text-white">{toolCount}</div>
          <div class="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">AI tools</div>
        </div>
        <div class="text-center">
          <div class="text-xl sm:text-2xl font-bold text-white">8</div>
          <div class="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">Categories</div>
        </div>
        <div class="text-center">
          <div class="text-xl sm:text-2xl font-bold text-white">24/7</div>
          <div class="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">Updated</div>
        </div>
      </div>
    </div>
  </div>
</section>
