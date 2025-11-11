<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { alternativeAffiliateManager } from '../utils/alternative-affiliates';
  import type { App } from '../stores/apps';

  export let app: App;

  const dispatch = createEventDispatcher();

  const handleClick = () => {
    // Track click for analytics
    alternativeAffiliateManager.trackClick(app, app.platform);

    // Generate affiliate link if available
    const affiliateUrl = alternativeAffiliateManager.generateAffiliateLink(
      app.url || app.link || '',
      app.platform,
      app
    );

    // Open affiliate link or default link
    if (affiliateUrl && affiliateUrl !== (app.url || app.link || '')) {
      window.open(affiliateUrl, '_blank');
    } else {
      dispatch('select', app);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
        return '🍎';
      case 'android':
        return '🤖';
      case 'web':
        return '🌐';
      case 'desktop':
        return '💻';
      default:
        return '📱';
    }
  };
</script>

<div
  class="app-card"
  on:click={handleClick}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  tabindex="0"
  aria-label={`Open ${app.name} by ${app.developer}`}
>
  <div class="app-icon">
    <img src={app.icon} alt={app.name} />
    <div class="platform-badge" title={app.platform}>
      {getPlatformIcon(app.platform)}
    </div>
  </div>

  <div class="app-info">
    <h3 class="app-name">{app.name}</h3>
    <p class="app-developer">{app.developer}</p>
    <p class="app-description">{app.description}</p>

    <div class="app-meta">
      <div class="rating">
        <span class="rating-stars">⭐ {formatRating(app.rating)}</span>
        <span class="review-count">({app.reviewCount.toLocaleString()})</span>
      </div>

      <div class="price">
        {formatPrice(app.price, app.currency)}
        {#if app.inAppPurchases && app.isFree}
          <span class="in-app-purchases">• In-app</span>
        {/if}
      </div>
    </div>

    <div class="app-tags">
      {#each app.tags.slice(0, 3) as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </div>

  <div class="app-action">
    <button class="get-button">
      Get
    </button>
  </div>
</div>

<style lang="scss">
  .app-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #d2d2d7;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #007aff;
      box-shadow: 0 4px 16px rgba(0, 122, 255, 0.1);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .app-icon {
    position: relative;
    width: 60px;
    height: 60px;
    margin: 0 auto;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      object-fit: cover;
      background: #f5f5f7;
    }

    .platform-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      border: 1px solid #d2d2d7;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .app-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .app-name {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-developer {
    font-size: 13px;
    color: #86868b;
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-description {
    font-size: 13px;
    color: #1d1d1f;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .app-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
  }

  .rating-stars {
    font-weight: 600;
    color: #1d1d1f;
  }

  .review-count {
    color: #86868b;
  }

  .price {
    font-size: 14px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .in-app-purchases {
    font-size: 11px;
    color: #86868b;
    font-weight: normal;
  }

  .app-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: auto;
  }

  .tag {
    background: #f0f0f0;
    color: #666;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: lowercase;
  }

  .app-action {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  .get-button {
    background: #007aff;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #0056cc;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  @media (max-width: 640px) {
    .app-card {
      padding: 12px;
      gap: 10px;
    }

    .app-icon {
      width: 50px;
      height: 50px;
    }

    .app-name {
      font-size: 15px;
    }

    .app-description {
      font-size: 12px;
    }
  }
</style>