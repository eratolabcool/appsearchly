<script lang="ts">
  export let data;

  $: category = data.category;
  $: tools = data.tools;
  $: itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.seo.title,
    description: data.seo.description,
    numberOfItems: data.pagination.total,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: (data.seo.page - 1) * 24 + index + 1,
      url: `https://appsearchly.com/tools/${tool.slug}`,
      name: tool.name
    }))
  };
</script>

<svelte:head>
  <title>{data.seo.title}</title>
  <meta name="description" content={data.seo.description} />
  <link rel="canonical" href={data.seo.canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="AppSearchly" />
  <meta property="og:title" content={data.seo.title} />
  <meta property="og:description" content={data.seo.description} />
  <meta property="og:url" content={data.seo.canonical} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={data.seo.title} />
  <meta name="twitter:description" content={data.seo.description} />
  <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
</svelte:head>

<main class="bg-slate-50 text-slate-900">
  <section class="border-b bg-white">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <a class="text-sm font-medium text-blue-700" href="/categories">Categories</a>
      <h1 class="mt-3 text-4xl font-bold">{category.icon ?? ''} {category.name}</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{category.description}</p>
      <p class="mt-3 text-sm text-slate-500">{data.pagination.total} tools indexed</p>
    </div>
  </section>

  <section class="mx-auto grid max-w-6xl gap-4 px-6 py-10 lg:grid-cols-3">
    {#each tools as tool}
      <a class="rounded-lg border bg-white p-5 hover:border-blue-300 hover:shadow-sm" href="/tools/{tool.slug}">
        <div class="flex items-start gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-slate-100 font-bold">
            {#if tool.logoUrl || tool.faviconUrl}
              <img class="h-8 w-8 object-contain" src={tool.logoUrl ?? tool.faviconUrl} alt="{tool.name} logo" />
            {:else}
              {tool.name.slice(0, 1)}
            {/if}
          </div>
          <div>
            <h2 class="font-semibold">{tool.name}</h2>
            <p class="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{tool.shortDescription}</p>
          </div>
        </div>
      </a>
    {:else}
      <p class="rounded-lg border bg-white p-6 text-slate-600">No published tools are indexed for this category yet.</p>
    {/each}
  </section>
</main>
