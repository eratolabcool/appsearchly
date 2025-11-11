<script lang="ts">
  import { onMount } from 'svelte';
  import { searchQueryStore, searchApps, isLoadingStore, searchFiltersStore, filteredAppsStore } from '../stores/apps';
  import SearchBar from './SearchBar.svelte';
  import FilterPanel from './FilterPanel.svelte';
  import AppGrid from './AppGrid.svelte';
  import AppDetail from './AppDetail.svelte';
  import AnalyticsDashboard from './AnalyticsDashboard.svelte';

  let searchQuery = '';
  let isLoading = false;
  let filteredApps = [];
  let showFilters = false;
  let selectedApp = null;

  // Subscribe to stores
  searchQueryStore.subscribe(value => searchQuery = value);
  isLoadingStore.subscribe(value => isLoading = value);
  filteredAppsStore.subscribe(value => filteredApps = value);

  let debounceTimer;

  const handleSearch = (query: string) => {
    searchQueryStore.set(query);

    // Debounce search
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchApps(query);
    }, 300);
  };

  const toggleFilters = () => {
    showFilters = !showFilters;
  };

  const selectApp = (app) => {
    selectedApp = app;
  };

  const closeDetail = () => {
    selectedApp = null;
  };

  // Initial search on mount
  onMount(() => {
    searchApps('');
  });
</script>

<div class="app-search">
  <!-- Header with Search -->
  <header class="search-header">
    <div class="container">
      <h1 class="app-title">App Search</h1>
      <SearchBar
        {searchQuery}
        on:search={(e) => handleSearch(e.detail)}
        on:filter={toggleFilters}
      />
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <div class="content-layout">
        <!-- Filter Panel -->
        {#if showFilters}
          <aside class="filter-sidebar">
            <FilterPanel />
          </aside>
        {/if}

        <!-- Results Section -->
        <section class="results-section">
          <!-- Results Header -->
          <div class="results-header">
            <h2 class="results-title">
              {searchQuery ? `Results for "${searchQuery}"` : 'Popular Apps'}
              <span class="results-count">({filteredApps.length})</span>
            </h2>

            <div class="view-options">
              <button class="filter-toggle" on:click={toggleFilters}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          <!-- Loading State -->
          {#if isLoading}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Searching apps...</p>
            </div>
          {:else if filteredApps.length === 0}
            <div class="empty-state">
              <h3>No apps found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          {:else}
            <!-- App Grid -->
            <AppGrid {filteredApps} on:select={(e) => selectApp(e.detail)} />
          {/if}
        </section>
      </div>
    </div>
  </main>

  <!-- App Detail Modal -->
  {#if selectedApp}
    <div
      class="modal-overlay"
      on:click={closeDetail}
      on:keydown={(e) => {
        if (e.key === 'Escape') {
          closeDetail();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-detail-title"
    >
      <div class="modal-content" on:click|stopPropagation>
        <AppDetail app={selectedApp} on:close={closeDetail} />
      </div>
    </div>
  {/if}
</div>

<style>

  .app-search {
    min-height: 100vh;
    background: #f5f5f7;
  }

  .search-header {
    background: white;
    border-bottom: 1px solid #d2d2d7;
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .app-title {
    font-size: 28px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 16px 0;
    text-align: center;

    @media (min-width: 640px) {
      text-align: left;
    }
  }

  .main-content {
    padding: 24px 0;
  }

  .content-layout {
    display: flex;
    gap: 24px;
    flex-direction: column;

    @media (min-width: 768px) {
      flex-direction: row;
    }
  }

  .filter-sidebar {
    width: 100%;
    flex-shrink: 0;

    @media (min-width: 768px) {
      width: 280px;
    }
  }

  .results-section {
    flex: 1;
    min-width: 0;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .results-title {
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
  }

  .results-count {
    font-weight: 400;
    color: #86868b;
    font-size: 16px;
  }

  .view-options {
    display: flex;
    gap: 12px;
  }

  .filter-toggle {
    background: #007aff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #0056cc;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-state h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 8px 0;
  }

  .empty-state p {
    color: #86868b;
    margin: 0;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    position: relative;
  }

  @media (min-width: 640px) {
    .app-title {
      font-size: 32px;
    }

    .results-title {
      font-size: 24px;
    }
  }
</style>