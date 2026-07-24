<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>{data?.tool?.name ?? 'AI Tool'} - AppSearchly</title>
  <meta name="description" content={data?.tool?.description ?? 'AI tool directory'} />
</svelte:head>

<main>
  {#if data?.tool}
    <h1>{data.tool.name}</h1>
    <p>{data.tool.description}</p>
    <a href={data.tool.website}>{data.tool.website}</a>
    <p>Status: {data.tool.status}</p>
  {:else}
    <h1>Tool not found</h1>
  {/if}
</main>
