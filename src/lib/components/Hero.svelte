<script lang="ts">
  import { Search, Sparkles } from 'lucide-svelte';

  export let toolCount: number = 90;

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

<section class="relative bg-slate-900 py-14 lg:py-20 overflow-hidden">
  <!-- Background decoration -->
  <div class="absolute inset-0 z-0">
    <div class="absolute -top-24 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
    <div class="absolute -bottom-24 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-3xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm mb-6">
        <Sparkles size={15} class="text-amber-400" />
        <span>{'AI Tool Directory — curated & verified'}</span>
      </div>

      <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
        Discover the Best{' '}
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">AI Tools</span>
      </h1>

      <p class="text-lg text-slate-400 leading-relaxed mb-8">
        Find, compare, and use the top AI tools across every category. Fast, free, and always up to date.
      </p>

      <!-- Search -->
      <div class="relative max-w-2xl mx-auto mb-6">
        <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          bind:value={query}
          placeholder="Search {toolCount} AI tools..."
          on:keydown={(e) => e.key === 'Enter' && handleSearch()}
          class="block w-full pl-13 pr-36 py-4 bg-slate-800/80 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all hover:-translate-y-[calc(50%+1px)]"
          on:click={handleSearch}
        >
          Search
        </button>
      </div>

      <!-- Popular tags -->
      <div class="flex flex-wrap justify-center gap-2">
        <span class="text-sm text-slate-500 font-medium mr-1">Popular:</span>
        {#each quickSearches as term}
          <a
            href="/search?q={encodeURIComponent(term)}"
            class="px-3 py-1.5 text-sm text-slate-300 bg-slate-800/60 hover:bg-slate-700 hover:text-blue-400 border border-slate-700/60 rounded-full transition-colors"
          >
            {term}
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>
