
<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Affiliate Disclosure | AppSearchly';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Affiliate Disclosure',
        description: 'AppSearchly affiliate disclosure - Transparency about our affiliate relationships and how we earn commissions.',
        url: 'https://appsearchly.org/affiliate-disclosure',
        dateModified: new Date().toISOString()
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });
</script>

<svelte:head>
  <title>Affiliate Disclosure | AppSearchly</title>
  <meta name="description" content="AppSearchly affiliate disclosure - Learn about our affiliate relationships, how we earn commissions, and our commitment to transparency and unbiased recommendations." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<PageHeader
  title="Affiliate Disclosure"
  subtitle="Transparency about our affiliate relationships and partnerships"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="affiliate-page">
  <div class="container">
    <div class="disclosure-content">
      <div class="disclosure-intro">
        <div class="honesty-badge">
          <span class="badge-icon">💎</span>
          <div>
            <strong>100% Transparency</strong>
            <p>Honest recommendations you can trust</p>
          </div>
        </div>

        <p>At AppSearchly, we believe in complete transparency about how we fund our operations and earn revenue. This Affiliate Disclosure explains our relationships with app developers, software companies, and affiliate partners.</p>

        <p>Our commitment to you: <strong>We only recommend apps and software we genuinely believe in, regardless of affiliate relationships.</strong></p>
      </div>

      <!-- What is Affiliate Marketing -->
      <div class="disclosure-section">
        <h2>🤔 What is Affiliate Marketing?</h2>

        <p>Affiliate marketing is a performance-based marketing model where we earn commissions when you purchase products or services through our unique referral links. Here's how it works:</p>

        <div class="process-flow">
          <div class="process-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>We Discover Apps</strong>
              <p>We research and test thousands of apps to find the best options</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="process-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>We Write Reviews</strong>
              <p>We create honest, detailed reviews based on actual testing</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="process-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>You Click Links</strong>
              <p>You click our affiliate links to learn more or purchase</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="process-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <strong>We Earn Commission</strong>
              <p>We earn a small commission at no extra cost to you</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Our Affiliate Partners -->
      <div class="disclosure-section">
        <h2>🤝 Our Affiliate Partners</h2>

        <p>We work with reputable affiliate partners and networks, including:</p>

        <div class="partner-categories">
          <div class="partner-category">
            <h3>📱 App Stores</h3>
            <ul>
              <li>Apple App Store</li>
              <li>Google Play Store</li>
              <li>Microsoft Store</li>
              <li>Mac App Store</li>
            </ul>
          </div>

          <div class="partner-category">
            <h3>💻 Software Companies</h3>
            <ul>
              <li>Adobe Creative Cloud</li>
              <li>Microsoft 365</li>
              <li>Notion</li>
              <li>Figma</li>
              <li>Canva Pro</li>
            </ul>
          </div>

          <div class="partner-category">
            <h3>🛒 E-commerce Platforms</h3>
            <ul>
              <li>Amazon</li>
              <li>B&H Photo</li>
              <li>Best Buy</li>
              <li>Newegg</li>
            </ul>
          </div>

          <div class="partner-category">
            <h3>🌐 Affiliate Networks</h3>
            <ul>
              <li>Impact.com</li>
              <li>ShareASale</li>
              <li>CJ Affiliate</li>
              <li>Rakuten Advertising</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- How Affiliate Links Work -->
      <div class="disclosure-section">
        <h2>🔗 How Affiliate Links Work</h2>

        <h3>Identification</h3>
        <p>Affiliate links on our site may be identified by:</p>
        <ul>
          <li><strong>URL Parameters:</strong> Links containing tracking parameters like ?ref= or ?affiliate=</li>
          <li><strong>Disclosure Labels:</strong> "Affiliate Link" or "Commission Earned" labels</li>
          <li><strong>Special Formatting:</strong> Different styling or badges</li>
          <li><strong>Contextual Hints:</strong> Clear mentions in review content</li>
        </ul>

        <h3>Tracking Process</h3>
        <ol>
          <li><strong>Click:</strong> You click an affiliate link on our website</li>
          <li><strong>Cookie:</strong> A tracking cookie is placed on your browser</li>
          <li><strong>Purchase:</strong> You make a purchase within the cookie period</li>
          <li><strong>Commission:</strong> We earn a percentage or fixed commission</li>
          <li><strong>Reporting:</strong> The purchase is tracked and reported to us</li>
        </ol>

        <h3>Cookie Duration</h3>
        <p>Commission tracking cookies typically last:</p>
        <ul>
          <li><strong>App Stores:</strong> 24-48 hours</li>
          <li><strong>Software Subscriptions:</strong> 30 days</li>
          <li><strong>E-commerce:</strong> 7-30 days</li>
          <li><strong>Special Offers:</strong> Varies by promotion</li>
        </ul>
      </div>

      <!-- Our Commitment to You -->
      <div class="disclosure-section">
        <h2>🎯 Our Commitment to You</h2>

        <div class="commitment-grid">
          <div class="commitment-item">
            <div class="commitment-icon">⭐</div>
            <h3>Honest Reviews</h3>
            <p>We only recommend products we've tested and genuinely believe in. Our reviews are not influenced by commission rates.</p>
          </div>

          <div class="commitment-item">
            <div class="commitment-icon">🔍</div>
            <h3>Thorough Testing</h3>
            <p>We personally test every app we review, using real-world scenarios to evaluate performance and usability.</p>
          </div>

          <div class="commitment-item">
            <div class="commitment-icon">💰</div>
            <h3>Transparent Pricing</h3>
            <p>We clearly disclose when links are affiliate and how commissions work. No hidden fees or confusing disclosures.</p>
          </div>

          <div class="commitment-item">
            <div class="commitment-icon">⚖️</div>
            <h3>Unbiased Rankings</h3>
            <p>App rankings and recommendations are based on merit, not commission potential. We feature non-affiliate products too.</p>
          </div>
        </div>
      </div>

      <!-- What This Means for You -->
      <div class="disclosure-section">
        <h2>🎁 What This Means for You</h2>

        <div class="impact-grid">
          <div class="impact-item positive">
            <div class="impact-icon">✅</div>
            <h3>No Extra Cost</h3>
            <p>You pay the same price whether you use our affiliate links or go directly to the merchant.</p>
          </div>

          <div class="impact-item positive">
            <div class="impact-icon">✅</div>
            <h3>Support Our Work</h3>
            <p>Your purchases help us continue providing free, high-quality app reviews and recommendations.</p>
          </div>

          <div class="impact-item positive">
            <div class="impact-icon">✅</div>
            <h3>Better Content</h3>
            <p>Commissions allow us to invest in thorough testing, detailed reviews, and website improvements.</p>
          </div>

          <div class="impact-item neutral">
            <div class="impact-icon">ℹ️</div>
            <h3>Small Commission</h3>
            <p>We typically earn 2-10% of your purchase price, which doesn't affect product prices.</p>
          </div>
        </div>
      </div>

      <!-- Types of Commissions -->
      <div class="disclosure-section">
        <h2>💵 Types of Commissions We Earn</h2>

        <div class="commission-types">
          <div class="commission-type">
            <h3>📱 App Sales</h3>
            <ul>
              <li><strong>Percentage:</strong> Usually 2-15% of app purchase price</li>
              <li><strong>In-App Purchases:</strong> 5-30% of IAP revenue</li>
              <li><strong>Subscriptions:</strong> Monthly recurring percentage</li>
            </ul>
          </div>

          <div class="commission-type">
            <h3>💻 Software Licenses</h3>
            <ul>
              <li><strong>One-time:</strong> 10-30% of software purchase</li>
              <li><strong>Subscriptions:</strong> 15-40% of monthly fees</li>
              <li><strong>Upgrades:</strong> 20-50% of upgrade purchases</li>
            </ul>
          </div>

          <div class="commission-type">
            <h3>🛒 Hardware Products</h3>
            <ul>
              <li><strong>Electronics:</strong> 1-8% of product price</li>
              <li><strong>Accessories:</strong> 5-15% of accessory price</li>
              <li><strong>Special Promotions:</strong> Higher rates for limited-time offers</li>
            </ul>
          </div>

          <div class="commission-type">
            <h3>📈 Lead Generation</h3>
            <ul>
              <li><strong>Free Trials:</strong> $1-10 per qualified signup</li>
              <li><strong>Demonstrations:</strong> $5-25 per demo request</li>
              <li><strong>Quote Requests:</strong> $2-15 per qualified lead</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Editorial Independence -->
      <div class="disclosure-section">
        <h2>📰 Editorial Independence</h2>

        <p>We maintain strict editorial independence through:</p>

        <div class="independence-principles">
          <div class="principle-item">
            <strong>Separation of Teams:</strong>
            <p>Our editorial team operates independently from business development and partnership decisions.</p>
          </div>

          <div class="principle-item">
            <strong>No Paid Reviews:</strong>
            <p>We never accept payment for positive reviews or favorable coverage. All reviews are based on actual testing.</p>
          </div>

          <div class="principle-item">
            <strong>Transparency First:</strong>
            <p>We disclose any potential conflicts of interest, including free products received for review.</p>
          </div>

          <div class="principle-item">
            <strong>User Focus:</strong>
            <p>Our recommendations prioritize your needs and experience over commission potential.</p>
          </div>

          <div class="principle-item">
            <strong>Regular Audits:</strong>
            <p>We regularly review our processes to ensure editorial integrity and compliance with disclosure requirements.</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="disclosure-section">
        <h2>❓ Frequently Asked Questions</h2>

        <div class="faq-list">
          <div class="faq-item">
            <h4>Do affiliate links affect product prices?</h4>
            <p>No. You pay exactly the same price whether you use our affiliate links or go directly to the merchant. The commission comes from the merchant's marketing budget.</p>
          </div>

          <div class="faq-item">
            <h4>Do you only review products with affiliate programs?</h4>
            <p>No. We review many products without affiliate relationships because we believe in providing comprehensive coverage, regardless of monetization potential.</p>
          </div>

          <div class="faq-item">
            <h4>How can I support your work without using affiliate links?</h4>
            <p>You can support us by sharing our content, subscribing to our newsletter, leaving reviews, or making direct donations through our support page.</p>
          </div>

          <div class="faq-item">
            <h4>What happens if I return a product purchased through an affiliate link?</h4>
            <p>Commissions are typically reversed when products are returned within the refund period. This doesn't affect you or your relationship with the merchant.</p>
          </div>

          <div class="faq-item">
            <h4>Are affiliate links safe and secure?</h4>
            <p>Yes. Our affiliate links use the same secure HTTPS connections as direct merchant links and don't compromise your security or privacy.</p>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="disclosure-section">
        <h2>📧 Questions or Concerns?</h2>

        <p>If you have questions about our affiliate relationships or this disclosure policy, please contact us:</p>

        <div class="contact-info">
          <div class="contact-item">
            <strong>Affiliate Inquiries:</strong> affiliates@appsearchly.org
          </div>
          <div class="contact-item">
            <strong>General Questions:</strong> hello@appsearchly.org
          </div>
          <div class="contact-item">
            <strong>Feedback:</strong> feedback@appsearchly.org
          </div>
        </div>

        <p class="update-note">
          <strong>Last Updated:</strong> January 15, 2024
        </p>
        <p>We update this disclosure regularly to reflect changes in our affiliate relationships and business practices. Check back periodically for the most current information.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .affiliate-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .disclosure-content {
    background: var(--surface);
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    line-height: 1.6;
  }

  .disclosure-intro {
    margin-bottom: 50px;
    text-align: center;
  }

  .honesty-badge {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: var(--gradient-secondary);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    margin-bottom: 30px;
  }

  .badge-icon {
    font-size: 2.5rem;
  }

  .honesty-badge strong {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .disclosure-intro p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .disclosure-intro strong {
    color: var(--primary-color);
  }

  .disclosure-section {
    margin-bottom: 50px;
  }

  .disclosure-section h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-color);
  }

  .disclosure-section h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 30px 0 15px 0;
  }

  .disclosure-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 20px 0 10px 0;
  }

  .disclosure-section p {
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .disclosure-section ul,
  .disclosure-section ol {
    margin: 16px 0 24px 20px;
    color: var(--text-secondary);
  }

  .disclosure-section li {
    margin-bottom: 8px;
  }

  /* Process Flow */
  .process-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 30px 0;
    flex-wrap: wrap;
    gap: 20px;
  }

  .process-step {
    flex: 1;
    min-width: 200px;
    text-align: center;
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
    margin: 0 auto 12px;
  }

  .step-content strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .step-content p {
    font-size: 0.9rem;
    margin-bottom: 0;
  }

  .step-arrow {
    font-size: 1.5rem;
    color: var(--primary-color);
    font-weight: 700;
  }

  /* Partner Categories */
  .partner-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 25px;
    margin-top: 30px;
  }

  .partner-category {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
  }

  .partner-category h3 {
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--text-primary);
  }

  .partner-category ul {
    margin: 0;
    padding-left: 20px;
  }

  .partner-category li {
    margin-bottom: 6px;
  }

  /* Commitment Grid */
  .commitment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
    margin-top: 30px;
  }

  .commitment-item {
    background: var(--light-bg);
    padding: 25px;
    border-radius: 12px;
    text-align: center;
  }

  .commitment-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }

  .commitment-item h3 {
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  .commitment-item p {
    font-size: 0.9rem;
    margin-bottom: 0;
  }

  /* Impact Grid */
  .impact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .impact-item {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    gap: 15px;
  }

  .impact-item.positive {
    border-left: 4px solid var(--secondary-color);
  }

  .impact-item.neutral {
    border-left: 4px solid var(--primary-color);
  }

  .impact-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .impact-item h3 {
    font-size: 1rem;
    margin-top: 0;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .impact-item p {
    font-size: 0.9rem;
    margin-bottom: 0;
  }

  /* Commission Types */
  .commission-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 25px;
    margin-top: 30px;
  }

  .commission-type {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
  }

  .commission-type h3 {
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--text-primary);
  }

  .commission-type ul {
    margin: 0;
    padding-left: 20px;
  }

  .commission-type li {
    margin-bottom: 6px;
  }

  /* Independence Principles */
  .independence-principles {
    margin-top: 25px;
  }

  .principle-item {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  .principle-item strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 8px;
    font-size: 1.05rem;
  }

  .principle-item p {
    margin-bottom: 0;
  }

  /* FAQ */
  .faq-list {
    margin-top: 25px;
  }

  .faq-item {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  .faq-item h4 {
    font-size: 1.1rem;
    color: var(--primary-color);
    margin-top: 0;
    margin-bottom: 10px;
  }

  .faq-item p {
    margin-bottom: 0;
  }

  /* Contact Info */
  .contact-info {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
  }

  .contact-item {
    margin-bottom: 10px;
    color: var(--text-secondary);
  }

  .contact-item strong {
    color: var(--text-primary);
  }

  .update-note {
    background: var(--gradient-primary);
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    display: inline-block;
    margin-top: 20px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .affiliate-page {
      padding: 40px 0;
    }

    .disclosure-content {
      padding: 30px 20px;
    }

    .disclosure-section h2 {
      font-size: 1.5rem;
    }

    .disclosure-section h3 {
      font-size: 1.2rem;
    }

    .process-flow {
      flex-direction: column;
    }

    .step-arrow {
      transform: rotate(90deg);
    }

    .honesty-badge {
      flex-direction: column;
      text-align: center;
    }

    .commitment-grid,
    .impact-grid,
    .partner-categories,
    .commission-types {
      grid-template-columns: 1fr;
    }
  }
</style>