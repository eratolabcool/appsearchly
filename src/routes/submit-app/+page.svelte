<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';

  let formData = {
    appName: '',
    developerName: '',
    developerEmail: '',
    developerWebsite: '',
    category: '',
    platform: [],
    priceType: 'free',
    price: 0,
    currency: 'USD',
    websiteUrl: '',
    appStoreUrl: '',
    playStoreUrl: '',
    description: '',
    features: '',
    screenshots: [],
    icon: null,
    tags: '',
    releaseDate: '',
    version: '',
    size: '',
    ageRating: '',
    privacyPolicy: '',
    termsOfService: '',
    supportEmail: '',
    contactInfo: '',
    additionalInfo: ''
  };

  let currentStep = 1;
  let formErrors = {};
  let isSubmitting = false;
  let submitted = false;
  let uploadedFiles = [];

  const categories = [
    'Productivity',
    'Design & Creative',
    'Development Tools',
    'Business',
    'Education',
    'Utilities',
    'Entertainment',
    'Health & Fitness',
    'Finance',
    'Social',
    'Photography',
    'Music & Audio',
    'Travel',
    'Lifestyle',
    'Shopping',
    'Sports',
    'News & Magazines',
    'Reference',
    'Weather'
  ];

  const platforms = [
    'iOS',
    'Android',
    'Web',
    'Windows',
    'macOS',
    'Linux'
  ];

  const priceTypes = [
    { value: 'free', label: 'Free', description: 'Completely free to use' },
    { value: 'freemium', label: 'Freemium', description: 'Free with premium features' },
    { value: 'paid', label: 'Paid', description: 'One-time purchase' },
    { value: 'subscription', label: 'Subscription', description: 'Monthly/Annual subscription' }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Submit App', href: '/submit-app' }
  ];

  onMount(() => {
    // Add structured data for SEO
    if (typeof window !== 'undefined') {
      document.title = 'Submit Your App - Appsearchly.org';

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Submit Your App',
        description: 'Submit your app to Appsearchly.org and reach millions of users looking for the best software and applications.',
        url: 'https://appsearchly.org/submit-app',
        mainEntity: {
          '@type': 'Service',
          name: 'App Submission Service',
          provider: {
            '@type': 'Organization',
            name: 'Appsearchly.org'
          }
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  });

  function validateStep(step) {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.appName.trim()) {
          errors.appName = 'App name is required';
        }
        if (!formData.developerName.trim()) {
          errors.developerName = 'Developer name is required';
        }
        if (!formData.developerEmail.trim()) {
          errors.developerEmail = 'Developer email is required';
        } else if (!isValidEmail(formData.developerEmail)) {
          errors.developerEmail = 'Please enter a valid email address';
        }
        if (!formData.category) {
          errors.category = 'Please select a category';
        }
        if (formData.platform.length === 0) {
          errors.platform = 'Please select at least one platform';
        }
        break;

      case 2:
        if (!formData.websiteUrl.trim()) {
          errors.websiteUrl = 'Website URL is required';
        } else if (!isValidUrl(formData.websiteUrl)) {
          errors.websiteUrl = 'Please enter a valid URL';
        }
        if (!formData.description.trim()) {
          errors.description = 'Description is required';
        } else if (formData.description.length < 50) {
          errors.description = 'Description must be at least 50 characters';
        }
        if (!formData.features.trim()) {
          errors.features = 'Please list key features';
        }
        break;

      case 3:
        if (!formData.privacyPolicy.trim()) {
          errors.privacyPolicy = 'Privacy policy URL is required';
        }
        if (!formData.termsOfService.trim()) {
          errors.termsOfService = 'Terms of service URL is required';
        }
        if (!formData.supportEmail.trim()) {
          errors.supportEmail = 'Support email is required';
        } else if (!isValidEmail(formData.supportEmail)) {
          errors.supportEmail = 'Please enter a valid support email';
        }
        break;
    }

    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      currentStep++;
    }
  }

  function prevStep() {
    currentStep--;
  }

  async function handleSubmit() {
    if (!validateStep(3)) {
      return;
    }

    isSubmitting = true;

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would normally send the data to your backend
      console.log('Form submitted:', formData);

      submitted = true;
      isSubmitting = false;

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 5000);

    } catch (error) {
      console.error('Submission error:', error);
      isSubmitting = false;
    }
  }

  function resetForm() {
    formData = {
      appName: '',
      developerName: '',
      developerEmail: '',
      developerWebsite: '',
      category: '',
      platform: [],
      priceType: 'free',
      price: 0,
      currency: 'USD',
      websiteUrl: '',
      appStoreUrl: '',
      playStoreUrl: '',
      description: '',
      features: '',
      screenshots: [],
      icon: null,
      tags: '',
      releaseDate: '',
      version: '',
      size: '',
      ageRating: '',
      privacyPolicy: '',
      termsOfService: '',
      supportEmail: '',
      contactInfo: '',
      additionalInfo: ''
    };
    currentStep = 1;
    submitted = false;
    uploadedFiles = [];
  }

  function handlePlatformToggle(platform) {
    if (formData.platform.includes(platform)) {
      formData.platform = formData.platform.filter(p => p !== platform);
    } else {
      formData.platform = [...formData.platform, platform];
    }
  }

  function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      uploadedFiles = [...uploadedFiles, ...files].slice(0, 5); // Limit to 5 files
    }
  }

  function removeFile(index) {
    uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
  }
</script>

<svelte:head>
  <title>Submit Your App - Appsearchly.org</title>
  <meta name="description" content="Submit your app to Appsearchly.org and reach millions of users looking for the best software and applications. Fast review process and featured placement opportunities." />
  <meta name="keywords" content="submit app, app submission, app listing, developer portal, submit software, app directory" />
</svelte:head>

<PageHeader
  title="Submit Your App"
  subtitle="Reach millions of users by listing your app on Appsearchly.org"
/>

<Breadcrumb items={breadcrumbItems} />

<section class="submit-page">
  <div class="container">
    <div class="submit-container">
      {#if submitted}
        <!-- Success Message -->
        <div class="success-message">
          <div class="success-icon">✅</div>
          <h2>Thank You!</h2>
          <p>Your app has been successfully submitted for review.</p>
          <div class="next-steps">
            <h3>What happens next?</h3>
            <ol>
              <li>Our team will review your submission within 48 hours</li>
              <li>You'll receive an email confirmation with tracking details</li>
              <li>Once approved, your app will be listed on Appsearchly.org</li>
              <li>Consider upgrading to a featured listing for maximum visibility</li>
            </ol>
          </div>
          <button class="new-submission-button" on:click={resetForm}>
            Submit Another App
          </button>
        </div>
      {:else}
        <!-- Multi-step Form -->
        <div class="form-container">
          <!-- Progress Bar -->
          <div class="progress-bar">
            <div class="progress-step {currentStep >= 1 ? 'active' : ''}">
              <div class="step-number">1</div>
              <div class="step-label">Basic Info</div>
            </div>
            <div class="progress-step {currentStep >= 2 ? 'active' : ''}">
              <div class="step-number">2</div>
              <div class="step-label">App Details</div>
            </div>
            <div class="progress-step {currentStep >= 3 ? 'active' : ''}">
              <div class="step-number">3</div>
              <div class="step-label">Legal Info</div>
            </div>
          </div>

          <!-- Step 1: Basic Information -->
          {#if currentStep === 1}
            <div class="form-section">
              <h2>Basic Information</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="appName">App Name *</label>
                  <input
                    type="text"
                    id="appName"
                    bind:value={formData.appName}
                    placeholder="Enter your app name"
                    class:error={formErrors.appName}
                  />
                  {#if formErrors.appName}
                    <span class="error">{formErrors.appName}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="developerName">Developer Name *</label>
                  <input
                    type="text"
                    id="developerName"
                    bind:value={formData.developerName}
                    placeholder="Your company or personal name"
                    class:error={formErrors.developerName}
                  />
                  {#if formErrors.developerName}
                    <span class="error">{formErrors.developerName}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="developerEmail">Developer Email *</label>
                  <input
                    type="email"
                    id="developerEmail"
                    bind:value={formData.developerEmail}
                    placeholder="contact@developer.com"
                    class:error={formErrors.developerEmail}
                  />
                  {#if formErrors.developerEmail}
                    <span class="error">{formErrors.developerEmail}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="developerWebsite">Developer Website</label>
                  <input
                    type="url"
                    id="developerWebsite"
                    bind:value={formData.developerWebsite}
                    placeholder="https://developer.com"
                  />
                </div>

                <div class="form-group">
                  <label for="category">Category *</label>
                  <select
                    id="category"
                    bind:value={formData.category}
                    class:error={formErrors.category}
                  >
                    <option value="">Select a category</option>
                    {#each categories as category}
                      <option value={category}>{category}</option>
                    {/each}
                  </select>
                  {#if formErrors.category}
                    <span class="error">{formErrors.category}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label>Platform(s) *</label>
                  <div class="platform-checkboxes">
                    {#each platforms as platform}
                      <label class="platform-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.platform.includes(platform)}
                          on:change={() => handlePlatformToggle(platform)}
                        />
                        <span>{platform}</span>
                      </label>
                    {/each}
                  </div>
                  {#if formErrors.platform}
                    <span class="error">{formErrors.platform}</span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}

          <!-- Step 2: App Details -->
          {#if currentStep === 2}
            <div class="form-section">
              <h2>App Details</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="priceType">Price Type</label>
                  <div class="price-options">
                    {#each priceTypes as type}
                      <label class="price-option">
                        <input
                          type="radio"
                          bind:group={formData.priceType}
                          value={type.value}
                        />
                        <div class="price-option-content">
                          <span class="price-label">{type.label}</span>
                          <span class="price-desc">{type.description}</span>
                        </div>
                      </label>
                    {/each}
                  </div>
                </div>

                <div class="form-group">
                  <label for="price">Price</label>
                  <input
                    type="number"
                    id="price"
                    bind:value={formData.price}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={formData.priceType === 'free'}
                  />
                  <small>Leave as 0 for free apps</small>
                </div>

                <div class="form-group">
                  <label for="websiteUrl">Website URL *</label>
                  <input
                    type="url"
                    id="websiteUrl"
                    bind:value={formData.websiteUrl}
                    placeholder="https://yourapp.com"
                    class:error={formErrors.websiteUrl}
                  />
                  {#if formErrors.websiteUrl}
                    <span class="error">{formErrors.websiteUrl}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="appStoreUrl">App Store URL</label>
                  <input
                    type="url"
                    id="appStoreUrl"
                    bind:value={formData.appStoreUrl}
                    placeholder="https://apps.apple.com/..."
                  />
                </div>

                <div class="form-group">
                  <label for="playStoreUrl">Play Store URL</label>
                  <input
                    type="url"
                    id="playStoreUrl"
                    bind:value={formData.playStoreUrl}
                    placeholder="https://play.google.com/store/..."
                  />
                </div>

                <div class="form-group full-width">
                  <label for="description">App Description *</label>
                  <textarea
                    id="description"
                    bind:value={formData.description}
                    placeholder="Describe your app, its features, and what makes it unique..."
                    rows="6"
                    class:error={formErrors.description}
                  ></textarea>
                  <small>Minimum 50 characters</small>
                  {#if formErrors.description}
                    <span class="error">{formErrors.description}</span>
                  {/if}
                </div>

                <div class="form-group full-width">
                  <label for="features">Key Features *</label>
                  <textarea
                    id="features"
                    bind:value={formData.features}
                    placeholder="List the main features of your app..."
                    rows="4"
                    class:error={formErrors.features}
                  ></textarea>
                  {#if formErrors.features}
                    <span class="error">{formErrors.features}</span>
                  {/if}
                </div>

                <div class="form-group full-width">
                  <label for="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    bind:value={formData.tags}
                    placeholder="productivity, collaboration, design (comma separated)"
                  />
                  <small>Comma-separated tags to help users find your app</small>
                </div>
              </div>
            </div>
          {/if}

          <!-- Step 3: Legal Information -->
          {#if currentStep === 3}
            <div class="form-section">
              <h2>Legal Information</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="privacyPolicy">Privacy Policy URL *</label>
                  <input
                    type="url"
                    id="privacyPolicy"
                    bind:value={formData.privacyPolicy}
                    placeholder="https://yourapp.com/privacy"
                    class:error={formErrors.privacyPolicy}
                  />
                  {#if formErrors.privacyPolicy}
                    <span class="error">{formErrors.privacyPolicy}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="termsOfService">Terms of Service URL *</label>
                  <input
                    type="url"
                    id="termsOfService"
                    bind:value={formData.termsOfService}
                    placeholder="https://yourapp.com/terms"
                    class:error={formErrors.termsOfService}
                  />
                  {#if formErrors.termsOfService}
                    <span class="error">{formErrors.termsOfService}</span>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="supportEmail">Support Email *</label>
                  <input
                    type="email"
                    id="supportEmail"
                    bind:value={formData.supportEmail}
                    placeholder="support@yourapp.com"
                    class:error={formErrors.supportEmail}
                  />
                  {#if formErrors.supportEmail}
                    <span class="error">{formErrors.supportEmail}</span>
                  {/if}
                </div>

                <div class="form-group full-width">
                  <label for="contactInfo">Additional Contact Information</label>
                  <textarea
                    id="contactInfo"
                    bind:value={formData.contactInfo}
                    placeholder="Any additional contact information, social media links, etc."
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group full-width">
                  <label for="additionalInfo">Additional Information</label>
                  <textarea
                    id="additionalInfo"
                    bind:value={formData.additionalInfo}
                    placeholder="Any other information you'd like to share with our review team..."
                    rows="4"
                  ></textarea>
                </div>

                <div class="form-group full-width">
                  <div class="terms-agreement">
                    <label class="checkbox-label">
                      <input type="checkbox" required />
                      <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- Navigation Buttons -->
          <div class="form-navigation">
            {#if currentStep > 1}
              <button class="nav-button secondary" on:click={prevStep}>
                ← Previous
              </button>
            {/if}

            {#if currentStep < 3}
              <button class="nav-button primary" on:click={nextStep}>
                Next →
              </button>
            {:else}
              <button
                class="nav-button primary"
                on:click={handleSubmit}
                disabled={isSubmitting}
              >
                {#if isSubmitting}
                  <span class="loading-spinner"></span>
                  Submitting...
                {:else}
                  Submit App
                {/if}
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Guidelines -->
    <div class="guidelines-section">
      <h2>Submission Guidelines</h2>
      <div class="guidelines-grid">
        <div class="guideline-item">
          <h3>🎯 Quality Standards</h3>
          <ul>
            <li>Your app must be functional and bug-free</li>
            <li>Provide clear, accurate descriptions</li>
            <li>Include high-quality screenshots</li>
            <li>Ensure proper documentation</li>
          </ul>
        </div>

        <div class="guideline-item">
          <h3>📋 Required Information</h3>
          <ul>
            <li>Valid website or app store URLs</li>
            <li>Privacy policy and terms of service</li>
            <li>Contact information for support</li>
            <li>Accurate categorization</li>
          </ul>
        </div>

        <div class="guideline-item">
          <h3>⏱️ Review Process</h3>
          <ul>
            <li>Initial review within 48 hours</li>
            <li>Quality assessment</li>
            <li>Category verification</li>
            <li>Final approval or feedback</li>
          </ul>
        </div>

        <div class="guideline-item">
          <h3>✅ Benefits of Listing</h3>
          <ul>
            <li>Reach millions of active users</li>
            <li>Improve app visibility</li>
            <li>Get valuable user feedback</li>
            <li>Featured listing opportunities</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .submit-page {
    padding: 60px 0;
    background: var(--light-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .submit-container {
    background: white;
    border-radius: 20px;
    padding: 50px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 60px;
  }

  /* Success Message */
  .success-message {
    text-align: center;
    padding: 60px 20px;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .success-message h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .success-message p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 40px;
  }

  .next-steps {
    text-align: left;
    max-width: 500px;
    margin: 0 auto;
  }

  .next-steps h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .next-steps ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .next-steps li {
    padding: 10px 0;
    color: var(--text-secondary);
    position: relative;
    padding-left: 25px;
  }

  .next-steps li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--secondary-color);
    font-weight: bold;
  }

  .new-submission-button {
    margin-top: 30px;
    padding: 14px 32px;
    background: var(--gradient-primary);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .new-submission-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  /* Progress Bar */
  .progress-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--light-bg);
  }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--light-bg);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  .progress-step.active .step-number {
    background: var(--gradient-primary);
    color: white;
  }

  .step-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .progress-step.active .step-label {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* Form Section */
  .form-section {
    margin-bottom: 40px;
  }

  .form-section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 30px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    font-weight: 600;
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
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: #ef4444;
  }

  .error {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 4px;
  }

  small {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  /* Platform Checkboxes */
  .platform-checkboxes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .platform-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .platform-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  /* Price Options */
  .price-options {
    display: grid;
    gap: 15px;
  }

  .price-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .price-option:hover {
    border-color: var(--primary-color);
  }

  .price-option input[type="radio"] {
    width: 18px;
    height: 18px;
  }

  .price-option-content {
    display: flex;
    flex-direction: column;
  }

  .price-label {
    font-weight: 600;
    color: var(--text-primary);
  }

  .price-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  /* Terms Agreement */
  .terms-agreement {
    margin-top: 20px;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .checkbox-label input[type="checkbox"] {
    margin-top: 2px;
  }

  .checkbox-label a {
    color: var(--primary-color);
    text-decoration: none;
  }

  .checkbox-label a:hover {
    text-decoration: underline;
  }

  /* Form Navigation */
  .form-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid var(--light-bg);
  }

  .nav-button {
    padding: 12px 32px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-button.primary {
    background: var(--gradient-primary);
    color: white;
  }

  .nav-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
  }

  .nav-button.primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .nav-button.secondary {
    background: var(--light-bg);
    color: var(--text-primary);
  }

  .nav-button.secondary:hover {
    background: var(--border-color);
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

  /* Guidelines Section */
  .guidelines-section {
    background: white;
    border-radius: 16px;
    padding: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .guidelines-section h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 40px;
    text-align: center;
  }

  .guidelines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }

  .guideline-item {
    background: var(--light-bg);
    padding: 25px;
    border-radius: 12px;
  }

  .guideline-item h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .guideline-item ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .guideline-item li {
    padding: 6px 0;
    color: var(--text-secondary);
    position: relative;
    padding-left: 20px;
  }

  .guideline-item li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-color);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .submit-page {
      padding: 40px 0;
    }

    .submit-container {
      padding: 30px 20px;
    }

    .progress-bar {
      flex-direction: column;
      gap: 20px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .platform-checkboxes {
      grid-template-columns: repeat(2, 1fr);
    }

    .form-navigation {
      flex-direction: column;
      gap: 20px;
    }

    .nav-button {
      width: 100%;
      justify-content: center;
    }

    .guidelines-section {
      padding: 30px 20px;
    }

    .guidelines-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>