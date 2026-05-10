
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AppCard from './AppCard.svelte';

  export let tools = [];
  export let title = 'Related Tools';
  export let subtitle = 'Similar tools you might be interested in';
  export let loading = false;

  const dispatch = createEventDispatcher();

  function handleToolSelect(tool) {
    dispatch('toolSelect', { tool });
  }
</script>

<section class="related-tools">
  <div class="section-header">
    <h2>{title}</h2>
    <p>{subtitle}</p>
  </div>

  <div class="tools-grid">
    {#if loading}
      {#each Array(6) as _}
        <div class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text skeleton-title"></div>
          </div>
          <div class="skeleton-description"></div>
          <div class="skeleton-meta">
            <div class="skeleton-rating"></div>
            <div class="skeleton-price"></div>
          </div>
        </div>
      {/each}
    {:else if tools && tools.length > 0}
      {#each tools as tool (tool.id)}
        <AppCard
          {tool}
          on:select={() => handleToolSelect(tool)}
        />
      {/each}
    {:else}
      <div class="no-tools">
        <div class="no-tools-icon">🔍</div>
        <h3>No related tools found</h3>
        <p>Check back later for similar AI tools</p>
      </div>
    {/if}
  </div>
</section>

<style>
  .related-tools {
    margin-top: 60px;
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .section-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .section-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .section-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
  }

  /* Loading Skeleton */
  .skeleton-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 25px;
  }

  .skeleton-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
  }

  .skeleton-icon {
    width: 48px;
    height: 48px;
    background: #e2e8f0;
    border-radius: 8px;
    animation: pulse 2s infinite;
  }

  .skeleton-text {
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
    height: 16px;
    width: 150px;
  }

  .skeleton-title {
    width: 120px;
    height: 20px;
  }

  .skeleton-description {
    width: 100%;
    height: 16px;
    margin-bottom: 15px;
  }

  .skeleton-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .skeleton-rating {
    width: 80px;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  .skeleton-price {
    width: 40px;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .no-tools {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }

  .no-tools-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  .no-tools h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  @media (max-width: 768px) {
    .related-tools {
      padding: 30px 20px;
    }

    .tools-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .section-header h2 {
      font-size: 1.6rem;
    }
  }
</style>