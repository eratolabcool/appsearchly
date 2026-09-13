<script lang="ts">
  import { ArrowRight, PlusCircle } from 'lucide-svelte';
</script>

<section class="bg-slate-900 relative overflow-hidden">
  <div class="absolute inset-0">
    <div class="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
  </div>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center relative z-10">
    <h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
      Found a Tool We're Missing?
    </h2>
    <p class="text-lg text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
      Submit your favorite AI tool and help grow the directory. Every submission is reviewed for quality before it goes live.
    </p>
    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <a
        href="/submit"
        class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
      >
        <PlusCircle size={18} />
        Submit a Tool
      </a>
      <a
        href="/categories"
        class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-full border border-slate-700 transition-all"
      >
        Browse All Categories
        <ArrowRight size={18} />
      </a>
    </div>
  </div>
</section>
