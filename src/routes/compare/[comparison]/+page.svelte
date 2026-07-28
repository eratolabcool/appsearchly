<script lang="ts">
  export let data;
  const siteUrl = 'https://appsearchly.com';
  $: left = data.left;
  $: right = data.right;
  $: title = `${left.name} vs ${right.name}: AI Tool Comparison (2026) | AppSearchly`;
  $: description = `Compare ${left.name} and ${right.name} by features, pricing, categories, and use cases.`;
  $: canonical = `${siteUrl}/compare/${left.slug}-vs-${right.slug}`;
  $: rows = [
    ['Pricing model', left.pricingType ?? 'Unknown', right.pricingType ?? 'Unknown'],
    ['Verified', left.isVerified ? 'Yes' : 'No', right.isVerified ? 'Yes' : 'No'],
    ['Features indexed', String(left.features.length), String(right.features.length)],
    ['Pricing plans indexed', String(left.pricing.length), String(right.pricing.length)]
  ];
  $: jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: `${left.name} vs ${right.name}`,
    description, url: canonical,
    mainEntity: [left, right].map((tool) => ({ '@type': 'SoftwareApplication', name: tool.name, url: `${siteUrl}/tools/${tool.slug}`, applicationCategory: tool.categories[0]?.name ?? 'AI Software' }))
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={data.index.indexable ? 'index,follow' : 'noindex,follow'} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
</svelte:head>

<main class="mx-auto max-w-6xl px-6 py-12">
  <nav class="text-sm text-slate-500"><a href="/">Home</a> / Comparisons / {left.name} vs {right.name}</nav>
  <h1 class="mt-4 text-4xl font-bold">{left.name} vs {right.name}</h1>
  <p class="mt-4 max-w-3xl text-lg text-slate-600">A structured comparison using AppSearchly's verified tool database.</p>
  <section class="mt-10 overflow-hidden rounded-xl border bg-white">
    <div class="grid grid-cols-3 border-b bg-slate-50 p-4 font-semibold"><span>Criteria</span><a href="/tools/{left.slug}">{left.name}</a><a href="/tools/{right.slug}">{right.name}</a></div>
    {#each rows as row}
      <div class="grid grid-cols-3 border-b p-4 last:border-0"><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span></div>
    {/each}
  </section>
  <section class="mt-10 grid gap-6 md:grid-cols-2">
    {#each [left, right] as tool}
      <article class="rounded-xl border bg-white p-6">
        <h2 class="text-2xl font-semibold">About {tool.name}</h2>
        <p class="mt-3 text-slate-600">{tool.description}</p>
        <h3 class="mt-5 font-semibold">Indexed features</h3>
        <p class="mt-2 text-sm text-slate-600">{tool.features.map((feature) => feature.name).join(', ') || 'Feature data is being verified.'}</p>
        <a class="mt-5 inline-block font-semibold text-blue-700" href="/alternatives/{tool.slug}">See {tool.name} alternatives</a>
      </article>
    {/each}
  </section>
  {#if data.sharedFeatures.length}
    <section class="mt-10 rounded-xl border bg-white p-6"><h2 class="text-2xl font-semibold">Shared capabilities</h2><p class="mt-3 text-slate-600">{data.sharedFeatures.map((feature) => feature.name).join(', ')}</p></section>
  {/if}
</main>
