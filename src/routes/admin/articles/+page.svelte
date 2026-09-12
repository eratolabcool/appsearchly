<script lang="ts">
  import AdminGate from '$lib/components/AdminGate.svelte';
  import { adminFetch } from '$lib/stores/admin';

  export let data;

  let message = '';

  async function publishArticle(id: string) {
    const response = await adminFetch(`/api/admin/articles/${id}/publish`, { method: 'POST' });
    if (!response.ok && response.status === 401) message = 'Admin token invalid.';
    location.reload();
  }

  async function deleteArticle(id: string) {
    const response = await adminFetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    if (!response.ok && response.status === 401) message = 'Admin token invalid.';
    location.reload();
  }
</script>

<svelte:head>
  <title>Articles | AppSearchly Admin</title>
</svelte:head>

<AdminGate>
<main class="mx-auto max-w-5xl px-6 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold">AI Article Drafts</h1>
    <p class="mt-2 text-slate-600">Weekly AI-generated listicle drafts. Review, then publish to /blog.</p>
  </div>

  <section class="space-y-4">
    {#each data.articles as article (article.slug)}
      <article class="rounded-lg border bg-white p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h2 class="font-semibold">{article.icon} {article.title}</h2>
            <p class="mt-1 text-sm text-slate-600">{article.excerpt}</p>
            <p class="mt-2 text-xs text-slate-500">
              /blog/{article.slug} ·
              <span class={article.status === 'draft' ? 'text-amber-700' : 'text-emerald-700'}>{article.status}</span>
              {#if article.publishedAt}· {new Date(article.publishedAt).toISOString().slice(0, 10)}{/if}
            </p>
          </div>
          <div class="flex gap-2">
            {#if article.status === 'draft'}
              <button class="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" onclick={() => publishArticle(article.slug)}>Publish</button>
            {/if}
            <button class="rounded border px-3 py-2 text-sm font-semibold" onclick={() => deleteArticle(article.slug)}>Delete</button>
          </div>
        </div>
      </article>
    {:else}
      <p class="text-slate-500">No articles yet. The weekly cron will generate drafts automatically.</p>
    {/each}
  </section>
</main>
{#if message}<p class="mt-4 text-sm text-rose-600">{message}</p>{/if}
</AdminGate>
