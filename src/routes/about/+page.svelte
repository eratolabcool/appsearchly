
<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'About AppSearchly | Our Mission & Team';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About AppSearchly',
        description: 'Learn about AppSearchly - Your intelligent app discovery platform. Our mission is to help you find the perfect apps for your needs.',
        url: 'https://www.appsearchly.com/about',
        mainEntity: {
          '@type': 'Organization',
          name: 'AppSearchly',
          description: 'Intelligent app discovery platform',
          url: 'https://www.appsearchly.com'
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });
</script>

<svelte:head>
  <title>About AppSearchly | Our Mission & Team</title>
  <meta name="description" content="Learn about AppSearchly - Your intelligent app discovery platform. Our mission is to help you find the perfect apps for your needs with expert reviews and recommendations." />
  <meta name="keywords" content="about appsearchly, app discovery, app search platform, app reviews, team, mission" />
</svelte:head>

<PageHeader
  title="About AppSearchly"
  subtitle="Your intelligent app discovery platform helping millions find their perfect apps"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="about-page">
  <div class="container">
    <!-- Mission Section -->
    <div class="mission-section">
      <div class="section-header">
        <h2>🎯 Our Mission</h2>
      </div>
      <div class="mission-content">
        <div class="mission-text">
          <p class="mission-statement">
            <strong>Empowering everyone to discover and choose the best apps for their unique needs.</strong>
          </p>
          <p>
            In today's digital world with millions of apps available across platforms, finding the right software can be overwhelming. AppSearchly was founded with a simple yet powerful mission: to make app discovery intelligent, personalized, and trustworthy.
          </p>
          <p>
            We combine cutting-edge AI technology with human expertise to provide you with accurate app recommendations, detailed reviews, and real user insights - all in one platform.
          </p>
        </div>
        <div class="mission-stats">
          <div class="stat-item">
            <div class="stat-number">10M+</div>
            <div class="stat-label">Users Helped</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50K+</div>
            <div class="stat-label">Apps Reviewed</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">150K+</div>
            <div class="stat-label">Expert Reviews</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">4.8★</div>
            <div class="stat-label">User Rating</div>
          </div>
        </div>
      </div>
    </div>

    <!-- What We Do -->
    <div class="what-we-do">
      <div class="section-header">
        <h2>🔍 What We Do</h2>
        <p>Comprehensive app discovery powered by technology and human expertise</p>
      </div>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🤖</div>
          <h3>AI-Powered Discovery</h3>
          <p>Our intelligent algorithms analyze your needs, preferences, and usage patterns to recommend the perfect apps for you.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">👥</div>
          <h3>Expert Reviews</h3>
          <p>Our team of tech experts thoroughly test and review apps, providing honest insights and detailed analysis.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔍</div>
          <h3>Smart Comparisons</h3>
          <p>Easily compare features, pricing, and performance across different apps to make informed decisions.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">💎</div>
          <h3>Curated Collections</h3>
          <p>Hand-picked app collections for specific needs, industries, and use cases, saving you time and effort.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⭐</div>
          <h3>Real User Feedback</h3>
          <p>Access authentic user reviews, ratings, and experiences from our vibrant community of app enthusiasts.</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔄</div>
          <h3>Always Updated</h3>
          <p>Stay current with the latest app releases, updates, trends, and industry news in real-time.</p>
        </div>
      </div>
    </div>

    <!-- Why Choose Us -->
    <div class="why-choose">
      <div class="section-header">
        <h2>✨ Why Choose AppSearchly?</h2>
      </div>

      <div class="reasons-grid">
        <div class="reason-item">
          <div class="reason-icon">🎯</div>
          <div class="reason-content">
            <h3>Personalized Recommendations</h3>
            <p>Unlike generic app stores, our recommendations are tailored to your specific needs, preferences, and workflow.</p>
          </div>
        </div>

        <div class="reason-item">
          <div class="reason-icon">⚖️</div>
          <div class="reason-content">
            <h3>Unbiased & Honest</h3>
            <p>We maintain strict editorial independence. Our reviews are always honest and never influenced by partnerships or payments.</p>
          </div>
        </div>

        <div class="reason-item">
          <div class="reason-icon">🚀</div>
          <div class="reason-content">
            <h3>Save Time & Money</h3>
            <p>Find the right app the first time and avoid costly mistakes with our comprehensive testing and comparison tools.</p>
          </div>
        </div>

        <div class="reason-item">
          <div class="reason-icon">🌍</div>
          <div class="reason-content">
            <h3>Comprehensive Coverage</h3>
            <p>We cover apps across all platforms - iOS, Android, Web, Desktop, and emerging technologies.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Our Values -->
    <div class="values-section">
      <div class="section-header">
        <h2>🏆 Our Values</h2>
        <p>The principles that guide everything we do</p>
      </div>

      <div class="values-grid">
        <div class="value-item">
          <h3>Integrity</h3>
          <p>We always put our users first and maintain the highest standards of honesty and transparency in everything we do.</p>
        </div>

        <div class="value-item">
          <h3>Innovation</h3>
          <p>We continuously push the boundaries of technology to create better, smarter ways to discover and evaluate apps.</p>
        </div>

        <div class="value-item">
          <h3>Quality</h3>
          <p>We are obsessed with providing accurate, helpful, and actionable information that helps you make better decisions.</p>
        </div>

        <div class="value-item">
          <h3>Community</h3>
          <p>We believe in the power of shared knowledge and building a supportive community of app enthusiasts and experts.</p>
        </div>
      </div>
    </div>

    <!-- Our Team -->
    <div class="team-section">
      <div class="section-header">
        <h2>👋 Meet Our Team</h2>
        <p>The passionate people behind AppSearchly</p>
      </div>

      <div class="team-grid">
        <div class="team-member">
          <div class="member-avatar">👨‍💼</div>
          <div class="member-info">
            <h4>Michael Chen</h4>
            <p class="member-role">Founder & CEO</p>
            <p class="member-bio">15+ years in tech product development, passionate about making technology accessible to everyone.</p>
          </div>
        </div>

        <div class="team-member">
          <div class="member-avatar">👩‍💻</div>
          <div class="member-info">
            <h4>Sarah Johnson</h4>
            <p class="member-role">Head of Content</p>
            <p class="member-bio">Tech writer and app enthusiast, focused on creating insightful reviews and comparisons.</p>
          </div>
        </div>

        <div class="team-member">
          <div class="member-avatar">👨‍💻</div>
          <div class="member-info">
            <h4>Alex Thompson</h4>
            <p class="member-role">Lead Developer</p>
            <p class="member-bio">Full-stack developer specializing in AI and machine learning for personalized recommendations.</p>
          </div>
        </div>

        <div class="team-member">
          <div class="member-avatar">👩‍🎨</div>
          <div class="member-info">
            <h4>Emily Davis</h4>
            <p class="member-role">UX Director</p>
            <p class="member-bio">Design thinking expert, creating intuitive and delightful app discovery experiences.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Join Us -->
    <div class="join-section">
      <div class="join-content">
        <h2>🚀 Join Our Journey</h2>
        <p>We're always looking for passionate people to help us revolutionize app discovery.</p>
        <div class="join-buttons">
          <a href="/contact" class="join-button primary">Contact Us</a>
          <a href="/blog" class="join-button secondary">Read Our Blog</a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .about-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .section-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .section-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  /* Mission Section */
  .mission-section {
    background: var(--surface);
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .mission-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    align-items: center;
  }

  .mission-statement {
    font-size: 1.4rem;
    color: var(--primary-color);
    margin-bottom: 24px;
    line-height: 1.4;
  }

  .mission-text p {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 20px;
    font-size: 1.05rem;
  }

  .mission-stats {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .stat-item {
    text-align: center;
    padding: 25px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: 8px;
  }

  .stat-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .feature-item {
    background: var(--surface);
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    text-align: center;
    transition: transform 0.3s ease;
  }

  .feature-item:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    font-size: 3rem;
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

  /* Why Choose */
  .why-choose {
    background: var(--surface);
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .reasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .reason-item {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .reason-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .reason-content h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 10px;
  }

  .reason-content p {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Values */
  .values-section {
    margin-bottom: 60px;
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }

  .value-item {
    background: var(--surface);
    padding: 35px 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .value-item h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 15px;
  }

  .value-item p {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Team Section */
  .team-section {
    background: var(--surface);
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 60px;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .team-member {
    display: flex;
    gap: 20px;
    padding: 25px;
    background: var(--light-bg);
    border-radius: 12px;
    transition: transform 0.3s ease;
  }

  .team-member:hover {
    transform: translateY(-3px);
  }

  .member-avatar {
    font-size: 3rem;
    flex-shrink: 0;
  }

  .member-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 5px;
  }

  .member-role {
    color: var(--primary-color);
    font-weight: 500;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }

  .member-bio {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  /* Join Section */
  .join-section {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    color: white;
  }

  .join-section h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .join-section p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .join-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .join-button {
    padding: 14px 30px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .join-button.primary {
    background: var(--surface);
    color: var(--primary-color);
  }

  .join-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
  }

  .join-button.secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
  }

  .join-button.secondary:hover {
    background: var(--surface);
    color: var(--primary-color);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .about-page {
      padding: 40px 0;
    }

    .mission-section,
    .why-choose,
    .team-section {
      padding: 30px 20px;
    }

    .mission-content {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .mission-statement {
      font-size: 1.2rem;
    }

    .mission-stats {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }

    .stat-item {
      flex: 1;
      min-width: 120px;
      padding: 20px 15px;
    }

    .stat-number {
      font-size: 2rem;
    }

    .features-grid,
    .reasons-grid,
    .values-grid,
    .team-grid {
      grid-template-columns: 1fr;
    }

    .join-section {
      padding: 40px 20px;
    }

    .join-buttons {
      flex-direction: column;
      align-items: center;
    }

    .join-button {
      width: 200px;
      text-align: center;
    }
  }
</style>