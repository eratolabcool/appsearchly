<script lang="ts">
  export let data;
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

<button>Approve</button>
<button>Reject</button>
