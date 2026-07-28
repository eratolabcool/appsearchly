<script lang="ts">
  import { page } from '$app/stores';
  const siteUrl = 'https://appsearchly.com';
  $: tool = $page.data.tool;
  $: breadcrumbJsonLd = tool ? {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'AI Tools', item: `${siteUrl}/categories` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: `${siteUrl}/tools/${tool.slug}` }
    ]
  } : null;
</script>

{#if breadcrumbJsonLd}<svelte:head><script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script></svelte:head>{/if}
<slot />
{#if tool}
  <aside class="border-t bg-white">
    <div class="mx-auto flex max-w-6xl flex-wrap gap-4 px-6 py-6 text-sm font-semibold">
      <a href="/alternatives/{tool.slug}">Best {tool.name} alternatives</a>
      {#each (tool.alternatives ?? []).slice(0, 3) as alternative}
        <a href="/compare/{tool.slug}-vs-{alternative.slug}">{tool.name} vs {alternative.name}</a>
      {/each}
      {#each (tool.categories ?? []).slice(0, 2) as category}
        <a href="/category/{category.slug}">More {category.name} tools</a>
      {/each}
    </div>
  </aside>
{/if}
