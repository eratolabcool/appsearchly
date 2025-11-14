<script lang="ts">
  const steps = [
    {
      number: '1',
      title: 'Search',
      description: 'Enter keywords or browse categories to find apps that match your needs.',
      icon: '🔍'
    },
    {
      number: '2',
      title: 'Compare',
      description: 'View detailed comparisons, reviews, and ratings to make informed decisions.',
      icon: '⚖️'
    },
    {
      number: '3',
      title: 'Discover',
      description: 'Find perfect alternatives and new tools you didn\'t know existed.',
      icon: '💡'
    },
    {
      number: '4',
      title: 'Install',
      description: 'Direct links to official stores with secure download and installation.',
      icon: '📱'
    }
  ];
</script>

<section class="how-it-works-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">
        How <span class="title-highlight">Appsearchly</span> Works
      </h2>
      <p class="section-subtitle">
        Find your perfect app in four simple steps
      </p>
    </div>

    <div class="steps-grid">
      {#each steps as step}
        <div class="step-card">
          <div class="step-number">{step.number}</div>
          <div class="step-icon">{step.icon}</div>
          <h3 class="step-title">{step.title}</h3>
          <p class="step-description">{step.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .how-it-works-section {
    padding: 80px 0;
    background: white;
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
    background: var(--gradient-primary);
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

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
  }

  .step-card {
    text-align: center;
    position: relative;
    padding: 40px 20px;
  }

  .step-number {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
  }

  .step-icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  .step-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .step-description {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .how-it-works-section {
      padding: 60px 0;
    }

    .section-title {
      font-size: 2rem;
    }

    .steps-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .step-card {
      padding: 30px 15px;
    }
  }
</style>