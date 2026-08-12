
<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy', href: '/privacy' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Privacy Policy | AppSearchly';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Privacy Policy',
        description: 'AppSearchly privacy policy - How we collect, use, and protect your personal information.',
        url: 'https://appsearchly.org/privacy',
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
  <title>Privacy Policy | AppSearchly</title>
  <meta name="description" content="AppSearchly privacy policy - Learn how we collect, use, and protect your personal information when you use our app discovery platform." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<PageHeader
  title="Privacy Policy"
  subtitle="How we collect, use, and protect your personal information"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="privacy-page">
  <div class="container">
    <div class="policy-content">
      <div class="last-updated">
        <strong>Last Updated:</strong> January 15, 2024
      </div>

      <div class="policy-intro">
        <p>At AppSearchly, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your data when you use our app discovery platform.</p>
        <p>By using AppSearchly, you agree to the collection and use of information in accordance with this policy.</p>
      </div>

      <!-- Information We Collect -->
      <div class="policy-section">
        <h2>📊 Information We Collect</h2>

        <h3>1. Information You Provide</h3>
        <ul>
          <li><strong>Email Address:</strong> When you subscribe to our newsletter</li>
          <li><strong>Feedback and Reviews:</strong> When you submit app reviews or feedback</li>
          <li><strong>Account Information:</strong> If you create an account on our platform</li>
          <li><strong>Communication Data:</strong> When you contact our support team</li>
        </ul>

        <h3>2. Automatically Collected Information</h3>
        <ul>
          <li><strong>Usage Data:</strong> Pages visited, time spent, and interaction patterns</li>
          <li><strong>Device Information:</strong> Browser type, operating system, and device type</li>
          <li><strong>IP Address:</strong> Approximate location and internet service provider</li>
          <li><strong>Cookies and Tracking:</strong> To improve your experience and analyze traffic</li>
        </ul>

        <h3>3. Third-Party Information</h3>
        <ul>
          <li><strong>Affiliate Networks:</strong> Click tracking for affiliate partnerships</li>
          <li><strong>Analytics Services:</strong> Google Analytics and similar tools</li>
          <li><strong>Social Media:</strong> Information when you interact with our social features</li>
        </ul>
      </div>

      <!-- How We Use Your Information -->
      <div class="policy-section">
        <h2>🎯 How We Use Your Information</h2>

        <p>We use your information to:</p>
        <ul>
          <li><strong>Provide and Improve Services:</strong> Deliver app recommendations and personalized experiences</li>
          <li><strong>Communication:</strong> Send newsletters, updates, and respond to inquiries</li>
          <li><strong>Analytics:</strong> Understand user behavior and improve our platform</li>
          <li><strong>Marketing:</strong> Promote relevant apps and services (with your consent)</li>
          <li><strong>Legal Compliance:</strong> Meet legal obligations and protect our rights</li>
          <li><strong>Safety:</strong> Detect and prevent fraud, abuse, and security issues</li>
        </ul>
      </div>

      <!-- Information Sharing -->
      <div class="policy-section">
        <h2>🤝 Information Sharing</h2>

        <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>

        <h3>1. With Your Consent</h3>
        <ul>
          <li>When you explicitly authorize us to share specific information</li>
          <li>When you choose to connect with third-party services</li>
        </ul>

        <h3>2. Service Providers</h3>
        <ul>
          <li><strong>Analytics Services:</strong> Google Analytics, Mixpanel, and similar platforms</li>
          <li><strong>Email Services:</strong> Mailchimp, SendGrid for newsletter delivery</li>
          <li><strong>Hosting Providers:</strong> Vercel, AWS, and cloud infrastructure</li>
          <li><strong>Affiliate Networks:</strong> Impact, ShareASale for affiliate tracking</li>
        </ul>

        <h3>3. Legal Requirements</h3>
        <ul>
          <li>When required by law, court order, or government request</li>
          <li>To protect our rights, property, and safety</li>
          <li>To prevent fraud or comply with legal obligations</li>
        </ul>
      </div>

      <!-- Cookies and Tracking -->
      <div class="policy-section">
        <h2>🍪 Cookies and Tracking Technologies</h2>

        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
          <li><strong>Marketing Cookies:</strong> Track ad performance and personalization</li>
          <li><strong>Affiliate Cookies:</strong> Track referrals for affiliate partnerships</li>
        </ul>

        <p>You can control cookie settings through your browser preferences, but disabling certain cookies may affect website functionality.</p>
      </div>

      <!-- Data Security -->
      <div class="policy-section">
        <h2>🔒 Data Security</h2>

        <p>We implement appropriate security measures to protect your information:</p>
        <ul>
          <li><strong>Encryption:</strong> SSL/TLS encryption for data transmission</li>
          <li><strong>Access Controls:</strong> Limited access to personal information</li>
          <li><strong>Regular Updates:</strong> Security patches and system updates</li>
          <li><strong>Monitoring:</strong> Continuous security monitoring and threat detection</li>
        </ul>

        <p>However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
      </div>

      <!-- Your Rights -->
      <div class="policy-section">
        <h2>⚖️ Your Privacy Rights</h2>

        <p>Depending on your location, you may have the following rights:</p>

        <h3>1. Access Rights</h3>
        <ul>
          <li>Request a copy of your personal information</li>
          <li>Know what data we collect and how it's used</li>
        </ul>

        <h3>2. Correction Rights</h3>
        <ul>
          <li>Update inaccurate personal information</li>
          <li>Request deletion of outdated data</li>
        </ul>

        <h3>3. Deletion Rights</h3>
        <ul>
          <li>Request deletion of your personal information</li>
          <li>Right to be forgotten (where applicable)</li>
        </ul>

        <h3>4. Data Portability</h3>
        <ul>
          <li>Request your data in a machine-readable format</li>
          <li>Transfer data to other services</li>
        </ul>

        <p>To exercise these rights, please contact us at privacy@appsearchly.org</p>
      </div>

      <!-- Third-Party Links -->
      <div class="policy-section">
        <h2>🔗 Third-Party Websites and Links</h2>

        <p>Our website may contain links to third-party websites, including:</p>
        <ul>
          <li>App stores and developer websites</li>
          <li>Social media platforms</li>
          <li>Affiliate partner websites</li>
          <li>Service provider websites</li>
        </ul>

        <p>We are not responsible for the privacy practices of third-party websites. Please review their privacy policies before providing personal information.</p>
      </div>

      <!-- Children's Privacy -->
      <div class="policy-section">
        <h2>👶 Children's Privacy</h2>

        <p>Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
      </div>

      <!-- International Data Transfers -->
      <div class="policy-section">
        <h2>🌍 International Data Transfers</h2>

        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including:</p>
        <ul>
          <li>Standard Contractual Clauses (SCCs)</li>
          <li>Adequacy decisions where applicable</li>
          <li>Compliance with GDPR and other privacy regulations</li>
        </ul>
      </div>

      <!-- Policy Changes -->
      <div class="policy-section">
        <h2>📝 Changes to This Policy</h2>

        <p>We may update this Privacy Policy from time to time. We will:</p>
        <ul>
          <li>Post the updated policy on our website</li>
          <li>Update the "Last Updated" date</li>
          <li>Notify users of significant changes via email or website notice</li>
          <li>Require continued consent for material changes</li>
        </ul>
      </div>

      <!-- Contact Information -->
      <div class="policy-section">
        <h2>📧 Contact Information</h2>

        <p>If you have questions about this Privacy Policy or want to exercise your privacy rights, please contact us:</p>

        <div class="contact-info">
          <div class="contact-item">
            <strong>Email:</strong> privacy@appsearchly.org
          </div>
          <div class="contact-item">
            <strong>Website:</strong> https://appsearchly.org
          </div>
          <div class="contact-item">
            <strong>Response Time:</strong> We typically respond within 30 days
          </div>
        </div>
      </div>

      <!-- Cookie Consent Notice -->
      <div class="policy-section">
        <h2>🎛️ Cookie Consent Management</h2>

        <p>When you first visit our website, you'll see a cookie consent banner where you can:</p>
        <ul>
          <li><strong>Accept All:</strong> Allow all cookies for optimal experience</li>
          <li><strong>Reject All:</strong> Only allow essential cookies</li>
          <li><strong>Customize:</strong> Choose specific cookie categories</li>
        </ul>

        <p>You can change your cookie preferences at any time through our Cookie Settings page or your browser settings.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .privacy-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .policy-content {
    background: var(--surface);
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    line-height: 1.6;
  }

  .last-updated {
    background: var(--gradient-secondary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    display: inline-block;
    font-size: 0.9rem;
  }

  .policy-intro {
    margin-bottom: 40px;
    font-size: 1.05rem;
    color: var(--text-secondary);
  }

  .policy-intro p {
    margin-bottom: 16px;
  }

  .policy-section {
    margin-bottom: 40px;
  }

  .policy-section h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-color);
  }

  .policy-section h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 25px 0 15px 0;
  }

  .policy-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 20px 0 10px 0;
  }

  .policy-section p {
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .policy-section ul {
    margin: 16px 0 24px 20px;
    color: var(--text-secondary);
  }

  .policy-section li {
    margin-bottom: 8px;
  }

  .policy-section li strong {
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
    .privacy-page {
      padding: 40px 0;
    }

    .policy-content {
      padding: 30px 20px;
    }

    .policy-section h2 {
      font-size: 1.5rem;
    }

    .policy-section h3 {
      font-size: 1.2rem;
    }

    .policy-section ul {
      margin-left: 15px;
    }
  }
</style>