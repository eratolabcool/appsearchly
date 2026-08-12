<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';

  export let rootCategories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    icon: string | null;
    toolCount: number;
  }> = [];
  export let subCategories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    icon: string | null;
    toolCount: number;
  }> = [];

  // Group subcategories under their parent for quick links
  $: subsByParent = subCategories.reduce<Record<string, typeof subCategories>>((acc, sub) => {
    const key = sub.parentId ?? '';
    (acc[key] ??= []).push(sub);
    return acc;
  }, {});
</script>

<section id="categories" class="py-14 lg:py-20 bg-slate-50 dark:bg-slate-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-end justify-between mb-10">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2">Browse by Category</p>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Explore <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">AI Tools</span>
        </h2>
      </div>
      <a
        href="/categories"
        class="hidden sm:inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-sm group"
      >
        All categories
        <ChevronRight size={16} class="group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each rootCategories as category}
        <div class="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200">
          <!-- Whole-card link (behind chips) -->
          <a
            href="/category/{category.slug}"
            class="absolute inset-0 rounded-2xl"
            aria-label="Browse {category.name} category"
          ></a>

          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {category.icon ?? '🤖'}
            </div>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
              {category.toolCount} tools
            </span>
          </div>

          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {category.name}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {category.description}
          </p>

          {#if subsByParent[category.slug]?.length}
            <div class="flex flex-wrap gap-1.5">
              {#each subsByParent[category.slug].slice(0, 4) as sub}
                <a
                  href="/category/{sub.slug}"
                  class="relative z-10 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  {sub.name}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
