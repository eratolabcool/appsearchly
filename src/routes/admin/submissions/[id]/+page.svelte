<script lang="ts">
  export let data;

  let submitting = false;

  async function review(action: 'approve' | 'reject') {
    if (submitting) return;

    submitting = true;

    const response = await fetch(`/api/admin/submissions/${data.submission.id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: action === 'reject'
        ? JSON.stringify({ reason: 'Rejected during admin review' })
        : undefined
    });

    if (response.ok) {
      location.href = '/admin/submissions';
    } else {
      submitting = false;
      alert('Review action failed');
    }
  }
</script>

<svelte:head>
  <title>Submission Review</title>
</svelte:head>

<h1>{data?.submission?.submitted_name ?? 'Tool Review'}</h1>

<section>
  <h2>Quality Score</h2>
  <p>{data?.quality?.overall_score ?? 'N/A'} / 100</p>
</section>

<section>
  <h2>Security Checks</h2>
  {#each data?.checks ?? [] as check}
    <p>{check.check_type}: {check.status}</p>
  {/each}
</section>

<button disabled={submitting} on:click={() => review('approve')}>Approve</button>
<button disabled={submitting} on:click={() => review('reject')}>Reject</button>
