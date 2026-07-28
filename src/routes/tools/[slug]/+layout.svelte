<script lang="ts">
  import { page } from '$app/stores';

  const siteUrl = 'https://appsearchly.com';
  $: tool = $page.data.tool;
  $: breadcrumbJsonLd = tool
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'AI Tools', item: `${siteUrl}/categories` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: `${siteUrl}/tools/${tool.slug}` }
        ]
      }
    : null;
</script>

{#if breadcrumbJsonLd}
  <svelte:head>
    <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
  </svelte:head>
{/if}

<slot />
