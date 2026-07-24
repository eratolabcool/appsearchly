<script lang="ts">
  let submissions: any[] = [];

  async function load() {
    const response = await fetch('/api/admin/submissions');
    const data = await response.json();
    submissions = data.items ?? [];
  }

  load();
</script>

<svelte:head>
  <title>AppSearchly Admin Review Queue</title>
</svelte:head>

<h1>AppSearchly Review Queue</h1>

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
