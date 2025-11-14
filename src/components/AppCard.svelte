<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { alternativeAffiliateManager } from '../utils/alternative-affiliates';

  export let app: any;

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
      case 'multi':
        return '🌟';
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
  <div class="app-header">
    <div class="app-icon">
      {#if app.icon}
        <img src={app.icon} alt={app.name} loading="lazy" />
      {:else}
        <div class="default-icon">{getPlatformIcon(app.platform)}</div>
      {/if}
      <div class="platform-badge" title={app.platform}>
        {getPlatformIcon(app.platform)}
      </div>
    </div>
    <div class="app-meta">
      <span class="app-category">{app.category}</span>
      <span class="app-price">{formatPrice(app.price, app.currency)}</span>
    </div>
  </div>

  <div class="app-content">
    <h3 class="app-name">{app.name}</h3>
    <p class="app-developer">{app.developer || 'Unknown Developer'}</p>
    <p class="app-description">{app.description}</p>
  </div>

  <div class="app-footer">
    <div class="rating">
      <span class="rating-stars">⭐ {formatRating(app.rating)}</span>
      <span class="review-count">({app.reviewCount.toLocaleString()})</span>
    </div>
    <div class="action-badge">
      View Details
    </div>
  </div>
</div>

<style>
  .app-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .app-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .app-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: var(--primary-color);
  }

  .app-card:hover::before {
    opacity: 1;
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .app-icon {
    position: relative;
    width: 64px;
    height: 64px;
    margin-right: 16px;
  }

  .app-icon img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
  }

  .default-icon {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .platform-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 24px;
    height: 24px;
    background: white;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .app-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .app-category {
    background: rgba(96, 165, 250, 0.1);
    color: var(--primary-color);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .app-price {
    font-weight: 700;
    color: var(--secondary-color);
    font-size: 1.1rem;
  }

  .app-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .app-name {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }

  .app-developer {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .app-description {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .app-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rating-stars {
    font-weight: 600;
    color: #fbbf24;
  }

  .review-count {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .action-badge {
    background: var(--gradient-secondary);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .app-card:hover .action-badge {
    transform: scale(1.05);
  }

  /* Focus styles for accessibility */
  .app-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .app-card {
      padding: 20px;
    }

    .app-icon {
      width: 56px;
      height: 56px;
    }

    .app-name {
      font-size: 1.2rem;
    }

    .app-footer {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .rating {
      justify-content: center;
    }

    .action-badge {
      text-align: center;
    }
  }
</style>