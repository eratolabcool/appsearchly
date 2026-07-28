<script lang="ts">
  import { page } from '$app/stores';

  const siteUrl = 'https://appsearchly.com';
  $: category = $page.data.category;
  $: tools = $page.data.tools ?? [];
  $: title = category ? `Best ${category.name} AI Tools (2026) | AppSearchly` : 'AI Tool Category | AppSearchly';
  $: description = category
    ? category.description || `Discover and compare the best ${category.name} AI tools, features, pricing, and alternatives on AppSearchly.`
    : 'Discover AI tools by category on AppSearchly.';
  $: canonical = category ? `${siteUrl}/category/${category.slug}` : `${siteUrl}/categories`;
  $: breadcrumbJsonLd = category
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: `${siteUrl}/categories` },
          { '@type': 'ListItem', position: 3, name: category.name, item: canonical }
        ]
      }
    : null;
  $: collectionJsonLd = category
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: canonical,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: $page.data.pagination?.total ?? tools.length,
          itemListElement: tools.slice(0, 24).map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/tools/${tool.slug}`,
            name: tool.name
          }))
        }
      }
    : null;
</script>

{#if category}
  <svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
    <script type="application/ld+json">{JSON.stringify(collectionJsonLd)}</script>
  </svelte:head>
{/if}

<slot />
