<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  const categories = [
    {
      id: 'productivity',
      name: 'Productivity',
      icon: '⚡',
      description: 'Tools to boost your efficiency and workflow',
      color: '#60a5fa',
      count: 1250,
      subcategories: [
        { name: 'Task Management', count: 180, icon: '📋' },
        { name: 'Note Taking', count: 220, icon: '📝' },
        { name: 'Calendar', count: 150, icon: '📅' },
        { name: 'Email Clients', count: 95, icon: '📧' },
        { name: 'Project Management', count: 165, icon: '📊' },
        { name: 'Time Tracking', count: 140, icon: '⏰' }
      ]
    },
    {
      id: 'design-creative',
      name: 'Design & Creative',
      icon: '🎨',
      description: 'Visual design, illustration, and creative tools',
      color: '#8b5cf6',
      count: 890,
      subcategories: [
        { name: 'Graphic Design', count: 195, icon: '🎭' },
        { name: 'UI/UX Design', count: 140, icon: '🎛️' },
        { name: 'Illustration', count: 110, icon: '🖌️' },
        { name: 'Photo Editing', count: 85, icon: '📷' },
        {name: 'Video Editing', count: 125, icon: '🎬' },
        { name: '3D Design', count: 90, icon: '🏗️' }
      ]
    },
    {
      id: 'development',
      name: 'Development',
      icon: '💻',
      description: 'Software development and coding tools',
      color: '#f59e0b',
      count: 1560,
      subcategories: [
        { name: 'Code Editors', count: 180, icon: '📝' },
        { name: 'IDE & Tools', count: 220, icon: '🛠️' },
        { name: 'Version Control', count: 95, icon: '🔄' },
        { name: 'Testing', count: 130, icon: '🧪' },
        { name: 'API Tools', count: 150, icon: '🔌' },
        { name: 'Database', count: 105, icon: '🗄️' }
      ]
    },
    {
      id: 'business',
      name: 'Business',
      icon: '💼',
      description: 'Business management and finance applications',
      color: '#10b981',
      count: 780,
      subcategories: [
        { name: 'Accounting', count: 145, icon: '💰' },
        { name: 'CRM', count: 110, icon: '🤝' },
        { name: 'Marketing', count: 95, icon: '📈' },
        { name: 'Sales', count: 85, icon: '💼' },
        { name: 'HR Management', count: 120, icon: '👥' },
        { name: 'Analytics', count: 165, icon: '📊' }
      ]
    },
    {
      id: 'education',
      name: 'Education',
      icon: '📚',
      description: 'Learning and educational tools and platforms',
      color: '#ef4444',
      count: 920,
      subcategories: [
        { name: 'Language Learning', count: 135, icon: '🗣️' },
        { name: 'Math & Science', count: 110, icon: '🧮' },
        { name: 'Programming', count: 185, icon: '💻' },
        { name: 'Online Courses', count: 155, icon: '📚' },
        { name: 'Reference', count: 125, icon: '📖' },
        { name: 'Study Tools', count: 95, icon: '📓' }
      ]
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎮',
      description: 'Games, media, and entertainment applications',
      color: '#ec4899',
      count: 2100,
      subcategories: [
        { name: 'Games', count: 1450, icon: '🎮' },
        { name: 'Music & Audio', count: 320, icon: '🎵' },
        { name: 'Video & Streaming', count: 210, icon: '🎬' },
        { name: 'Social Media', count: 120, icon: '📱' },
        { name: 'Podcasts', count: 95, icon: '🎙️' },
        { name: 'Books & Reading', count: 175, icon: '📖' }
      ]
    }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      // Update document title
      document.title = 'App Categories - Discover Apps by Category | Appsearchly.org';

      // Add structured data
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'App Categories',
        description: 'Browse apps and software by category. Find the perfect productivity, design, development, business, education, or entertainment apps for your needs.',
        url: 'https://appsearchly.org/categories',
        mainEntity: categories.map(cat => ({
          '@type': 'Thing',
          name: cat.name,
          description: cat.description,
          url: `https://appsearchly.org/category/${cat.id}`
        }))
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });
</script>

<svelte:head>
  <title>App Categories - Discover Apps by Category | Appsearchly.org</title>
  <meta name="description" content="Browse apps and software by category. Find the perfect productivity, design, development, business, education, or entertainment apps for your needs." />
  <meta name="keywords" content="app categories, productivity apps, design software, development tools, business apps, educational apps, entertainment apps" />
</svelte:head>

<PageHeader
  title="Browse App Categories"
  subtitle="Find the perfect apps by category with detailed subcategories and recommendations"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="categories-page">
  <div class="container">
    <div class="categories-grid">
      {#each categories as category}
        <a
          href="/category/{category.id}"
          class="category-card"
          style="--category-color: {category.color}"
        >
          <div class="category-header">
            <div class="category-icon" style="background: {category.color}20;">
              {category.icon}
            </div>
            <div class="category-info">
              <h3 class="category-name">{category.name}</h3>
              <span class="category-count">{category.count} apps</span>
            </div>
          </div>
          <p class="category-description">{category.description}</p>

          <div class="subcategories-preview">
            <h4>Popular Subcategories:</h4>
            <div class="subcategories-grid">
              {#each category.subcategories.slice(0, 3) as subcategory}
                <div class="subcategory-item">
                  <span class="subcategory-icon">{subcategory.icon}</span>
                  <span class="subcategory-name">{subcategory.name}</span>
                  <span class="subcategory-count">{subcategory.count}</span>
                </div>
              {/each}
            </div>
            {#if category.subcategories.length > 3}
              <div class="more-subcategories">
                +{category.subcategories.length - 3} more
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    <!-- SEO Content Section -->
    <div class="seo-content">
      <h2>Why Choose Appsearchly.org for App Discovery?</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>Comprehensive Categories</h3>
          <p>Browse through 6 main categories with detailed subcategories, ensuring you find exactly what you need.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⭐</div>
          <h3>Expert Reviews</h3>
          <p>Every app is carefully reviewed and rated by our expert team to help you make informed decisions.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔄</div>
          <h3>Smart Alternatives</h3>
          <p>Discover perfect alternatives to popular apps you already know and use.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <h3>Latest Trends</h3>
          <p>Stay updated with trending apps and newly discovered software in your favorite categories.</p>
        </div>
      </div>

      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">10,000+</div>
            <div class="stat-label">Total Apps</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">36</div>
            <div class="stat-label">Subcategories</div>
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
    </div>
  </div>
</section>

<style>
  .categories-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 32px;
    margin-bottom: 80px;
  }

  .category-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .category-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--category-color);
  }

  .category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    border-color: var(--category-color);
  }

  .category-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 20px;
  }

  .category-icon {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .category-info {
    flex: 1;
  }

  .category-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .category-count {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .category-description {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;
    flex-grow: 1;
  }

  .subcategories-preview {
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
  }

  .subcategories-preview h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  }

  .subcategories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .subcategory-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--light-bg);
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .subcategory-icon {
    font-size: 1rem;
  }

  .subcategory-name {
    color: var(--text-secondary);
    flex: 1;
  }

  .subcategory-count {
    color: var(--text-secondary);
    font-weight: 600;
    background: var(--category-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
  }

  .more-subcategories {
    color: var(--primary-color);
    font-weight: 600;
    text-align: center;
    margin-top: 8px;
    font-size: 0.9rem;
  }

  .seo-content {
    background: white;
    border-radius: 20px;
    padding: 60px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .seo-content h2 {
    font-size: 2.5rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 60px;
    color: var(--text-primary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 60px;
  }

  .feature-item {
    text-align: center;
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    color: var(--primary-color);
  }

  .feature-item h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .feature-item p {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .stats-section {
    background: var(--gradient-hero);
    border-radius: 16px;
    padding: 40px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .categories-page {
      padding: 40px 0;
    }

    .categories-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .seo-content {
      padding: 40px 30px;
    }

    .seo-content h2 {
      font-size: 2rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>