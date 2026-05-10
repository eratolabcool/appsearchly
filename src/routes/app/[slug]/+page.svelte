
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let app = null;
  let loading = true;
  let relatedApps = [];
  let activeTab = 'overview';

  $: slug = $page.params.slug;

  onMount(async () => {
    await loadAppData();
  });

  async function loadAppData() {
    loading = true;
    try {
      // Load apps data
      const response = await fetch('/data/apps.json');
      const apps = await response.json();
      
      // Find the app by slug
      app = apps.find(a => a.seo.slug === slug);
      
      if (!app) {
        // Redirect to 404 or home
        goto('/');
        return;
      }

      // Find related apps (same category, exclude current)
      relatedApps = apps
        .filter(a => a.category === app.category && a.seo.slug !== slug)
        .slice(0, 3);

      // Set page title
      if (typeof window !== 'undefined') {
        document.title = `${app.appName} - ${app.seo.title}`;
      }
    } catch (error) {
      console.error('Failed to load app data:', error);
      goto('/');
    } finally {
      loading = false;
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  function handleVisitWebsite() {
    if (app?.websiteUrl) {
      window.open(app.websiteUrl, '_blank');
    }
  }
</script>

<svelte:head>
  {#if app}
    <title>{app.seo.title}</title>
    <meta name="description" content={app.seo.description} />
    <meta name="keywords" content={app.seo.keywords.join(', ')} />
  {/if}
</svelte:head>

{#if loading}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading tool details...</p>
  </div>
{:else if app}
  <div class="app-detail-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="app-header">
            <div class="app-icon-large">{app.icon}</div>
            <div class="app-title-section">
              <h1 class="app-title">{app.appName}</h1>
              <p class="app-subtitle">{app.description}</p>
              <div class="app-meta">
                <span class="meta-item">
                  <span class="meta-icon">📁</span>
                  {app.category}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">⭐</span>
                  {app.rating} ({formatNumber(app.reviewCount)} reviews)
                </span>
                <span class="meta-item">
                  <span class="meta-icon">💰</span>
                  {app.pricingModel}
                </span>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary" on:click={handleVisitWebsite}>
              Visit Website
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-value">{formatNumber(app.monthlyVisits)}</div>
              <div class="stat-label">Monthly Visits</div>
            </div>
          </div>
          <div class="stat-card growth">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-value">+{formatNumber(app.growth)}</div>
              <div class="stat-label">Growth</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-value">{app.rating}/5</div>
              <div class="stat-label">Rating</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏷️</div>
            <div class="stat-content">
              <div class="stat-value">{app.pricingModel}</div>
              <div class="stat-label">Pricing</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <div class="content-grid">
          <!-- Left Column -->
          <div class="content-main">
            <!-- Tabs -->
            <div class="tabs">
              <button 
                class="tab {activeTab === 'overview' ? 'active' : ''}"
                on:click={() => activeTab = 'overview'}
              >
                Overview
              </button>
              <button 
                class="tab {activeTab === 'features' ? 'active' : ''}"
                on:click={() => activeTab = 'features'}
              >
                Features
              </button>
              <button 
                class="tab {activeTab === 'reviews' ? 'active' : ''}"
                on:click={() => activeTab = 'reviews'}
              >
                Reviews
              </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
              {#if activeTab === 'overview'}
                <div class="overview-section">
                  <h2>About {app.appName}</h2>
                  <p class="description">{app.description}</p>
                  
                  <div class="info-grid">
                    <div class="info-item">
                      <h3>Category</h3>
                      <p>{app.category} • {app.subcategory}</p>
                    </div>
                    <div class="info-item">
                      <h3>Developer</h3>
                      <p>{app.developerName}</p>
                    </div>
                    <div class="info-item">
                      <h3>Platforms</h3>
                      <p>{app.platforms.join(', ')}</p>
                    </div>
                    <div class="info-item">
                      <h3>Version</h3>
                      <p>{app.version}</p>
                    </div>
                  </div>

                  <div class="tags-section">
                    <h3>Tags</h3>
                    <div class="tags">
                      {#each app.tags.slice(0, 10) as tag}
                        <span class="tag">{tag}</span>
                      {/each}
                    </div>
                  </div>
                </div>
              {:else if activeTab === 'features'}
                <div class="features-section">
                  <h2>Key Features</h2>
                  <div class="features-grid">
                    {#each app.tags.slice(0, 6) as feature, index}
                      <div class="feature-card">
                        <div class="feature-icon">
                          {['🎯', '⚡', '🔒', '🚀', '💡', '🎨'][index % 6]}
                        </div>
                        <h4>{feature}</h4>
                        <p>Enhance your workflow with {feature.toLowerCase()} capabilities.</p>
                      </div>
                    {/each}
                  </div>
                </div>
              {:else if activeTab === 'reviews'}
                <div class="reviews-section">
                  <h2>User Reviews</h2>
                  <div class="rating-summary">
                    <div class="rating-score-large">
                      <div class="score">{app.rating}</div>
                      <div class="stars">⭐⭐⭐⭐⭐</div>
                      <div class="review-count">{formatNumber(app.reviewCount)} reviews</div>
                    </div>
                  </div>
                  
                  <div class="reviews-list">
                    {#each Array(3) as _, i}
                      <div class="review-card">
                        <div class="review-header">
                          <div class="reviewer-avatar">
                            {['👤', '👨', '👩'][i]}
                          </div>
                          <div class="reviewer-info">
                            <div class="reviewer-name">User {i + 1}</div>
                            <div class="review-rating">⭐⭐⭐⭐⭐</div>
                          </div>
                        </div>
                        <p class="review-text">
                          Great tool! {app.appName} has significantly improved my productivity. 
                          Highly recommended for anyone in {app.category.toLowerCase()}.
                        </p>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="content-sidebar">
            <!-- Quick Info Card -->
            <div class="sidebar-card">
              <h3>Quick Info</h3>
              <div class="quick-info">
                <div class="info-row">
                  <span class="info-label">Price</span>
                  <span class="info-value">{app.price ? `$${app.price}` : 'Free'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Model</span>
                  <span class="info-value">{app.pricingModel}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status</span>
                  <span class="info-value status-badge">{app.status}</span>
                </div>
              </div>
              
              <a href={app.websiteUrl} target="_blank" class="btn-secondary full-width">
                Visit Official Website
              </a>
            </div>

            <!-- Developer Card -->
            <div class="sidebar-card">
              <h3>Developer</h3>
              <p class="developer-name">{app.developerName}</p>
              {#if app.supportEmail}
                <a href="mailto:{app.supportEmail}" class="contact-link">
                  📧 Contact Support
                </a>
              {/if}
            </div>

            <!-- Links Card -->
            <div class="sidebar-card">
              <h3>Resources</h3>
              <div class="resource-links">
                {#if app.privacyPolicy}
                  <a href={app.privacyPolicy} target="_blank" class="resource-link">
                    🔒 Privacy Policy
                  </a>
                {/if}
                {#if app.termsOfService}
                  <a href={app.termsOfService} target="_blank" class="resource-link">
                    📄 Terms of Service
                  </a>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Apps -->
    {#if relatedApps.length > 0}
      <section class="related-section">
        <div class="container">
          <h2 class="section-title">Similar Tools in {app.category}</h2>
          <div class="related-grid">
            {#each relatedApps as relatedApp}
              <a href="/app/{relatedApp.seo.slug}" class="related-card">
                <div class="related-icon">{relatedApp.icon}</div>
                <h4>{relatedApp.appName}</h4>
                <p>{relatedApp.description}</p>
                <div class="related-meta">
                  <span class="rating">⭐ {relatedApp.rating}</span>
                  <span class="visits">{formatNumber(relatedApp.monthlyVisits)} visits</span>
                </div>
              </a>
            {/each}
          </div>
        </div>
      </section>
    {/if}
  </div>
{/if}

<style>
  .app-detail-page {
    min-height: 100vh;
    background: var(--light-bg);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 20px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 80px 0 40px;
    border-bottom: 1px solid var(--border-color);
  }

  .hero-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
    margin-bottom: 40px;
  }

  .app-header {
    display: flex;
    gap: 30px;
    flex: 1;
  }

  .app-icon-large {
    font-size: 5rem;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 24px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .app-title-section {
    flex: 1;
  }

  .app-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .app-subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .app-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .meta-icon {
    font-size: 1.1rem;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: white;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

  .full-width {
    width: 100%;
  }

  /* Stats Bar */
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }

  .stat-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .stat-card.growth .stat-icon {
    background: rgba(52, 211, 153, 0.1);
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-card.growth .stat-value {
    color: var(--secondary-color);
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  /* Main Content */
  .main-content {
    padding: 60px 0;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 40px;
  }

  .content-main {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
    border-bottom: 2px solid var(--border-color);
  }

  .tab {
    padding: 12px 24px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    margin-bottom: -2px;
  }

  .tab:hover {
    color: var(--primary-color);
  }

  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  /* Tab Content */
  .tab-content {
    animation: fadeIn 0.3s ease;
  }

  .overview-section h2,
  .features-section h2,
  .reviews-section h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .info-item h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-item p {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .tags-section h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .tag {
    padding: 8px 16px;
    background: var(--light-bg);
    color: var(--text-secondary);
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background: var(--primary-color);
    color: white;
  }

  /* Features */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .feature-card {
    padding: 24px;
    background: var(--light-bg);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    background: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }

  .feature-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .feature-card p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  /* Reviews */
  .rating-summary {
    background: var(--light-bg);
    padding: 32px;
    border-radius: 12px;
    margin-bottom: 32px;
    text-align: center;
  }

  .rating-score-large .score {
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .rating-score-large .stars {
    font-size: 1.5rem;
    margin: 8px 0;
  }

  .review-count {
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .review-card {
    padding: 24px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .reviewer-avatar {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .reviewer-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .review-rating {
    color: var(--accent-color);
    font-size: 0.9rem;
  }

  .review-text {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  /* Sidebar */
  .content-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .sidebar-card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .sidebar-card h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .quick-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
  }

  .info-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .info-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .status-badge {
    padding: 4px 12px;
    background: var(--secondary-color);
    color: white;
    border-radius: 12px;
    font-size: 0.8rem;
    text-transform: capitalize;
  }

  .developer-name {
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: 12px;
  }

  .contact-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.9rem;
  }

  .contact-link:hover {
    text-decoration: underline;
  }

  .resource-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .resource-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--light-bg);
    border-radius: 8px;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .resource-link:hover {
    background: var(--primary-color);
    color: white;
  }

  /* Related Section */
  .related-section {
    padding: 60px 0;
    background: white;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 40px;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .related-card {
    padding: 24px;
    background: var(--light-bg);
    border-radius: 16px;
    text-decoration: none;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .related-card:hover {
    background: white;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }

  .related-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
  }

  .related-card h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .related-card p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 16px;
    flex: 1;
  }

  .related-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);
  }

  .related-meta .rating,
  .related-meta .visits {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .content-sidebar {
      order: -1;
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 60px 0 30px;
    }

    .hero-content {
      flex-direction: column;
    }

    .app-header {
      flex-direction: column;
      text-align: center;
    }

    .app-icon-large {
      margin: 0 auto;
    }

    .app-title {
      font-size: 2rem;
    }

    .app-meta {
      justify-content: center;
    }

    .hero-actions {
      width: 100%;
      justify-content: center;
    }

    .stats-bar {
      grid-template-columns: 1fr 1fr;
    }

    .content-main {
      padding: 24px;
    }

    .tabs {
      overflow-x: auto;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
