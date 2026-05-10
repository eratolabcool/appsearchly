
<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowRight, Palette, Code, BarChart, Target, Smartphone } from 'lucide-svelte';

  function scrollToSearch() {
    const searchSection = document.getElementById('featured-apps');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Popular search terms for quick access
  const quickSearches = [
    'Productivity Apps',
    'Design Tools',
    'Development Software',
    'Business Apps',
    'Educational Tools'
  ];

  // Floating apps configuration
  const floatingApps = [
    { icon: Palette, label: 'Design Tools', class: 'top-10 -left-4 md:-left-8 lg:-left-12 animation-delay-0' },
    { icon: Code, label: 'Development', class: 'top-40 right-0 md:right-8 lg:right-12 animation-delay-2000' },
    { icon: BarChart, label: 'Analytics', class: 'bottom-32 left-8 md:left-16 lg:left-24 animation-delay-4000' },
    { icon: Target, label: 'Productivity', class: '-top-4 right-16 md:right-24 lg:right-32 animation-delay-1000' },
    { icon: Smartphone, label: 'Mobile Apps', class: 'bottom-10 right-12 md:right-20 lg:right-28 animation-delay-3000' }
  ];
</script>

<section class="relative bg-slate-900 pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
  <!-- Background Decoration -->
  <div class="absolute inset-0 z-0">
    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
    <div class="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-16 lg:mb-24">
      
      <!-- Hero Text -->
      <div class="animate-fade-in-up">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
          Discover Your <br />
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Perfect</span> App
        </h1>
        
        <p class="text-lg sm:text-xl text-slate-400 leading-relaxed mb-8 max-w-lg">
          Search and explore thousands of mobile apps, desktop software, and productivity tools. Find exactly what you need with App Search's intelligent discovery platform.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 mb-10">
          <button 
            class="inline-flex justify-center items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-base font-semibold rounded-full shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
            on:click={scrollToSearch}
          >
            Start Exploring
            <ArrowRight size={20} />
          </button>
          
          <a 
            href="/submit-app" 
            class="inline-flex justify-center items-center px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-base font-medium rounded-full transition-all border border-slate-700 hover:border-slate-600"
          >
            Submit Your App
          </a>
        </div>

        <!-- Quick Search Tags -->
        <div class="space-y-3">
          <span class="text-sm font-medium text-slate-500 uppercase tracking-wider">Popular Searches</span>
          <div class="flex flex-wrap gap-2">
            {#each quickSearches as search}
              <button 
                class="px-4 py-2 text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-blue-400 border border-slate-700/50 rounded-full transition-colors cursor-pointer"
                on:click={() => window.location.href = `/search?q=${encodeURIComponent(search)}`}
              >
                {search}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Hero Visual / Floating Apps -->
      <div class="relative h-[400px] lg:h-[500px] hidden md:block">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        {#each floatingApps as app}
          <div class="absolute {app.class} flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-3 pr-5 rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer hover:border-blue-500/50 animate-[float_6s_ease-in-out_infinite]">
            <div class="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-xl text-blue-400">
              <svelte:component this={app.icon} size={24} />
            </div>
            <span class="font-medium text-slate-200">{app.label}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-slate-800">
      <div class="text-center md:text-left">
        <div class="text-3xl font-bold text-white mb-1">10,000+</div>
        <div class="text-sm font-medium text-slate-500 uppercase tracking-wide">Apps & Software</div>
      </div>
      <div class="text-center md:text-left">
        <div class="text-3xl font-bold text-white mb-1">500+</div>
        <div class="text-sm font-medium text-slate-500 uppercase tracking-wide">Categories</div>
      </div>
      <div class="text-center md:text-left">
        <div class="text-3xl font-bold text-white mb-1">50K+</div>
        <div class="text-sm font-medium text-slate-500 uppercase tracking-wide">Reviews</div>
      </div>
      <div class="text-center md:text-left">
        <div class="text-3xl font-bold text-white mb-1">100+</div>
        <div class="text-sm font-medium text-slate-500 uppercase tracking-wide">New Apps Daily</div>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  .animation-delay-0 { animation-delay: 0s; }
  .animation-delay-1000 { animation-delay: 1s; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-3000 { animation-delay: 3s; }
  .animation-delay-4000 { animation-delay: 4s; }
</style>