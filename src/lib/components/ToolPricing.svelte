
<script lang="ts">
  export let tool = null;
  export let isActive = false;

  // 格式化价格显示
  function formatPrice(price, currency = 'USD') {
    if (price === 0 || !price) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  function getPricingDescription(pricingModel) {
    const descriptions = {
      'free': 'Completely free to use with all features included',
      'freemium': 'Free basic features with premium plans available',
      'paid': 'Paid tool with subscription or one-time purchase',
      'subscription': 'Monthly or annual subscription required',
      'trial': 'Free trial available with paid plans'
    };
    return descriptions[pricingModel] || 'Pricing information available on website';
  }
</script>

<div class="tool-pricing" class:active={isActive}>
  <div class="pricing-content">
    <div class="pricing-header">
      <h2>💰 Pricing</h2>
      <p>Transparent pricing with no hidden fees</p>
    </div>

    {#if tool}
      <div class="pricing-main">
        <div class="current-pricing">
          <div class="price-display">
            <span class="price-amount">
              {formatPrice(tool.price, tool.currency)}
            </span>
            <span class="price-model">
              {tool.pricingModel === 'free' ? 'Free Forever' :
               tool.pricingModel.charAt(0).toUpperCase() + tool.pricingModel.slice(1)}
            </span>
          </div>
          <div class="pricing-description">
            {getPricingDescription(tool.pricingModel)}
          </div>
        </div>

        <!-- Pricing Features -->
        <div class="pricing-features">
          <h3>What's Included</h3>
          <div class="features-list">
            {#if tool.pricingModel === 'free'}
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>All core features</span>
              </div>
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>No credit card required</span>
              </div>
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Community support</span>
              </div>
            {:else if tool.pricingModel === 'freemium'}
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Free basic features</span>
              </div>
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Premium features available</span>
              </div>
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Flexible upgrade options</span>
              </div>
            {:else}
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Full feature access</span>
              </div>
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Priority support</span>
              </div>
              <div class="pricing-feature">
                <div class="check-icon">✓</div>
                <span>Regular updates</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- CTA Button -->
        <div class="pricing-cta">
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="cta-button"
          >
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M7 7L17 7M7 17L17 7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <p class="cta-note">Visit website for detailed pricing information</p>
        </div>
      </div>

      <!-- Comparison Table -->
      <div class="pricing-comparison">
        <h3>Value Proposition</h3>
        <div class="comparison-table">
          <div class="comparison-row">
            <div class="comparison-label">Monthly Visits</div>
            <div class="comparison-value">{tool.monthlyVisits?.toLocaleString() || 'N/A'}</div>
          </div>
          <div class="comparison-row">
            <div class="comparison-label">Growth Rate</div>
            <div class="comparison-value">{tool.growth ? `+${tool.growth.toLocaleString()}` : 'N/A'}</div>
          </div>
          <div class="comparison-row">
            <div class="comparison-label">User Rating</div>
            <div class="comparison-value">⭐ {tool.rating || '4.0'}/5.0</div>
          </div>
          <div class="comparison-row">
            <div class="comparison-label">Category</div>
            <div class="comparison-value">{tool.category}</div>
          </div>
        </div>
      </div>
    {:else}
      <div class="no-pricing">
        <div class="no-pricing-icon">💰</div>
        <h3>Pricing Information</h3>
        <p>Pricing details will be available soon</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-pricing {
    background: white;
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .tool-pricing.active {
    transform: translateY(0);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .pricing-content {
    padding: 40px;
  }

  .pricing-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .pricing-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .pricing-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .pricing-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .current-pricing {
    background: var(--light-bg);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    border: 2px solid var(--primary-color);
  }

  .price-display {
    margin-bottom: 20px;
  }

  .price-amount {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary-color);
    display: block;
    margin-bottom: 8px;
  }

  .price-model {
    font-size: 1.2rem;
    color: var(--text-primary);
    font-weight: 600;
  }

  .pricing-description {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    max-width: 400px;
    margin: 0 auto;
  }

  .pricing-features {
    background: white;
    border-radius: 12px;
    padding: 30px;
  }

  .pricing-features h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pricing-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--light-bg);
    border-radius: 8px;
  }

  .check-icon {
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .pricing-feature span {
    color: var(--text-primary);
    font-weight: 500;
  }

  .pricing-cta {
    text-align: center;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    background: var(--gradient-primary);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    margin-bottom: 12px;
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 211, 153, 0.4);
  }

  .cta-note {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .pricing-comparison {
    background: var(--light-bg);
    border-radius: 12px;
    padding: 30px;
  }

  .pricing-comparison h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
    text-align: center;
  }

  .comparison-table {
    display: grid;
    gap: 16px;
  }

  .comparison-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: white;
    border-radius: 8px;
  }

  .comparison-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .comparison-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .no-pricing {
    text-align: center;
    padding: 60px;
    color: var(--text-secondary);
  }

  .no-pricing-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  .no-pricing h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  @media (max-width: 768px) {
    .pricing-content {
      padding: 30px 20px;
    }

    .pricing-header h2 {
      font-size: 1.6rem;
    }

    .current-pricing {
      padding: 30px 20px;
    }

    .price-amount {
      font-size: 2.5rem;
    }

    .pricing-features {
      padding: 20px;
    }

    .pricing-comparison {
      padding: 20px;
    }

    .comparison-row {
      padding: 12px;
    }
  }

  @media (max-width: 480px) {
    .price-amount {
      font-size: 2rem;
    }

    .cta-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>