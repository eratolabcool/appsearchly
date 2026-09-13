<script lang="ts">
  import { ArrowUpRight, Replace } from 'lucide-svelte';

  export let data;

  $: groups = data.groups;

  function formatNumber(num: number | undefined): string {
    if (num == null) return '';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
  }
</script>

<svelte:head>
  <title>AI Tool Alternatives | AppSearchly</title>
  <meta
    name="description"
    content="Find the best alternatives for the most popular AI tools. Compare similar tools by category, pricing, and traffic on AppSearchly."
  />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 font-semibold text-sm mb-4">
        <Replace size={15} />
        <span>Alternatives</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight">AI Tool Alternatives</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
        For every popular AI tool, find comparable options from the same category — real tools, real data.
      </p>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-10 space-y-8">
    {#each groups as { tool, alternatives } (tool.slug)}
      <div class="rounded-xl border bg-white dark:bg-slate-800 p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-700 text-xl">
              {#if tool.icon}
                <span>{tool.icon}</span>
              {:else}
                <span class="text-sm font-bold text-slate-400">{tool.name.slice(0, 1)}</span>
              {/if}
            </div>
            <div>
              <a class="font-bold hover:text-blue-600 dark:hover:text-blue-400" href="/tools/{tool.slug}">{tool.name}</a>
              <p class="text-sm text-slate-500 dark:text-slate-400">{tool.categories?.[0]?.name}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm">
            {#if tool.monthlyVisits != null}
              <span class="text-slate-500 dark:text-slate-400">{formatNumber(tool.monthlyVisits)} visits/mo</span>
            {/if}
            <a
              href="/tools/{tool.slug}"
              class="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
            >
              Details <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        {#if alternatives.length > 0}
          <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {#each alternatives as alt (alt.slug)}
              <a
                class="group flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                href="/tools/{alt.slug}"
              >
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-700 text-base">
                  {#if alt.icon}
                    <span>{alt.icon}</span>
                  {:else}
                    <span class="text-xs font-bold text-slate-400">{alt.name.slice(0, 1)}</span>
                  {/if}
                </div>
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">{alt.name}</div>
                  <div class="text-xs text-slate-400">{formatNumber(alt.monthlyVisits) || alt.pricingType || 'AI Tool'} {alt.monthlyVisits != null ? 'visits/mo' : ''}</div>
                </div>
              </a>
            {/each}
          </div>
        {:else}
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">No alternatives indexed yet.</p>
        {/if}
      </div>
    {/each}
  </section>
</main>
