<script lang="ts">
  import Hero from '../components/Hero.svelte';
  import FeaturedApps from '../components/FeaturedApps.svelte';
  import Categories from '../components/Categories.svelte';
  import HowItWorks from '../components/HowItWorks.svelte';
  import Testimonials from '../components/Testimonials.svelte';
  import CallToAction from '../components/CallToAction.svelte';

  // Appsearchly.org homepage with app discovery theme
</script>

<main class="homepage">
  <!-- Hero Section -->
  <Hero />

  <!-- Featured Apps Section -->
  <FeaturedApps />

  <!-- Categories Section -->
  <Categories />

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