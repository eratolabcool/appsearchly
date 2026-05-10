
<script lang="ts">
  import { Search, GitCompare, Lightbulb, Download } from 'lucide-svelte';

  const steps = [
    {
      number: '1',
      title: 'Search',
      description: 'Enter keywords or browse categories to find apps that match your needs.',
      icon: Search,
      color: 'blue'
    },
    {
      number: '2',
      title: 'Compare',
      description: 'View detailed comparisons, reviews, and ratings to make informed decisions.',
      icon: GitCompare,
      color: 'indigo'
    },
    {
      number: '3',
      title: 'Discover',
      description: 'Find perfect alternatives and new tools you didn\'t know existed.',
      icon: Lightbulb,
      color: 'amber'
    },
    {
      number: '4',
      title: 'Install',
      description: 'Direct links to official stores with secure download and installation.',
      icon: Download,
      color: 'emerald'
    }
  ];
</script>

<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-20">
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        How <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">Appsearchly</span> Works
      </h2>
      <p class="text-lg text-slate-500">
        Find your perfect app in four simple steps
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      {#each steps as step}
        <div class="relative flex flex-col items-center text-center group">
          <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 relative">
            <svelte:component this={step.icon} size={32} class="text-slate-700 group-hover:text-blue-600 transition-colors" />
            <div class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
              {step.number}
            </div>
          </div>
          
          <h3 class="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
          <p class="text-slate-500 leading-relaxed">
            {step.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>