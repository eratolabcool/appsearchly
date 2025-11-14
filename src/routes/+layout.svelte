<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '../components/Footer.svelte';


  // Add Appsearchly theme styles
  onMount(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'appsearchly');
      document.body.classList.add('appsearchly-theme');
    }
  });
</script>

<div class="app-layout">
  <Header />

  <main class="main-content">
    <slot />
  </main>

  <Footer />
</div>

<style>
  :global(.appsearchly-theme) {
    --primary-color: #60a5fa;
    --secondary-color: #34d399;
    --accent-color: #f59e0b;
    --dark-bg: #1a1a2e;
    --darker-bg: #0f172a;
    --light-bg: #f8fafc;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-light: #94a3b8;
    --border-color: #e2e8f0;
    --gradient-primary: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    --gradient-secondary: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    --gradient-dark: linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%);
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--light-bg);
  }

  .main-content {
    flex: 1;
    width: 100%;
  }

  /* Global styles for Appsearchly theme */
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background-color: var(--light-bg);
  }

  /* Smooth scrolling */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>