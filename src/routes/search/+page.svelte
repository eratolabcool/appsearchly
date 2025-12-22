<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';

  let searchQuery = '';
  let searchResults = [];
  let loading = false;
  let searchPerformed = false;
  let selectedCategory = 'all';
  let selectedPlatform = 'all';
  let priceFilter = 'all';

  // 从URL参数获取搜索查询
  $: initialQuery = $page.url.searchParams.get('q') || '';

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'design', label: 'Design' },
    { id: 'development', label: 'Development' },
    { id: 'business', label: 'Business' },
    { id: 'education', label: 'Education' },
    { id: 'utilities', label: 'Utilities' }
  ];

  const platforms = [
    { id: 'all', label: 'All Platforms' },
    { id: 'web', label: 'Web' },
    { id: 'desktop', label: 'Desktop' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'ios', label: 'iOS' },
    { id: 'android', label: 'Android' }
  ];

  const priceOptions = [
    { id: 'all', label: 'All Prices' },
    { id: 'free', label: 'Free Only' },
    { id: 'paid', label: 'Paid Only' },
    { id: 'under10', label: 'Under $10' },
    { id: '10to50', label: '$10 - $50' },
    { id: 'over50', label: 'Over $50' }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' }
  ];

  const trendingSearches = [
    'AI productivity tools',
    'video editing apps',
    'project management software',
    'note taking apps',
    'design tools for beginners',
    'password managers',
    'time tracking apps',
    'collaboration tools',
    'mobile app development',
    'graphic design software'
  ];

  onMount(() => {
    if (initialQuery) {
      searchQuery = initialQuery;
      performSearch();
    }
  });

  async function performSearch() {
    if (!searchQuery.trim()) return;

    loading = true;
    searchPerformed = true;

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: selectedCategory,
        platform: selectedPlatform,
        price: priceFilter
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        searchResults = data.results;
      } else {
        searchResults = getMockSearchResults();
      }
    } catch (error) {
      console.error('Search failed:', error);
      searchResults = getMockSearchResults();
    } finally {
      loading = false;
    }
  }

  function getMockSearchResults() {
    const queryLower = searchQuery.toLowerCase();
    const mockApps = [
      {
        id: '1',
        name: 'Notion',
        description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
        icon: '📝',
        rating: 4.8,
        reviewCount: 15000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://notion.so',
        relevanceScore: queryLower.includes('note') || queryLower.includes('productivity') ? 95 : 85
      },
      {
        id: '2',
        name: 'Figma',
        description: 'Collaborative interface design tool for teams.',
        icon: '🎨',
        rating: 4.9,
        reviewCount: 25000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        url: 'https://figma.com',
        relevanceScore: queryLower.includes('design') || queryLower.includes('ui') ? 95 : 75
      },
      {
        id: '3',
        name: 'Linear',
        description: 'Modern issue tracking for software teams.',
        icon: '🚀',
        rating: 4.9,
        reviewCount: 8500,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Development',
        url: 'https://linear.app',
        relevanceScore: queryLower.includes('project') || queryLower.includes('issue') ? 90 : 70
      },
      {
        id: '4',
        name: 'Canva',
        description: 'Graphic design platform for social media and marketing.',
        icon: '🎨',
        rating: 4.7,
        reviewCount: 32000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        url: 'https://canva.com',
        relevanceScore: queryLower.includes('design') || queryLower.includes('graphic') ? 92 : 78
      },
      {
        id: '5',
        name: 'Slack',
        description: 'Team communication and collaboration platform.',
        icon: '💬',
        rating: 4.3,
        reviewCount: 45000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://slack.com',
        relevanceScore: queryLower.includes('team') || queryLower.includes('chat') ? 88 : 72
      },
      {
        id: '6',
        name: 'Zoom',
        description: 'Video conferencing and online meetings.',
        icon: '📹',
        rating: 4.5,
        reviewCount: 28000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://zoom.us',
        relevanceScore: queryLower.includes('video') || queryLower.includes('meeting') ? 93 : 68
      },
      {
        id: '7',
        name: 'Trello',
        description: 'Visual project management with boards and cards.',
        icon: '📌',
        rating: 4.4,
        reviewCount: 18000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://trello.com',
        relevanceScore: queryLower.includes('project') || queryLower.includes('kanban') ? 87 : 65
      },
      {
        id: '8',
        name: '1Password',
        description: 'Secure password manager and digital wallet.',
        icon: '🔐',
        rating: 4.6,
        reviewCount: 12000,
        price: 2.99,
        currency: 'USD',
        platform: 'desktop',
        category: 'Utilities',
        url: 'https://1password.com',
        relevanceScore: queryLower.includes('password') || queryLower.includes('security') ? 96 : 60
      }
    ];

    // Filter based on search query relevance
    return mockApps.filter(app => app.relevanceScore > 60)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  function handleSearch() {
    // Update URL with search parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('q', searchQuery);
      window.history.pushState({}, '', url.toString());
    }
    performSearch();
  }

  function handleFilterChange() {
    if (searchPerformed) {
      performSearch();
    }
  }

  function handleTrendingClick(term) {
    searchQuery = term;
    handleSearch();
  }
</script>

<svelte:head>
  <title>Search Apps & Software | App Search</title>
  <meta name="description" content="Search thousands of apps and software with Appsearchly. Find the perfect tools for your needs with advanced filters and expert reviews." />
  <meta name="keywords" content="app search, software search, find apps, app discovery, software finder" />
</svelte:head>

<PageHeader
  title="Search Apps & Software"
  subtitle="Find the perfect apps and software for your needs from thousands of options"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="search-page">
  <div class="container">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search for apps, software, or features..."
            bind:value={searchQuery}
            on:keypress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button class="search-button" on:click={handleSearch}>
            Search
          </button>
        </div>

        <!-- Filters -->
        <div class="search-filters">
          <div class="filter-group">
            <label>Category</label>
            <select bind:value={selectedCategory} on:change={handleFilterChange}>
              {#each categories as category}
                <option value={category.id}>{category.label}</option>
              {/each}
            </select>
          </div>

          <div class="filter-group">
            <label>Platform</label>
            <select bind:value={selectedPlatform} on:change={handleFilterChange}>
              {#each platforms as platform}
                <option value={platform.id}>{platform.label}</option>
              {/each}
            </select>
          </div>

          <div class="filter-group">
            <label>Price</label>
            <select bind:value={priceFilter} on:change={handleFilterChange}>
              {#each priceOptions as option}
                <option value={option.id}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Trending Searches -->
    <div class="trending-section" class:visible={!searchPerformed}>
      <h3>🔥 Trending Searches</h3>
      <div class="trending-tags">
        {#each trendingSearches as term}
          <button class="trending-tag" on:click={() => handleTrendingClick(term)}>
            {term}
          </button>
        {/each}
      </div>
    </div>

    <!-- Search Results -->
    {#if searchPerformed}
      <div class="results-section">
        <div class="results-header">
          <h2>Search Results</h2>
          {#if searchQuery}
            <p class="results-count">
              Found {searchResults.length} apps for "{searchQuery}"
            </p>
          {/if}
        </div>

        {#if loading}
          <div class="loading-grid">
            {#each Array(6) as _}
              <div class="skeleton-card">
                <div class="skeleton-header">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-rating"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if searchResults.length > 0}
          <div class="results-grid">
            {#each searchResults as app (app.id)}
              <div class="result-item">
                <AppCard
                  {app}
                  on:select={() => console.log('App selected:', app.name)}
                />
                <div class="relevance-score">
                  {Math.round(app.relevanceScore)}% match
                </div>
              </div>
            {/each}
          </div>

          <div class="load-more-section">
            <button class="load-more-button">
              Load More Results
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        {:else}
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try different keywords or adjust your filters</p>
            <div class="search-suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Check your spelling</li>
                <li>Try more general terms</li>
                <li>Adjust category or platform filters</li>
                <li>Browse our categories instead</li>
              </ul>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Popular Categories -->
    <div class="categories-section">
      <h3>📂 Browse by Category</h3>
      <div class="categories-grid">
        <a href="/category/productivity" class="category-card">
          <div class="category-icon">⚡</div>
          <div class="category-info">
            <h4>Productivity</h4>
            <p>3,456 apps</p>
          </div>
        </a>
        <a href="/category/design-creative" class="category-card">
          <div class="category-icon">🎨</div>
          <div class="category-info">
            <h4>Design & Creative</h4>
            <p>1,654 apps</p>
          </div>
        </a>
        <a href="/category/development-tools" class="category-card">
          <div class="category-icon">💻</div>
          <div class="category-info">
            <h4>Development Tools</h4>
            <p>2,109 apps</p>
          </div>
        </a>
        <a href="/category/business" class="category-card">
          <div class="category-icon">💼</div>
          <div class="category-info">
            <h4>Business</h4>
            <p>1,932 apps</p>
          </div>
        </a>
        <a href="/category/education" class="category-card">
          <div class="category-icon">📚</div>
          <div class="category-info">
            <h4>Education</h4>
            <p>2,847 apps</p>
          </div>
        </a>
        <a href="/category/utilities" class="category-card">
          <div class="category-icon">🛠️</div>
          <div class="category-info">
            <h4>Utilities</h4>
            <p>1,287 apps</p>
          </div>
        </a>
      </div>
    </div>

    <!-- Search Tips -->
    <div class="search-tips">
      <h3>💡 Search Tips</h3>
      <div class="tips-grid">
        <div class="tip-item">
          <h4>Be Specific</h4>
          <p>Use specific terms like "video editing" instead of just "editor"</p>
        </div>
        <div class="tip-item">
          <h4>Use Filters</h4>
          <p>Narrow down results by category, platform, and price</p>
        </div>
        <div class="tip-item">
          <h4>Check Alternatives</h4>
          <p>Try searching for alternatives to specific apps you know</p>
        </div>
        <div class="tip-item">
          <h4>Explore Features</h4>
          <p>Search for specific features like "real-time collaboration"</p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .search-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Search Section */
  .search-section {
    background: white;
    border-radius: 20px;
    padding: 50px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 40px;
  }

  .search-container {
    max-width: 900px;
    margin: 0 auto;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: var(--light-bg);
    border-radius: 25px;
    padding: 8px;
    margin-bottom: 30px;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;
  }

  .search-box:focus-within {
    border-color: var(--primary-color);
  }

  .search-icon {
    margin-left: 20px;
    color: var(--text-secondary);
  }

  .search-box input {
    flex: 1;
    padding: 16px 20px;
    border: none;
    background: transparent;
    outline: none;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .search-box input::placeholder {
    color: var(--text-secondary);
  }

  .search-button {
    padding: 16px 32px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 8px;
  }

  .search-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  /* Filters */
  .search-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .filter-group select {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    background: white;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .filter-group select:focus {
    border-color: var(--primary-color);
  }

  /* Trending Searches */
  .trending-section {
    text-align: center;
    margin-bottom: 40px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .trending-section.visible {
    opacity: 1;
  }

  .trending-section h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .trending-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .trending-tag {
    padding: 8px 16px;
    background: var(--light-bg);
    border: none;
    border-radius: 15px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .trending-tag:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
  }

  /* Results Section */
  .results-section {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .results-header {
    margin-bottom: 30px;
  }

  .results-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .results-count {
    color: var(--text-secondary);
    font-size: 1rem;
  }

  /* Results Grid */
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
  }

  .result-item {
    position: relative;
  }

  .relevance-score {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--gradient-primary);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 1;
  }

  /* Loading Skeleton */
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
  }

  .skeleton-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 25px;
  }

  .skeleton-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .skeleton-icon {
    width: 48px;
    height: 48px;
    background: #e2e8f0;
    border-radius: 8px;
    animation: pulse 2s infinite;
  }

  .skeleton-content {
    flex: 1;
  }

  .skeleton-title {
    width: 150px;
    height: 20px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
    margin-bottom: 8px;
  }

  .skeleton-text {
    width: 100%;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
    margin-bottom: 8px;
  }

  .skeleton-rating {
    width: 80px;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* No Results */
  .no-results {
    text-align: center;
    padding: 60px 20px;
  }

  .no-results-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .no-results h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 10px;
  }

  .no-results p {
    color: var(--text-secondary);
    margin-bottom: 30px;
  }

  .search-suggestions {
    background: var(--light-bg);
    padding: 25px;
    border-radius: 12px;
    text-align: left;
    max-width: 400px;
    margin: 0 auto;
  }

  .search-suggestions h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .search-suggestions ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .search-suggestions li {
    padding: 6px 0;
    color: var(--text-secondary);
    position: relative;
    padding-left: 16px;
  }

  .search-suggestions li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-color);
  }

  /* Categories Section */
  .categories-section {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .categories-section h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 30px;
    text-align: center;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .category-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: var(--light-bg);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .category-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .category-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .category-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  /* Search Tips */
  .search-tips {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 16px;
    padding: 50px;
    color: white;
    text-align: center;
  }

  .search-tips h3 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 40px;
  }

  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }

  .tip-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 25px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .tip-item h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .tip-item p {
    margin: 0;
    opacity: 0.9;
    line-height: 1.4;
  }

  /* Load More */
  .load-more-section {
    text-align: center;
  }

  .load-more-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: var(--gradient-secondary);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .load-more-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .search-page {
      padding: 40px 0;
    }

    .search-section {
      padding: 30px 20px;
    }

    .search-box {
      flex-direction: column;
      gap: 15px;
      padding: 15px;
    }

    .search-box input {
      padding: 14px 16px;
      text-align: center;
    }

    .search-button {
      width: 100%;
      margin: 0;
    }

    .search-filters {
      grid-template-columns: 1fr;
    }

    .results-section,
    .categories-section {
      padding: 30px 20px;
    }

    .results-grid,
    .categories-grid {
      grid-template-columns: 1fr;
    }

    .search-tips {
      padding: 40px 20px;
    }

    .tips-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>