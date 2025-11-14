<script lang="ts">
  export let app: any;
  export let compact = false;
  export let onSelect: ((app: any) => void) | null = null;

  function handleClick() {
    if (onSelect) {
      onSelect(app);
    } else if (app.url) {
      window.open(app.url, '_blank');
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }

  $: priceDisplay = app.price === 0 ? 'Free' : `$${app.price}`;
  $: platformIcon = getPlatformIcon(app.platform);
  $: ratingStars = generateStars(app.rating || 0);

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case 'ios': return '📱';
      case 'android': return '🤖';
      case 'web': return '🌐';
      case 'desktop': return '💻';
      case 'multi': return '🔄';
      default: return '📱';
    }
  }

  function generateStars(rating: number) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    if (hasHalfStar) {
      stars += '✨';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }
    return stars;
  }
</script>

<div
  class="app-card {compact ? 'compact' : ''}"
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <div class="app-header">
    <div class="app-icon">
      {#if app.icon && app.icon.startsWith('/')}
        <img src={app.icon} alt={app.name} />
      {:else}
        <span class="icon-emoji">{app.icon || platformIcon}</span>
      {/if}
    </div>
    <div class="app-info">
      <h3 class="app-name">{app.name}</h3>
      <p class="app-category">{app.category}</p>
    </div>
    <div class="app-platform">
      <span class="platform-icon">{platformIcon}</span>
    </div>
  </div>

  <div class="app-content">
    <p class="app-description">{app.description}</p>

    <div class="app-meta">
      <div class="rating">
        <span class="stars">{ratingStars}</span>
        <span class="rating-value">{app.rating || 'N/A'}</span>
        {#if app.reviewCount}
          <span class="review-count">({app.reviewCount.toLocaleString()})</span>
        {/if}
      </div>
      <div class="price">
        {priceDisplay}
      </div>
    </div>
  </div>

  <div class="app-footer">
    <div class="action-button">
      <span>View App</span>
      <span class="arrow">→</span>
    </div>
  </div>
</div>

<style>
  .app-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid transparent;
    display: flex;
    flex-direction: column;
  }

  .app-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
  }

  .app-card:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .app-card.compact {
    padding: 15px;
  }

  .app-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
  }

  .app-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--light-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .app-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-emoji {
    font-size: 1.5rem;
  }

  .app-info {
    flex: 1;
    min-width: 0;
  }

  .app-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    line-height: 1.3;
  }

  .app-category {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .app-platform {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
  }

  .platform-icon {
    font-size: 1.2rem;
  }

  .app-content {
    flex: 1;
    margin-bottom: 15px;
  }

  .app-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 15px 0;
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
    gap: 10px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stars {
    font-size: 0.9rem;
  }

  .rating-value {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .review-count {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  .price {
    font-weight: 600;
    color: var(--secondary-color);
    font-size: 0.9rem;
  }

  .app-footer {
    display: flex;
    justify-content: center;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .arrow {
    transition: transform 0.2s ease;
  }

  .app-card:hover .action-button {
    transform: translateY(-1px);
  }

  .app-card:hover .arrow {
    transform: translateX(2px);
  }

  .compact .app-header {
    margin-bottom: 10px;
  }

  .compact .app-icon {
    width: 40px;
    height: 40px;
  }

  .compact .app-name {
    font-size: 1rem;
  }

  .compact .app-description {
    -webkit-line-clamp: 1;
    margin-bottom: 10px;
  }

  .compact .app-meta {
    margin-bottom: 10px;
  }

  @media (max-width: 640px) {
    .app-card {
      padding: 15px;
    }

    .app-header {
      gap: 12px;
    }

    .app-icon {
      width: 40px;
      height: 40px;
    }

    .icon-emoji {
      font-size: 1.2rem;
    }

    .app-name {
      font-size: 1rem;
    }

    .app-description {
      font-size: 0.85rem;
      -webkit-line-clamp: 2;
    }

    .app-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>