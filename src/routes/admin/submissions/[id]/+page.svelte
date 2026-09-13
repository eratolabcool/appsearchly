<script lang="ts">
  import AdminGate from '$lib/components/AdminGate.svelte';
  import { adminFetch } from '$lib/stores/admin';

  export let data;

  let submitting = false;
  let message = '';

  async function review(action: 'approve' | 'reject') {
    if (submitting) return;
    submitting = true;
    message = '';

    const response = await adminFetch(`/api/admin/submissions/${data.submission.id}/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: action === 'reject' ? JSON.stringify({ reason: 'Rejected during admin review' }) : undefined
    });

    if (response.status === 401) {
      message = 'Admin token invalid — re-enter it on the admin page.';
      submitting = false;
    } else if (response.ok) {
      location.href = '/admin/submissions';
    } else {
      message = 'Review action failed.';
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Submission Review | AppSearchly</title>
</svelte:head>

<AdminGate>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <a class="text-sm text-blue-700 dark:text-blue-400" href="/admin/submissions">← Back to queue</a>
    <h1 class="mt-3 text-3xl font-bold">{data?.submission?.submitted_name ?? 'Tool Review'}</h1>

    {#if message}
      <p class="mt-4 rounded border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{message}</p>
    {/if}

    <section class="mt-8 rounded-lg border bg-white dark:bg-slate-800 p-6">
      <h2 class="text-lg font-semibold">Quality Score</h2>
      <p class="mt-2 text-2xl font-bold">{data?.quality?.overall_score ?? 'N/A'} / 100</p>
    </section>

    <section class="mt-4 rounded-lg border bg-white dark:bg-slate-800 p-6">
      <h2 class="text-lg font-semibold">Security Checks</h2>
      <div class="mt-3 space-y-2">
        {#each data?.checks ?? [] as check}
          <p class="text-sm">
            <span class="font-medium">{check.check_type}</span>: {check.status}
          </p>
        {/each}
      </div>
    </section>

    <div class="mt-8 flex gap-3">
      <button
        class="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        disabled={submitting}
        onclick={() => review('approve')}
      >
        Approve & publish
      </button>
      <button
        class="rounded-lg bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
        disabled={submitting}
        onclick={() => review('reject')}
      >
        Reject
      </button>
    </div>
  </main>
</AdminGate>
