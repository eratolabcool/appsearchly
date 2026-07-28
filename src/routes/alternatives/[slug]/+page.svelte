<script lang="ts">
  export let data;
  const siteUrl = 'https://appsearchly.com';
  $: tool = data.tool;
  $: alternatives = data.alternatives;
  $: canonical = `${siteUrl}/alternatives/${tool.slug}`;
  $: title = `Best ${tool.name} Alternatives in 2026 | AppSearchly`;
  $: description = `Compare the best alternatives to ${tool.name}, including features, pricing models, and use cases.`;
  $: itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: `${tool.name} alternatives`,
    itemListElement: alternatives.map((item, index) => ({ '@type': 'ListItem', position: index + 1, url: `${siteUrl}/tools/${item.slug}`, name: item.name }))
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={data.index.indexable ? 'index,follow' : 'noindex,follow'} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <script type="application/ld+json">{JSON.stringify(itemList)}</script>
</svelte:head>

<main class="mx-auto max-w-6xl px-6 py-12">
  <nav class="text-sm text-slate-500"><a href="/">Home</a> / <a href="/tools/{tool.slug}">{tool.name}</a> / Alternatives</nav>
  <h1 class="mt-4 text-4xl font-bold">Best {tool.name} alternatives</h1>
  <p class="mt-4 max-w-3xl text-lg text-slate-600">Compare tools that serve similar users and categories to {tool.name}. Review each product before choosing.</p>
  <section class="mt-10 grid gap-5 md:grid-cols-2">
    {#each alternatives as item, index}
      <article class="rounded-xl border bg-white p-6">
        <p class="text-sm font-semibold text-blue-700">#{index + 1} alternative</p>
        <h2 class="mt-2 text-2xl font-semibold"><a href="/tools/{item.slug}">{item.name}</a></h2>
        <p class="mt-3 text-slate-600">{item.shortDescription}</p>
        <div class="mt-5 flex gap-4 text-sm font-medium">
          <a href="/tools/{item.slug}">View details</a>
          <a href="/compare/{tool.slug}-vs-{item.slug}">Compare with {tool.name}</a>
        </div>
      </article>
    {:else}
      <p class="rounded-lg border bg-white p-6">More alternatives are being verified. This page is excluded from search indexing until enough data is available.</p>
    {/each}
  </section>
</main>
