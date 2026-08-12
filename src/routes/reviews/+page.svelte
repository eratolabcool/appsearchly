<script lang="ts">
  import { Star, ArrowUpRight } from 'lucide-svelte';

  export let data;

  // Rank by rating when ratings exist (legacy dataset); otherwise keep traffic order.
  $: rated = [...data.tools]
    .filter((tool) => typeof tool.rating === 'number')
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));

  $: unrated = data.tools.filter((tool) => typeof tool.rating !== 'number');

  function formatNumber(num: number | undefined): string {
    if (num == null) return '';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
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
  <title>Top Rated AI Tools | AppSearchly</title>
  <meta
    name="description"
    content="Ranked list of the highest-rated AI tools by user score and review count. Ratings are sourced from public store data where available."
  />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 font-semibold text-sm mb-4">
        <Star size={15} />
        <span>Top Rated</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight">Top Rated AI Tools</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
        The highest-rated AI tools by user score and review count. Ratings are sourced from public store data where available.
      </p>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-10">
    {#if rated.length === 0}
      <div class="rounded-lg border bg-white dark:bg-slate-800 p-12 text-center">
        <p class="text-4xl mb-4">⭐</p>
        <h2 class="text-xl font-semibold">Ratings are being verified</h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400">
          User ratings will appear here as verified data becomes available.
        </p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each rated as tool, i (tool.slug)}
          <a
            class="group flex items-center gap-4 rounded-lg border bg-white dark:bg-slate-800 p-4 hover:border-amber-300 hover:shadow-sm transition-all"
            href="/tools/{tool.slug}"
          >
            <span class="w-8 shrink-0 text-center text-lg font-bold text-slate-300 dark:text-slate-600">{i + 1}</span>
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-700 text-xl">
              {#if tool.icon}
                <span>{tool.icon}</span>
              {:else}
                <span class="text-sm font-bold text-slate-400">{tool.name.slice(0, 1)}</span>
              {/if}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.name}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{tool.categories?.[0]?.name}</div>
            </div>
            <div class="hidden sm:block text-right">
              <div class="flex items-center justify-end gap-1">
                <Star size={14} class="text-amber-400 fill-amber-400" />
                <span class="font-bold">{tool.rating}</span>
              </div>
              {#if tool.reviewCount != null}
                <div class="text-xs text-slate-400">{tool.reviewCount.toLocaleString()} reviews</div>
              {/if}
            </div>
            <div class="hidden md:flex w-28 justify-end">
              {#if pricingLabel(tool.pricingType)}
                <span class="text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                  {pricingLabel(tool.pricingType)}
                </span>
              {/if}
            </div>
            <span class="text-blue-500 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              <ArrowUpRight size={16} />
            </span>
          </a>
        {/each}
      </div>

      {#if unrated.length > 0}
        <div class="mt-10">
          <h2 class="mb-4 text-lg font-semibold">More Popular Tools</h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {#each unrated as tool (tool.slug)}
              <a class="group flex items-center gap-3 rounded-lg border bg-white dark:bg-slate-800 p-3 hover:border-blue-300 hover:shadow-sm transition-all" href="/tools/{tool.slug}">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-700 text-base">
                  {#if tool.icon}
                    <span>{tool.icon}</span>
                  {:else}
                    <span class="text-xs font-bold text-slate-400">{tool.name.slice(0, 1)}</span>
                  {/if}
                </div>
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.name}</div>
                  <div class="text-xs text-slate-400">{formatNumber(tool.monthlyVisits)}{tool.monthlyVisits != null ? ' visits/mo' : tool.categories?.[0]?.name}</div>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </section>
</main>
