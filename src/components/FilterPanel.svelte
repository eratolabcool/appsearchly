<script lang="ts">
  import { searchFiltersStore, getCategories } from '../stores/apps';

  let filters = {
    platform: 'all',
    category: '',
    priceRange: 'all',
    minRating: undefined,
    sortBy: 'relevance'
  };

  const categories = getCategories();

  // Subscribe to filters store
  searchFiltersStore.subscribe(value => filters = value);

  const updateFilter = (filterName: string, value: any) => {
    filters = { ...filters, [filterName]: value };
    searchFiltersStore.set(filters);
  };

  const clearFilters = () => {
    filters = {
      platform: 'all',
      category: '',
      priceRange: 'all',
      minRating: undefined,
      sortBy: 'relevance'
    };
    searchFiltersStore.set(filters);
  };

  const ratingOptions = [
    { label: 'All Ratings', value: undefined },
    { label: '4+ Stars', value: 4 },
    { label: '3+ Stars', value: 3 },
    { label: '2+ Stars', value: 2 }
  ];

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Name: A to Z', value: 'name' }
  ];
</script>

<aside class="filter-panel">
  <div class="filter-header">
    <h3>Filters</h3>
    <button class="clear-filters" on:click={clearFilters}>
      Clear all
    </button>
  </div>

  <div class="filter-sections">
    <!-- Platform Filter -->
    <div class="filter-section">
      <h4>Platform</h4>
      <div class="radio-group">
        <label class="radio-option">
          <input
            type="radio"
            name="platform"
            bind:group={filters.platform}
            value="all"
            on:change={() => updateFilter('platform', 'all')}
          />
          <span class="radio-label">All Platforms</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="platform"
            bind:group={filters.platform}
            value="ios"
            on:change={() => updateFilter('platform', 'ios')}
          />
          <span class="radio-label">iOS</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="platform"
            bind:group={filters.platform}
            value="android"
            on:change={() => updateFilter('platform', 'android')}
          />
          <span class="radio-label">Android</span>
        </label>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="filter-section">
      <h4>Category</h4>
      <select
        class="select-input"
        bind:value={filters.category}
        on:change={() => updateFilter('category', filters.category)}
      >
        <option value="">All Categories</option>
        {#each categories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>

    <!-- Price Filter -->
    <div class="filter-section">
      <h4>Price</h4>
      <div class="radio-group">
        <label class="radio-option">
          <input
            type="radio"
            name="price"
            bind:group={filters.priceRange}
            value="all"
            on:change={() => updateFilter('priceRange', 'all')}
          />
          <span class="radio-label">All</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="price"
            bind:group={filters.priceRange}
            value="free"
            on:change={() => updateFilter('priceRange', 'free')}
          />
          <span class="radio-label">Free</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="price"
            bind:group={filters.priceRange}
            value="paid"
            on:change={() => updateFilter('priceRange', 'paid')}
          />
          <span class="radio-label">Paid</span>
        </label>
      </div>
    </div>

    <!-- Rating Filter -->
    <div class="filter-section">
      <h4>Rating</h4>
      <select
        class="select-input"
        bind:value={filters.minRating}
        on:change={() => updateFilter('minRating', filters.minRating)}
      >
        {#each ratingOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>

    <!-- Sort Filter -->
    <div class="filter-section">
      <h4>Sort by</h4>
      <select
        class="select-input"
        bind:value={filters.sortBy}
        on:change={() => updateFilter('sortBy', filters.sortBy)}
      >
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>
</aside>

<style lang="scss">
  .filter-panel {
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #d2d2d7;
    height: fit-content;
    position: sticky;
    top: 100px;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .filter-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .clear-filters {
    background: none;
    border: none;
    color: #007aff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 122, 255, 0.1);
    }
  }

  .filter-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .filter-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1d1d1f;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 0;
    border-radius: 6px;
    transition: background 0.2s ease;

    &:hover {
      background: #f5f5f7;
    }

    input[type="radio"] {
      margin-right: 12px;
      width: 16px;
      height: 16px;
      accent-color: #007aff;
    }

    .radio-label {
      font-size: 14px;
      color: #1d1d1f;
      user-select: none;
    }
  }

  .select-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d2d2d7;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #007aff;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }
  }

  @media (max-width: 768px) {
    .filter-panel {
      position: static;
      margin-bottom: 20px;
    }
  }
</style>