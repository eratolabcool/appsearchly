<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';

  let categoryApps = [];
  let loading = true;
  let selectedSubcategory = 'all';
  let sortBy = 'popular';

  // 获取当前分类
  $: categorySlug = $page.params.slug;
  $: categoryInfo = getCategoryInfo(categorySlug);

  // 子分类数据
  $: subcategories = categoryInfo ? [
    { id: 'all', label: 'All Apps', count: categoryInfo.totalApps },
    ...categoryInfo.subcategories
  ] : [];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest Released' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'trending', label: 'Trending Up' }
  ];

  $: breadcrumbItems = categoryInfo ? [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: categoryInfo.name, href: `/category/${categorySlug}` }
  ] : [];

  onMount(async () => {
    await loadCategoryApps();

    // SEO优化
    if (typeof window !== 'undefined') {
      document.title = `${categoryInfo.name} Apps & Software | App Search`;

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${categoryInfo.name} Apps`,
        description: categoryInfo.description,
        url: `https://appsearchly.org/category/${categorySlug}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: categoryApps.length,
          itemListElement: categoryApps.map((app, index) => ({
            '@type': 'SoftwareApplication',
            position: index + 1,
            name: app.name,
            description: app.description,
            applicationCategory: categoryInfo.name,
            operatingSystem: app.platform,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: app.rating,
              reviewCount: app.reviewCount
            },
            offers: app.price === 0 ? {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            } : {
              '@type': 'Offer',
              price: app.price,
              priceCurrency: 'USD'
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

  function getCategoryInfo(slug) {
    const categories = {
      'education': {
        name: 'Education',
        description: 'Discover the best educational apps and learning tools for students, teachers, and lifelong learners.',
        icon: '📚',
        color: '#4CAF50',
        totalApps: 2847,
        subcategories: [
          { id: 'language-learning', label: 'Language Learning', count: 456, icon: '🗣️' },
          { id: 'math-science', label: 'Math & Science', count: 382, icon: '🔬' },
          { id: 'coding', label: 'Coding & Programming', count: 521, icon: '💻' },
          { id: 'art-music', label: 'Art & Music', count: 294, icon: '🎨' },
          { id: 'test-prep', label: 'Test Preparation', count: 367, icon: '📝' },
          { id: 'early-learning', label: 'Early Learning', count: 234, icon: '👶' },
          { id: 'reference', label: 'Reference & Research', count: 189, icon: '📖' },
          { id: 'study-tools', label: 'Study Tools', count: 404, icon: '🛠️' }
        ]
      },
      'business': {
        name: 'Business',
        description: 'Professional business tools and apps to enhance productivity, collaboration, and growth.',
        icon: '💼',
        color: '#2196F3',
        totalApps: 1932,
        subcategories: [
          { id: 'project-management', label: 'Project Management', count: 287, icon: '📊' },
          { id: 'accounting', label: 'Accounting & Finance', count: 156, icon: '💰' },
          { id: 'crm', label: 'CRM & Sales', count: 198, icon: '🤝' },
          { id: 'marketing', label: 'Marketing Tools', count: 342, icon: '📈' },
          { id: 'hr', label: 'HR & Recruiting', count: 128, icon: '👥' },
          { id: 'communication', label: 'Communication', count: 245, icon: '💬' },
          { id: 'analytics', label: 'Analytics & Reporting', count: 189, icon: '📊' },
          { id: 'document', label: 'Document Management', count: 387, icon: '📄' }
        ]
      },
      'design-creative': {
        name: 'Design & Creative',
        description: 'Professional design tools and creative apps for artists, designers, and content creators.',
        icon: '🎨',
        color: '#FF5722',
        totalApps: 1654,
        subcategories: [
          { id: 'graphic-design', label: 'Graphic Design', count: 298, icon: '🖼️' },
          { id: 'video-editing', label: 'Video Editing', count: 187, icon: '🎬' },
          { id: 'photo-editing', label: 'Photo Editing', count: 234, icon: '📷' },
          { id: 'ui-ux', label: 'UI/UX Design', count: 156, icon: '📱' },
          { id: 'illustration', label: 'Illustration', count: 143, icon: '✏️' },
          { id: 'animation', label: 'Animation', count: 98, icon: '🎞️' },
          { id: '3d-modeling', label: '3D Modeling', count: 87, icon: '🏗️' },
          { id: 'typography', label: 'Typography', count: 65, icon: '🔤' },
          { id: 'color-tools', label: 'Color Tools', count: 386, icon: '🎨' }
        ]
      },
      'development-tools': {
        name: 'Development Tools',
        description: 'Essential development tools and IDEs for programmers and software engineers.',
        icon: '💻',
        color: '#9C27B0',
        totalApps: 2109,
        subcategories: [
          { id: 'ide', label: 'IDEs & Editors', count: 187, icon: '⚡' },
          { id: 'version-control', label: 'Version Control', count: 89, icon: '🔄' },
          { id: 'testing', label: 'Testing Tools', count: 234, icon: '🧪' },
          { id: 'debugging', label: 'Debugging Tools', count: 156, icon: '🐛' },
          { id: 'api-tools', label: 'API Tools', count: 298, icon: '🔌' },
          { id: 'database', label: 'Database Tools', count: 143, icon: '🗄️' },
          { id: 'deployment', label: 'Deployment', count: 198, icon: '🚀' },
          { id: 'monitoring', label: 'Monitoring', count: 234, icon: '📊' },
          { id: 'documentation', label: 'Documentation', count: 570, icon: '📚' }
        ]
      },
      'productivity': {
        name: 'Productivity',
        description: 'Boost your productivity with the best apps for task management, note-taking, and workflow optimization.',
        icon: '⚡',
        color: '#FFC107',
        totalApps: 3456,
        subcategories: [
          { id: 'task-management', label: 'Task Management', count: 487, icon: '✅' },
          { id: 'note-taking', label: 'Note Taking', count: 356, icon: '📝' },
          { id: 'calendar', label: 'Calendar & Scheduling', count: 234, icon: '📅' },
          { id: 'time-tracking', label: 'Time Tracking', count: 198, icon: '⏰' },
          { id: 'focus-tools', label: 'Focus Tools', count: 145, icon: '🎯' },
          { id: 'automation', label: 'Automation', count: 287, icon: '🤖' },
          { id: 'file-management', label: 'File Management', count: 432, icon: '📁' },
          { id: 'mind-mapping', label: 'Mind Mapping', count: 123, icon: '🧠' },
          { id: 'collaboration', label: 'Collaboration', count: 1194, icon: '🤝' }
        ]
      },
      'utilities': {
        name: 'Utilities',
        description: 'Essential utility apps to optimize your device performance and daily workflow.',
        icon: '🛠️',
        color: '#607D8B',
        totalApps: 1287,
        subcategories: [
          { id: 'system-optimization', label: 'System Optimization', count: 234, icon: '⚡' },
          { id: 'security', label: 'Security & Privacy', count: 198, icon: '🔒' },
          { id: 'file-conversion', label: 'File Conversion', count: 156, icon: '🔄' },
          { id: 'backup', label: 'Backup & Recovery', count: 89, icon: '💾' },
          { id: 'password-manager', label: 'Password Manager', count: 67, icon: '🔑' },
          { id: 'compression', label: 'Compression Tools', count: 45, icon: '📦' },
          { id: 'cleaning', label: 'Cleaning Tools', count: 134, icon: '🧹' },
          { id: 'diagnostics', label: 'System Diagnostics', count: 78, icon: '🔍' },
          { id: 'network-tools', label: 'Network Tools', count: 286, icon: '🌐' }
        ]
      }
    };

    return categories[slug] || categories['education'];
  }

  async function loadCategoryApps() {
    loading = true;
    try {
      // 获取现有分类应用
      const categoryResponse = await fetch(`/api/category/${categorySlug}?subcategory=${selectedSubcategory}&sort=${sortBy}`);
      let allApps = [];

      if (categoryResponse.ok) {
        const categoryApps = await categoryResponse.json();
        allApps = Array.isArray(categoryApps) ? categoryApps : categoryApps.apps || [];
      }

      // 获取用户提交的已批准应用
      try {
        const submittedResponse = await fetch(`/api/submitted-apps?status=approved&category=${categorySlug}&limit=100`);
        if (submittedResponse.ok) {
          const submittedData = await submittedResponse.json();
          const submittedApps = submittedData.apps || [];
          // 合并应用，提交的应用排在前面
          allApps = [...submittedApps, ...allApps];
        }
      } catch (submittedError) {
        console.warn('Failed to load submitted apps:', submittedError);
      }

      categoryApps = allApps.length > 0 ? allApps : getMockCategoryApps();

    } catch (error) {
      console.error('Failed to load category apps:', error);
      categoryApps = getMockCategoryApps();
    } finally {
      loading = false;
    }
  }

  function getMockCategoryApps() {
    const baseApps = [
      {
        id: '1',
        name: `${categoryInfo.name} Pro`,
        description: `Leading ${categoryInfo.name.toLowerCase()} application with advanced features and intuitive interface.`,
        icon: categoryInfo.icon,
        rating: 4.7 + Math.random() * 0.3,
        reviewCount: Math.floor(Math.random() * 50000) + 1000,
        price: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 50) + 5,
        currency: 'USD',
        platform: ['web', 'desktop', 'mobile'][Math.floor(Math.random() * 3)],
        category: categoryInfo.name,
        url: 'https://example.com'
      },
      {
        id: '2',
        name: `Master ${categoryInfo.name}`,
        description: `Professional-grade ${categoryInfo.toLowerCase()} tool for experts and enthusiasts alike.`,
        icon: '🎯',
        rating: 4.6 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 30000) + 500,
        price: Math.random() > 0.3 ? Math.floor(Math.random() * 80) + 10 : 0,
        currency: 'USD',
        platform: ['web', 'desktop', 'mobile'][Math.floor(Math.random() * 3)],
        category: categoryInfo.name,
        url: 'https://example.com'
      }
    ];

    // 生成更多app
    const moreApps = [];
    for (let i = 3; i <= 12; i++) {
      moreApps.push({
        id: i.toString(),
        name: `${categoryInfo.name} Suite ${i}`,
        description: `Comprehensive ${categoryInfo.toLowerCase()} solution with modern features.`,
        icon: ['⭐', '🚀', '💡', '🎨', '🔧', '📊', '🎯', '💎'][Math.floor(Math.random() * 8)],
        rating: 4.2 + Math.random() * 0.7,
        reviewCount: Math.floor(Math.random() * 25000) + 100,
        price: Math.random() > 0.4 ? Math.floor(Math.random() * 60) + 8 : 0,
        currency: 'USD',
        platform: ['web', 'desktop', 'mobile'][Math.floor(Math.random() * 3)],
        category: categoryInfo.name,
        url: 'https://example.com'
      });
    }

    return [...baseApps, ...moreApps];
  }

  function handleSubcategoryChange(subcategory) {
    selectedSubcategory = subcategory;
    loadCategoryApps();
  }

  function handleSortChange(sort) {
    sortBy = sort;
    loadCategoryApps();
  }
</script>

<svelte:head>
  <title>{categoryInfo?.name || 'Category'} Apps & Software | App Search</title>
  <meta name="description" content={categoryInfo?.description || 'Discover the best apps and software for your needs.'} />
  <meta name="keywords" content="{categoryInfo?.name || 'category'} apps, {categoryInfo?.name?.toLowerCase() || ''} software, best {categoryInfo?.name?.toLowerCase() || ''} apps" />
</svelte:head>

{#if categoryInfo}
<PageHeader
  title="{categoryInfo.name} Apps & Software"
  subtitle="{categoryInfo.description}"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="category-page">
  <div class="container">
    <!-- Category Hero Section -->
    <div class="category-hero">
      <div class="hero-content">
        <div class="category-icon" style="background: {categoryInfo.color}20;">
          {categoryInfo.icon}
        </div>
        <div class="hero-info">
          <h1 class="category-title">{categoryInfo.name}</h1>
          <p class="category-description">{categoryInfo.description}</p>
          <div class="category-stats">
            <span class="stat-item">
              <strong>{categoryInfo.totalApps.toLocaleString()}</strong> Apps
            </span>
            <span class="stat-item">
              <strong>{categoryInfo.subcategories.length}</strong> Categories
            </span>
            <span class="stat-item">
              <strong>4.7★</strong> Avg Rating
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-group">
        <h3>Subcategories</h3>
        <div class="subcategory-filters">
          {#each subcategories as subcategory}
            <button
              class="subcategory-button {selectedSubcategory === subcategory.id ? 'active' : ''}"
              on:click={() => handleSubcategoryChange(subcategory.id)}
            >
              <span class="subcategory-icon">{subcategory.icon}</span>
              <span class="subcategory-label">{subcategory.label}</span>
              <span class="subcategory-count">{subcategory.count}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="filter-group">
        <h3>Sort By</h3>
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

    <!-- Featured Apps -->
    <div class="featured-section">
      <div class="section-header">
        <h2>Featured {categoryInfo.name} Apps</h2>
        <p>Hand-picked applications that excel in {categoryInfo.name.toLowerCase()}</p>
      </div>

      {#if loading}
        <div class="loading-grid">
          {#each Array(6) as _}
            <div class="skeleton-card">
              <div class="skeleton-header">
                <div class="skeleton-icon"></div>
                <div class="skeleton-text skeleton-title"></div>
              </div>
              <div class="skeleton-description"></div>
              <div class="skeleton-meta">
                <div class="skeleton-rating"></div>
                <div class="skeleton-price"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="apps-grid">
          {#each categoryApps as app (app.id)}
            <AppCard
              {app}
              on:select={() => console.log('App selected:', app.name)}
            />
          {/each}
        </div>
      {/if}

      <div class="load-more-section">
        <button class="load-more-button">
          Load More Apps
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Related Categories -->
    <div class="related-categories">
      <h2>Related Categories</h2>
      <div class="related-grid">
        <a href="/categories/productivity" class="related-category">
          <div class="related-icon">⚡</div>
          <div class="related-info">
            <h4>Productivity</h4>
            <p>Boost your efficiency</p>
          </div>
        </a>
        <a href="/categories/design-creative" class="related-category">
          <div class="related-icon">🎨</div>
          <div class="related-info">
            <h4>Design & Creative</h4>
            <p>Creative tools and apps</p>
          </div>
        </a>
        <a href="/categories/business" class="related-category">
          <div class="related-icon">💼</div>
          <div class="related-info">
            <h4>Business</h4>
            <p>Professional tools</p>
          </div>
        </a>
      </div>
    </div>

    <!-- SEO Content -->
    <div class="seo-content">
      <h2>Why Choose Our {categoryInfo.name} App Recommendations?</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>Expert Curation</h3>
          <p>Our team of {categoryInfo.name.toLowerCase()} experts personally test and review every app to ensure quality and effectiveness.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⭐</div>
          <h3>Real User Reviews</h3>
          <p>Access authentic reviews from real users who have actually used these {categoryInfo.name.toLowerCase()} apps in their workflows.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔄</div>
          <h3>Always Updated</h3>
          <p>Our recommendations are regularly updated to include the latest {categoryInfo.name.toLowerCase()} apps and features.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h3>Personalized Matches</h3>
          <p>Find {categoryInfo.name.toLowerCase()} apps that match your specific needs, skill level, and budget requirements.</p>
        </div>
      </div>

      <div class="category-guide">
        <h3>How to Choose the Right {categoryInfo.name} App</h3>
        <div class="guide-steps">
          <div class="guide-step">
            <span class="step-number">1</span>
            <div class="step-content">
              <h4>Assess Your Needs</h4>
              <p>Consider your specific {categoryInfo.name.toLowerCase()} goals and requirements</p>
            </div>
          </div>
          <div class="guide-step">
            <span class="step-number">2</span>
            <div class="step-content">
              <h4>Compare Features</h4>
              <p>Look at the features and capabilities of different apps</p>
            </div>
          </div>
          <div class="guide-step">
            <span class="step-number">3</span>
            <div class="step-content">
              <h4>Check Compatibility</h4>
              <p>Ensure the app works with your devices and other tools</p>
            </div>
          </div>
          <div class="guide-step">
            <span class="step-number">4</span>
            <div class="step-content">
              <h4>Read Reviews</h4>
              <p>Learn from other users' experiences and expert opinions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/if}

<style>
  .category-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Category Hero */
  .category-hero {
    background: white;
    border-radius: 20px;
    padding: 50px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
  }

  .category-hero::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 50%;
    transform: translate(100px, -100px);
    opacity: 0.1;
  }

  .hero-content {
    display: flex;
    align-items: center;
    gap: 30px;
    position: relative;
    z-index: 1;
  }

  .category-icon {
    width: 100px;
    height: 100px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    flex-shrink: 0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .category-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .category-description {
    font-size: 1.2rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .category-stats {
    display: flex;
    gap: 30px;
  }

  .stat-item {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .stat-item strong {
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.1rem;
  }

  /* Filters Section */
  .filters-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
    margin-bottom: 40px;
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .filter-group h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .subcategory-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .subcategory-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .subcategory-button:hover {
    border-color: var(--primary-color);
  }

  .subcategory-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

  .subcategory-icon {
    font-size: 1rem;
  }

  .subcategory-count {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .subcategory-button.active .subcategory-count {
    background: rgba(255, 255, 255, 0.2);
  }

  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sort-button {
    padding: 12px 16px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
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

  /* Featured Section */
  .featured-section {
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
    font-size: 1.1rem;
  }

  /* Apps Grid */
  .apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
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
    margin-bottom: 15px;
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
    width: 150px;
  }

  .skeleton-title {
    width: 120px;
    height: 20px;
  }

  .skeleton-description {
    width: 100%;
    height: 16px;
    margin-bottom: 15px;
  }

  .skeleton-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .skeleton-rating {
    width: 80px;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  .skeleton-price {
    width: 40px;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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

  /* Related Categories */
  .related-categories {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .related-categories h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 30px;
    text-align: center;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .related-category {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 25px;
    background: var(--light-bg);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .related-category:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .related-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .related-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .related-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
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
    color: var(--text-primary);
    margin-bottom: 40px;
    text-align: center;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    margin-bottom: 50px;
  }

  .feature-item {
    text-align: center;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  .feature-item h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .feature-item p {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .category-guide {
    margin-top: 50px;
  }

  .category-guide h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 30px;
    text-align: center;
  }

  .guide-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .guide-step {
    display: flex;
    gap: 15px;
    padding: 25px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .step-number {
    width: 40px;
    height: 40px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-content h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .step-content p {
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .filters-section {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .hero-content {
      flex-direction: column;
      text-align: center;
    }

    .category-stats {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .category-page {
      padding: 40px 0;
    }

    .category-hero {
      padding: 30px 20px;
    }

    .category-title {
      font-size: 2rem;
    }

    .category-description {
      font-size: 1rem;
    }

    .category-stats {
      flex-direction: column;
      gap: 15px;
      align-items: center;
    }

    .filters-section {
      padding: 20px;
    }

    .subcategory-filters {
      justify-content: flex-start;
    }

    .featured-section {
      padding: 30px 20px;
    }

    .apps-grid {
      grid-template-columns: 1fr;
    }

    .seo-content {
      padding: 40px 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .guide-steps {
      grid-template-columns: 1fr;
    }
  }
</style>