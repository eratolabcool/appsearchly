<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Terms of Service', href: '/terms' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Terms of Service | Appsearchly.org';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Terms of Service',
        description: 'Appsearchly.org terms of service - Rules and guidelines for using our app discovery platform.',
        url: 'https://appsearchly.org/terms',
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
  <title>Terms of Service | Appsearchly.org</title>
  <meta name="description" content="Appsearchly.org terms of service - Read our rules, guidelines, and legal terms for using our app discovery platform and affiliate services." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<PageHeader
  title="Terms of Service"
  subtitle="Rules and guidelines for using Appsearchly.org"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="terms-page">
  <div class="container">
    <div class="terms-content">
      <div class="last-updated">
        <strong>Last Updated:</strong> January 15, 2024
      </div>

      <div class="terms-intro">
        <p>Welcome to Appsearchly.org! These Terms of Service ("Terms") govern your use of our app discovery platform, website, and related services (collectively, the "Service").</p>
        <p>By accessing or using Appsearchly.org, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.</p>
      </div>

      <!-- Acceptance of Terms -->
      <div class="terms-section">
        <h2>📋 Acceptance of Terms</h2>

        <p>By using Appsearchly.org, you represent and warrant that:</p>
        <ul>
          <li>You are at least 13 years of age (or the minimum age in your jurisdiction)</li>
          <li>You have the legal capacity to enter into these Terms</li>
          <li>You will comply with all applicable laws and regulations</li>
          <li>You will not use the Service for any illegal or unauthorized purposes</li>
        </ul>
      </div>

      <!-- Description of Service -->
      <div class="terms-section">
        <h2>🔍 Description of Service</h2>

        <p>Appsearchly.org is an app discovery platform that provides:</p>
        <ul>
          <li><strong>App Recommendations:</strong> Curated lists of mobile and desktop applications</li>
          <li><strong>Reviews and Ratings:</strong> User-generated and expert reviews of apps</li>
          <li><strong>Affiliate Links:</strong> Links to app stores and developer websites</li>
          <li><strong>News and Updates:</strong> Industry news and app-related content</li>
          <li><strong>Community Features:</strong> User profiles, comments, and discussions</li>
        </ul>

        <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
      </div>

      <!-- User Conduct -->
      <div class="terms-section">
        <h2>👤 User Conduct</h2>

        <p>When using Appsearchly.org, you agree to:</p>

        <h3>Permitted Activities</h3>
        <ul>
          <li>Browse and search for apps and software</li>
          <li>Submit honest and constructive reviews</li>
          <li>Participate in community discussions respectfully</li>
          <li>Share content through our sharing features</li>
          <li>Use affiliate links for legitimate purchases</li>
        </ul>

        <h3>Prohibited Activities</h3>
        <ul>
          <li><strong>Illegal Content:</strong> Posting or sharing illegal or harmful content</li>
          <li><strong>Spam:</strong> Unsolicited commercial messages or repetitive content</li>
          <li><strong>Fraud:</strong> Fake reviews, misleading information, or scams</li>
          <li><strong>Intellectual Property:</strong> Infringing on copyrights, trademarks, or patents</li>
          <li><strong>Security:</strong> Attempting to hack, damage, or disrupt the Service</li>
          <li><strong>Harassment:</strong> Abusive, threatening, or discriminatory behavior</li>
          <li><strong>Automated Access:</strong> Using bots, scrapers, or automated tools without permission</li>
          <li><strong>False Information:</strong> Providing fake personal information or impersonating others</li>
        </ul>
      </div>

      <!-- Content and Intellectual Property -->
      <div class="terms-section">
        <h2>📝 Content and Intellectual Property</h2>

        <h3>Your Content</h3>
        <p>By submitting content to Appsearchly.org (reviews, comments, etc.), you grant us:</p>
        <ul>
          <li>A worldwide, non-exclusive, royalty-free license to use, display, and distribute your content</li>
          <li>The right to modify, adapt, and create derivative works</li>
          <li>The ability to use your content for marketing and promotional purposes</li>
        </ul>

        <p>You retain ownership of your content but represent that you have all necessary rights to grant these licenses.</p>

        <h3>Our Content</h3>
        <p>All content on Appsearchly.org, including but not limited to:</p>
        <ul>
          <li>Text, images, graphics, and design</li>
          <li>App descriptions and reviews</li>
          <li>Software and source code</li>
          <li>Trademarks, logos, and branding</li>
        </ul>

        <p>Is protected by intellectual property laws and owned by Appsearchly.org or our licensors.</p>

        <h3>Third-Party Content</h3>
        <p>We may display third-party content including:</p>
        <ul>
          <li>App store information and screenshots</li>
          <li>User reviews from external sources</li>
          <li>Affiliate partner content</li>
        </ul>

        <p>Third-party content remains the property of their respective owners.</p>
      </div>

      <!-- Affiliate Disclosure -->
      <div class="terms-section">
        <h2>💰 Affiliate Disclosure</h2>

        <h3>Affiliate Relationships</h3>
        <p>Appsearchly.org participates in affiliate marketing programs with:</p>
        <ul>
          <li>App stores (Apple App Store, Google Play Store)</li>
          <li>Software vendors and developers</li>
          <li>Affiliate networks (Impact, ShareASale, etc.)</li>
          <li>Amazon and other e-commerce platforms</li>
        </ul>

        <h3>How It Works</h3>
        <ul>
          <li>We may earn commissions when you purchase through our affiliate links</li>
          <li>This does not affect the price you pay for products</li>
          <li>We only recommend products we believe in</li>
          <li>Commissions help us maintain and improve the Service</li>
        </ul>

        <h3>Transparency</h3>
        <ul>
          <li>Affiliate links are clearly marked when required</li>
          <li>We maintain our Affiliate Disclosure Policy</li>
          <li>Editorial decisions are independent of affiliate relationships</li>
        </ul>
      </div>

      <!-- Privacy and Data Protection -->
      <div class="terms-section">
        <h2>🔒 Privacy and Data Protection</h2>

        <p>Your privacy is important to us. Our use of your information is governed by our Privacy Policy, which covers:</p>
        <ul>
          <li>What information we collect and why</li>
          <li>How we use and share your data</li>
          <li>Your rights regarding your personal information</li>
          <li>Cookies and tracking technologies</li>
          <li>Data security and retention</li>
        </ul>

        <p>By using our Service, you consent to the collection and use of information as described in our Privacy Policy.</p>
      </div>

      <!-- Disclaimers and Limitations -->
      <div class="terms-section">
        <h2>⚠️ Disclaimers and Limitations</h2>

        <h3>Service Availability</h3>
        <ul>
          <li>The Service is provided "as is" without warranties of any kind</li>
          <li>We do not guarantee uninterrupted or error-free operation</li>
          <li>We may modify or discontinue features at any time</li>
          <li>Third-party services may be unavailable or changed</li>
        </ul>

        <h3>App Recommendations</h3>
        <ul>
          <li>We do not endorse or guarantee the quality of third-party apps</li>
          <li>App information may become outdated or inaccurate</li>
          <li>User experiences may vary based on devices and preferences</li>
          <li>We are not responsible for app performance or issues</li>
        </ul>

        <h3>Financial Disclaimer</h3>
        <ul>
          <li>Affiliate commissions vary and are not guaranteed</li>
          <li>Price information may not always be current</li>
          <li>We are not financial advisors or investment experts</li>
          <li>App purchases should be based on your own research</li>
        </ul>
      </div>

      <!-- Limitation of Liability -->
      <div class="terms-section">
        <h2>⚖️ Limitation of Liability</h2>

        <p>To the fullest extent permitted by law:</p>
        <ul>
          <li>Appsearchly.org shall not be liable for indirect, incidental, or consequential damages</li>
          <li>Our total liability is limited to the amount you paid for any premium services</li>
          <li>We are not liable for third-party app performance or issues</li>
          <li>We are not responsible for data loss or system failures</li>
          <li>Some jurisdictions do not allow these limitations, so they may not apply to you</li>
        </ul>

        <p>These limitations apply whether the claim is based on warranty, contract, tort, or any other legal theory.</p>
      </div>

      <!-- Indemnification -->
      <div class="terms-section">
        <h2>🛡️ Indemnification</h2>

        <p>You agree to indemnify and hold Appsearchly.org harmless from:</p>
        <ul>
          <li>Any claims arising from your use of the Service</li>
          <li>Violations of these Terms or applicable laws</li>
          <li>Infringement of third-party rights</li>
          <li>Content you submit or share</li>
          <li>Your interactions with other users</li>
        </ul>

        <p>We reserve the right to defend ourselves against any such claims at your expense.</p>
      </div>

      <!-- Account Termination -->
      <div class="terms-section">
        <h2>🚫 Account Termination</h2>

        <h3>Termination by You</h3>
        <ul>
          <li>You may close your account at any time</li>
          <li>Your content may remain visible after account closure</li>
          <li>You are responsible for outstanding obligations</li>
        </ul>

        <h3>Termination by Us</h3>
        <p>We may suspend or terminate your account for:</p>
        <ul>
          <li>Violation of these Terms or applicable laws</li>
          <li>Fraudulent or harmful activities</li>
          <li>Inactivity for extended periods</li>
          <li>Technical or security reasons</li>
          <li>Business or legal requirements</li>
        </ul>

        <p>Upon termination, your right to use the Service ceases immediately.</p>
      </div>

      <!-- Dispute Resolution -->
      <div class="terms-section">
        <h2>⚖️ Dispute Resolution</h2>

        <h3>Governing Law</h3>
        <p>These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.</p>

        <h3>Dispute Resolution Process</h3>
        <ul>
          <li><strong>Informal Resolution:</strong> Contact us to resolve disputes informally</li>
          <li><strong>Mediation:</strong> If informal resolution fails, we agree to mediation</li>
          <li><strong>Arbitration:</strong> Binding arbitration as a last resort</li>
          <li><strong>Class Actions:</strong> You waive the right to participate in class actions</li>
        </ul>

        <h3>Limitation Period</h3>
        <p>Any claim must be brought within one year of the events giving rise to the claim.</p>
      </div>

      <!-- General Provisions -->
      <div class="terms-section">
        <h2>📄 General Provisions</h2>

        <h3>Entire Agreement</h3>
        <p>These Terms, along with our Privacy Policy, constitute the entire agreement between you and Appsearchly.org.</p>

        <h3>Severability</h3>
        <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force.</p>

        <h3>No Waiver</h3>
        <p>Our failure to enforce any provision of these Terms does not constitute a waiver of such provision.</p>

        <h3>Assignment</h3>
        <p>You may not assign these Terms without our written consent. We may assign these Terms without restriction.</p>

        <h3>Force Majeure</h3>
        <p>We are not liable for failures due to events beyond our reasonable control (natural disasters, wars, etc.).</p>
      </div>

      <!-- Contact Information -->
      <div class="terms-section">
        <h2>📧 Contact Information</h2>

        <p>If you have questions about these Terms of Service, please contact us:</p>

        <div class="contact-info">
          <div class="contact-item">
            <strong>Email:</strong> legal@appsearchly.org
          </div>
          <div class="contact-item">
            <strong>Website:</strong> https://appsearchly.org
          </div>
          <div class="contact-item">
            <strong>Response Time:</strong> We typically respond within 30 days
          </div>
        </div>

        <p>For specific issues, please use:</p>
        <ul>
          <li><strong>Privacy Concerns:</strong> privacy@appsearchly.org</li>
          <li><strong>Affiliate Inquiries:</strong> affiliates@appsearchly.org</li>
          <li><strong>DMCA Notices:</strong> dmca@appsearchly.org</li>
          <li><strong>Technical Support:</strong> support@appsearchly.org</li>
        </ul>
      </div>

      <!-- Terms Updates -->
      <div class="terms-section">
        <h2>🔄 Terms Updates</h2>

        <p>We may update these Terms from time to time. We will:</p>
        <ul>
          <li>Post the updated terms on our website</li>
          <li>Update the "Last Updated" date</li>
          <li>Notify users of material changes via email or website notice</li>
          <li>Require continued consent for significant changes</li>
        </ul>

        <p>Your continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .terms-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .terms-content {
    background: white;
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    line-height: 1.6;
  }

  .last-updated {
    background: var(--gradient-primary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    display: inline-block;
    font-size: 0.9rem;
  }

  .terms-intro {
    margin-bottom: 40px;
    font-size: 1.05rem;
    color: var(--text-secondary);
  }

  .terms-intro p {
    margin-bottom: 16px;
  }

  .terms-section {
    margin-bottom: 40px;
  }

  .terms-section h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-color);
  }

  .terms-section h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 25px 0 15px 0;
  }

  .terms-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 20px 0 10px 0;
  }

  .terms-section p {
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .terms-section ul {
    margin: 16px 0 24px 20px;
    color: var(--text-secondary);
  }

  .terms-section li {
    margin-bottom: 8px;
  }

  .terms-section li strong {
    color: var(--text-primary);
  }

  .contact-info {
    background: var(--light-bg);
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
  }

  .contact-item {
    margin-bottom: 10px;
    color: var(--text-secondary);
  }

  .contact-item strong {
    color: var(--text-primary);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .terms-page {
      padding: 40px 0;
    }

    .terms-content {
      padding: 30px 20px;
    }

    .terms-section h2 {
      font-size: 1.5rem;
    }

    .terms-section h3 {
      font-size: 1.2rem;
    }

    .terms-section ul {
      margin-left: 15px;
    }
  }
</style>