<script lang="ts">
  import { ArrowUpRight, ChevronRight } from 'lucide-svelte';

  export let data;

  $: category = data.category;
  $: parent = data.parent;
  $: siblings = data.siblings;
  $: tools = data.tools;
  $: isSubcategory = Boolean(parent);

  function pricingLabel(type: string | null): string | null {
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Freemium';
    if (type === 'subscription') return 'Subscription';
    if (type === 'one_time') return 'One-time';
    return type ?? null;
  }
</script>

<svelte:head>
  <title>{category.name} AI Tools | AppSearchly</title>
  <meta name="description" content={category.description ?? `Browse ${category.name} AI tools on AppSearchly.`} />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <!-- Header -->
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
        <a class="hover:text-blue-600 dark:hover:text-blue-400 font-medium" href="/categories">Categories</a>
        {#if parent}
          <ChevronRight size={14} class="text-slate-300" />
          <a class="hover:text-blue-600 dark:hover:text-blue-400 font-medium" href="/category/{parent.slug}">{parent.icon ?? ''} {parent.name}</a>
        {/if}
        <ChevronRight size={14} class="text-slate-300" />
        <span class="text-slate-900 dark:text-slate-100 font-semibold">{category.icon ?? ''} {category.name}</span>
      </nav>

      <h1 class="mt-4 text-4xl font-bold tracking-tight">{category.icon ?? ''} {category.name} AI Tools</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">{category.description}</p>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{data.pagination.total} tools indexed</p>
    </div>
  </section>

  <!-- Subcategory / sibling navigation chips -->
  {#if siblings.length > 0}
    <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-4">
        <span class="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-1">{isSubcategory ? 'Related' : 'Subcategories'}:</span>

        {#if parent}
          <a
            href="/category/{parent.slug}"
            class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600"
          >
            {parent.icon ?? ''} All {parent.name}
          </a>
        {/if}

        {#each siblings as sibling}
          <a
            href="/category/{sibling.slug}"
            class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors {sibling.slug === category.slug
              ? 'bg-slate-900 dark:bg-blue-600 dark:border-blue-600 border-slate-900 text-white'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600'}"
          >
            {sibling.name}
            <span class="ml-1 text-xs opacity-60">{sibling.toolCount}</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Tools grid -->
  <section class="mx-auto max-w-6xl px-6 py-10">
    {#if tools.length === 0}
      <p class="rounded-lg border bg-white dark:bg-slate-800 p-6 text-slate-600 dark:text-slate-400">No published tools are indexed for this category yet.</p>
    {:else}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each tools as tool (tool.slug)}
          <a class="group flex flex-col rounded-lg border bg-white dark:bg-slate-800 p-5 hover:border-blue-300 hover:shadow-sm transition-all" href="/tools/{tool.slug}">
            <div class="flex items-start gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-slate-50 dark:bg-slate-800 text-xl">
                {#if tool.icon}
                  <span>{tool.icon}</span>
                {:else}
                  <span class="text-sm font-bold text-slate-400">{tool.name.slice(0, 1)}</span>
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="truncate font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.name}</h2>
                {#if tool.monthlyVisits != null}
                  <p class="text-xs text-slate-400 font-medium">{tool.monthlyVisits.toLocaleString()} visits/mo</p>
                {/if}
              </div>
            </div>

            <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400 flex-1">
              {tool.shortDescription || tool.description}
            </p>

            <div class="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              {#if pricingLabel(tool.pricingType)}
                <span class="text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                  {pricingLabel(tool.pricingType)}
                </span>
              {:else}
                <span></span>
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
