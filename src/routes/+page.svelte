
<script lang="ts">
  /**
   * [INPUT]: 依赖 components/ 的 Hero, FeaturedApps, Categories, TrendingAI, HowItWorks, Testimonials, CallToAction
   * [OUTPUT]: 渲染首页完整内容，包含 Hero/Featured/Categories/AI/Testimonials/Hooks/CTA 七个区块
   * [POS]: routes/ 的根页面，展示平台核心价值和应用发现入口
   * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
   */
  import Hero from '$lib/components/Hero.svelte';
  import FeaturedApps from '$lib/components/FeaturedApps.svelte';
  import Categories from '$lib/components/Categories.svelte';
  import TrendingAI from '$lib/components/TrendingAI.svelte';
  import HowItWorks from '$lib/components/HowItWorks.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import CallToAction from '$lib/components/CallToAction.svelte';

  // App Search homepage with app discovery theme
</script>

<main class="homepage">
  <!-- Hero Section -->
  <Hero />

  <!-- Featured Apps Section -->
  <FeaturedApps />

  <!-- Categories Section -->
  <Categories />

  <!-- Trending AI Tools Section -->
  <TrendingAI />

  <!-- How It Works -->
  <HowItWorks />

  <!-- Testimonials -->
  <Testimonials />

  <!-- Call to Action -->
  <CallToAction />
</main>

<style>
  .homepage {
    width: 100%;
    min-height: 100vh;
  }

  /* Smooth scroll behavior */
  html {
    scroll-behavior: smooth;
  }
</style>