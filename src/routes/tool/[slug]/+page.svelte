
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import ToolScreenshot from '$lib/components/ToolScreenshot.svelte';
  import ToolFeatures from '$lib/components/ToolFeatures.svelte';
  import ToolReviews from '$lib/components/ToolReviews.svelte';
  import ToolPricing from '$lib/components/ToolPricing.svelte';

  let tool = null;
  let loading = true;
  let error = null;
  let selectedScreenshotIndex = 0;

  $: slug = $page.params.slug;

  // 相关工具
  let relatedTools = [];

  onMount(async () => {
    await loadTool();
  });

  async function loadTool() {
    loading = true;
    error = null;

    try {
      // 尝试从 apps.json 加载工具数据
      const response = await fetch('/api/apps.json');
      if (response.ok) {
        const allApps = await response.json();
        tool = allApps.find(app => app.seo?.slug === slug);

        if (tool) {
          // 加载相关工具
          loadRelatedTools(tool);

          // SEO 优化
          setupSEO();
        } else {
          error = 'Tool not found';
        }
      } else {
        error = 'Failed to load tool data';
      }
    } catch (err) {
      console.error('Error loading tool:', err);
      error = 'Failed to load tool';
    } finally {
      loading = false;
    }
  }

  function loadRelatedTools(currentTool) {
    // 从所有工具中找出相关的工具（基于类别和标签）
    fetch('/api/apps.json')
      .then(response => response.json())
      .then(allApps => {
        relatedTools = allApps
          .filter(app =>
            app.id !== currentTool.id && // 排除当前工具
            (app.category === currentTool.category || // 相同类别
            app.tags.some(tag => currentTool.tags.includes(tag))) // 有共同标签
          )
          .slice(0, 6); // 最多显示6个相关工具
      })
      .catch(err => {
        console.warn('Failed to load related tools:', err);
        relatedTools = [];
      });
  }

  function setupSEO() {
    if (typeof window !== 'undefined' && tool) {
      document.title = `${tool.appName} - AI Tool Details | App Search`;

      // 更新 meta 标签
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', tool.description);
      }

      // 结构化数据
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.appName,
        description: tool.description,
        url: `https://appsearchly.org/tool/${slug}`,
        applicationCategory: tool.category,
        operatingSystem: 'Web',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          reviewCount: tool.reviewCount
        },
        offers: {
          '@type': 'Offer',
          price: tool.price || 0,
          priceCurrency: tool.currency || 'USD',
          availability: tool.pricingModel === 'free' ? 'InStock' : 'InStock'
        },
        author: {
          '@type': 'Organization',
          name: tool.developerName
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }

  // 截图导航
  function nextScreenshot() {
    if (tool && tool.screenshots && tool.screenshots.length > 0) {
      selectedScreenshotIndex = (selectedScreenshotIndex + 1) % tool.screenshots.length;
    }
  }

  function prevScreenshot() {
    if (tool && tool.screenshots && tool.screenshots.length > 0) {
      selectedScreenshotIndex = (selectedScreenshotIndex - 1 + tool.screenshots.length) % tool.screenshots.length;
    }
  }

  // 格式化数据
  function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  function formatPercentage(rate) {
    return `${(rate * 100).toFixed(1)}%`;
  }

  $: breadcrumbItems = tool ? [
    { label: 'Home', href: '/' },
    { label: tool.category, href: `/category/${tool.category.toLowerCase().replace(/\s+/g, '-')}` },
    { label: tool.appName, href: `/tool/${slug}` }
  ] : [];
</script>

<svelte:head>
  <title>{tool ? `${tool.appName} - AI Tool Details` : 'Tool Details'} | App Search</title>
  <meta name="description" content={tool?.description || 'Discover detailed information about this AI tool including features, pricing, and reviews.'} />
  <meta name="keywords" content="{tool?.appName} AI tool, {tool?.category} AI, {tool?.tags?.join(', ')}, artificial intelligence, machine learning" />
</svelte:head>

{#if loading}
  <div class="tool-detail-loading">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading tool details...</p>
    </div>
  </div>
{:else if error}
  <div class="tool-detail-error">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Tool Not Found</h2>
      <p>{error}</p>
      <a href="/" class="back-home">← Back to Home</a>
    </div>
  </div>
{:else if tool}
  <div class="tool-detail-page">
    <!-- Header Section -->
    <PageHeader
      title={tool.appName}
      subtitle={`${tool.category} • AI Tool`}
      showBack={true}
    />

    <!-- Breadcrumb -->
    <Breadcrumb items={breadcrumbItems} />

    <!-- Tool Hero Section -->
    <section class="tool-hero">
      <div class="container">
        <div class="tool-hero-content">
          <div class="tool-main-info">
            <div class="tool-header">
              <div class="tool-icon">{tool.icon}</div>
              <div class="tool-title-section">
                <h1 class="tool-name">{tool.appName}</h1>
                <div class="tool-meta">
                  <span class="developer">{tool.developerName}</span>
                  <span class="category">{tool.category}</span>
                </div>
              </div>
            </div>

            <div class="tool-description">
              <p>{tool.description}</p>
            </div>

            <!-- Quick Stats -->
            <div class="tool-stats">
              <div class="stat-item">
                <div class="stat-value">⭐ {tool.rating}</div>
                <div class="stat-label">Rating</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{formatNumber(tool.reviewCount)}</div>
                <div class="stat-label">Reviews</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{formatNumber(tool.monthlyVisits)}</div>
                <div class="stat-label">Monthly Visits</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">+{formatNumber(tool.growth)}</div>
                <div class="stat-label">Growth</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="tool-actions">
              <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" class="primary-button">
                Visit Website
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 17L17 7M7 7L17 7M7 17L17 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              {#if tool.downloadUrl}
                <a href={tool.downloadUrl} class="secondary-button">
                  Download
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 7L17 7M7 7L17 7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              {/if}
            </div>
          </div>

          <div class="tool-visual">
            {#if tool.screenshots && tool.screenshots.length > 0}
              <div class="screenshot-container">
                <div class="screenshot-main">
                  <img
                    src={tool.screenshots[selectedScreenshotIndex]}
                    alt={`${tool.appName} screenshot`}
                    class="screenshot-image"
                  />
                </div>
                {#if tool.screenshots.length > 1}
                  <div class="screenshot-nav">
                    <button class="nav-button prev" on:click={prevScreenshot}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 3 6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <span class="screenshot-indicator">
                      {selectedScreenshotIndex + 1} / {tool.screenshots.length}
                    </span>
                    <button class="nav-button next" on:click={nextScreenshot}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 6 15 12 21 18" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="placeholder-visual">
                <div class="placeholder-icon">{tool.icon}</div>
                <div class="placeholder-text">No screenshots available</div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </section>

    <!-- Tool Details Tabs -->
    <section class="tool-details">
      <div class="container">
        <div class="tabs-container">
          <!-- Features Tab -->
          <ToolFeatures
            tool={tool}
            isActive={true}
          />

          <!-- Pricing Tab -->
          <ToolPricing
            tool={tool}
            isActive={true}
          />

          <!-- Screenshots Tab -->
          <ToolScreenshot
            tool={tool}
            isActive={true}
          />

          <!-- Reviews Tab -->
          <ToolReviews
            tool={tool}
            isActive={true}
          />
        </div>

        <!-- Related Tools -->
        <RelatedTools
          tools={relatedTools}
          title="Related AI Tools"
          subtitle="Similar tools you might be interested in"
        />
      </div>
    </section>

    <!-- About Section -->
    <section class="tool-about">
      <div class="container">
        <div class="about-content">
          <h2>About {tool.appName}</h2>
          <div class="about-grid">
            <div class="about-section">
              <h3>Overview</h3>
              <p>{tool.description}</p>
              <p>Developed by <strong>{tool.developerName}</strong>, {tool.appName} is a {tool.category.toLowerCase()} tool that has gained significant traction with {formatNumber(tool.monthlyVisits)} monthly visits and growing by {formatNumber(tool.growth)} users per month.</p>
            </div>

            <div class="about-section">
              <h3>Key Features</h3>
              <ul class="features-list">
                {#each tool.tags.slice(0, 8) as tag}
                  <li class="feature-tag">{tag}</li>
                {/each}
              </ul>
            </div>

            <div class="about-section">
              <h3>Technical Details</h3>
              <div class="tech-details">
                <div class="tech-item">
                  <span class="tech-label">Platform:</span>
                  <span class="tech-value">{tool.platforms.join(', ')}</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">Pricing:</span>
                  <span class="tech-value">{tool.pricingModel}</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">Category:</span>
                  <span class="tech-value">{tool.category}</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">Last Updated:</span>
                  <span class="tech-value">{new Date(tool.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
{/if}

<style>
  .tool-detail-loading {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--light-bg);
  }

  .loading-container {
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--primary-color);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tool-detail-error {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--light-bg);
  }

  .error-container {
    text-align: center;
    max-width: 400px;
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .error-container h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .error-container p {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .back-home {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--gradient-primary);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .back-home:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  }

  .tool-detail-page {
    background: var(--light-bg);
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Tool Hero Section */
  .tool-hero {
    background: white;
    padding: 40px 0;
    border-bottom: 1px solid var(--border-color);
  }

  .tool-hero-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 40px;
    align-items: start;
  }

  .tool-main-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .tool-icon {
    width: 64px;
    height: 64px;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--light-bg);
    border-radius: 16px;
    flex-shrink: 0;
  }

  .tool-title-section {
    flex: 1;
  }

  .tool-name {
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 8px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tool-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .developer, .category {
    padding: 6px 12px;
    background: var(--light-bg);
    border-radius: 20px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .tool-description {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 1.1rem;
  }

  .tool-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .stat-item {
    text-align: center;
    padding: 20px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tool-actions {
    display: flex;
    gap: 16px;
  }

  .primary-button, .secondary-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .primary-button {
    background: var(--gradient-primary);
    color: white;
    border: none;
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  }

  .secondary-button {
    background: white;
    color: var(--text-primary);
    border: 2px solid var(--primary-color);
  }

  .secondary-button:hover {
    background: var(--primary-color);
    color: white;
  }

  .tool-visual {
    width: 100%;
    aspect-ratio: 16/9;
    background: var(--light-bg);
    border-radius: 16px;
    overflow: hidden;
  }

  .screenshot-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .screenshot-main {
    width: 100%;
    height: 100%;
  }

  .screenshot-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }

  .screenshot-nav {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px 16px;
    border-radius: 20px;
  }

  .nav-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .screenshot-indicator {
    color: white;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .placeholder-visual {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color)10, var(--secondary-color)10);
  }

  .placeholder-icon {
    font-size: 4rem;
    opacity: 0.3;
    margin-bottom: 16px;
  }

  .placeholder-text {
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Tool Details Section */
  .tool-details {
    padding: 60px 0;
    background: white;
  }

  .tabs-container {
    display: grid;
    gap: 40px;
  }

  /* About Section */
  .tool-about {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .about-content {
    max-width: 900px;
    margin: 0 auto;
  }

  .about-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .about-section {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .about-section h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .about-section p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .features-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style: none;
    padding: 0;
  }

  .feature-tag {
    background: var(--light-bg);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .tech-details {
    display: grid;
    gap: 16px;
  }

  .tech-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .tech-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .tech-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .tool-hero-content {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .tool-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .tool-visual {
      aspect-ratio: 16/10;
    }
  }

  @media (max-width: 768px) {
    .tool-header {
      flex-direction: column;
      align-items: start;
      gap: 12px;
    }

    .tool-name {
      font-size: 1.8rem;
    }

    .tool-meta {
      gap: 12px;
    }

    .tool-actions {
      flex-direction: column;
      width: 100%;
    }

    .primary-button, .secondary-button {
      width: 100%;
      justify-content: center;
    }

    .about-grid {
      gap: 30px;
    }

    .about-section {
      padding: 30px 20px;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0 16px;
    }

    .tool-hero {
      padding: 30px 0;
    }

    .tool-stats {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .stat-item {
      padding: 16px;
    }

    .tool-details {
      padding: 40px 0;
    }

    .tool-about {
      padding: 40px 0;
    }
  }
</style>