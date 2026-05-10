
<script lang="ts">
  export let items: Array<{ label: string; href?: string }> = [];

  // Check if running on client side
  import { browser } from '$app/environment';
</script>

<nav class="breadcrumb" aria-label="Breadcrumb navigation">
  <div class="container">
    <ol class="breadcrumb-list">
      {#each items as item, index}
        <li class="breadcrumb-item">
          {#if item.href && index < items.length - 1}
            <a href={item.href} class="breadcrumb-link">{item.label}</a>
          {:else}
            <span class="breadcrumb-current" aria-current="page">{item.label}</span>
          {/if}
        </li>
        {#if index < items.length - 1}
          <li class="breadcrumb-separator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </li>
        {/if}
      {/each}
    </ol>
  </div>
</nav>

<style>
  .breadcrumb {
    padding: 20px 0;
    margin-bottom: 30px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.9rem;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
  }

  .breadcrumb-link {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;
    font-weight: 500;
  }

  .breadcrumb-link:hover {
    color: var(--primary-color);
  }

  .breadcrumb-current {
    color: var(--text-primary);
    font-weight: 600;
  }

  .breadcrumb-separator {
    margin: 0 8px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
  }

  .breadcrumb-separator svg {
    width: 12px;
    height: 12px;
  }

  @media (max-width: 768px) {
    .breadcrumb {
      padding: 15px 0;
      margin-bottom: 20px;
    }

    .breadcrumb-list {
      font-size: 0.85rem;
    }

    .breadcrumb-separator {
      margin: 0 6px;
    }
  }
</style>