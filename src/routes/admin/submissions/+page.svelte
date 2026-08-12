<script lang="ts">
  import { onMount } from 'svelte';
  import AdminGate from '$lib/components/AdminGate.svelte';
  import { adminFetch } from '$lib/stores/admin';

  let submissions: any[] = [];
  let authError = false;

  async function load() {
    authError = false;
    const response = await adminFetch('/api/admin/submissions');
    if (response.status === 401) {
      authError = true;
      submissions = [];
      return;
    }
    const data = await response.json();
    submissions = data.items ?? [];
  }

  onMount(() => load());
</script>

<svelte:head>
  <title>AppSearchly Admin Review Queue</title>
</svelte:head>

<AdminGate>
  <main class="mx-auto max-w-4xl px-6 py-10">
    <h1 class="text-3xl font-bold">Review Queue</h1>
    {#if authError}
      <p class="mt-4 rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">The stored token is invalid. Re-enter it above.</p>
    {/if}
  </main>
</AdminGate>

{#if submissions.length === 0}
  <p>No pending submissions.</p>
{:else}
  {#each submissions as item}
    <article>
      <h2>{item.submitted_name ?? item.submitted_url}</h2>
      <p>Quality Score: {item.overall_score ?? 'N/A'}</p>
      <p>Status: {item.status}</p>
      <a href={`/admin/submissions/${item.id}`}>Review</a>
    </article>
  {/each}
{/if}
