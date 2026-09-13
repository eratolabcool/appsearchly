<script lang="ts">
  import { Search, GitCompare, Rocket } from 'lucide-svelte';

  const steps = [
    {
      number: '1',
      title: 'Search',
      description: 'Search 90+ AI tools or browse categories to find what you need.',
      icon: Search
    },
    {
      number: '2',
      title: 'Compare',
      description: 'Compare features, pricing, and alternatives side by side.',
      icon: GitCompare
    },
    {
      number: '3',
      title: 'Launch',
      description: 'Jump straight to the official site and start using the tool.',
      icon: Rocket
    }
  ];
</script>

<section class="py-14 lg:py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
        How <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">AppSearchly</span> Works
      </h2>
      <p class="text-lg text-slate-500 dark:text-slate-400">
        From search to launch in three simple steps
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each steps as step, i (step.number)}
        <div class="relative flex flex-col items-center text-center group">
          <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
            <svelte:component this={step.icon} size={28} class="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <div class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
              {step.number}
            </div>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{step.title}</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-[240px]">
            {step.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>
