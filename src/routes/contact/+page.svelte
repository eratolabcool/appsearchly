
<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  let formStatus = {
    submitting: false,
    submitted: false,
    error: ''
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Contact AppSearchly | Get in Touch';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact AppSearchly',
        description: 'Get in touch with the AppSearchly team. We love hearing from our users and are here to help.',
        url: 'https://appsearchly.org/contact',
        mainEntity: {
          '@type': 'Organization',
          name: 'AppSearchly',
          url: 'https://appsearchly.org',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'hello@appsearchly.org'
          }
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  async function handleSubmit() {
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      formStatus.error = 'Please fill in all required fields.';
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      formStatus.error = 'Please enter a valid email address.';
      return;
    }

    formStatus.submitting = true;
    formStatus.error = '';

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form
      formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };

      formStatus.submitted = true;
      formStatus.submitting = false;

      // Reset success message after 5 seconds
      setTimeout(() => {
        formStatus.submitted = false;
      }, 5000);

    } catch (error) {
      formStatus.error = 'An error occurred. Please try again later.';
      formStatus.submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Contact AppSearchly | Get in Touch</title>
  <meta name="description" content="Get in touch with the AppSearchly team. We love hearing from our users and are here to help with any questions, feedback, or partnerships." />
  <meta name="keywords" content="contact appsearchly, appsearchly support, appsearchly team, customer service, feedback" />
</svelte:head>

<PageHeader
  title="Contact Us"
  subtitle="We love hearing from our users and are here to help with any questions, feedback, or partnerships"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="contact-page">
  <div class="container">
    <div class="contact-content">
      <!-- Contact Form Section -->
      <div class="contact-form-section">
        <div class="form-container">
          <h2>📬 Send Us a Message</h2>
          <p>Have a question, feedback, or partnership idea? We'd love to hear from you!</p>

          {#if formStatus.submitted}
            <div class="success-message">
              <div class="success-icon">✅</div>
              <h3>Thank you for reaching out!</h3>
              <p>We'll get back to you within 24 hours.</p>
            </div>
          {:else}
            <form class="contact-form" on:submit|preventDefault={handleSubmit}>
              {#if formStatus.error}
                <div class="error-message">
                  {formStatus.error}
                </div>
              {/if}

              <div class="form-group">
                <label for="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  bind:value={formData.name}
                  placeholder="Your full name"
                  required
                  disabled={formStatus.submitting}
                />
              </div>

              <div class="form-group">
                <label for="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  bind:value={formData.email}
                  placeholder="your.email@example.com"
                  required
                  disabled={formStatus.submitting}
                />
              </div>

              <div class="form-group">
                <label for="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  bind:value={formData.subject}
                  disabled={formStatus.submitting}
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership</option>
                  <option value="press">Press & Media</option>
                  <option value="technical">Technical Support</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  bind:value={formData.message}
                  placeholder="Tell us what's on your mind..."
                  rows="6"
                  required
                  disabled={formStatus.submitting}
                ></textarea>
              </div>

              <button
                type="submit"
                class="submit-button"
                disabled={formStatus.submitting}
              >
                {#if formStatus.submitting}
                  <span class="loading-spinner"></span>
                  Sending...
                {:else}
                  Send Message
                  <span class="button-arrow">→</span>
                {/if}
              </button>
            </form>
          {/if}
        </div>
      </div>

      <!-- Contact Info Section -->
      <div class="contact-info-section">
        <div class="info-card">
          <h3>📧 Email Us</h3>
          <p>For general inquiries and support</p>
          <a href="mailto:hello@appsearchly.org" class="contact-link">hello@appsearchly.org</a>
        </div>

        <div class="info-card">
          <h3>💼 Partnerships</h3>
          <p>Interested in partnering with us?</p>
          <a href="mailto:partners@appsearchly.org" class="contact-link">partners@appsearchly.org</a>
        </div>

        <div class="info-card">
          <h3>📰 Press & Media</h3>
          <p>Media inquiries and press releases</p>
          <a href="mailto:press@appsearchly.org" class="contact-link">press@appsearchly.org</a>
        </div>

        <div class="info-card">
          <h3>🐛 Report a Bug</h3>
          <p>Found an issue? Let us know!</p>
          <a href="mailto:support@appsearchly.org" class="contact-link">support@appsearchly.org</a>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="faq-section">
      <div class="section-header">
        <h2>❓ Frequently Asked Questions</h2>
        <p>Quick answers to common questions</p>
      </div>

      <div class="faq-grid">
        <div class="faq-item">
          <h4>How do I submit an app for review?</h4>
          <p>We're always looking for new apps to review! Please email us with details about your app, including platform, features, and why our users would love it.</p>
        </div>

        <div class="faq-item">
          <h4>Do you accept paid reviews?</h4>
          <p>No. We maintain strict editorial independence and never accept payment for positive reviews. All our recommendations are based on merit.</p>
        </div>

        <div class="faq-item">
          <h4>How often do you update app reviews?</h4>
          <p>We regularly update our reviews to reflect current app versions, features, and user experiences. Major apps are reviewed quarterly.</p>
        </div>

        <div class="faq-item">
          <h4>Can I request specific app comparisons?</h4>
          <p>Absolutely! We love hearing from our users about what they'd like to see compared. Send us your suggestions and we'll consider them for future content.</p>
        </div>

        <div class="faq-item">
          <h4>Do you offer advertising opportunities?</h4>
          <p>We offer limited advertising opportunities that align with our mission. Contact our partnerships team for more information.</p>
        </div>

        <div class="faq-item">
          <h4>How do I report inaccurate information?</h4>
          <p>We strive for accuracy but occasionally make mistakes. Please email us with any corrections, and we'll update the information promptly.</p>
        </div>
      </div>
    </div>

    <!-- Office Hours Section -->
    <div class="office-hours">
      <div class="office-content">
        <h2>🕐 Response Times</h2>
        <div class="hours-grid">
          <div class="hours-item">
            <div class="hours-type">General Inquiries</div>
            <div class="hours-time">Within 24 hours</div>
          </div>
          <div class="hours-item">
            <div class="hours-type">Technical Support</div>
            <div class="hours-time">Within 48 hours</div>
          </div>
          <div class="hours-item">
            <div class="hours-type">Partnership Inquiries</div>
            <div class="hours-time">Within 72 hours</div>
          </div>
          <div class="hours-item">
            <div class="hours-type">Press Inquiries</div>
            <div class="hours-time">Within 12 hours</div>
          </div>
        </div>
        <p class="hours-note">We're available Monday through Friday, 9 AM to 6 PM EST. Weekend responses may be delayed.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .contact-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .contact-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    margin-bottom: 60px;
  }

  /* Form Section */
  .form-container {
    background: var(--surface);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .form-container h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 10px;
  }

  .form-container > p {
    color: var(--text-secondary);
    margin-bottom: 30px;
  }

  /* Success Message */
  .success-message {
    text-align: center;
    padding: 40px;
  }

  .success-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .success-message h3 {
    font-size: 1.3rem;
    color: var(--text-primary);
    margin-bottom: 10px;
  }

  .success-message p {
    color: var(--text-secondary);
  }

  /* Contact Form */
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .error-message {
    background: #fee;
    color: #c33;
    padding: 12px;
    border-radius: 8px;
    border-left: 4px solid #c33;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 120px;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Contact Info Section */
  .contact-info-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .info-card {
    background: var(--surface);
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
  }

  .info-card:hover {
    transform: translateY(-2px);
  }

  .info-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .info-card p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 12px;
  }

  .contact-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .contact-link:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }

  /* FAQ Section */
  .faq-section {
    background: var(--surface);
    border-radius: 16px;
    padding: 50px;
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
    margin-bottom: 10px;
  }

  .section-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }

  .faq-item {
    padding: 25px;
    background: var(--light-bg);
    border-radius: 12px;
    transition: transform 0.2s ease;
  }

  .faq-item:hover {
    transform: translateY(-2px);
  }

  .faq-item h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .faq-item p {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Office Hours */
  .office-hours {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 16px;
    padding: 50px;
    color: white;
    text-align: center;
  }

  .office-content h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 30px;
  }

  .hours-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .hours-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .hours-type {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .hours-time {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .hours-note {
    opacity: 0.9;
    font-size: 0.95rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .contact-page {
      padding: 40px 0;
    }

    .contact-content {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .form-container,
    .faq-section {
      padding: 30px 20px;
    }

    .section-header h2,
    .office-content h2 {
      font-size: 1.5rem;
    }

    .faq-grid {
      grid-template-columns: 1fr;
    }

    .hours-grid {
      grid-template-columns: 1fr;
    }

    .office-hours {
      padding: 40px 20px;
    }
  }
</style>