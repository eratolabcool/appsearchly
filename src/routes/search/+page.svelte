<script lang="ts">
  import { goto } from '$app/navigation';
  import { Search, ArrowUpRight, SlidersHorizontal, X } from 'lucide-svelte';

  export let data;

  $: q = data.q;
  $: activeCategory = data.category;
  $: activePricing = data.pricing;
  $: activeSort = data.sort;
  $: tools = data.tools;
  $: total = data.total;
  $: rootCategories = data.rootCategories;
  $: hasFilters = Boolean(activeCategory || activePricing);

  const pricingOptions = [
    { id: '', label: 'All' },
    { id: 'free', label: 'Free' },
    { id: 'freemium', label: 'Freemium' },
    { id: 'paid', label: 'Paid' }
  ];

  const sortOptions = [
    { id: 'popular', label: 'Popular' },
    { id: 'trending', label: 'Trending' },
    { id: 'latest', label: 'Newest' }
  ];

  const trendingSearches = [
    'Image Generation',
    'Video Editing',
    'Writing Assistant',
    'Voice & Audio',
    'Face Swap',
    'AI Assistant'
  ];

  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  function buildUrl(patch: Partial<{ q: string; category: string; pricing: string; sort: string }>): string {
    const next = { q, category: activeCategory, pricing: activePricing, sort: activeSort, ...patch };
    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.category) params.set('category', next.category);
    if (next.pricing) params.set('pricing', next.pricing);
    if (next.sort && next.sort !== 'popular') params.set('sort', next.sort);
    const qs = params.toString();
    return qs ? `/search?${qs}` : '/search';
  }

  // Debounced live search — typing updates the URL, SSR reloads results.
  function scheduleSearch(value: string) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => goto(buildUrl({ q: value.trim() })), 350);
  }

  function handleSearchSubmit() {
    clearTimeout(searchTimer);
    goto(buildUrl({ q: q.trim() }));
  }

  function clearAll() {
    goto('/search');
  }

  function setCategory(slug: string) {
    goto(buildUrl({ category: slug }));
  }

  function setPricing(id: string) {
    goto(buildUrl({ pricing: id }));
  }

  function setSort(id: string) {
    goto(buildUrl({ sort: id }));
  }

  function pricingLabel(type: string | null): string | null {
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Freemium';
    if (type === 'subscription') return 'Subscription';
    if (type === 'one_time') return 'One-time';
    return type ?? null;
  }
</script>

<svelte:head>
  <title>{q ? `Search "${q}" — AI Tools | AppSearchly` : 'Search AI Tools | AppSearchly'}</title>
  <meta
    name="description"
    content="Search and discover AI tools by task, category, or pricing. Compare the best AI software in the AppSearchly directory."
  />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <!-- Search header -->
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-10">
      <h1 class="text-3xl font-bold tracking-tight">Search AI Tools</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        Find the right tool by name, task, or feature — {total} tools indexed.
      </p>

      <!-- Search input -->
      <div class="mt-6 relative max-w-2xl">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
          <Search size={19} />
        </div>
        <input
          id="search-page-input"
          type="text"
          value={q}
          placeholder="Search AI tools, features, tasks..."
          oninput={(e) => scheduleSearch(e.currentTarget.value)}
          onkeydown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          class="block w-full pl-11 pr-32 py-4 border border-slate-200 dark:border-slate-700 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all"
          onclick={handleSearchSubmit}
        >
          Search
        </button>
      </div>

      <!-- Filter chips -->
      <div class="mt-6 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <SlidersHorizontal size={14} />
            Category
          </span>
          {#each [{ id: '', label: 'All' }, ...rootCategories.map((c) => ({ id: c.slug, label: `${c.icon ?? ''} ${c.name}` }))] as option}
            <button
              class="px-3 py-1.5 rounded-full text-sm font-medium border transition-all {activeCategory === option.id
                ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'}"
              onclick={() => setCategory(option.id)}
            >
              {option.label}
            </button>
          {/each}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-1">Pricing</span>
          {#each pricingOptions as option}
            <button
              class="px-3 py-1.5 rounded-full text-sm font-medium border transition-all {activePricing === option.id
                ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'}"
              onclick={() => setPricing(option.id)}
            >
              {option.label}
            </button>
          {/each}

          <span class="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-4 mr-1">Sort</span>
          {#each sortOptions as option}
            <button
              class="px-3 py-1.5 rounded-full text-sm font-medium border transition-all {activeSort === option.id
                ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'}"
              onclick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          {/each}

          {#if hasFilters || q}
            <button
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              onclick={clearAll}
            >
              <X size={14} />
              Clear
            </button>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Results -->
  <section class="mx-auto max-w-6xl px-6 py-10">
    {#if q === '' && tools.length === 0}
      <!-- Empty landing: trending searches -->
      <div class="rounded-2xl border bg-white dark:bg-slate-800 p-12 text-center">
        <p class="text-5xl mb-5">🔍</p>
        <h2 class="text-xl font-bold">Search the AI tool directory</h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400">Try one of these popular searches:</p>
        <div class="mt-7 flex flex-wrap justify-center gap-2">
          {#each trendingSearches as term}
            <button
              class="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all"
              onclick={() => goto(buildUrl({ q: term }))}
            >
              {term}
            </button>
          {/each}
        </div>
      </div>
    {:else if tools.length === 0}
      <!-- No results -->
      <div class="rounded-2xl border bg-white dark:bg-slate-800 p-14 text-center">
        <p class="text-5xl mb-5">🤷</p>
        <h2 class="text-xl font-bold">No results found</h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400">
          We couldn't find any tools {q ? `matching "${q}"` : 'for these filters'}.
        </p>
        <button
          class="mt-7 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-blue-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
          onclick={clearAll}
        >
          Clear filters
        </button>
      </div>
    {:else}
      <!-- Results header -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-slate-500 dark:text-slate-400">
          <span class="font-bold text-slate-900 dark:text-slate-100">{total}</span>
          {total === 1 ? 'tool' : 'tools'}
          {#if q}<span class="font-semibold text-slate-900 dark:text-slate-100"> for "{q}"</span>{/if}
        </p>
        <p class="hidden sm:block text-xs text-slate-400 dark:text-slate-500">Type to search instantly</p>
      </div>

      <!-- Grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each tools as tool (tool.slug)}
          <a class="group flex flex-col rounded-xl border bg-white dark:bg-slate-800 p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-200" href="/tools/{tool.slug}">
            <div class="flex items-start gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-slate-50 dark:bg-slate-700 text-xl">
                {#if tool.icon}
                  <span>{tool.icon}</span>
                {:else}
                  <span class="text-sm font-bold text-slate-400 dark:text-slate-300">{tool.name.slice(0, 1)}</span>
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="truncate font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.name}</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">{tool.categories?.[0]?.name}</p>
              </div>
            </div>

            <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400 flex-1">
              {tool.shortDescription || tool.description}
            </p>

            <div class="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
              {#if pricingLabel(tool.pricingType)}
                <span class="text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                  {pricingLabel(tool.pricingType)}
                </span>
              {:else}
                <span></span>
              {/if}
              {#if tool.monthlyVisits != null}
                <span class="text-xs text-slate-400 dark:text-slate-500">{tool.monthlyVisits.toLocaleString()} visits/mo</span>
              {/if}
              <span class="text-blue-500 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</main>
