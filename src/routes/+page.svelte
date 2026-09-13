<script lang="ts">
  /**
   * Homepage — content-first AI tool navigation.
   * [INPUT]: server data (rootCategories, subCategories, trendingTools)
   * [POS]: first screen shows search + category grid; trending below.
   */
  import Hero from '$lib/components/Hero.svelte';
  import Categories from '$lib/components/Categories.svelte';
  import TrendingAI from '$lib/components/TrendingAI.svelte';
  import HowItWorks from '$lib/components/HowItWorks.svelte';
  import CallToAction from '$lib/components/CallToAction.svelte';

  export let data;
</script>

<main class="homepage">
  <!-- Search-first hero -->
  <Hero toolCount={data.toolCount} />

  <!-- Category navigation (the core of the directory) -->
  <Categories rootCategories={data.rootCategories} subCategories={data.subCategories} />

  <!-- Trending tools by traffic -->
  <TrendingAI tools={data.trendingTools} />

  <!-- How it works -->
  <HowItWorks />

  <!-- Submit CTA -->
  <CallToAction />
</main>

<style>
  .homepage {
    width: 100%;
    min-height: 100vh;
  }
</style>
