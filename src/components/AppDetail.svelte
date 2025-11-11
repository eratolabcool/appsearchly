<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { App } from '../stores/apps';

  export let app: App;

  const dispatch = createEventDispatcher();

  const handleClose = () => {
    dispatch('close');
  };

  const handleDownload = () => {
    // Use affiliate URL if available, otherwise use regular download URL
    const url = app.affiliateUrl || app.downloadUrl;
    window.open(url, '_blank');
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'ios':
        return '#007aff';
      case 'android':
        return '#3ddc84';
      case 'web':
        return '#ff6b35';
      case 'desktop':
        return '#6c757d';
      default:
        return '#86868b';
    }
  };
</script>

<div class="app-detail">
  <!-- Header -->
  <div class="detail-header">
    <button class="close-button" on:click={handleClose}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M12 4L4 12M4 4L12 12" stroke="#86868b" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <div class="app-header-content">
      <div class="app-icon-large">
        <img src={app.icon} alt={app.name} />
      </div>

      <div class="app-header-info">
        <h2 class="app-title">{app.name}</h2>
        <p class="app-developer">{app.developer}</p>

        <div class="app-badges">
          <span
            class="platform-badge"
            style="background-color: {getPlatformBadgeColor(app.platform)}"
          >
            {app.platform.toUpperCase()}
          </span>
          {#if app.isFree}
            <span class="free-badge">Free</span>
          {/if}
          {#if app.inAppPurchases}
            <span class="inapp-badge">In-app purchases</span>
          {/if}
        </div>

        <div class="app-rating">
          <span class="rating-score">⭐ {app.rating.toFixed(1)}</span>
          <span class="rating-count">{app.reviewCount.toLocaleString()} ratings</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="detail-content">
    <!-- Screenshots -->
    {#if app.screenshots && app.screenshots.length > 0}
      <div class="screenshots-section">
        <h3>Screenshots</h3>
        <div class="screenshots-container">
          {#each app.screenshots as screenshot}
            <img src={screenshot} alt="{app.name} screenshot" class="screenshot" />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Description -->
    <div class="description-section">
      <h3>Description</h3>
      <p class="app-description">{app.description}</p>
    </div>

    <!-- Information -->
    <div class="info-section">
      <h3>Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Price</span>
          <span class="info-value">{formatPrice(app.price, app.currency)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Size</span>
          <span class="info-value">{formatFileSize(app.size)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Version</span>
          <span class="info-value">{app.version}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Updated</span>
          <span class="info-value">{app.lastUpdated}</span>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div class="tags-section">
      <h3>Categories</h3>
      <div class="tags-list">
        <span class="tag primary">{app.category}</span>
        {#each app.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    </div>
  </div>

  <!-- Footer Actions -->
  <div class="detail-footer">
    <button class="download-button" on:click={handleDownload}>
      {formatPrice(app.price, app.currency)} - {app.platform.toUpperCase()}
    </button>
    <p class="affiliate-note">
      {#if app.affiliateUrl}
        By downloading, you support our site at no extra cost.
      {/if}
    </p>
  </div>
</div>

<style lang="scss">
  .app-detail {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
  }

  .detail-header {
    position: relative;
    padding: 24px 24px 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #f5f5f7;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #e8e8ed;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .app-header-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .app-icon-large {
    width: 80px;
    height: 80px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      object-fit: cover;
      background: #f5f5f7;
    }
  }

  .app-header-info {
    flex: 1;
    min-width: 0;
  }

  .app-title {
    font-size: 24px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .app-developer {
    font-size: 14px;
    color: #86868b;
    margin: 0 0 12px 0;
  }

  .app-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .platform-badge {
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
    text-transform: uppercase;
  }

  .free-badge {
    background: #34c759;
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .inapp-badge {
    background: #ff9500;
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .app-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rating-score {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .rating-count {
    font-size: 14px;
    color: #86868b;
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .screenshots-section,
  .description-section,
  .info-section,
  .tags-section {
    margin-bottom: 24px;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 12px 0;
  }

  .screenshots-container {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f0f0f0;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d2d2d7;
      border-radius: 2px;
    }
  }

  .screenshot {
    height: 200px;
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid #f0f0f0;
  }

  .app-description {
    font-size: 15px;
    line-height: 1.5;
    color: #1d1d1f;
    margin: 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 13px;
    color: #86868b;
    font-weight: 500;
  }

  .info-value {
    font-size: 14px;
    color: #1d1d1f;
    font-weight: 600;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #f0f0f0;
    color: #666;
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 16px;

    &.primary {
      background: #007aff;
      color: white;
    }
  }

  .detail-footer {
    padding: 20px 24px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    flex-shrink: 0;
  }

  .download-button {
    background: #007aff;
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    max-width: 300px;

    &:hover {
      background: #0056cc;
      transform: scale(1.02);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .affiliate-note {
    font-size: 12px;
    color: #86868b;
    margin: 8px 0 0 0;
  }

  @media (max-width: 640px) {
    .detail-header {
      padding: 16px;
    }

    .app-header-content {
      flex-direction: column;
      text-align: center;
    }

    .app-icon-large {
      align-self: center;
      width: 70px;
      height: 70px;
    }

    .app-title {
      font-size: 20px;
    }

    .app-badges,
    .app-rating {
      justify-content: center;
    }

    .detail-content {
      padding: 16px;
    }

    .screenshot {
      height: 150px;
    }

    .info-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>