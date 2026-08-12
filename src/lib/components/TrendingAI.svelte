<script lang="ts">
  import { TrendingUp, ArrowUpRight, Globe } from 'lucide-svelte';

  // Tools arrive pre-sorted by the server (fallback: monthly visits).
  export let tools: Array<{
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    websiteUrl: string;
    pricingType: string | null;
    monthlyVisits?: number;
    growth?: number;
    icon?: string | null;
    categories?: Array<{ name: string; slug: string; icon?: string | null }>;
  }> = [];

  function formatNumber(num: number | undefined): string {
    if (num == null) return '';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
  }

  function labelFor(tool: (typeof tools)[number]): string {
    const type = tool.pricingType;
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Freemium';
    if (type === 'subscription') return 'Subscription';
    if (type === 'one_time') return 'One-time';
    return type ?? 'AI Tool';
  }
</script>

<section class="py-14 lg:py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-semibold text-sm mb-5">
        <TrendingUp size={15} />
        <span>Trending Now</span>
      </div>
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
        Top <span class="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500">AI Tools</span>
      </h2>
      <p class="text-lg text-slate-500 dark:text-slate-400">
        The most popular AI tools right now, ranked by traffic.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each tools as tool, i (tool.slug)}
        <a
          href="/tools/{tool.slug}"
          class="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-200"
        >
          <div class="flex items-start gap-3 mb-4">
            <div class="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {#if tool.icon}
                <span>{tool.icon}</span>
              {:else}
                <span class="text-sm font-bold text-slate-500 dark:text-slate-400">{tool.name.charAt(0)}</span>
              {/if}
              <span class="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {i + 1}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 transition-colors">{tool.name}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.categories?.[0]?.name}</p>
            </div>
          </div>

          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {tool.shortDescription || tool.description}
          </p>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {#if tool.monthlyVisits != null}
              <div class="flex items-baseline gap-2">
                <span class="text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(tool.monthlyVisits)}</span>
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">visits/mo</span>
                {#if tool.growth != null && tool.growth > 0}
                  <span class="text-[11px] font-bold text-emerald-600">+{formatNumber(tool.growth)}</span>
                {/if}
              </div>
            {:else}
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">{labelFor(tool)}</span>
            {/if}
            <span class="flex items-center gap-1 text-blue-500 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              <ArrowUpRight size={15} />
            </span>
          </div>
        </a>
      {/each}
    </div>

    <div class="mt-12 text-center">
      <a
        href="/trending"
        class="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold rounded-full transition-colors"
      >
        <Globe size={17} />
        View All Trending Tools
      </a>
    </div>
  </div>
</section>
