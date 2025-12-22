<script lang="ts">
  import FontsSimple from './components/FontsSimple.svelte';
  import FooterSimple from './components/FooterSimple.svelte';
  import AppSearch from './components/AppSearch.svelte';
  import { browser } from '$app/environment';

  let language = 'en'; // Default language

  // Get language from URL on client only (avoid SSR window access)
  if (browser) {
    const urlParams = new URLSearchParams(window.location.search);
    language = urlParams.get('lang') || 'en';
  }
</script>

<svelte:head>
  <title>App Search - Find the best apps across all platforms</title>
  <meta name="description" content="Search and discover the best apps for iOS, Android, and web. Compare prices, read reviews, and find alternatives." />
  <meta name="keywords" content="app search, mobile apps, iOS apps, Android apps, app alternatives, app reviews" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="App Search - Find the best apps across all platforms" />
  <meta property="og:description" content="Search and discover the best apps for iOS, Android, and web. Compare prices, read reviews, and find alternatives." />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="App Search - Find the best apps across all platforms" />
  <meta property="twitter:description" content="Search and discover the best apps for iOS, Android, and web. Compare prices, read reviews, and find alternatives." />
</svelte:head>

<FontsSimple {language} />

<div class="app-search-page">
  <!-- Main Search Component -->
  <AppSearch />

  <!-- Footer -->
  <FooterSimple />
</div>

<style>
  .app-search-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f7;
  }

  /* Global styles */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f5f5f7;
  }

  ::-webkit-scrollbar-thumb {
    background: #d2d2d7;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1a6;
  }

  /* Focus styles for accessibility */
  :global(*:focus-visible) {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }

  /* Loading animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Utility classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  @media (min-width: 640px) {
    .container {
      padding: 0 32px;
    }
  }
</style>