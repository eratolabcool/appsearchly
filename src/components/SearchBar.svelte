<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let searchQuery = '';
  let inputElement: HTMLInputElement;

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    dispatch('search', searchQuery);
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    dispatch('search', searchQuery);
  };

  const clearSearch = () => {
    searchQuery = '';
    inputElement?.focus();
    dispatch('search', '');
  };

  const dispatch = createEventDispatcher();
</script>

<form class="search-bar" on:submit={handleSubmit}>
  <div class="search-input-container">
    <div class="search-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" stroke="#86868b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <input
      bind:this={inputElement}
      type="text"
      bind:value={searchQuery}
      on:input={handleInput}
      placeholder="Search for apps, games, developers..."
      class="search-input"
      autocomplete="off"
    />

    {#if searchQuery}
      <button type="button" class="clear-button" on:click={clearSearch}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#86868b" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    {/if}
  </div>

  <button type="button" class="filter-button" on:click={() => dispatch('filter')}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="#86868b" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    Filter
  </button>
</form>

<style lang="scss">
  .search-bar {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .search-input-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
  }

  .search-input {
    width: 100%;
    height: 44px;
    padding: 0 44px 0 44px;
    border: 1px solid #d2d2d7;
    border-radius: 10px;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #007aff;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }

    &::placeholder {
      color: #86868b;
    }
  }

  .clear-button {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    padding: 4px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;

    &:hover {
      background: #f5f5f7;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .filter-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #d2d2d7;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #1d1d1f;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      background: #f5f5f7;
      border-color: #a1a1a6;
    }

    &:active {
      transform: scale(0.98);
      background: #e8e8ed;
    }

    svg {
      flex-shrink: 0;
    }
  }

  @media (max-width: 480px) {
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-button {
      justify-content: center;
    }
  }
</style>