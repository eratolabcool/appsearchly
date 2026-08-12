<script lang="ts">
  import { ArrowUpRight, ChevronRight, CalendarClock } from 'lucide-svelte';

  export let data;

  $: guide = data.guide;
  $: tools = data.tools;
  $: toolCount = data.toolCount;

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
  <title>{guide.title} | AppSearchly</title>
  <meta name="description" content={guide.excerpt} />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <!-- Article header -->
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <nav class="flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
        <a class="hover:text-blue-600 font-medium" href="/blog">Guides</a>
        <ChevronRight size={14} class="text-slate-300" />
        <span class="text-slate-900 dark:text-slate-100 font-semibold">{guide.title}</span>
      </nav>

      <h1 class="mt-4 text-4xl font-bold tracking-tight">{guide.icon} {guide.title}</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">{guide.intro}</p>
      <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span class="flex items-center gap-1.5">
          <CalendarClock size={15} />
          Updated continuously from verified directory data
        </span>
        <span class="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-semibold text-slate-600 dark:text-slate-300">{toolCount} tools</span>
      </div>
    </div>
  </section>

  <!-- Tool list -->
  <section class="mx-auto max-w-6xl px-6 py-10">
    {#if tools.length === 0}
      <div class="rounded-lg border bg-white dark:bg-slate-800 p-12 text-center">
        <p class="text-4xl mb-4">🔍</p>
        <h2 class="text-xl font-semibold">No tools in this guide yet</h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400">Check back soon as the directory grows.</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each tools as tool, i (tool.slug)}
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-white dark:bg-slate-800 p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <span class="w-7 shrink-0 text-center text-lg font-bold text-slate-300 dark:text-slate-600">{i + 1}</span>
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-700 text-xl">
                {#if tool.icon}
                  <span>{tool.icon}</span>
                {:else}
                  <span class="text-sm font-bold text-slate-400">{tool.name.slice(0, 1)}</span>
                {/if}
              </div>
              <div class="min-w-0">
                <a class="font-bold hover:text-indigo-600 dark:hover:text-indigo-400" href="/tools/{tool.slug}">{tool.name}</a>
                <p class="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{tool.shortDescription || tool.description}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 sm:shrink-0">
              {#if tool.monthlyVisits != null}
                <div class="text-right">
                  <div class="font-bold text-slate-900 dark:text-slate-100">{formatNumber(tool.monthlyVisits)}</div>
                  <div class="text-[10px] font-semibold text-slate-400 uppercase">visits/mo</div>
                </div>
              {/if}
              {#if pricingLabel(tool.pricingType)}
                <span class="text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                  {pricingLabel(tool.pricingType)}
                </span>
              {/if}
              <a
                href="/tools/{tool.slug}"
                class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="View {tool.name} details"
              >
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="mt-12 text-center">
      <a
        href="/categories"
        class="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold rounded-full transition-colors"
      >
        Browse All Categories
      </a>
    </div>
  </section>
</main>
