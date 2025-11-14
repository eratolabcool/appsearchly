<script lang="ts">
  import { onMount } from 'svelte';
  import AppCard from './AppCard.svelte';

  let featuredApps = [];
  let loading = true;

  onMount(async () => {
    await loadFeaturedApps();
  });

  async function loadFeaturedApps() {
    try {
      // Use the existing iTunes API service to load real apps
      const response = await fetch('/api/featured-apps');
      if (response.ok) {
        const apps = await response.json();
        featuredApps = apps.slice(0, 8); // Show 8 featured apps
      } else {
        // Fallback to mock data if API fails
        featuredApps = getMockApps();
      }
    } catch (error) {
      console.error('Failed to load featured apps:', error);
      featuredApps = getMockApps();
    } finally {
      loading = false;
    }
  }

  function getMockApps() {
    return [
      {
        id: '1',
        name: 'Notion',
        description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
        icon: '/assets/icons/notion.svg',
        rating: 4.8,
        reviewCount: 15000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://notion.so'
      },
      {
        id: '2',
        name: 'Figma',
        description: 'Collaborative interface design tool for teams.',
        icon: '/assets/icons/figma.svg',
        rating: 4.9,
        reviewCount: 25000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        url: 'https://figma.com'
      },
      {
        id: '3',
        name: 'Procreate',
        description: 'Powerful illustration and painting app for iPad.',
        icon: '/assets/icons/procreate.svg',
        rating: 4.9,
        reviewCount: 18000,
        price: 12.99,
        currency: 'USD',
        platform: 'ios',
        category: 'Design',
        url: 'https://procreate.com'
      },
      {
        id: '4',
        name: 'Spotify',
        description: 'Music streaming service with millions of songs.',
        icon: '/assets/icons/spotify.svg',
        rating: 4.6,
        reviewCount: 8500000,
        price: 0,
        currency: 'USD',
        platform: 'multi',
        category: 'Entertainment',
        url: 'https://spotify.com'
      },
      {
        id: '5',
        name: 'VS Code',
        description: 'Lightweight code editor with extensive extensions.',
        icon: '/assets/icons/vscode.svg',
        rating: 4.8,
        reviewCount: 45000,
        price: 0,
        currency: 'USD',
        platform: 'desktop',
        category: 'Development',
        url: 'https://code.visualstudio.com'
      },
      {
        id: '6',
        name: 'Canva',
        description: 'Graphic design platform for social media and marketing.',
        icon: '/assets/icons/canva.svg',
        rating: 4.7,
        reviewCount: 32000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Design',
        url: 'https://canva.com'
      },
      {
        id: '7',
        name: 'Slack',
        description: 'Team communication and collaboration platform.',
        icon: '/assets/icons/slack.svg',
        rating: 4.5,
        reviewCount: 28000,
        price: 0,
        currency: 'USD',
        platform: 'multi',
        category: 'Productivity',
        url: 'https://slack.com'
      },
      {
        id: '8',
        name: 'Trello',
        description: 'Visual collaboration tool for project management.',
        icon: '/assets/icons/trello.svg',
        rating: 4.4,
        reviewCount: 19000,
        price: 0,
        currency: 'USD',
        platform: 'web',
        category: 'Productivity',
        url: 'https://trello.com'
      }
    ];
  }

  function handleAppSelect(app) {
    // Track the click for analytics
    console.log('App selected:', app.name);
    // Could open modal or navigate to detail page
  }
</script>

<section id="featured-apps" class="featured-apps-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-highlight">Featured</span> Apps
      </h2>
      <p class="section-subtitle">
        Handpicked apps and software recommendations from our expert team
      </p>
    </div>

    {#if loading}
      <div class="loading-grid">
        {#each Array(8) as _}
          <div class="skeleton-card">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text skeleton-title"></div>
            <div class="skeleton-text skeleton-description"></div>
            <div class="skeleton-text skeleton-meta"></div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="apps-grid">
        {#each featuredApps as app (app.id)}
          <AppCard
            {app}
            on:select={handleAppSelect}
          />
        {/each}
      </div>
    {/if}

    <div class="section-footer">
      <a href="/categories" class="view-all-button">
        View All Categories
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </div>
  </div>
</section>

<style>
  .featured-apps-section {
    padding: 80px 0;
    background: white;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .title-highlight {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }

  .apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 60px;
  }

  .loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 60px;
  }

  .skeleton-card {
    background: #f8fafc;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #e2e8f0;
  }

  .skeleton-icon {
    width: 64px;
    height: 64px;
    background: #e2e8f0;
    border-radius: 12px;
    margin-bottom: 16px;
    animation: pulse 2s infinite;
  }

  .skeleton-text {
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 8px;
    animation: pulse 2s infinite;
  }

  .skeleton-title {
    height: 24px;
    width: 70%;
  }

  .skeleton-description {
    height: 16px;
    width: 100%;
  }

  .skeleton-meta {
    height: 14px;
    width: 40%;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .section-footer {
    text-align: center;
  }

  .view-all-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--gradient-secondary);
    color: white;
    padding: 16px 32px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
  }

  .view-all-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .featured-apps-section {
      padding: 60px 0;
    }

    .section-title {
      font-size: 2rem;
    }

    .apps-grid,
    .loading-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>