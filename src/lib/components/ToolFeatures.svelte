
<script lang="ts">
  export let tool = null;
  export let isActive = false;

  // 提取主要特性
  $: mainFeatures = tool ? [
    ...tool.tags.slice(0, 6)
  ].filter((tag, index, arr) => arr.indexOf(tag) === index) : [];
</script>

<div class="tool-features" class:active={isActive}>
  <div class="features-content">
    <div class="features-header">
      <h2>✨ Key Features</h2>
      <p>Discover what makes {tool?.appName || 'this tool'} special</p>
    </div>

    <div class="features-grid">
      {#if mainFeatures.length > 0}
        {#each mainFeatures as feature}
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <div class="feature-content">
              <h3>{feature}</h3>
              <p>Advanced {feature.toLowerCase()} capabilities for enhanced productivity</p>
            </div>
          </div>
        {/each}
      {:else}
        <div class="no-features">
          <p>Feature information will be available soon</p>
        </div>
      {/if}
    </div>

    <!-- Additional Information -->
    <div class="additional-info">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Category</div>
          <div class="info-value">{tool?.category}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Subcategory</div>
          <div class="info-value">{tool?.subcategory}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Platforms</div>
          <div class="info-value">{tool?.platforms?.join(', ')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Pricing Model</div>
          <div class="info-value">{tool?.pricingModel}</div>
        </div>
      </div>
    </div>

    <!-- Tags Section -->
    {#if tool?.tags && tool.tags.length > 0}
      <div class="tags-section">
        <h3>Tags</h3>
        <div class="tags-list">
          {#each tool.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-features {
    background: white;
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .tool-features.active {
    transform: translateY(0);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .features-content {
    padding: 40px;
  }

  .features-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .features-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .features-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .feature-item {
    display: flex;
    align-items: start;
    gap: 16px;
    padding: 24px;
    background: var(--light-bg);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .feature-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .feature-content h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .feature-content p {
    color: var(--text-secondary);
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .no-features {
    text-align: center;
    padding: 60px;
    color: var(--text-secondary);
  }

  .additional-info {
    background: var(--light-bg);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-label {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
  }

  .tags-section {
    background: var(--light-bg);
    border-radius: 12px;
    padding: 30px;
  }

  .tags-section h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .tag {
    padding: 8px 16px;
    background: white;
    border: 2px solid var(--primary-color);
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background: var(--primary-color);
    color: white;
  }

  @media (max-width: 768px) {
    .features-content {
      padding: 30px 20px;
    }

    .features-header h2 {
      font-size: 1.6rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .feature-item {
      padding: 20px;
    }

    .additional-info {
      padding: 20px;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .tags-section {
      padding: 20px;
    }
  }

  @media (max-width: 480px) {
    .feature-item {
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }

    .feature-icon {
      margin: 0 auto;
    }
  }
</style>