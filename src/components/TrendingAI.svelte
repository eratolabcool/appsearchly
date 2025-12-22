<script lang="ts">
  import appsData from '../../data/apps.json';
  import categoriesData from '../../data/categories.json';

  // Filter AI tools with the specified criteria
  const trendingAITools = appsData
    .filter(app =>
      app.monthlyVisits >= 300000 &&
      app.monthlyVisits <= 5000000 &&
      app.growth >= 200000
    )
    .sort((a, b) => b.growth - a.growth);

  // Group by category
  const toolsByCategory = trendingAITools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  function handleToolClick(tool) {
    window.location.href = `/app/${tool.seo.slug}`;
  }

  function getCategoryIcon(categoryName: string): string {
    const categoryKey = Object.keys(categoriesData.categories).find(
      key => categoriesData.categories[key].name === categoryName
    );
    return categoryKey ? categoriesData.categories[categoryKey].icon : '📱';
  }
</script>

<section class="trending-ai-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">
        🔥 Trending <span class="title-highlight">AI Tools</span>
      </h2>
      <p class="section-subtitle">
        Top AI tools with 300K-5M monthly visits and 200K+ growth this month
      </p>
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-number">{trendingAITools.length}</span>
          <span class="stat-label">Tools</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{formatNumber(trendingAITools.reduce((acc, tool) => acc + tool.monthlyVisits, 0))}</span>
          <span class="stat-label">Total Visits</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">+{formatNumber(Math.round(trendingAITools.reduce((acc, tool) => acc + tool.growth, 0) / trendingAITools.length))}</span>
          <span class="stat-label">Avg Growth</span>
        </div>
      </div>
    </div>

    <div class="categories-section">
      {#each Object.entries(toolsByCategory) as [category, tools]}
        <div class="category-group">
          <div class="category-header">
            <span class="category-icon">{getCategoryIcon(category)}</span>
            <h3 class="category-name">{category}</h3>
            <span class="category-count">{tools.length} tools</span>
          </div>

          <div class="tools-grid">
            {#each tools as tool}
              <div
                class="tool-card"
                on:click={() => handleToolClick(tool)}
              >
                <div class="tool-header">
                  <div class="tool-icon">{tool.icon}</div>
                  <div class="tool-info">
                    <h4 class="tool-name">{tool.appName}</h4>
                    <p class="tool-description">{tool.description}</p>
                  </div>
                </div>

                <div class="tool-metrics">
                  <div class="metric">
                    <span class="metric-label">Monthly Visits</span>
                    <span class="metric-value">{formatNumber(tool.monthlyVisits)}</span>
                  </div>
                  <div class="metric growth">
                    <span class="metric-label">Growth</span>
                    <span class="metric-value">+{formatNumber(tool.growth)}</span>
                  </div>
                </div>

                <div class="tool-footer">
                  <div class="rating">
                    <span class="rating-score">⭐ {tool.rating}</span>
                    <span class="rating-count">({tool.reviewCount})</span>
                  </div>
                  <div class="pricing-model">{tool.pricingModel}</div>
                </div>

                <div class="tool-tags">
                  {#each tool.tags.slice(0, 3) as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="top-performers">
      <h3 class="section-title">🏆 Top Performers</h3>
      <div class="performers-grid">
        <div class="performer-card">
          <div class="performer-title">Most Visited</div>
          <div class="performer-info">
            <span class="performer-icon">🤖</span>
            <div>
              <div class="performer-name">Claude</div>
              <div class="performer-metric">{formatNumber(4500000)} visits</div>
            </div>
          </div>
        </div>

        <div class="performer-card">
          <div class="performer-title">Fastest Growing</div>
          <div class="performer-info">
            <span class="performer-icon">🎭</span>
            <div>
              <div class="performer-name">Character.AI</div>
              <div class="performer-metric">+{formatNumber(380000)} growth</div>
            </div>
          </div>
        </div>

        <div class="performer-card">
          <div class="performer-title">Highest Rated</div>
          <div class="performer-info">
            <span class="performer-icon">🤖</span>
            <div>
              <div class="performer-name">Claude</div>
              <div class="performer-metric">⭐ 4.8 rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .trending-ai-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .title-highlight {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 32px;
  }

  .stats-summary {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 32px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .categories-section {
    margin-bottom: 60px;
  }

  .category-group {
    margin-bottom: 48px;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e2e8f0;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .category-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .category-count {
    font-size: 0.9rem;
    color: var(--text-secondary);
    background: #f1f5f9;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 24px;
  }

  .tool-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
  }

  .tool-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }

  .tool-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  .tool-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .tool-info {
    flex: 1;
  }

  .tool-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .tool-description {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .tool-metrics {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .metric-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .metric.growth .metric-value {
    color: #10b981;
  }

  .tool-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rating-score {
    font-weight: 600;
    color: var(--text-primary);
  }

  .rating-count {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .pricing-model {
    font-size: 0.8rem;
    color: #3b82f6;
    background: #eff6ff;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .tool-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 0.7rem;
    color: var(--text-secondary);
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 8px;
  }

  .top-performers {
    margin-top: 60px;
  }

  .top-performers .section-title {
    text-align: center;
    margin-bottom: 32px;
  }

  .performers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .performer-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    border: 2px solid #e2e8f0;
  }

  .performer-title {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .performer-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .performer-icon {
    font-size: 1.5rem;
  }

  .performer-name {
    font-weight: 700;
    color: var(--text-primary);
  }

  .performer-metric {
    font-size: 0.9rem;
    color: #3b82f6;
    font-weight: 600;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .trending-ai-section {
      padding: 60px 0;
    }

    .section-title {
      font-size: 2rem;
    }

    .stats-summary {
      flex-direction: column;
      gap: 24px;
    }

    .tools-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .performers-grid {
      grid-template-columns: 1fr;
    }

    .tool-header {
      gap: 12px;
    }

    .tool-metrics {
      gap: 16px;
    }
  }
</style>