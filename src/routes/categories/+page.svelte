<script lang="ts">
  export let data;

  $: rootCategories = data.categories.filter((category) => !category.parentId);
</script>

<svelte:head>
  <title>AI Tool Categories | AppSearchly</title>
  <meta name="description" content="Browse AppSearchly AI tools by writing, image, video, coding, marketing, audio, agents, and productivity categories." />
</svelte:head>

<main class="bg-slate-50 text-slate-900">
  <section class="border-b bg-white">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700">AI Software Knowledge Base</p>
      <h1 class="mt-3 text-4xl font-bold">AI Tool Categories</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        Explore verified AI tools by capability, workflow, and buyer intent.
      </p>
    </div>
  </section>

  <section class="mx-auto grid max-w-6xl gap-4 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
    {#each rootCategories as category}
      <a class="rounded-lg border bg-white p-6 hover:border-blue-300 hover:shadow-sm" href="/category/{category.slug}">
        <div class="flex items-center justify-between gap-4">
          <div class="text-3xl">{category.icon ?? 'AI'}</div>
          <span class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{category.toolCount} tools</span>
        </div>
        <h2 class="mt-5 text-xl font-semibold">{category.name}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
      </a>
    {/each}
  </section>
</main>
