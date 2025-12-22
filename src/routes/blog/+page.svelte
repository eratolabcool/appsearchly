<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  let blogPosts = [];
  let loading = true;
  let selectedCategory = 'all';
  let featuredPost = null;

  const categories = [
    { id: 'all', label: 'All Posts', icon: '📝' },
    { id: 'app-reviews', label: 'App Reviews', icon: '⭐' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'development', label: 'Development', icon: '💻' },
    { id: 'tutorials', label: 'Tutorials', icon: '📚' },
    { id: 'news', label: 'Industry News', icon: '📰' }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' }
  ];

  onMount(async () => {
    await loadBlogPosts();

    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Appsearchly Blog - Latest App Reviews, Tips & Industry News | App Search';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Appsearchly Blog',
        description: 'Discover the latest app reviews, productivity tips, design tutorials, and industry news from the Appsearchly team.',
        url: 'https://appsearchly.org/blog',
        mainEntity: blogPosts.map(post => ({
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          author: {
            '@type': 'Person',
            name: post.author
          },
          datePublished: post.date,
          dateModified: post.updatedDate,
          image: post.image
        }))
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  async function loadBlogPosts() {
    loading = true;
    try {
      const response = await fetch(`/api/blog-posts?category=${selectedCategory}`);
      if (response.ok) {
        const posts = await response.json();
        blogPosts = posts;
        featuredPost = posts[0]; // First post as featured
      } else {
        const mockPosts = getMockBlogPosts();
        blogPosts = mockPosts;
        featuredPost = mockPosts[0];
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      const mockPosts = getMockBlogPosts();
      blogPosts = mockPosts;
      featuredPost = mockPosts[0];
    } finally {
      loading = false;
    }
  }

  function getMockBlogPosts() {
    return [
      {
        id: '1',
        title: '10 AI Tools That Will Transform Your Workflow in 2024',
        excerpt: 'Discover the cutting-edge AI applications that are revolutionizing productivity and creativity in the modern workplace.',
        author: 'Sarah Chen',
        authorAvatar: '👩‍💼',
        authorRole: 'Tech Writer',
        date: '2024-01-15',
        readTime: 8,
        category: 'productivity',
        tags: ['AI', 'Productivity', 'Tools'],
        image: '/images/blog/ai-tools-2024.jpg',
        featured: true,
        content: 'Artificial intelligence is no longer a futuristic concept...'
      },
      {
        id: '2',
        title: 'The Ultimate Guide to Choosing Design Software in 2024',
        excerpt: 'A comprehensive comparison of the best design tools available, from Figma to Adobe Creative Suite and beyond.',
        author: 'Alex Rivera',
        authorAvatar: '👨‍🎨',
        authorRole: 'Design Expert',
        date: '2024-01-12',
        readTime: 12,
        category: 'design',
        tags: ['Design', 'Software', 'Comparison'],
        image: '/images/blog/design-software-guide.jpg',
        featured: false,
        content: 'Choosing the right design software can make or break your creative workflow...'
      },
      {
        id: '3',
        title: 'Remote Work Tools: What\'s Working and What Isn\'t',
        excerpt: 'An honest look at the tools that actually help distributed teams collaborate effectively versus those that fall short.',
        author: 'Marcus Johnson',
        authorAvatar: '👨‍💻',
        authorRole: 'Remote Work Specialist',
        date: '2024-01-10',
        readTime: 6,
        category: 'productivity',
        tags: ['Remote Work', 'Collaboration', 'Tools'],
        image: '/images/blog/remote-work-tools.jpg',
        featured: false,
        content: 'The shift to remote work has created a booming market for collaboration tools...'
      },
      {
        id: '4',
        title: 'Building Your First Mobile App: A Beginner\'s Guide',
        excerpt: 'Step-by-step tutorial for aspiring app developers, covering everything from idea to launch.',
        author: 'David Kim',
        authorAvatar: '👨‍💻',
        authorRole: 'App Developer',
        date: '2024-01-08',
        readTime: 15,
        category: 'tutorials',
        tags: ['Development', 'Mobile Apps', 'Tutorial'],
        image: '/images/blog/mobile-app-development.jpg',
        featured: false,
        content: 'Have you ever had an amazing idea for a mobile app but didn\'t know where to start?...'
      },
      {
        id: '5',
        title: 'The Rise of No-Code Platforms in 2024',
        excerpt: 'How no-code and low-code tools are democratizing software development and empowering non-technical creators.',
        author: 'Emma Watson',
        authorAvatar: '👩‍💻',
        authorRole: 'Tech Analyst',
        date: '2024-01-05',
        readTime: 10,
        category: 'development',
        tags: ['No-Code', 'Development', 'Innovation'],
        image: '/images/blog/no-code-platforms.jpg',
        featured: false,
        content: 'The no-code movement is transforming how we build software...'
      },
      {
        id: '6',
        title: 'App Store Optimization: Complete Guide for 2024',
        excerpt: 'Learn the strategies and techniques to get your app discovered and downloaded in crowded app stores.',
        author: 'Lisa Thompson',
        authorAvatar: '👩‍🎨',
        authorRole: 'Marketing Expert',
        date: '2024-01-03',
        readTime: 9,
        category: 'tutorials',
        tags: ['ASO', 'Marketing', 'Mobile Apps'],
        image: '/images/blog/app-store-optimization.jpg',
        featured: false,
        content: 'Building a great app is only half the battle - getting it discovered is equally important...'
      },
      {
        id: '7',
        title: 'Top Productivity Apps That Actually Work in 2024',
        excerpt: 'We tested dozens of productivity apps to find the ones that truly help you get more done.',
        author: 'Sarah Chen',
        authorAvatar: '👩‍💼',
        authorRole: 'Tech Writer',
        date: '2024-01-01',
        readTime: 7,
        category: 'app-reviews',
        tags: ['Productivity', 'Apps', 'Reviews'],
        image: '/images/blog/productivity-apps-2024.jpg',
        featured: false,
        content: 'In a world filled with productivity apps promising to change your life, which ones actually deliver?...'
      },
      {
        id: '8',
        title: 'The Future of Web Design: Trends to Watch in 2024',
        excerpt: 'From AI-powered design tools to immersive experiences, discover the trends shaping web design this year.',
        author: 'Alex Rivera',
        authorAvatar: '👨‍🎨',
        authorRole: 'Design Expert',
        date: '2023-12-28',
        readTime: 8,
        category: 'design',
        tags: ['Web Design', 'Trends', 'UI/UX'],
        image: '/images/blog/web-design-trends.jpg',
        featured: false,
        content: 'Web design is constantly evolving, and 2024 brings exciting new possibilities...'
      }
    ];
  }

  function handleCategoryChange(category) {
    selectedCategory = category;
    loadBlogPosts();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Appsearchly Blog - Latest App Reviews, Tips & Industry News | App Search</title>
  <meta name="description" content="Discover the latest app reviews, productivity tips, design tutorials, and industry news from the Appsearchly team. Stay updated with the best apps and software." />
  <meta name="keywords" content="app blog, software reviews, productivity tips, design tutorials, app news, tech blog" />
</svelte:head>

<PageHeader
  title="Appsearchly Blog"
  subtitle="Discover the latest app reviews, productivity tips, design tutorials, and industry insights from our expert team"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="blog-page">
  <div class="container">
    <!-- Category Filter -->
    <div class="category-filter">
      <div class="filter-container">
        <h3>Browse by Category</h3>
        <div class="category-buttons">
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

    <!-- Featured Post -->
    {#if featuredPost}
      <div class="featured-post">
        <div class="featured-badge">Featured Article</div>
        <div class="featured-content">
          <div class="featured-image">
            <div class="image-placeholder">{featuredPost.image ? '🖼️' : '📱'}</div>
          </div>
          <div class="featured-info">
            <div class="post-meta">
              <span class="category-badge">{featuredPost.category.replace('-', ' ')}</span>
              <span class="reading-time">{featuredPost.readTime} min read</span>
            </div>
            <h1 class="featured-title">{featuredPost.title}</h1>
            <p class="featured-excerpt">{featuredPost.excerpt}</p>
            <div class="author-info">
              <span class="author-avatar">{featuredPost.authorAvatar}</span>
              <div class="author-details">
                <div class="author-name">{featuredPost.author}</div>
                <div class="author-role">{featuredPost.authorRole} • {formatDate(featuredPost.date)}</div>
              </div>
            </div>
            <button class="read-more-button">
              Read Full Article
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Blog Posts Grid -->
    <div class="blog-content">
      <div class="section-header">
        <h2>Latest Articles</h2>
        <p>Expert insights, reviews, and tutorials to help you discover the best apps</p>
      </div>

      {#if loading}
        <div class="loading-grid">
          {#each Array(6) as _}
            <div class="skeleton-post">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-meta">
                  <div class="skeleton-category"></div>
                  <div class="skeleton-time"></div>
                </div>
                <div class="skeleton-title"></div>
                <div class="skeleton-excerpt"></div>
                <div class="skeleton-author">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-author-info"></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="blog-grid">
          {#each blogPosts.slice(1) as post (post.id)}
            <article class="blog-post">
              <div class="post-image">
                <div class="image-placeholder">{post.image ? '🖼️' : '📱'}</div>
              </div>
              <div class="post-content">
                <div class="post-meta">
                  <span class="category-badge">{post.category.replace('-', ' ')}</span>
                  <span class="reading-time">{post.readTime} min read</span>
                </div>
                <h3 class="post-title">{post.title}</h3>
                <p class="post-excerpt">{post.excerpt}</p>
                <div class="post-tags">
                  {#each post.tags as tag}
                    <span class="tag">#{tag}</span>
                  {/each}
                </div>
                <div class="author-info">
                  <span class="author-avatar">{post.authorAvatar}</span>
                  <div class="author-details">
                    <div class="author-name">{post.author}</div>
                    <div class="post-date">{formatDate(post.date)}</div>
                  </div>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}

      <!-- Load More -->
      <div class="load-more-section">
        <button class="load-more-button">
          Load More Articles
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Newsletter Section -->
    <div class="newsletter-section">
      <div class="newsletter-content">
        <div class="newsletter-icon">📧</div>
        <h2>Stay Updated with Latest App Insights</h2>
        <p>Get weekly updates on new app reviews, productivity tips, and industry trends delivered to your inbox.</p>
        <div class="newsletter-form">
          <input type="email" placeholder="Enter your email address" />
          <button class="subscribe-button">Subscribe</button>
        </div>
        <p class="newsletter-disclaimer">Join 10,000+ subscribers. No spam, unsubscribe anytime.</p>
      </div>
    </div>

    <!-- SEO Content Section -->
    <div class="seo-content">
      <h2>Why Follow the Appsearchly Blog?</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>Expert Reviews</h3>
          <p>Get in-depth reviews of the latest apps and software from our team of experts who test everything thoroughly.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <h3>Productivity Tips</h3>
          <p>Learn how to use apps more effectively and discover workflows that will boost your productivity.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <h3>Design Insights</h3>
          <p>Stay updated with the latest design trends and learn about the best tools for creative work.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">💻</div>
          <h3>Development Tutorials</h3>
          <p>Step-by-step guides for developers, from app creation to advanced coding techniques.</p>
        </div>
      </div>

      <div class="blog-stats">
        <h3>Blog Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">150+</div>
            <div class="stat-label">Articles Published</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50K+</div>
            <div class="stat-label">Monthly Readers</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">300+</div>
            <div class="stat-label">Apps Reviewed</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">4.8</div>
            <div class="stat-label">Reader Rating</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .blog-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Category Filter */
  .category-filter {
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 40px;
  }

  .filter-container h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .category-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .category-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--light-bg);
    border: 2px solid transparent;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .category-button:hover {
    border-color: var(--primary-color);
  }

  .category-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

  /* Featured Post */
  .featured-post {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    margin-bottom: 60px;
    position: relative;
  }

  .featured-badge {
    position: absolute;
    top: 20px;
    left: 20px;
    background: var(--gradient-primary);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    z-index: 1;
  }

  .featured-content {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 0;
  }

  .featured-image {
    background: var(--gradient-hero);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .image-placeholder {
    font-size: 4rem;
    opacity: 0.7;
  }

  .featured-info {
    padding: 50px;
  }

  .post-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .category-badge {
    background: var(--secondary-color);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .reading-time {
    color: var(--text-secondary);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .featured-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: 20px;
  }

  .featured-excerpt {
    font-size: 1.1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 30px;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
  }

  .author-avatar {
    font-size: 2rem;
  }

  .author-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .author-role {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .read-more-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .read-more-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  /* Blog Content */
  .blog-content {
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

  /* Loading Skeleton */
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }

  .skeleton-post {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .skeleton-image {
    height: 200px;
    background: #e2e8f0;
    animation: pulse 2s infinite;
  }

  .skeleton-content {
    padding: 25px;
  }

  .skeleton-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .skeleton-category,
  .skeleton-time {
    width: 80px;
    height: 20px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  .skeleton-title {
    width: 100%;
    height: 24px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 12px;
    animation: pulse 2s infinite;
  }

  .skeleton-excerpt {
    width: 100%;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 8px;
    animation: pulse 2s infinite;
  }

  .skeleton-excerpt:last-child {
    width: 70%;
    margin-bottom: 20px;
  }

  .skeleton-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .skeleton-avatar {
    width: 32px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .skeleton-author-info {
    flex: 1;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Blog Grid */
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
  }

  .blog-post {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .blog-post:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .post-image {
    height: 200px;
    background: var(--gradient-hero);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .post-content {
    padding: 25px;
  }

  .post-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .post-excerpt {
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }

  .tag {
    background: var(--light-bg);
    color: var(--text-secondary);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* Newsletter Section */
  .newsletter-section {
    background: var(--gradient-hero);
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    margin-bottom: 60px;
    color: white;
  }

  .newsletter-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .newsletter-section h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .newsletter-section p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .newsletter-form {
    display: flex;
    gap: 12px;
    max-width: 500px;
    margin: 0 auto 20px;
  }

  .newsletter-form input {
    flex: 1;
    padding: 14px 20px;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    outline: none;
  }

  .subscribe-button {
    padding: 14px 28px;
    background: white;
    color: var(--primary-color);
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .subscribe-button:hover {
    transform: scale(1.05);
  }

  .newsletter-disclaimer {
    font-size: 0.9rem;
    opacity: 0.8;
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

  .blog-stats {
    margin-top: 40px;
  }

  .blog-stats h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-item {
    text-align: center;
    padding: 20px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: 8px;
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .featured-content {
      grid-template-columns: 1fr;
    }

    .featured-image {
      min-height: 250px;
    }

    .featured-info {
      padding: 40px;
    }
  }

  @media (max-width: 768px) {
    .blog-page {
      padding: 40px 0;
    }

    .category-filter {
      padding: 20px;
    }

    .category-buttons {
      justify-content: flex-start;
    }

    .featured-info {
      padding: 30px;
    }

    .featured-title {
      font-size: 1.8rem;
    }

    .blog-grid,
    .loading-grid {
      grid-template-columns: 1fr;
    }

    .newsletter-section {
      padding: 40px 20px;
    }

    .newsletter-form {
      flex-direction: column;
    }

    .seo-content {
      padding: 40px 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>