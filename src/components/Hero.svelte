<script lang="ts">
  import { onMount } from 'svelte';

  let heroVisible = false;

  onMount(() => {
    // Animate hero on mount
    setTimeout(() => {
      heroVisible = true;
    }, 100);
  });

  function scrollToSearch() {
    const searchSection = document.getElementById('featured-apps');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Popular search terms for quick access
  const quickSearches = [
    'Productivity Apps',
    'Design Tools',
    'Development Software',
    'Business Apps',
    'Educational Tools'
  ];
</script>

<section class="hero-section">
  <div class="hero-container">
    <div class="hero-content {heroVisible ? 'visible' : ''}">
      <div class="hero-text">
        <h1 class="hero-title">
          Discover Your <span class="gradient-text">Perfect</span> App
        </h1>
        <p class="hero-subtitle">
          Search and explore thousands of mobile apps, desktop software, and productivity tools.
          Find exactly what you need with Appsearchly.org's intelligent discovery platform.
        </p>
        <div class="hero-actions">
          <button class="primary-button" on:click={scrollToSearch}>
            Start Exploring
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <a href="/submit-app" class="secondary-button">
            Submit Your App
          </a>
        </div>

        <!-- Quick Search Tags -->
        <div class="quick-searches">
          <span class="quick-search-label">Popular:</span>
          {#each quickSearches as search}
            <button class="quick-search-tag" on:click={() => {
              window.location.href = `/search?q=${encodeURIComponent(search)}`;
            }}>
              {search}
            </button>
          {/each}
        </div>
      </div>

      <!-- Hero Visual -->
      <div class="hero-visual">
        <div class="app-showcase">
          <div class="floating-app app-1">
            <div class="app-icon">🎨</div>
            <span>Design Tools</span>
          </div>
          <div class="floating-app app-2">
            <div class="app-icon">💻</div>
            <span>Development</span>
          </div>
          <div class="floating-app app-3">
            <div class="app-icon">📊</div>
            <span>Analytics</span>
          </div>
          <div class="floating-app app-4">
            <div class="app-icon">🎯</div>
            <span>Productivity</span>
          </div>
          <div class="floating-app app-5">
            <div class="app-icon">📱</div>
            <span>Mobile Apps</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-number">10,000+</div>
        <div class="stat-label">Apps & Software</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">500+</div>
        <div class="stat-label">Categories</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">50K+</div>
        <div class="stat-label">Reviews</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">100+</div>
        <div class="stat-label">New Apps Daily</div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero-section {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 80px 0 60px;
    overflow: hidden;
    position: relative;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
    z-index: 1;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
    z-index: 2;
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    margin-bottom: 60px;
  }

  .hero-text {
    animation: slideInLeft 0.8s ease-out;
  }

  .hero-content.visible .hero-text {
    opacity: 1;
    transform: translateX(0);
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
    color: var(--text-primary);
  }

  .gradient-text {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin-bottom: 32px;
    max-width: 500px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
    align-items: center;
  }

  .primary-button {
    background: var(--gradient-primary);
    color: white;
    padding: 16px 28px;
    border: none;
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  .secondary-button {
    background: rgba(52, 211, 153, 0.1);
    color: var(--secondary-color);
    padding: 16px 28px;
    border: 2px solid var(--secondary-color);
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .secondary-button:hover {
    background: var(--gradient-secondary);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
  }

  .quick-searches {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .quick-search-label {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .quick-search-tag {
    background: white;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quick-search-tag:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: slideInRight 0.8s ease-out;
  }

  .app-showcase {
    position: relative;
    width: 400px;
    height: 400px;
  }

  .floating-app {
    position: absolute;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .floating-app:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .app-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    border-radius: 12px;
    background: var(--gradient-primary);
  }

  .app-1 { top: 0; left: 50%; transform: translateX(-50%); }
  .app-2 { top: 25%; left: 0; }
  .app-3 { top: 25%; right: 0; }
  .app-4 { bottom: 25%; left: 10%; }
  .app-5 { bottom: 0; left: 50%; transform: translateX(-50%); }

  .stats-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Animations */
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 40px;
      text-align: center;
    }

    .hero-title {
      font-size: 3rem;
    }

    .hero-actions {
      justify-content: center;
    }

    .hero-visual {
      order: -1;
    }

    .app-showcase {
      width: 300px;
      height: 300px;
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 60px 0 40px;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .hero-actions {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
      margin: 0 auto 32px;
    }

    .quick-searches {
      justify-content: center;
    }

    .stats-bar {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      padding: 30px 20px;
    }

    .stat-number {
      font-size: 2rem;
    }

    .app-showcase {
      width: 250px;
      height: 250px;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 2rem;
    }

    .stats-bar {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .app-showcase {
      width: 200px;
      height: 200px;
    }
  }
</style>