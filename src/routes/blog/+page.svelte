<script lang="ts">
  import { ArrowUpRight, FileText } from 'lucide-svelte';

  export let data;

  $: guides = data.guides;
  $: articles = data.articles ?? [];
</script>

<svelte:head>
  <title>AI Tool Guides & Rankings | AppSearchly</title>
  <meta
    name="description"
    content="Practical guides and rankings of the best AI tools, built from verified directory data — image generators, video tools, voice, productivity, and more."
  />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold text-sm mb-4">
        <FileText size={15} />
        <span>Guides</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight">AI Tool Guides & Rankings</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
        Practical guides built from verified directory data — no hype, just the tools that actually get used.
      </p>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-10 space-y-6">
    {#if articles.length > 0}
      {#each articles as article (article.slug)}
        <a class="group block rounded-xl border bg-white dark:bg-slate-800 p-6 hover:border-indigo-300 hover:shadow-sm transition-all" href="/blog/{article.slug}">
          <div class="flex items-start gap-3">
            <span class="text-3xl">{article.icon}</span>
            <div>
              <h2 class="text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{article.title}</h2>
              <p class="mt-1 text-slate-500 dark:text-slate-400 text-sm">{article.excerpt}</p>
              {#if article.publishedAt}
                <p class="mt-2 text-xs font-semibold text-slate-400">{new Date(article.publishedAt).toISOString().slice(0, 10)}</p>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    {/if}
    {#each guides as { guide, previewTools, toolCount } (guide.slug)}
      <a class="group block rounded-xl border bg-white dark:bg-slate-800 p-6 hover:border-indigo-300 hover:shadow-sm transition-all" href="/blog/{guide.slug}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{guide.icon}</span>
            <div>
              <h2 class="text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{guide.title}</h2>
              <p class="mt-1 text-slate-500 dark:text-slate-400 text-sm">{guide.excerpt}</p>
            </div>
          </div>
          <span class="shrink-0 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
            {toolCount} tools
          </span>
        </div>

        {#if previewTools.length > 0}
          <div class="mt-5 flex flex-wrap gap-2">
            {#each previewTools as tool (tool.slug)}
              <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm text-slate-600 dark:text-slate-300">
                {tool.icon ?? ''} {tool.name}
              </span>
            {/each}
            <span class="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Read guide <ArrowUpRight size={14} class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        {/if}
      </a>
    {/each}
  </section>
</main>
