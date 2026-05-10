
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import AppCard from '$lib/components/AppCard.svelte';

  let article = null;
  let relatedArticles = [];
  let loading = true;

  // 从URL参数获取文章slug
  $: articleSlug = $page.params.slug;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: article ? article.title : 'Loading...', href: `/blog/${articleSlug}` }
  ];

  onMount(async () => {
    await loadArticle();

    // SEO优化
    if (typeof window !== 'undefined' && article) {
      document.title = `${article.title} - App Search Blog`;

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        image: article.image,
        author: {
          '@type': 'Person',
          name: article.author,
          url: article.authorUrl || 'https://appsearchly.org'
        },
        datePublished: article.date,
        dateModified: article.updatedDate,
        publisher: {
          '@type': 'Organization',
          name: 'App Search',
          logo: {
            '@type': 'ImageObject',
            url: 'https://appsearchly.org/favicon.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPageElement',
          isAccessibleForFree: true,
          cssSelector: '.article-content'
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  async function loadArticle() {
    loading = true;
    try {
      const response = await fetch(`/api/blog/${articleSlug}`);
      if (response.ok) {
        const data = await response.json();
        article = data.article;
        relatedArticles = data.relatedArticles;
      } else {
        // 使用模拟数据
        article = getMockArticle(articleSlug);
        relatedArticles = getMockRelatedArticles();
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      article = getMockArticle(articleSlug);
      relatedArticles = getMockRelatedArticles();
    } finally {
      loading = false;
    }
  }

  function getMockArticle(slug) {
    const articles = {
      '10-ai-tools-transform-workflow-2024': {
        id: '1',
        title: '10 AI Tools That Will Transform Your Workflow in 2024',
        excerpt: 'Discover the cutting-edge AI applications that are revolutionizing productivity and creativity in the modern workplace.',
        author: 'Sarah Chen',
        authorAvatar: '👩‍💼',
        authorRole: 'Tech Writer',
        date: '2024-01-15',
        updatedDate: '2024-01-20',
        readTime: 8,
        category: 'productivity',
        tags: ['AI', 'Productivity', 'Tools', 'Workflow'],
        image: '/images/blog/ai-tools-2024.jpg',
        featured: true,
        content: `
          <h2>The AI Revolution is Here</h2>
          <p>Artificial intelligence is no longer a futuristic concept; it's here now, and it's transforming how we work. In 2024, we're seeing AI tools that can automate repetitive tasks, generate creative content, and even make strategic business decisions.</p>

          <p>From project management to content creation, AI tools are helping professionals work smarter, not harder. Let's explore the most impactful AI applications that are changing workflows across industries.</p>

          <h3>Why AI Tools Matter</h3>
          <p>The right AI tools can increase productivity by up to 40%, reduce human error, and provide insights that were previously impossible to obtain. They're not replacing humans but augmenting human capabilities.</p>

          <h2>Key Trends for 2024</h2>
          <ul>
            <li><strong>Conversational AI</strong> - ChatGPT and similar tools are becoming more sophisticated</li>
            <li><strong>AI-Powered Development</strong> - GitHub Copilot and other AI coding assistants</li>
            <li><strong>Visual AI</strong> - Midjourney and DALL-E are democratizing design</li>
            <li><strong>AI Analytics</strong> - Better data insights and predictions</li>
          </ul>

          <h2>Getting Started with AI Tools</h3>
          <p>Start with tools that solve your most pressing problems. Document your current workflow and identify where AI can provide the most value. Remember that AI tools are meant to assist, not replace, human judgment.</p>
        `,
        wordCount: 1500,
        views: 12500
      },
      'ultimate-guide-design-software-2024': {
        id: '2',
        title: 'The Ultimate Guide to Choosing Design Software in 2024',
        excerpt: 'A comprehensive comparison of the best design tools available, from Figma to Adobe Creative Suite and beyond.',
        author: 'Alex Rivera',
        authorAvatar: '👨‍🎨',
        authorRole: 'Design Expert',
        date: '2024-01-12',
        updatedDate: '2024-01-18',
        readTime: 12,
        category: 'design',
        tags: ['Design', 'Software', 'Comparison', 'Tools'],
        image: '/images/blog/design-software-guide.jpg',
        featured: false,
        content: `
          <h2>The Design Software Landscape</h2>
          <p>The design software market has evolved significantly in recent years. What was once dominated by Adobe's Creative Suite now includes powerful competitors that are changing how designers work.</p>

          <h3>Cloud vs Desktop</h3>
          <p>Cloud-based design tools offer collaboration features that traditional desktop apps can't match. Desktop tools still excel in performance and offline capabilities. Your choice depends on your team's workflow and needs.</p>

          <h2>Key Factors for Choosing Design Software</h2>
          <ul>
            <li><strong>Collaboration Features</strong> - Real-time editing and commenting</li>
            <li><strong>Performance</strong> - Speed and resource usage</li>
            <li><strong>Integration</strong> - Compatibility with other tools</li>
            <li><strong>Learning Curve</strong> - Ease of adoption for your team</li>
            <li><strong>Cost</strong> - Subscription vs one-time purchase</li>
          </ul>

          <h2>Top Design Tools by Category</h2>
          <p>We've categorized the best design tools by use case to help you make the right choice for your specific needs.</p>
        `,
        wordCount: 2000,
        views: 8900
      },
      'remote-work-tools-working-2024': {
        id: '3',
        title: 'Remote Work Tools That Actually Work in 2024',
        excerpt: 'An honest look at the tools that actually help distributed teams collaborate effectively versus those that fall short.',
        author: 'Marcus Johnson',
        authorAvatar: '👨‍💻',
        authorRole: 'Remote Work Specialist',
        date: '2024-01-10',
        updatedDate: '2024-01-15',
        readTime: 6,
        category: 'productivity',
        tags: ['Remote Work', 'Collaboration', 'Tools', 'Teams'],
        image: '/images/blog/remote-work-tools.jpg',
        featured: false,
        content: `
          <h2>The Remote Work Revolution</h2>
          <p>Remote work is here to stay, but success depends on having the right tools. Many organizations struggle with productivity because they use the wrong software or implement poor workflows.</p>

          <h3>What Works vs What Doesn't</h3>
          <p>Communication tools, project management platforms, and file sharing systems work well. Complex enterprise systems often create more problems than they solve for smaller teams.</p>

          <h2>Essential Remote Work Tools</h2>
          <p>After testing dozens of tools with remote teams, we've identified the ones that consistently deliver value and those that create friction.</p>

          <h3>Communication is Key</h3>
          <p>Clear, asynchronous communication channels are more important than real-time video calls. Teams that master async communication are more productive and have less meeting fatigue.</p>
        `,
        wordCount: 1800,
        views: 15600
      },
      'building-first-mobile-app-beginners-guide': {
        id: '4',
        title: 'Building Your First Mobile App: A Beginner\'s Guide',
        excerpt: 'Step-by-step tutorial for aspiring app developers, covering everything from idea to launch.',
        author: 'David Kim',
        authorAvatar: '👨‍💻',
        authorRole: 'App Developer',
        date: '2024-01-08',
        updatedDate: '2024-01-10',
        readTime: 15,
        category: 'development',
        tags: ['Mobile Apps', 'Development', 'Tutorial', 'Beginner'],
        image: '/images/blog/mobile-app-development.jpg',
        featured: false,
        content: `
          <h2>Your First Mobile App Journey</h2>
          <p>Building your first mobile app can feel overwhelming, but it's an achievable goal with the right guidance and approach.</p>

          <h3>Before You Start</h3>
          <p>Have a clear idea of what your app will do and who it's for. This clarity will guide your technology choices and feature decisions.</p>

          <h2>Choosing Your Platform</h2>
          <p>iOS (Swift/Objective-C), Android (Kotlin/Java), or cross-platform solutions? Each choice has pros and cons for different types of apps.</p>

          <h3>Native vs Cross-Platform</h3>
          <p>Native apps offer the best performance and user experience. Cross-platform solutions speed up development but may have performance tradeoffs.</p>
        `,
        wordCount: 2500,
        views: 23400
      },
      'no-code-platforms-rise-2024': {
        id: '5',
        title: 'The Rise of No-Code Platforms in 2024',
        excerpt: 'How no-code and low-code tools are democratizing software development and empowering non-technical creators.',
        author: 'Emma Watson',
        authorAvatar: '👩‍💻',
        authorRole: 'Tech Analyst',
        date: '2024-01-05',
        updatedDate: '2024-01-12',
        readTime: 10,
        category: 'development',
        tags: ['No-Code', 'Low-Code', 'Development', 'Innovation'],
        image: '/images/blog/no-code-platforms.jpg',
        featured: false,
        content: `
          <h2>The No-Code Revolution</h2>
          <p>No-code and low-code platforms are changing who can build software. They're empowering non-technical people to create sophisticated applications without writing code.</p>

          <h3>What Makes No-Code Powerful</h3>
          <p>Visual development environments, pre-built components, and automated testing make app creation accessible to everyone.</p>

          <h2>Popular No-Code Platforms</h2>
          <p>From simple websites to complex enterprise applications, there's a no-code solution for almost every use case.</p>

          <h3>Enterprise Adoption</h3>
          <p>Larger organizations are embracing no-code for rapid prototyping and internal tool development.</p>
        `,
        wordCount: 1600,
        views: 18900
      },
      'app-store-optimization-complete-guide-2024': {
        id: '6',
        title: 'App Store Optimization Complete Guide for 2024',
        excerpt: 'Learn the strategies and techniques to get your app discovered and downloaded in crowded app stores.',
        author: 'Lisa Thompson',
        authorAvatar: '👩‍🎨',
        authorRole: 'Marketing Expert',
        date: '2024-01-03',
        updatedDate: '2024-01-10',
        readTime: 9,
        category: 'marketing',
        tags: ['ASO', 'Marketing', 'Mobile Apps', 'App Store'],
        image: '/images/blog/app-store-optimization.jpg',
        featured: false,
        content: `
          <h2>App Store Optimization Fundamentals</h2>
          <p>ASO (App Store Optimization) is critical for getting your app discovered in crowded app stores.</p>

          <h3>Keyword Research</h3>
          <p>Understanding how users search for apps like yours is the foundation of effective ASO strategy.</p>

          <h2>On-Page Optimization</h2>
          <p>Your app title, description, and keywords all impact your visibility in search results.</p>

          <h3>Off-Page Factors</h3>
          <p>Reviews, downloads, and user engagement signals all influence your app's ranking.</p>
        `,
        wordCount: 2200,
        views: 45600
      },
      'top-productivity-apps-actually-work': {
        id: '7',
        title: 'Top Productivity Apps That Actually Work',
        excerpt: 'We tested dozens of productivity apps to find the ones that truly help you get more done.',
        author: 'Sarah Chen',
        authorAvatar: '👩‍💼',
        authorRole: 'Tech Writer',
        date: '2024-01-01',
        updatedDate: '2024-01-15',
        readTime: 7,
        category: 'productivity',
        tags: ['Productivity', 'Apps', 'Reviews', 'Testing'],
        image: '/images/blog/productivity-apps-2024.jpg',
        featured: false,
        content: `
          <h2>Honest Productivity Testing</h2>
          <p>We tested dozens of productivity apps to find the ones that actually deliver on their promises.</p>

          <h3>The Results Were Surprising</h3>
          <p>Many popular apps have poor user experiences despite their marketing claims.</p>

          <h2>What We Found</h3>
          <p>Simple, focused tools often outperform feature-rich applications that try to do everything.</p>

          <h3>The Best Productivity Apps</h3>
          <p>We share our top recommendations based on real-world testing and user feedback.</p>
        `,
        wordCount: 1400,
        views: 67800
      },
      'future-web-design-trends-2024': {
        id: '8',
        title: 'The Future of Web Design: Trends to Watch in 2024',
        excerpt: 'From AI-powered design tools to immersive experiences, discover the trends shaping web design this year.',
        author: 'Alex Rivera',
        authorAvatar: '👨‍🎨',
        authorRole: 'Design Expert',
        date: '2023-12-28',
        updatedDate: '2024-01-05',
        readTime: 8,
        category: 'design',
        tags: ['Web Design', 'Trends', 'UI/UX', 'Future'],
        image: '/images/blog/web-design-trends.jpg',
        featured: false,
        content: `
          <h2>Web Design Evolution</h2>
          <p>Web design is constantly evolving, and 2024 brings exciting new possibilities for designers and developers.</p>

          <h3>AI-Powered Design</h3>
          <p>AI is now helping designers create better designs faster and more efficiently.</p>

          <h2>Emerging Trends</h2>
          <p>From immersive experiences to adaptive designs, see what's next in web design.</p>

          <h3>Design Systems</h3>
          <p>Consistent design systems are becoming essential for larger organizations.</p>
        `,
        wordCount: 1300,
        views: 34200
      }
    };

    return articles[slug] || articles['10-ai-tools-transform-workflow-2024'];
  }

  function getMockRelatedArticles() {
    return [
      {
        id: '9',
        title: 'Essential Tools for Remote Teams',
        excerpt: 'Must-have tools for distributed teams to stay productive.',
        author: 'Alex Rivera',
        authorAvatar: '👨‍🎨',
        date: '2024-01-10',
        readTime: 6
      },
      {
        id: '10',
        title: 'Mobile App Development Best Practices',
        excerpt: 'Learn the best practices for building successful mobile applications.',
        author: 'David Kim',
        authorAvatar: '👨‍💻',
        date: '2024-01-08',
        readTime: 10
      },
      {
        id: '11',
        title: 'Choosing the Right Design Software',
        excerpt: 'A comprehensive comparison for designers and creative professionals.',
        author: 'Emma Watson',
        authorAvatar: '👩‍💻',
        date: '2023-12-15',
        readTime: 8
      },
      {
        id: '12',
        title: 'Productivity Tips for 2024',
        excerpt: 'Boost your productivity with these expert tips and strategies.',
        author: 'Sarah Chen',
        authorAvatar: '👩‍💼',
        date: '2024-01-01',
        readTime: 5
      }
    ];
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getReadingTime(wordCount) {
    return Math.ceil(wordCount / 200);
  }
</script>

<svelte:head>
  <title>{article ? `${article.title} - App Search Blog` : 'Loading...'}</title>
  <meta name="description" content={article ? article.excerpt : 'Read the latest articles and insights from App Search about apps, software, and productivity.'} />
  <meta name="keywords" content={article ? article.tags.join(', ') : 'app blog, software reviews, tech insights'} />
</svelte:head>

<PageHeader
  title="{article ? article.title : 'Loading...'}"
  subtitle="{article ? `By ${article.author} • ${formatDate(article.date)} • ${getReadingTime(article.wordCount)} min read` : ''}"
/>

<Breadcrumb items={breadcrumbItems} />

{#if loading}
  <section class="article-page">
    <div class="container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    </div>
  </section>
{:else if article}
  <section class="article-page">
    <div class="container">
      <!-- Article Header -->
      <div class="article-header">
        <div class="article-meta">
          <div class="category-badge">{article.category}</div>
          <div class="article-date">
            <span class="date">📅 {formatDate(article.date)}</span>
            {#if article.updatedDate !== article.date && article.updatedDate}
              <span class="updated">Updated {formatDate(article.updatedDate)}</span>
            {/if}
          </div>
        </div>

        <div class="author-info">
          <span class="author-avatar">{article.authorAvatar}</span>
          <div class="author-details">
            <span class="author-name">{article.author}</span>
            <span class="author-role">{article.authorRole}</span>
          </div>
        </div>
      </div>

      <!-- Article Image -->
      {#if article.image}
        <div class="article-image">
          <img src={article.image} alt={article.title} />
        </div>
      {/if}

      <!-- Article Content -->
      <div class="article-content">
        {@html article.content}
      </div>

      <!-- Article Stats -->
      <div class="article-stats">
        <div class="stat-item">
          <div class="stat-number">{article.views.toLocaleString()}</div>
          <div class="stat-label">Views</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{getReadingTime(article.wordCount)} min</div>
          <div class="stat-label">Read Time</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{article.wordCount}</div>
          <div class="stat-label">Words</div>
        </div>
      </div>

      <!-- Tags -->
      <div class="article-tags">
        {#each article.tags as tag}
          <span class="tag">#{tag}</span>
        {/each}
      </div>

      <!-- Share Section -->
      <div class="share-section">
        <h3>Share this article</h3>
        <div class="share-buttons">
          <button class="share-button twitter" aria-label="Share on Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 1-3.42-1.73a7.28 7.28 0 0113.42-1.73 7.28 7.28 0 003.42 1.73 7.28 7.28z"/>
            </svg>
            Twitter
          </button>
          <button class="share-button linkedin" aria-label="Share on LinkedIn">
            <svg width="20" height="eight" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20H3.53C2.21 20 1 19.79 18.99 19 18.49S2.22 17 3.53 2H3.53z M7 3.1v13.37h2V3.1z"/>
              <path d="M9.4 14.25L12 12l2.6-2.75"/>
            </svg>
            LinkedIn
          </button>
          <button class="share-button facebook" aria-label="Share on Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-11.993C18.627.08 24 4.673 24 11.007c3.334 0 6.334-.042.673 0-6.673-4.673-11.007C18.627.08 24 4.673 24 11.007c3.334 0 6.334-.042.673 0-6.673-4.673-11.007C18.627.08 24 4.673 24 11.007z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Related Articles -->
  {#if relatedArticles.length > 0}
    <section class="related-articles">
      <div class="container">
        <h2>Related Articles</h2>
        <div class="related-grid">
          {#each relatedArticles as relatedArticle (relatedArticle.id)}
            <article class="related-article">
              <a href={`/blog/${relatedArticle.id}`} class="related-link">
                <div class="related-info">
                  <h4>{relatedArticle.title}</h4>
                  <div class="related-meta">
                    <span class="related-date">{formatDate(relatedArticle.date)}</span>
                    <span class="related-author">{relatedArticle.author}</span>
                  </div>
                </div>
              </a>
            </article>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- Newsletter Section -->
  <section class="newsletter-section">
    <div class="container">
      <div class="newsletter-content">
        <h3>📧 Stay Updated</h3>
        <p>Get the latest app reviews, productivity tips, and industry insights delivered to your inbox.</p>
        <div class="newsletter-form">
          <input type="email" placeholder="Enter your email address" />
          <button class="subscribe-button">Subscribe</button>
        </div>
        <p class="newsletter-disclaimer">Join 10,000+ subscribers. No spam, unsubscribe anytime.</p>
      </div>
    </div>
  </section>

{/if}

<style>
  .article-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--primary-color);
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Article Header */
  .article-header {
    margin-bottom: 40px;
    padding: 30px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }

  .category-badge {
    background: var(--gradient-primary);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .article-date {
    display: flex;
    flex-direction: column;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .updated {
    color: var(--text-secondary);
    font-style: italic;
    font-size: 0.8rem;
    margin-top: 4px;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-avatar {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .author-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .author-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .author-role {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  /* Article Image */
  .article-image {
    margin-bottom: 40px;
    border-radius: 12px;
    overflow: hidden;
  }

  .article-image img {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }

  /* Article Content */
  .article-content {
    background: white;
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 40px;
    line-height: 1.6;
  }

  .article-content :global(h1),
  .article-content :global(h2),
  .article-content :global(h3),
  .article-content :global(h4) {
    color: var(--text-primary);
    margin-top: 2.5rem;
    margin-bottom: 1rem;
  }

  .article-content :global(p) {
    margin-bottom: 1.5rem;
  }

  .article-content ul,
  .article-content ol {
    margin: 1.5rem 0;
    padding-left: 20px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .article-content li {
    margin-bottom: 0.5rem;
  }

  /* Article Stats */
  .article-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
    padding: 25px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 4px;
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Tags */
  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 40px;
  }

  .tag {
    background: var(--light-bg);
    color: var(--text-secondary);
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background: var(--primary-color);
    color: white;
  }

  /* Share Section */
  .share-section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 60px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .share-section h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .share-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .share-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--light-bg);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .share-button.twitter {
    color: #1DA1F2;
    border-color: #1DA1F2;
  }

  .share-button.linkedin {
    color: #0077B5E;
    border-color: #0077B5E;
  }

  .share-button.facebook {
    color: #1877F2;
    border-color: #1877F2;
  }

  .share-button svg {
    width: 16px;
    height: 16px;
  }

  /* Related Articles */
  .related-articles {
    background: white;
    border-radius: 16px;
    padding: 40px;
    margin-bottom: 60px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .related-articles h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 30px;
    text-align: center;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .related-article {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .related-article:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .related-link {
    display: block;
    padding: 25px;
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .related-link:hover {
    background: var(--light-bg);
  }

  .related-info {
    padding: 0 0 10px 0;
  }

  .related-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .related-meta {
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .related-date,
  .related-author {
    display: block;
    margin-top: 2px;
  }

  /* Newsletter Section */
  .newsletter-section {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 16px;
    padding: 50px;
    color: white;
    text-align: center;
    margin-bottom: 60px;
  }

  .newsletter-content h3 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .newsletter-content p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .newsletter-form {
    display: flex;
    gap: 12px;
    max-width: 400px;
    margin: 0 auto;
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
    transition: all 0.3s ease;
  }

  .subscribe-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
  }

  .newsletter-disclaimer {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 10px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .article-page {
      padding: 40px 0;
    }

    .article-header {
      padding: 20px;
    }

    .article-meta {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }

    .author-info {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .article-content {
      padding: 30px 20px;
    }

    .article-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      padding: 20px;
    }

    .share-buttons {
      justify-content: center;
    }

    .related-articles {
      padding: 30px 20px;
    }

    .related-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .related-article {
      padding: 20px;
    }

    .related-link {
      padding: 20px;
    }

    .newsletter-section {
      padding: 40px 20px;
    }

    .newsletter-form {
      flex-direction: column;
      max-width: 100%;
    }
  }
</style>