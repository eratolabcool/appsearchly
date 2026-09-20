<script lang="ts">
  import { onMount } from 'svelte';
  import AdminGate from '$lib/components/AdminGate.svelte';
  import { adminFetch, adminToken } from '$lib/stores/admin';

  let submissions: any[] = [];
  let authError = false;

  async function load() {
    authError = false;
    const response = await adminFetch('/api/admin/submissions');
    if (response.status === 401) {
      adminToken.set('');
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
    {:else if submissions.length === 0}
      <p class="mt-4 text-slate-500">No pending submissions.</p>
    {:else}
      <div class="mt-6 space-y-4">
        {#each submissions as item}
          <article class="rounded-lg border bg-white p-4">
            <h2 class="font-semibold">{item.submitted_name ?? item.submitted_url}</h2>
            <p class="mt-1 text-sm text-slate-500">Quality Score: {item.overall_score ?? 'N/A'} · Status: {item.status}</p>
            <a class="mt-2 inline-block text-sm font-medium text-blue-600" href={`/admin/submissions/${item.id}`}>Review</a>
          </article>
        {/each}
      </div>
    {/if}
  </main>
</AdminGate>
