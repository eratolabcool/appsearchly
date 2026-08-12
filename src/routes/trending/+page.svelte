<script lang="ts">
  import { TrendingUp, ArrowUpRight } from 'lucide-svelte';

  export let data;

  $: tools = data.tools;

  function formatNumber(num: number | undefined): string {
    if (num == null) return '';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
  }

  function pricingLabel(type: string | null): string {
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Freemium';
    if (type === 'subscription') return 'Subscription';
    if (type === 'one_time') return 'One-time';
    return type ?? 'AI Tool';
  }
</script>

<svelte:head>
  <title>Trending AI Tools | AppSearchly</title>
  <meta name="description" content="Discover the most popular AI tools right now, ranked by traffic. Updated daily from the AppSearchly AI tool directory." />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <!-- Header -->
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-semibold text-sm mb-4">
        <TrendingUp size={15} />
        <span>Trending Now</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight">Trending AI Tools</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
        The most popular AI tools right now, ranked by monthly traffic. {data.toolCount} tools indexed and growing.
      </p>

      <!-- Sort tabs -->
      <div class="mt-8 flex gap-2">
        {#each [
          { id: 'trending', label: '🔥 Trending' },
          { id: 'popular', label: 'Popular' },
          { id: 'latest', label: 'Newest' }
        ] as tab}
          <a
            href="?sort={tab.id}"
            class="px-4 py-2 rounded-full text-sm font-semibold border transition-colors {data.sort === tab.id
              ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'}"
          >
            {tab.label}
          </a>
        {/each}
      </div>
    </div>
  </section>

  <!-- Tools grid -->
  <section class="mx-auto max-w-6xl px-6 py-10">
    {#if tools.length === 0}
      <p class="rounded-lg border bg-white dark:bg-slate-800 p-6 text-slate-600 dark:text-slate-400">No tools indexed yet. Check back soon.</p>
    {:else}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each tools as tool (tool.slug)}
          <a
            class="group flex flex-col rounded-lg border bg-white dark:bg-slate-800 p-5 hover:border-rose-300 hover:shadow-sm transition-all"
            href="/tools/{tool.slug}"
          >
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-800 text-xl">
                {#if tool.icon}
                  <span>{tool.icon}</span>
                {:else}
                  <span class="text-sm font-bold text-slate-400">{tool.name.charAt(0)}</span>
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="truncate font-semibold group-hover:text-rose-600">{tool.name}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">{tool.categories?.[0]?.name}</p>
              </div>
            </div>

            <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {tool.shortDescription || tool.description}
            </p>

            <div class="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <div class="flex items-baseline gap-2">
                {#if tool.monthlyVisits != null}
                  <span class="text-sm font-bold">{formatNumber(tool.monthlyVisits)}</span>
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">visits/mo</span>
                  {#if tool.growth != null && tool.growth > 0}
                    <span class="text-xs font-bold text-emerald-600">+{formatNumber(tool.growth)}</span>
                  {/if}
                {:else}
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">{pricingLabel(tool.pricingType)}</span>
                {/if}
              </div>
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
