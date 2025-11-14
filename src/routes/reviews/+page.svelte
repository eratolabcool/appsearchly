<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';

  let reviews = [];
  let loading = true;
  let selectedCategory = 'all';
  let sortBy = 'latest';
  let searchTerm = '';

  const categories = [
    { id: 'all', label: 'All Reviews', icon: '⭐' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'development', label: 'Development', icon: '💻' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎮' }
  ];

  const sortOptions = [
    { id: 'latest', label: 'Latest Reviews' },
    { id: 'highest', label: 'Highest Rated' },
    { id: 'most-helpful', label: 'Most Helpful' },
    { id: 'popular', label: 'Popular Apps' }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Reviews', href: '/reviews' }
  ];

  onMount(async () => {
    await loadReviews();

    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'App Reviews - Expert Reviews & User Ratings | Appsearchly.org';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'App Reviews',
        description: 'Expert reviews and user ratings for the best apps and software. Read detailed analysis to make informed decisions.',
        url: 'https://appsearchly.org/reviews',
        mainEntity: reviews.map(review => ({
          '@type': 'Review',
          itemReviewed: {
            '@type': 'SoftwareApplication',
            name: review.appName,
            applicationCategory: review.category
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5
          },
          author: {
            '@type': 'Person',
            name: review.author
          },
          reviewBody: review.content
        }))
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  async function loadReviews() {
    loading = true;
    try {
      const response = await fetch(`/api/reviews?category=${selectedCategory}&sort=${sortBy}`);
      if (response.ok) {
        const reviewsData = await response.json();
        reviews = reviewsData;
      } else {
        reviews = getMockReviews();
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      reviews = getMockReviews();
    } finally {
      loading = false;
    }
  }

  function getMockReviews() {
    return [
      {
        id: '1',
        appName: 'Notion',
        appIcon: '📝',
        appUrl: 'https://notion.so',
        category: 'Productivity',
        author: 'Sarah Chen',
        authorAvatar: '👩‍💼',
        rating: 5,
        title: 'The Ultimate All-in-One Workspace',
        content: 'Notion has completely transformed how I organize my work and personal life. The flexibility of combining notes, tasks, databases, and wikis in one platform is incredible. What sets it apart is the template system and the ability to create custom workflows. The collaboration features are top-notch, making it perfect for team projects. While it might seem overwhelming at first, the learning curve is worth it for the productivity gains.',
        pros: ['Highly customizable', 'Excellent collaboration', 'Versatile functionality', 'Great mobile apps', 'Affordable pricing'],
        cons: ['Can be overwhelming for beginners', 'Offline mode limited', 'Performance can lag with large databases'],
        helpfulCount: 245,
        verified: true,
        date: '2024-01-15',
        images: []
      },
      {
        id: '2',
        appName: 'Figma',
        appIcon: '🎨',
        appUrl: 'https://figma.com',
        category: 'Design',
        author: 'Alex Rivera',
        authorAvatar: '👨‍🎨',
        rating: 4.5,
        title: 'Game-Changer for Collaborative Design',
        content: 'As a UI/UX designer, Figma has become my go-to tool. The real-time collaboration features are unmatched - I can work with my team simultaneously on the same design file. The component system and auto layout features have streamlined my workflow significantly. The web-based nature means I can work from any device. The free tier is generous for individual use, and the plugin ecosystem extends functionality.',
        pros: ['Excellent real-time collaboration', 'Powerful design tools', 'Great for teams', 'Web-based', 'Strong plugin ecosystem'],
        cons: ['Can be resource-intensive', 'Limited offline capabilities', 'Learning curve for advanced features'],
        helpfulCount: 189,
        verified: true,
        date: '2024-01-12',
        images: []
      },
      {
        id: '3',
        appName: 'Linear',
        appIcon: '🚀',
        appUrl: 'https://linear.app',
        category: 'Development',
        author: 'Marcus Johnson',
        authorAvatar: '👨‍💻',
        rating: 4.8,
        title: 'The Modern Project Management Tool',
        content: 'Linear has redefined how our development team manages projects. The clean interface and powerful keyboard shortcuts make it incredibly efficient. The issue tracking is intuitive, and the integration with GitHub is seamless. What I love most is the focus on speed - everything is optimized for quick navigation and updates. The automation features have reduced our manual work significantly.',
        pros: ['Blazing fast performance', 'Beautiful UI', 'Excellent keyboard shortcuts', 'Great integrations', 'Powerful automation'],
        cons: ['Can be expensive for small teams', 'Limited customization', 'Mobile app still developing'],
        helpfulCount: 156,
        verified: true,
        date: '2024-01-10',
        images: []
      },
      {
        id: '4',
        appName: 'Arc Browser',
        appIcon: '🌐',
        appUrl: 'https://arc.net',
        category: 'Productivity',
        author: 'Emma Watson',
        authorAvatar: '👩‍💻',
        rating: 4.6,
        title: 'A Fresh Take on Web Browsing',
        content: 'Arc Browser brings innovative thinking to something we use daily - web browsing. The sidebar organization, split-screen views, and built-in notes make it perfect for research and productivity. The design is beautiful and thoughtful. While still macOS-only, it\'s worth the platform lock-in. The frequent updates show the team is actively improving based on user feedback.',
        pros: ['Innovative features', 'Beautiful design', 'Built-in productivity tools', 'Great for research', 'Active development'],
        cons: ['macOS only', 'Learning curve for power users', 'Some websites may have compatibility issues'],
        helpfulCount: 203,
        verified: false,
        date: '2024-01-08',
        images: []
      },
      {
        id: '5',
        appName: 'Raycast',
        appIcon: '⚡',
        appUrl: 'https://raycast.com',
        category: 'Productivity',
        author: 'David Kim',
        authorAvatar: '👨‍💼',
        rating: 4.9,
        title: 'Essential Mac Productivity Tool',
        content: 'Raycast has become indispensable to my daily workflow. As an Alfred replacement, it offers a modern interface and incredible extensibility through plugins. The ability to search, open apps, manage clipboard history, and integrate with various services from one spot is amazing. The command palette approach is intuitive, and the performance is lightning fast.',
        pros: ['Extremely fast', 'Rich plugin ecosystem', 'Beautiful UI', 'Great clipboard management', 'Customizable'],
        cons: ['macOS only', 'Some features require Pro subscription', 'Can be resource-heavy with many plugins'],
        helpfulCount: 178,
        verified: true,
        date: '2024-01-05',
        images: []
      },
      {
        id: '6',
        appName: 'Canva',
        appIcon: '🎨',
        appUrl: 'https://canva.com',
        category: 'Design',
        author: 'Lisa Thompson',
        authorAvatar: '👩‍🎨',
        rating: 4.4,
        title: 'Design Made Accessible for Everyone',
        content: 'Canva has democratized design for non-designers. The template library is extensive and covers everything from social media posts to presentations. The drag-and-drop interface is intuitive, and the AI features help create professional designs quickly. While professionals might find it limiting, it\'s perfect for small businesses, marketers, and casual users who need quick, polished designs.',
        pros: ['Easy to use', 'Huge template library', 'AI design features', 'Affordable', 'Great for social media'],
        cons: ['Limited advanced features', 'Can be slow with large files', 'Subscription needed for best features'],
        helpfulCount: 267,
        verified: true,
        date: '2024-01-03',
        images: []
      }
    ];
  }

  function handleCategoryChange(category) {
    selectedCategory = category;
    loadReviews();
  }

  function handleSortChange(sort) {
    sortBy = sort;
    loadReviews();
  }

  function handleSearch() {
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm + ' reviews')}`;
    }
  }

  function handleHelpful(reviewId) {
    // Simulate marking review as helpful
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpfulCount++;
    }
  }
</script>

<svelte:head>
  <title>App Reviews - Expert Reviews & User Ratings | Appsearchly.org</title>
  <meta name="description" content="Read expert reviews and user ratings for the best apps and software. Get detailed analysis, pros and cons, and make informed decisions." />
  <meta name="keywords" content="app reviews, software reviews, user ratings, app ratings, expert analysis, app recommendations" />
</svelte:head>

<PageHeader
  title="App Reviews & Ratings"
  subtitle="Read expert reviews and user ratings to make informed decisions about the best apps and software for your needs"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="reviews-page">
  <div class="container">
    <!-- Search and Filters Section -->
    <div class="filters-section">
      <div class="search-container">
        <h3>Search Reviews</h3>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search for app reviews..."
            bind:value={searchTerm}
            on:keypress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button class="search-button" on:click={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="filter-controls">
        <div class="filter-group">
          <h4>Category</h4>
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

        <div class="filter-group">
          <h4>Sort By</h4>
          <div class="sort-options">
            {#each sortOptions as option}
              <button
                class="sort-button {sortBy === option.id ? 'active' : ''}"
                on:click={() => handleSortChange(option.id)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews Stats -->
    <div class="reviews-stats">
      <div class="stat-card">
        <div class="stat-number">15,234</div>
        <div class="stat-label">Total Reviews</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">4.6</div>
        <div class="stat-label">Average Rating</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">2,847</div>
        <div class="stat-label">Apps Reviewed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">89%</div>
        <div class="stat-label">Verified Users</div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-content">
      <div class="section-header">
        <h2>Latest Reviews</h2>
        <p>Expert analysis and user experiences from our community</p>
      </div>

      {#if loading}
        <div class="loading-reviews">
          {#each Array(4) as _}
            <div class="skeleton-review">
              <div class="skeleton-header">
                <div class="skeleton-app-info">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-text skeleton-title"></div>
                </div>
                <div class="skeleton-author">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-text skeleton-name"></div>
                </div>
              </div>
              <div class="skeleton-rating"></div>
              <div class="skeleton-content">
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="reviews-list">
          {#each reviews as review (review.id)}
            <div class="review-card">
              <!-- Review Header -->
              <div class="review-header">
                <div class="app-info">
                  <div class="app-icon">{review.appIcon}</div>
                  <div class="app-details">
                    <h3 class="app-name">{review.appName}</h3>
                    <span class="review-category">{review.category}</span>
                  </div>
                </div>

                <div class="review-meta">
                  <div class="author-info">
                    <span class="author-avatar">{review.authorAvatar}</span>
                    <div class="author-details">
                      <div class="author-name">
                        {review.author}
                        {#if review.verified}
                          <span class="verified-badge">✓ Verified</span>
                        {/if}
                      </div>
                      <div class="review-date">{review.date}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Review Content -->
              <div class="review-content">
                <h4 class="review-title">{review.title}</h4>

                <div class="rating-stars">
                  {#each Array(5) as _, i}
                    <span class="star {i < review.rating ? 'filled' : ''}">★</span>
                  {/each}
                  <span class="rating-number">{review.rating}/5</span>
                </div>

                <p class="review-text">{review.content}</p>

                <!-- Pros and Cons -->
                <div class="pros-cons">
                  <div class="pros-section">
                    <h5>✅ Pros</h5>
                    <ul>
                      {#each review.pros as pro}
                        <li>{pro}</li>
                      {/each}
                    </ul>
                  </div>

                  <div class="cons-section">
                    <h5>❌ Cons</h5>
                    <ul>
                      {#each review.cons as con}
                        <li>{con}</li>
                      {/each}
                    </ul>
                  </div>
                </div>

                <!-- Review Actions -->
                <div class="review-actions">
                  <button class="helpful-button" on:click={() => handleHelpful(review.id)}>
                    <span class="thumb-icon">👍</span>
                    Helpful ({review.helpfulCount})
                  </button>
                  <button class="share-button">
                    <span class="share-icon">🔗</span>
                    Share
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Load More -->
      <div class="load-more-section">
        <button class="load-more-button">
          Load More Reviews
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- SEO Content Section -->
    <div class="seo-content">
      <h2>Why Trust Appsearchly.org Reviews?</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">👥</div>
          <h3>Real User Experiences</h3>
          <p>Our reviews come from actual users who have extensively tested each app in real-world scenarios.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>In-depth Analysis</h3>
          <p>We go beyond surface-level features to test performance, usability, and long-term value.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⚖️</div>
          <h3>Balanced Perspectives</h3>
          <p>Every review includes both pros and cons to help you make informed decisions.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔄</div>
          <h3>Regular Updates</h3>
          <p>Reviews are updated regularly to reflect current app versions and user experiences.</p>
        </div>
      </div>

      <div class="review-categories">
        <h3>Reviews by Category</h3>
        <div class="category-stats">
          <div class="category-stat">
            <span class="category-icon">⚡</span>
            <span class="category-info">
              <div class="category-name">Productivity</div>
              <div class="category-count">3,245 reviews</div>
            </span>
          </div>
          <div class="category-stat">
            <span class="category-icon">🎨</span>
            <span class="category-info">
              <div class="category-name">Design</div>
              <div class="category-count">2,156 reviews</div>
            </span>
          </div>
          <div class="category-stat">
            <span class="category-icon">💻</span>
            <span class="category-info">
              <div class="category-name">Development</div>
              <div class="category-count">1,892 reviews</div>
            </span>
          </div>
          <div class="category-stat">
            <span class="category-icon">💼</span>
            <span class="category-info">
              <div class="category-name">Business</div>
              <div class="category-count">1,567 reviews</div>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .reviews-page {
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

  .search-container h3,
  .filter-group h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: var(--light-bg);
    border-radius: 25px;
    padding: 4px;
  }

  .search-box input {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.95rem;
  }

  .search-button {
    padding: 12px 16px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  }

  .search-button:hover {
    transform: scale(1.05);
  }

  .filter-controls {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .category-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }

  .category-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
  }

  .category-button:hover {
    border-color: var(--primary-color);
  }

  .category-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

  .sort-options {
    display: flex;
    gap: 8px;
  }

  .sort-button {
    padding: 8px 16px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .sort-button:hover {
    border-color: var(--primary-color);
  }

  .sort-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

  /* Reviews Stats */
  .reviews-stats {
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

  /* Reviews Content */
  .reviews-content {
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

  .section-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .section-header p {
    color: var(--text-secondary);
  }

  /* Loading Skeleton */
  .loading-reviews {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .skeleton-review {
    padding: 30px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .skeleton-app-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .skeleton-icon {
    width: 48px;
    height: 48px;
    background: #e2e8f0;
    border-radius: 8px;
    animation: pulse 2s infinite;
  }

  .skeleton-author {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .skeleton-avatar {
    width: 32px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .skeleton-text {
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
    height: 16px;
    width: 120px;
  }

  .skeleton-title {
    width: 150px;
  }

  .skeleton-name {
    width: 100px;
  }

  .skeleton-rating {
    width: 100px;
    height: 20px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 16px;
    animation: pulse 2s infinite;
  }

  .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-content .skeleton-text {
    width: 100%;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Reviews List */
  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .review-card {
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 30px;
    transition: all 0.2s ease;
  }

  .review-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .app-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .app-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: var(--light-bg);
  }

  .app-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .review-category {
    font-size: 0.85rem;
    color: var(--text-secondary);
    background: var(--light-bg);
    padding: 4px 10px;
    border-radius: 10px;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-avatar {
    font-size: 1.8rem;
  }

  .author-name {
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .verified-badge {
    background: var(--secondary-color);
    color: white;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
  }

  .review-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .review-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .rating-stars {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .star {
    color: #ddd;
    font-size: 1.2rem;
  }

  .star.filled {
    color: #ffc107;
  }

  .rating-number {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .review-text {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .pros-cons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 24px;
  }

  .pros-section h5,
  .cons-section h5 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .pros-cons ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .pros-cons li {
    padding: 6px 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    position: relative;
    padding-left: 16px;
  }

  .pros-cons li::before {
    content: '•';
    position: absolute;
    left: 0;
  }

  .pros-section li::before {
    color: var(--secondary-color);
  }

  .cons-section li::before {
    color: #ef4444;
  }

  .review-actions {
    display: flex;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  .helpful-button,
  .share-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--light-bg);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .helpful-button:hover,
  .share-button:hover {
    background: var(--primary-color);
    color: white;
  }

  /* Load More */
  .load-more-section {
    text-align: center;
    margin-top: 40px;
  }

  .load-more-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
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

  .review-categories {
    margin-top: 40px;
  }

  .review-categories h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .category-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .category-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--light-bg);
    border-radius: 10px;
  }

  .category-info .category-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .category-info .category-count {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .filters-section {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .reviews-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .pros-cons {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  @media (max-width: 768px) {
    .reviews-page {
      padding: 40px 0;
    }

    .filters-section {
      padding: 20px;
    }

    .category-filters {
      grid-template-columns: repeat(2, 1fr);
    }

    .sort-options {
      flex-wrap: wrap;
    }

    .reviews-stats {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .reviews-content {
      padding: 30px 20px;
    }

    .review-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .review-actions {
      flex-direction: column;
    }

    .seo-content {
      padding: 40px 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .category-stats {
      grid-template-columns: 1fr;
    }
  }
</style>