<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { page } from '$app/stores';

  const siteUrl = 'https://appsearchly.com';
  $: canonicalUrl = `${siteUrl}${$page.url.pathname}`;
  $: websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'AppSearchly',
    description: 'Discover, compare, and evaluate AI tools for work, creativity, development, and business.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'AppSearchly',
      url: siteUrl
    }
  };
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:site_name" content="AppSearchly" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50 text-slate-800">
  <Header />

  <main class="w-full flex-1">
    <slot />
  </main>

  <Footer />
</div>
