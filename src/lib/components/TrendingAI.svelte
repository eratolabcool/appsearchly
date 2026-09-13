<script lang="ts">
  import { TrendingUp, ArrowUpRight } from 'lucide-svelte';

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
    <div class="flex items-end justify-between mb-12">
      <div>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Top <span class="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500">AI Tools</span> This Month
        </h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400">The most popular tools right now, ranked by traffic.</p>
      </div>
      <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-sm">
        <TrendingUp size={15} />
        Live ranking
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each tools as tool, i (tool.slug)}
        <a
          href="/tools/{tool.slug}"
          class="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-0.5 transition-all duration-200"
        >
          <div class="flex items-start gap-3 mb-4">
            <div class="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {#if tool.icon}
                <span>{tool.icon}</span>
              {:else}
                <span class="text-sm font-bold text-slate-500 dark:text-slate-300">{tool.name.charAt(0)}</span>
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{tool.name}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.categories?.[0]?.name}</p>
            </div>
            <span class="text-2xl font-extrabold text-slate-200 dark:text-slate-700 group-hover:text-rose-200 dark:group-hover:text-rose-500/40 transition-colors">
              {i + 1}
            </span>
          </div>

          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-5 flex-1">
            {tool.shortDescription || tool.description}
          </p>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            {#if tool.monthlyVisits != null}
              <div class="flex items-baseline gap-1.5">
                <span class="text-base font-bold text-slate-900 dark:text-slate-100">{formatNumber(tool.monthlyVisits)}</span>
                <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">visits/mo</span>
                {#if tool.growth != null && tool.growth > 0}
                  <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+{formatNumber(tool.growth)}</span>
                {/if}
              </div>
            {:else}
              <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{labelFor(tool)}</span>
            {/if}
            <span class="text-rose-500 dark:text-rose-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </a>
      {/each}
    </div>

    <div class="mt-12 text-center">
      <a
        href="/trending"
        class="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold rounded-full transition-colors"
      >
        View All Trending Tools
        <ArrowUpRight size={17} />
      </a>
    </div>
  </div>
</section>
