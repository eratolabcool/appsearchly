
<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';

  let trendingApps = [];
  let loading = true;
  let selectedPeriod = 'today';
  let selectedCategory = 'all';

  const periods = [
    { id: 'today', label: 'Today', count: 142 },
    { id: 'week', label: 'This Week', count: 892 },
    { id: 'month', label: 'This Month', count: 3421 }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: '🌟' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'development', label: 'Development', icon: '💻' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎮' }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Trending', href: '/trending' }
  ];

  onMount(async () => {
    await loadTrendingApps();

    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Trending Apps - Discover Popular Apps & Software | App Search';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Trending Apps',
        description: 'Discover the most popular and trending apps and software. Daily updated rankings of mobile apps, desktop software, and productivity tools.',
        url: 'https://appsearchly.org/trending',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: trendingApps.length,
          itemListElement: trendingApps.map((app, index) => ({
            '@type': 'SoftwareApplication',
            position: index + 1,
            name: app.name,
            applicationCategory: app.category,
            operatingSystem: app.platform,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: app.rating,
              reviewCount: app.reviewCount
            }
          }))
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  async function loadTrendingApps() {
    loading = true;
    try {
      const response = await fetch(`/api/trending-apps?period=${selectedPeriod}&category=${selectedCategory}`);
      if (response.ok) {
        const apps = await response.json();
        trendingApps = apps;
      } else {
        trendingApps = getMockTrendingApps();
      }
    } catch (error) {
      console.error('Failed to load trending apps:', error);
      trendingApps = getMockTrendingApps();
    } finally {
      loading = false;
    }
  }

  function getMockTrendingApps() {
    return [
      {
        id: '1',
        name: 'ChatGPT',
        description: 'Advanced AI assistant for conversations, writing, and problem-solving.',
        icon: '🤖',
        rating: 4.8,
        reviewCount: 125000,
        price: 0,
        currency: 'USD',
        platform: 'multi',
        category: 'Productivity',
        trendingRank: 1,
        trendChange: '+15%',
        url: 'https://openai.com/chatgpt'
      },
      {
        id: '2',
        name: 'Notion',
        description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
        icon: '📝',
        rating: 4.8,
        reviewCount: 15000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        trendingRank: 2,
        trendChange: '+8%',
        url: 'https://notion.so'
      },
      {
        id: '3',
        name: 'Linear',
        description: 'Modern issue tracking for software teams with beautiful design.',
        icon: '🚀',
        rating: 4.9,
        reviewCount: 8500,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Development',
        trendingRank: 3,
        trendChange: '+22%',
        url: 'https://linear.app'
      },
      {
        id: '4',
        name: 'Figma',
        description: 'Collaborative interface design tool for teams.',
        icon: '🎨',
        rating: 4.9,
        reviewCount: 25000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        trendingRank: 4,
        trendChange: '+5%',
        url: 'https://figma.com'
      },
      {
        id: '5',
        name: 'Cursor',
        description: 'AI-powered code editor designed for pair programming with AI.',
        icon: '💻',
        rating: 4.7,
        reviewCount: 3200,
        price: 20,
        currency: 'USD',
        platform: 'desktop',
        category: 'Development',
        trendingRank: 5,
        trendChange: '+45%',
        url: 'https://cursor.sh'
      },
      {
        id: '6',
        name: 'Arc Browser',
        description: 'Innovative web browser with built-in productivity features.',
        icon: '🌐',
        rating: 4.6,
        reviewCount: 8900,
        price: 0,
        currency: 'USD',
        platform: 'desktop',
        category: 'Productivity',
        trendingRank: 6,
        trendChange: '+12%',
        url: 'https://arc.net'
      },
      {
        id: '7',
        name: 'Raycast',
        description: 'Productivity launcher for macOS that supercharges your workflow.',
        icon: '⚡',
        rating: 4.8,
        reviewCount: 6700,
        price: 0,
        currency: 'USD',
        platform: 'desktop',
        category: 'Productivity',
        trendingRank: 7,
        trendChange: '+18%',
        url: 'https://raycast.com'
      },
      {
        id: '8',
        name: 'Midjourney',
        description: 'AI art generator that creates stunning images from text descriptions.',
        icon: '🎭',
        rating: 4.7,
        reviewCount: 18900,
        price: 10,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        trendingRank: 8,
        trendChange: '+28%',
        url: 'https://midjourney.com'
      },
      {
        id: '9',
        name: 'Perplexity',
        description: 'AI-powered search engine with conversational answers.',
        icon: '🔍',
        rating: 4.6,
        reviewCount: 12400,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        trendingRank: 9,
        trendChange: '+35%',
        url: 'https://perplexity.ai'
      },
      {
        id: '10',
        name: 'Loom',
        description: 'Quick video messaging for screen recording and team communication.',
        icon: '📹',
        rating: 4.5,
        reviewCount: 9800,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        trendingRank: 10,
        trendChange: '+7%',
        url: 'https://loom.com'
      },
      {
        id: '11',
        name: 'Replit',
        description: 'Online IDE for collaborative coding and app deployment.',
        icon: '👨‍💻',
        rating: 4.7,
        reviewCount: 15200,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Development',
        trendingRank: 11,
        trendChange: '+11%',
        url: 'https://replit.com'
      },
      {
        id: '12',
        name: 'Canva',
        description: 'Graphic design platform for social media and marketing.',
        icon: '🎨',
        rating: 4.7,
        reviewCount: 32000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        trendingRank: 12,
        trendChange: '+3%',
        url: 'https://canva.com'
      }
    ];
  }

  function handlePeriodChange(period) {
    selectedPeriod = period;
    loadTrendingApps();
  }

  function handleCategoryChange(category) {
    selectedCategory = category;
    loadTrendingApps();
  }
</script>

<svelte:head>
  <title>Trending Apps - Discover Popular Apps & Software | App Search</title>
  <meta name="description" content="Discover the most popular and trending apps and software. Daily updated rankings of mobile apps, desktop software, and productivity tools." />
  <meta name="keywords" content="trending apps, popular apps, app rankings, top software, trending mobile apps, popular desktop software" />
</svelte:head>

<PageHeader
  title="Trending Apps & Software"
  subtitle="Discover the most popular apps gaining traction right now - updated daily with real-time trends"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="trending-page">
  <div class="container">
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-group">
        <h3>Time Period</h3>
        <div class="period-filters">
          {#each periods as period}
            <button
              class="period-button {selectedPeriod === period.id ? 'active' : ''}"
              on:click={() => handlePeriodChange(period.id)}
            >
              <span class="period-label">{period.label}</span>
              <span class="period-count">{period.count} apps</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="filter-group">
        <h3>Categories</h3>
        <div class="category-filters">
          {#each categories as category}
            <button
              class="category-button {selectedCategory === category.id ? 'active' : ''}"
              on:click={() => handleCategoryChange(category.id)}
            >
              <span class="category-icon">{category.icon}</span>
              <span class="category-label">{category.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Trending Stats -->
    <div class="trending-stats">
      <div class="stat-card">
        <div class="stat-number">1.2M+</div>
        <div class="stat-label">Daily Downloads</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">892</div>
        <div class="stat-label">Apps Tracked</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">24/7</div>
        <div class="stat-label">Real-time Updates</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">45%</div>
        <div class="stat-label">Avg. Growth Rate</div>
      </div>
    </div>

    <!-- Trending Apps List -->
    <div class="trending-content">
      <div class="section-header">
        <h2 class="section-title">
          <span class="trending-icon">🔥</span>
          Trending Rankings
        </h2>
        <p class="section-subtitle">
          Apps ranked by growth rate, user engagement, and download velocity
        </p>
      </div>

      {#if loading}
        <div class="loading-grid">
          {#each Array(12) as _, index}
            <div class="skeleton-card">
              <div class="skeleton-rank">#{index + 1}</div>
              <div class="skeleton-content">
                <div class="skeleton-icon"></div>
                <div class="skeleton-text skeleton-title"></div>
                <div class="skeleton-text skeleton-description"></div>
                <div class="skeleton-text skeleton-meta"></div>
              </div>
              <div class="skeleton-trend"></div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="trending-list">
          {#each trendingApps as app (app.id)}
            <div class="trending-item">
              <div class="trending-rank">
                <span class="rank-number">#{app.trendingRank}</span>
                {#if app.trendingRank <= 3}
                  <div class="rank-badge top-3">🏆</div>
                {/if}
              </div>

              <div class="app-info">
                <AppCard
                  {app}
                  compact={true}
                  on:select={() => console.log('App selected:', app.name)}
                />
              </div>

              <div class="trend-info">
                <div class="trend-change {app.trendChange.startsWith('+') ? 'positive' : 'negative'}">
                  <span class="trend-icon">
                    {app.trendChange.startsWith('+') ? '📈' : '📉'}
                  </span>
                  {app.trendChange}
                </div>
                <div class="trend-label">vs last period</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- SEO Content Section -->
    <div class="seo-content">
      <h2>Why Track Trending Apps with App Search?</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <h3>Real-time Analytics</h3>
          <p>Our trending algorithms update every hour to show you what's gaining momentum right now.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h3>Growth-focused Rankings</h3>
          <p>We prioritize apps showing significant growth, not just established popularity.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>Smart Filtering</h3>
          <p>Filter by time period and category to discover trends relevant to your needs.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📈</div>
          <h3>Trend Analysis</h3>
          <p>Understand why apps are trending with detailed growth metrics and insights.</p>
        </div>
      </div>

      <div class="trending-categories">
        <h3>Trending by Category</h3>
        <div class="category-trends">
          <div class="category-trend-item">
            <span class="trend-icon">🚀</span>
            <span class="trend-category">AI & Machine Learning</span>
            <span class="trend-count">145 apps</span>
          </div>
          <div class="category-trend-item">
            <span class="trend-icon">💼</span>
            <span class="trend-category">Remote Work Tools</span>
            <span class="trend-count">89 apps</span>
          </div>
          <div class="category-trend-item">
            <span class="trend-icon">🎨</span>
            <span class="trend-category">Creative Software</span>
            <span class="trend-count">67 apps</span>
          </div>
          <div class="category-trend-item">
            <span class="trend-icon">📱</span>
            <span class="trend-category">Mobile Productivity</span>
            <span class="trend-count">123 apps</span>
          </div>
          <div class="category-trend-item">
            <span class="trend-icon">🔒</span>
            <span class="trend-category">Privacy & Security</span>
            <span class="trend-count">45 apps</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .trending-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Filters Section */
  .filters-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 40px;
    margin-bottom: 40px;
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .filter-group h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .period-filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .period-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .period-button:hover {
    border-color: var(--primary-color);
  }

  .period-button.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .period-label {
    font-weight: 500;
  }

  .period-count {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .category-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .category-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .category-button:hover {
    border-color: var(--primary-color);
  }

  .category-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

  .category-icon {
    font-size: 1rem;
  }

  /* Trending Stats */
  .trending-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: 4px;
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Trending Content */
  .trending-content {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .trending-icon {
    font-size: 1.8rem;
  }

  .section-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
  }

  /* Loading Skeleton */
  .loading-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skeleton-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .skeleton-rank {
    width: 60px;
    height: 24px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
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
  }

  .skeleton-title {
    width: 120px;
    height: 18px;
  }

  .skeleton-description {
    width: 200px;
  }

  .skeleton-meta {
    width: 80px;
  }

  .skeleton-trend {
    width: 80px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 6px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Trending List */
  .trending-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .trending-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: var(--light-bg);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .trending-item:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .trending-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
  }

  .rank-number {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .rank-badge {
    margin-top: 4px;
    font-size: 1rem;
  }

  .app-info {
    flex: 1;
  }

  .trend-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
  }

  .trend-change {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 6px 12px;
    border-radius: 20px;
    margin-bottom: 4px;
  }

  .trend-change.positive {
    background: rgba(16, 185, 129, 0.1);
    color: var(--secondary-color);
  }

  .trend-change.negative {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .trend-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
  }

  /* SEO Content */
  .seo-content {
    background: white;
    border-radius: 16px;
    padding: 60px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .seo-content h2 {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 40px;
    color: var(--text-primary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-bottom: 50px;
  }

  .feature-item {
    text-align: center;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
  }

  .feature-item h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .feature-item p {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .trending-categories {
    margin-top: 40px;
  }

  .trending-categories h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .category-trends {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .category-trend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--light-bg);
    border-radius: 10px;
  }

  .trend-category {
    flex: 1;
    font-weight: 500;
    color: var(--text-primary);
  }

  .trend-count {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .filters-section {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .trending-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .trending-page {
      padding: 40px 0;
    }

    .filters-section {
      padding: 20px;
    }

    .category-filters {
      grid-template-columns: repeat(2, 1fr);
    }

    .trending-stats {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .trending-content {
      padding: 30px 20px;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .trending-item {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .app-info {
      width: 100%;
    }

    .seo-content {
      padding: 40px 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .category-trends {
      grid-template-columns: 1fr;
    }
  }
</style>