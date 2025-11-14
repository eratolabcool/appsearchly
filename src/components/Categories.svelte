<script lang="ts">
  const categories = [
    {
      name: 'Productivity',
      icon: '⚡',
      description: 'Tools to boost your efficiency',
      color: '#60a5fa',
      count: 1250
    },
    {
      name: 'Design & Creative',
      icon: '🎨',
      description: 'Visual design and creative tools',
      color: '#8b5cf6',
      count: 890
    },
    {
      name: 'Development',
      icon: '💻',
      description: 'Software development tools',
      color: '#f59e0b',
      count: 1560
    },
    {
      name: 'Business',
      icon: '💼',
      description: 'Business and finance apps',
      color: '#10b981',
      count: 780
    },
    {
      name: 'Education',
      icon: '📚',
      description: 'Learning and educational tools',
      color: '#ef4444',
      count: 920
    },
    {
      name: 'Entertainment',
      icon: '🎮',
      description: 'Games and entertainment',
      color: '#ec4899',
      count: 2100
    }
  ];

  function handleCategoryClick(category) {
    window.location.href = `/category/${category.name.toLowerCase()}`;
  }
</script>

<section class="categories-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">
        Explore <span class="title-highlight">Categories</span>
      </h2>
      <p class="section-subtitle">
        Browse apps by category to find exactly what you need
      </p>
    </div>

    <div class="categories-grid">
      {#each categories as category}
        <button
          class="category-card"
          style="--category-color: {category.color}"
          on:click={() => handleCategoryClick(category)}
        >
          <div class="category-icon" style="background: {category.color}20;">
            {category.icon}
          </div>
          <h3 class="category-name">{category.name}</h3>
          <p class="category-description">{category.description}</p>
          <div class="category-count">
            <span class="count-number">{category.count}</span>
            <span class="count-label">apps</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .categories-section {
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
    background: var(--gradient-secondary);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }

  .category-card {
    background: white;
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .category-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--category-color);
  }

  .category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: var(--category-color);
  }

  .category-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin: 0 auto 20px;
  }

  .category-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .category-description {
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .category-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--text-secondary);
  }

  .count-number {
    font-weight: 700;
    color: var(--category-color);
  }

  .count-label {
    font-size: 0.9rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .categories-section {
      padding: 60px 0;
    }

    .section-title {
      font-size: 2rem;
    }

    .categories-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .category-card {
      padding: 24px 20px;
    }

    .category-icon {
      width: 64px;
      height: 64px;
      font-size: 2rem;
    }
  }
</style>