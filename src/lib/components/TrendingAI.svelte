
<script lang="ts">
  import appsData from '../../../data/apps.json';
  import categoriesData from '../../../data/categories.json';
  import { TrendingUp, Users, ArrowUpRight, Star } from 'lucide-svelte';

  // Filter AI tools with the specified criteria
  const trendingAITools = appsData
    .filter(app =>
      (app.monthlyVisits || 0) >= 300000 &&
      (app.monthlyVisits || 0) <= 5000000 &&
      (app.growth || 0) >= 200000
    )
    .sort((a, b) => (b.growth || 0) - (a.growth || 0));

  // Group by category
  const toolsByCategory = trendingAITools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num?.toString() || '0';
  }

  function handleToolClick(tool) {
    if(tool.seo?.slug) {
      window.location.href = `/tool/${tool.seo.slug}`;
    }
  }

  function getCategoryIcon(categoryName: string): string {
    const categoryKey = Object.keys(categoriesData.categories).find(
      key => categoriesData.categories[key].name === categoryName
    );
    return categoryKey ? categoriesData.categories[categoryKey].icon : '📱';
  }
</script>

<section class="py-20 bg-slate-50 border-t border-slate-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-semibold text-sm mb-6">
        <TrendingUp size={16} />
        <span>Trending Now</span>
      </div>
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        Top <span class="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500">AI Tools</span>
      </h2>
      <p class="text-lg text-slate-500 mb-8">
        Top AI tools with 300K-5M monthly visits and 200K+ growth this month
      </p>

      <div class="flex flex-wrap justify-center gap-4 md:gap-8">
        <div class="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[120px]">
          <span class="text-2xl font-bold text-slate-900">{trendingAITools.length}</span>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Tools</span>
        </div>
        <div class="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[120px]">
          <span class="text-2xl font-bold text-slate-900">{formatNumber(trendingAITools.reduce((acc, tool) => acc + (tool.monthlyVisits || 0), 0))}</span>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Visits</span>
        </div>
        <div class="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[120px]">
          <span class="text-2xl font-bold text-emerald-500">+{formatNumber(Math.round(trendingAITools.reduce((acc, tool) => acc + (tool.growth || 0), 0) / (trendingAITools.length || 1)))}</span>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Growth</span>
        </div>
      </div>
    </div>

    <div class="space-y-12">
      {#each Object.entries(toolsByCategory) as [category, tools]}
        <div>
          <div class="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
            <span class="text-2xl">{getCategoryIcon(category)}</span>
            <h3 class="text-xl font-bold text-slate-900">{category}</h3>
            <span class="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md text-xs font-bold">{tools.length} tools</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each tools as tool}
              <button
                class="flex flex-col text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-rose-300 hover:shadow-lg transition-all duration-200 group"
                on:click={() => handleToolClick(tool)}
              >
                <div class="flex items-start gap-4 mb-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                    {tool.icon || '🤖'}
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{tool.appName || tool.name}</h4>
                    <p class="text-sm text-slate-500 line-clamp-1">{tool.description}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      <Users size={14} />
                      Visits
                    </div>
                    <div class="font-bold text-slate-900">{formatNumber(tool.monthlyVisits || 0)}</div>
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                      <ArrowUpRight size={14} />
                      Growth
                    </div>
                    <div class="font-bold text-emerald-600">+{formatNumber(tool.growth || 0)}</div>
                  </div>
                </div>

                <div class="flex items-center justify-between mt-auto">
                  <div class="flex items-center gap-1">
                    <Star size={14} class="text-amber-400 fill-amber-400" />
                    <span class="text-sm font-bold text-slate-700">{tool.rating || '4.5'}</span>
                  </div>
                  <div class="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                    {tool.pricingModel || tool.pricing?.model || 'Free / Paid'}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>