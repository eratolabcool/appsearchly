<script lang="ts">
  function handleGetStarted() {
    window.location.href = '/categories';
  }

  function handleSubmitApp() {
    window.location.href = '/submit-app';
  }
</script>

<section class="cta-section">
  <div class="container">
    <div class="cta-content">
      <h2 class="cta-title">
        Ready to Find Your <span class="gradient-text">Perfect</span> App?
      </h2>
      <p class="cta-subtitle">
        Join thousands of users who have discovered their ideal software solutions through Appsearchly.org
      </p>
      <div class="cta-buttons">
        <button class="cta-primary-button" on:click={handleGetStarted}>
          Get Started Now
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button class="cta-secondary-button" on:click={handleSubmitApp}>
          Submit Your App
        </button>
      </div>
    </div>
  </div>
</section>

<style>
  .cta-section {
    background: var(--gradient-dark);
    padding: 100px 0;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .cta-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
    z-index: 1;
  }

  .cta-content {
    text-align: center;
  }

  .cta-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 24px;
    line-height: 1.2;
  }

  .gradient-text {
    background: var(--gradient-secondary);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cta-subtitle {
    font-size: 1.3rem;
    line-height: 1.6;
    margin-bottom: 40px;
    color: rgba(255, 255, 255, 0.8);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .cta-primary-button {
    background: var(--gradient-secondary);
    color: white;
    padding: 20px 40px;
    border: none;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(52, 211, 153, 0.3);
  }

  .cta-primary-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(52, 211, 153, 0.4);
  }

  .cta-secondary-button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    padding: 20px 40px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .cta-secondary-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .cta-section {
      padding: 80px 0;
    }

    .cta-title {
      font-size: 2.2rem;
    }

    .cta-subtitle {
      font-size: 1.1rem;
    }

    .cta-buttons {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }

    .cta-primary-button,
    .cta-secondary-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>