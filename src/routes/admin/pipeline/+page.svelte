<script lang="ts">
  import AdminGate from '$lib/components/AdminGate.svelte';
  import { adminFetch } from '$lib/stores/admin';

  export let data;

  let running = false;
  let message = '';

  async function runDiscovery() {
    running = true;
    message = '';
    const response = await adminFetch('/api/admin/discovery/jobs', { method: 'POST' });
    message = response.ok ? 'Discovery started.' : response.status === 401 ? 'Admin token invalid.' : 'Discovery failed.';
    running = false;
    location.reload();
  }

  async function approveImport(id: string) {
    const response = await adminFetch(`/api/admin/imports/${id}/approve`, { method: 'POST' });
    if (!response.ok && response.status === 401) message = 'Admin token invalid.';
    location.reload();
  }

  async function rejectImport(id: string) {
    const response = await adminFetch(`/api/admin/imports/${id}/reject`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'Rejected from pipeline dashboard' })
    });
    if (!response.ok && response.status === 401) message = 'Admin token invalid.';
    location.reload();
  }
</script>

<svelte:head>
  <title>Acquisition Pipeline | AppSearchly Admin</title>
</svelte:head>

<AdminGate>
<main class="mx-auto max-w-7xl px-6 py-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">AI Tools Acquisition Pipeline</h1>
      <p class="mt-2 text-slate-600">Discovery, crawler, extraction, quality, and import queue operations.</p>
    </div>
    <button class="rounded bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={running} onclick={runDiscovery}>
      {running ? 'Running...' : 'Run discovery'}
    </button>
  </div>

  <section class="grid gap-4 md:grid-cols-5">
    <div class="rounded-lg border bg-white p-4"><p class="text-sm text-slate-500">Today discovered</p><p class="mt-2 text-3xl font-bold">{data.metrics.discovered_today}</p></div>
    <div class="rounded-lg border bg-white p-4"><p class="text-sm text-slate-500">Extracted</p><p class="mt-2 text-3xl font-bold">{data.metrics.extracted_today}</p></div>
    <div class="rounded-lg border bg-white p-4"><p class="text-sm text-slate-500">Pending</p><p class="mt-2 text-3xl font-bold">{data.metrics.pending}</p></div>
    <div class="rounded-lg border bg-white p-4"><p class="text-sm text-slate-500">Published</p><p class="mt-2 text-3xl font-bold">{data.metrics.published_today}</p></div>
    <div class="rounded-lg border bg-white p-4"><p class="text-sm text-slate-500">Errors</p><p class="mt-2 text-3xl font-bold">{data.metrics.failed_jobs}</p></div>
  </section>

  <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
    <div class="rounded-lg border bg-white p-5">
      <h2 class="text-xl font-semibold">Sources</h2>
      <div class="mt-4 space-y-3">
        {#each data.metrics.sources as source}
          <div class="rounded border p-3">
            <div class="flex items-center justify-between">
              <p class="font-semibold">{source.name}</p>
              <span class="rounded px-2 py-1 text-xs {source.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}">{source.enabled ? 'enabled' : 'disabled'}</span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{source.type}</p>
            <p class="mt-1 text-xs text-slate-400">Last sync: {source.last_sync_at ?? 'never'}</p>
          </div>
        {/each}
      </div>
    </div>

    <div class="rounded-lg border bg-white p-5">
      <h2 class="text-xl font-semibold">Pending Imports</h2>
      <div class="mt-4 space-y-4">
        {#each data.imports as item}
          <article class="rounded border p-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold">{item.extracted_data.name ?? item.raw_data.name}</h3>
                <p class="mt-1 text-sm text-slate-600">{item.extracted_data.description ?? item.raw_data.description}</p>
                <p class="mt-2 text-xs text-slate-500">Source: {item.source_name} · Score: {item.quality_score ?? 'N/A'}</p>
                {#if item.duplicate_name}
                  <p class="mt-1 text-xs text-amber-700">Possible duplicate: {item.duplicate_name}</p>
                {/if}
              </div>
              <div class="flex gap-2">
                <button class="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" onclick={() => approveImport(item.id)}>Approve</button>
                <button class="rounded border px-3 py-2 text-sm font-semibold" onclick={() => rejectImport(item.id)}>Reject</button>
              </div>
            </div>
          </article>
        {:else}
          <p class="text-slate-500">No pending imports.</p>
        {/each}
      </div>
    </div>
  </section>

  <section class="mt-8 rounded-lg border bg-white p-5">
    <h2 class="text-xl font-semibold">Recent Jobs</h2>
    <div class="mt-4 overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead><tr class="border-b"><th class="p-2">Source</th><th class="p-2">Status</th><th class="p-2">Found</th><th class="p-2">Processed</th><th class="p-2">Error</th></tr></thead>
        <tbody>
          {#each data.jobs.slice(0, 20) as job}
            <tr class="border-b"><td class="p-2">{job.source_name}</td><td class="p-2">{job.status}</td><td class="p-2">{job.items_found}</td><td class="p-2">{job.items_processed}</td><td class="p-2">{job.error_message ?? ''}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</main>
{#if message}<p class="mt-4 text-sm text-rose-600">{message}</p>{/if}
</AdminGate>
