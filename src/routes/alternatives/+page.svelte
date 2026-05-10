
<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';

  let popularApps = [];
  let selectedApp = null;
  let alternatives = [];
  let loading = false;
  let searchTerm = '';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Alternatives', href: '/alternatives' }
  ];

  const popularAppsList = [
    {
      id: 'photoshop',
      name: 'Adobe Photoshop',
      icon: '🎨',
      description: 'Professional photo editing and design software',
      category: 'Design',
      color: '#31a8ff'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Team communication and collaboration platform',
      category: 'Productivity',
      color: '#4a154b'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      description: 'All-in-one workspace for notes and tasks',
      category: 'Productivity',
      color: '#000000'
    },
    {
      id: 'figma',
      name: 'Figma',
      icon: '🎯',
      description: 'Collaborative interface design tool',
      category: 'Design',
      color: '#0acf83'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      description: 'Code hosting and version control platform',
      category: 'Development',
      color: '#24292e'
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: '📋',
      description: 'Project and issue tracking software',
      category: 'Productivity',
      color: '#0052cc'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: '📹',
      description: 'Video conferencing and online meetings',
      category: 'Communication',
      color: '#2d8cff'
    },
    {
      id: 'trello',
      name: 'Trello',
      icon: '📌',
      description: 'Visual project management with boards',
      category: 'Productivity',
      color: '#0079bf'
    }
  ];

  const alternativesData = {
    'photoshop': [
      {
        id: '1',
        name: 'Canva',
        description: 'User-friendly graphic design platform with templates and AI tools.',
        icon: '🎨',
        rating: 4.7,
        reviewCount: 32000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        url: 'https://canva.com',
        pros: ['Easy to use', 'Extensive template library', 'AI features', 'Free tier available'],
        cons: ['Less advanced features', 'Limited customization'],
        bestFor: 'Beginners and quick designs'
      },
      {
        id: '2',
        name: 'Figma',
        description: 'Professional design tool with collaboration features.',
        icon: '🎯',
        rating: 4.9,
        reviewCount: 25000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        url: 'https://figma.com',
        pros: ['Real-time collaboration', 'Powerful features', 'Free tier', 'Plugin ecosystem'],
        cons: ['Learning curve for advanced features'],
        bestFor: 'UI/UX design and team collaboration'
      },
      {
        id: '3',
        name: 'Affinity Photo',
        description: 'Professional photo editing software with one-time purchase.',
        icon: '📷',
        rating: 4.8,
        reviewCount: 8500,
        price: 69.99,
        currency: 'USD',
        platform: 'desktop',
        category: 'Design',
        url: 'https://affinity.serif.com',
        pros: ['One-time purchase', 'Professional features', 'No subscription', 'Fast performance'],
        cons: ['Windows only', 'Smaller community'],
        bestFor: 'Professional photographers wanting to avoid subscriptions'
      }
    ],
    'slack': [
      {
        id: '4',
        name: 'Microsoft Teams',
        description: 'Integrated communication platform for Microsoft 365 users.',
        icon: '👥',
        rating: 4.3,
        reviewCount: 45000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://teams.microsoft.com',
        pros: ['Office 365 integration', 'Video conferencing', 'File sharing', 'Enterprise features'],
        cons: ['Complex interface', 'Resource intensive'],
        bestFor: 'Enterprise and Microsoft 365 users'
      },
      {
        id: '5',
        name: 'Discord',
        description: 'Voice, video, and text communication platform.',
        icon: '🎮',
        rating: 4.6,
        reviewCount: 180000,
        price: 0,
        currency: 'USD',
        platform: 'multi',
        category: 'Communication',
        url: 'https://discord.com',
        pros: ['Free to use', 'Excellent voice quality', 'Community features', 'Gaming optimized'],
        cons: ['Not business-focused', 'Limited productivity features'],
        bestFor: 'Communities and casual team communication'
      },
      {
        id: '6',
        name: 'Rocket.Chat',
        description: 'Open-source team communication platform.',
        icon: '🚀',
        rating: 4.4,
        reviewCount: 3200,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Communication',
        url: 'https://rocket.chat',
        pros: ['Self-hosted option', 'Open source', 'Customizable', 'Integrations'],
        cons: ['Setup complexity', 'Smaller ecosystem'],
        bestFor: 'Teams wanting control over their communication tools'
      }
    ],
    'notion': [
      {
        id: '7',
        name: 'Obsidian',
        description: 'Knowledge management app with markdown and backlinks.',
        icon: '💎',
        rating: 4.8,
        reviewCount: 8500,
        price: 0,
        currency: 'USD',
        platform: 'desktop',
        category: 'Productivity',
        url: 'https://obsidian.md',
        pros: ['Local files', 'Powerful linking', 'Plugin ecosystem', 'One-time purchase option'],
        cons: ['Learning curve', 'Mobile app limited'],
        bestFor: 'Personal knowledge management and research'
      },
      {
        id: '8',
        name: 'Coda',
        description: 'All-in-one doc that brings words, data, and teams together.',
        icon: '📊',
        rating: 4.6,
        reviewCount: 6800,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://coda.io',
        pros: ['Interactive features', 'Template library', 'Database capabilities', 'Collaborative'],
        cons: ['Can be complex', 'Learning curve'],
        bestFor: 'Teams needing interactive documents and databases'
      },
      {
        id: '9',
        name: 'ClickUp',
        description: 'Productivity platform with docs, tasks, and goals.',
        icon: '🎯',
        rating: 4.5,
        reviewCount: 12000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://clickup.com',
        pros: ['All-in-one solution', 'Customizable views', 'Integrations', 'Free tier'],
        cons: ['Can be overwhelming', 'Performance issues'],
        bestFor: 'Teams wanting everything in one place'
      }
    ]
  };

  onMount(() => {
    popularApps = popularAppsList;

    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'App Alternatives - Find Perfect Software Replacements | App Search';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'App Alternatives',
        description: 'Find the best alternatives to popular apps and software. Compare features, pricing, and user reviews to discover perfect replacements.',
        url: 'https://appsearchly.org/alternatives',
        mainEntity: popularAppsList.map(app => ({
          '@type': 'SoftwareApplication',
          name: app.name,
          description: app.description,
          applicationCategory: app.category,
          alternateName: `${app.name} alternatives`
        }))
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  function handleAppSelect(app) {
    selectedApp = app;
    loadAlternatives(app.id);
  }

  async function loadAlternatives(appId) {
    loading = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      alternatives = alternativesData[appId] || getMockAlternatives(appId);
    } catch (error) {
      console.error('Failed to load alternatives:', error);
      alternatives = getMockAlternatives(appId);
    } finally {
      loading = false;
    }
  }

  function getMockAlternatives(appId) {
    return [
      {
        id: 'mock1',
        name: 'Alternative Pro',
        description: 'A powerful alternative with advanced features.',
        icon: '⭐',
        rating: 4.6,
        reviewCount: 5400,
        price: 9.99,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: '#',
        pros: ['Great features', 'Affordable pricing', 'Good support'],
        cons: ['Limited integrations'],
        bestFor: 'Small to medium teams'
      }
    ];
  }

  function handleSearch() {
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm + ' alternatives')}`;
    }
  }
</script>

<svelte:head>
  <title>App Alternatives - Find Perfect Software Replacements | App Search</title>
  <meta name="description" content="Find the best alternatives to popular apps and software. Compare features, pricing, and user reviews to discover perfect replacements for your workflow." />
  <meta name="keywords" content="app alternatives, software alternatives, replacement apps, similar apps, alternative software, open source alternatives" />
</svelte:head>

<PageHeader
  title="Find App Alternatives"
  subtitle="Discover perfect replacements for popular apps and software. Compare features, pricing, and find the best alternative for your needs."
/>

<Breadcrumb items={breadcrumbItems} />

<section class="alternatives-page">
  <div class="container">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <h2>Search for Alternatives</h2>
        <div class="search-box">
          <input
            type="text"
            placeholder="Enter an app name to find alternatives..."
            bind:value={searchTerm}
            on:keypress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button class="search-button" on:click={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Find Alternatives
          </button>
        </div>
      </div>
    </div>

    <!-- Popular Apps Section -->
    <div class="popular-apps">
      <div class="section-header">
        <h2>Popular Apps & Their Alternatives</h2>
        <p>Click on any app to explore the best alternatives available</p>
      </div>

      <div class="apps-grid">
        {#each popularApps as app}
          <button
            class="app-card {selectedApp?.id === app.id ? 'active' : ''}"
            on:click={() => handleAppSelect(app)}
            style="--app-color: {app.color}"
          >
            <div class="app-icon" style="background: {app.color}20;">
              {app.icon}
            </div>
            <div class="app-info">
              <h3>{app.name}</h3>
              <p>{app.description}</p>
              <span class="app-category">{app.category}</span>
            </div>
            <div class="app-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Alternatives Results -->
    {#if selectedApp}
      <div class="alternatives-results">
        <div class="results-header">
          <h2>Alternatives to {selectedApp.name}</h2>
          <p>Discover the best replacement options for {selectedApp.name}</p>
        </div>

        {#if loading}
          <div class="loading-grid">
            {#each Array(3) as _}
              <div class="skeleton-card">
                <div class="skeleton-header">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-text skeleton-title"></div>
                </div>
                <div class="skeleton-description"></div>
                <div class="skeleton-features">
                  <div class="skeleton-text"></div>
                  <div class="skeleton-text"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if alternatives.length > 0}
          <div class="alternatives-list">
            {#each alternatives as alternative (alternative.id)}
              <div class="alternative-card">
                <div class="alternative-header">
                  <div class="app-info">
                    <AppCard
                      app={alternative}
                      on:select={() => console.log('Alternative selected:', alternative.name)}
                    />
                  </div>
                </div>

                <div class="alternative-details">
                  <div class="detail-section">
                    <h4>✅ Pros</h4>
                    <ul>
                      {#each alternative.pros as pro}
                        <li>{pro}</li>
                      {/each}
                    </ul>
                  </div>

                  <div class="detail-section">
                    <h4>❌ Cons</h4>
                    <ul>
                      {#each alternative.cons as con}
                        <li>{con}</li>
                      {/each}
                    </ul>
                  </div>

                  <div class="detail-section">
                    <h4>🎯 Best For</h4>
                    <p>{alternative.bestFor}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>No alternatives found</h3>
            <p>We couldn't find alternatives for {selectedApp.name}. Try searching for a different app.</p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- SEO Content Section -->
    <div class="seo-content">
      <h2>Why Find App Alternatives with App Search?</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">💰</div>
          <h3>Cost Savings</h3>
          <p>Discover free or more affordable alternatives to expensive software and subscriptions.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔧</div>
          <h3>Better Features</h3>
          <p>Find apps with features that better match your specific workflow and requirements.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🌐</div>
          <h3>Platform Support</h3>
          <p>Locate alternatives that work on your preferred operating system or devices.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🛡️</div>
          <h3>Privacy & Security</h3>
          <p>Find alternatives with better privacy policies and security practices.</p>
        </div>
      </div>

      <div class="alternative-categories">
        <h3>Popular Alternative Categories</h3>
        <div class="categories-grid">
          <div class="category-item">
            <span class="category-icon">🎨</span>
            <span class="category-name">Design Software</span>
            <span class="category-count">45 alternatives</span>
          </div>
          <div class="category-item">
            <span class="category-icon">💬</span>
            <span class="category-name">Communication Tools</span>
            <span class="category-count">38 alternatives</span>
          </div>
          <div class="category-item">
            <span class="category-icon">📊</span>
            <span class="category-name">Project Management</span>
            <span class="category-count">52 alternatives</span>
          </div>
          <div class="category-item">
            <span class="category-icon">📝</span>
            <span class="category-name">Note-Taking Apps</span>
            <span class="category-count">29 alternatives</span>
          </div>
          <div class="category-item">
            <span class="category-icon">💻</span>
            <span class="category-name">Development Tools</span>
            <span class="category-count">67 alternatives</span>
          </div>
          <div class="category-item">
            <span class="category-icon">🔒</span>
            <span class="category-name">Security Software</span>
            <span class="category-count">23 alternatives</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .alternatives-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Search Section */
  .search-section {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
    text-align: center;
  }

  .search-container h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 24px;
  }

  .search-box {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    gap: 12px;
  }

  .search-box input {
    flex: 1;
    padding: 16px 20px;
    border: 2px solid var(--border-color);
    border-radius: 30px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .search-box input:focus {
    border-color: var(--primary-color);
  }

  .search-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 28px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .search-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  /* Popular Apps Section */
  .popular-apps {
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
    font-size: 1.1rem;
  }

  .apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }

  .app-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: white;
    border: 2px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;
  }

  .app-card:hover {
    border-color: var(--app-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .app-card.active {
    border-color: var(--app-color);
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%);
  }

  .app-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }

  .app-info {
    flex: 1;
  }

  .app-info h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .app-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .app-category {
    display: inline-block;
    padding: 4px 12px;
    background: var(--light-bg);
    color: var(--text-secondary);
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .app-arrow {
    color: var(--text-secondary);
    transition: transform 0.2s ease;
  }

  .app-card:hover .app-arrow {
    transform: translateX(4px);
  }

  /* Alternatives Results */
  .alternatives-results {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .results-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .results-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .results-header p {
    color: var(--text-secondary);
  }

  /* Loading Skeleton */
  .loading-grid {
    display: grid;
    gap: 30px;
  }

  .skeleton-card {
    padding: 30px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .skeleton-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .skeleton-icon {
    width: 60px;
    height: 60px;
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
    width: 150px;
    height: 20px;
  }

  .skeleton-description {
    width: 100%;
    height: 16px;
    margin-bottom: 20px;
  }

  .skeleton-features {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-features .skeleton-text {
    width: 80%;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Alternatives List */
  .alternatives-list {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .alternative-card {
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
  }

  .alternative-header {
    padding: 24px;
    background: var(--light-bg);
    border-bottom: 1px solid var(--border-color);
  }

  .alternative-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    padding: 30px;
  }

  .detail-section h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .detail-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .detail-section li {
    padding: 6px 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    position: relative;
    padding-left: 16px;
  }

  .detail-section li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
  }

  .detail-section p {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
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
    margin-bottom: 8px;
  }

  .no-results p {
    color: var(--text-secondary);
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

  .alternative-categories h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--light-bg);
    border-radius: 10px;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .category-name {
    flex: 1;
    font-weight: 500;
    color: var(--text-primary);
  }

  .category-count {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .alternatives-page {
      padding: 40px 0;
    }

    .search-section {
      padding: 30px 20px;
    }

    .search-container h2 {
      font-size: 1.5rem;
    }

    .search-box {
      flex-direction: column;
    }

    .apps-grid {
      grid-template-columns: 1fr;
    }

    .app-card {
      padding: 20px;
    }

    .alternatives-results {
      padding: 30px 20px;
    }

    .alternative-details {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .seo-content {
      padding: 40px 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }
  }
</style>