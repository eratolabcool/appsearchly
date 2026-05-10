
<script lang="ts">
  import { onMount } from 'svelte';

  export let title: string = '';
  export let subtitle: string = '';

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        name: title,
        description: subtitle
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });
</script>

<header class="page-header">
  <div class="container">
    <div class="header-content">
      <h1 class="page-title">{title}</h1>
      {#if subtitle}
        <p class="page-subtitle">{subtitle}</p>
      {/if}
    </div>
  </div>
</header>

<style>
  .page-header {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%);
    padding: 60px 0;
    margin-bottom: 40px;
    border-bottom: 1px solid var(--border-color);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .header-content {
    text-align: center;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 16px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .page-header {
      padding: 40px 0;
    }

    .page-title {
      font-size: 2rem;
    }

    .page-subtitle {
      font-size: 1rem;
    }
  }
</style>