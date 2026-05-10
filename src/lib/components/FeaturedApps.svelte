
<script lang="ts">
  import { onMount } from 'svelte';
  import AppCard from './AppCard.svelte';
  import appsData from '../../../data/apps.json';
  import { ArrowRight } from 'lucide-svelte';

  let featuredApps = [];
  let loading = true;

  onMount(() => {
    // Get top 8 highest rated apps
    featuredApps = [...appsData]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
    loading = false;
  });

  function handleAppSelect(app) {
    console.log('App selected:', app.name);
  }
</script>

<section id="featured-apps" class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">Featured</span> Apps
      </h2>
      <p class="text-lg text-slate-500">
        Handpicked apps and software recommendations from our expert team
      </p>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each Array(8) as _}
          <div class="bg-slate-50 rounded-2xl border border-slate-100 p-5 h-64 animate-pulse flex flex-col">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-14 h-14 bg-slate-200 rounded-xl shrink-0"></div>
              <div class="flex-1">
                <div class="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
            <div class="space-y-2 mt-2">
              <div class="h-4 bg-slate-200 rounded w-full"></div>
              <div class="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div class="mt-auto pt-4 flex justify-between">
              <div class="h-4 bg-slate-200 rounded w-1/4"></div>
              <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each featuredApps as app (app.id)}
          <AppCard
            {app}
            onSelect={handleAppSelect}
          />
        {/each}
      </div>
    {/if}

    <div class="mt-16 text-center">
      <a 
        href="/categories" 
        class="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-blue-600 font-semibold rounded-full transition-colors group"
      >
        View All Categories
        <ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  </div>
</section>