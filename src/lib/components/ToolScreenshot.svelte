
<script lang="ts">
  export let tool = null;
  export let isActive = false;

  let selectedScreenshotIndex = 0;

  function nextScreenshot() {
    if (tool?.screenshots && tool.screenshots.length > 1) {
      selectedScreenshotIndex = (selectedScreenshotIndex + 1) % tool.screenshots.length;
    }
  }

  function prevScreenshot() {
    if (tool?.screenshots && tool.screenshots.length > 1) {
      selectedScreenshotIndex = (selectedScreenshotIndex - 1 + tool.screenshots.length) % tool.screenshots.length;
    }
  }

  function goToScreenshot(index) {
    selectedScreenshotIndex = index;
  }
</script>

<div class="tool-screenshots" class:active={isActive}>
  <div class="screenshots-content">
    <div class="screenshots-header">
      <h2>📸 Screenshots</h2>
      <p>Visual tour of {tool?.appName || 'the tool'} interface and features</p>
    </div>

    {#if tool?.screenshots && tool.screenshots.length > 0}
      <div class="screenshots-gallery">
        <!-- Main Screenshot Display -->
        <div class="main-screenshot">
          <img
            src={tool.screenshots[selectedScreenshotIndex]}
            alt={`${tool.appName} screenshot ${selectedScreenshotIndex + 1}`}
            class="screenshot-image"
          />

          {#if tool.screenshots.length > 1}
            <div class="screenshot-navigation">
              <button
                class="nav-button prev"
                on:click={prevScreenshot}
                aria-label="Previous screenshot"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 3 6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div class="screenshot-counter">
                {selectedScreenshotIndex + 1} / {tool.screenshots.length}
              </div>

              <button
                class="nav-button next"
                on:click={nextScreenshot}
                aria-label="Next screenshot"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 6 15 12 21 18" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          {/if}
        </div>

        <!-- Thumbnail Navigation -->
        {#if tool.screenshots.length > 1}
          <div class="thumbnail-navigation">
            {#each tool.screenshots as screenshot, index}
              <button
                class="thumbnail {selectedScreenshotIndex === index ? 'active' : ''}"
                on:click={() => goToScreenshot(index)}
                aria-label={`Screenshot ${index + 1}`}
              >
                <img
                  src={screenshot}
                  alt={`Thumbnail ${index + 1}`}
                  class="thumbnail-image"
                />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Screenshot Description -->
      <div class="screenshot-description">
        <h3>Interface Preview</h3>
        <p>
          Explore the {tool.appName} interface to understand its design, features, and user experience.
          These screenshots showcase the main functionality and visual design of the tool.
        </p>
        <div class="screenshot-features">
          <div class="screenshot-feature">
            <div class="feature-icon">🎨</div>
            <div>
              <strong>Modern Design</strong>
              <p>Clean and intuitive user interface</p>
            </div>
          </div>
          <div class="screenshot-feature">
            <div class="feature-icon">⚡</div>
            <div>
              <strong>Easy Navigation</strong>
              <p>User-friendly layout and controls</p>
            </div>
          </div>
          <div class="screenshot-feature">
            <div class="feature-icon">🚀</div>
            <div>
              <strong>Powerful Features</strong>
              <p>Advanced functionality at your fingertips</p>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="no-screenshots">
        <div class="no-screenshots-icon">📸</div>
        <h3>Screenshots Coming Soon</h3>
        <p>Visual previews of {tool?.appName || 'this tool'} will be available shortly</p>
        <a
          href={tool?.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="visit-website-btn"
        >
          Visit Website to See Tool
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7M7 7L17 7M7 17L17 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-screenshots {
    background: white;
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .tool-screenshots.active {
    transform: translateY(0);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .screenshots-content {
    padding: 40px;
  }

  .screenshots-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .screenshots-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .screenshots-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .screenshots-gallery {
    margin-bottom: 40px;
  }

  .main-screenshot {
    position: relative;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    background: var(--light-bg);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .screenshot-image {
    width: 100%;
    height: auto;
    aspect-ratio: 16/10;
    object-fit: cover;
    display: block;
  }

  .screenshot-navigation {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.8);
    padding: 12px 20px;
    border-radius: 25px;
    backdrop-filter: blur(10px);
  }

  .nav-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .screenshot-counter {
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .thumbnail-navigation {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .thumbnail {
    background: var(--light-bg);
    border: 3px solid transparent;
    border-radius: 12px;
    padding: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    width: 120px;
    height: 80px;
  }

  .thumbnail:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  .thumbnail.active {
    border-color: var(--primary-color);
    box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
  }

  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .screenshot-description {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
  }

  .screenshot-description h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .screenshot-description p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .screenshot-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    text-align: left;
  }

  .screenshot-feature {
    display: flex;
    align-items: start;
    gap: 16px;
    padding: 24px;
    background: var(--light-bg);
    border-radius: 12px;
  }

  .feature-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .screenshot-feature strong {
    display: block;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 4px;
  }

  .screenshot-feature p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
  }

  .no-screenshots {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }

  .no-screenshots-icon {
    font-size: 4rem;
    margin-bottom: 24px;
    opacity: 0.3;
  }

  .no-screenshots h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .visit-website-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--gradient-primary);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    margin-top: 24px;
    transition: all 0.3s ease;
  }

  .visit-website-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  }

  @media (max-width: 768px) {
    .screenshots-content {
      padding: 30px 20px;
    }

    .screenshots-header h2 {
      font-size: 1.6rem;
    }

    .screenshot-navigation {
      bottom: 16px;
      padding: 10px 16px;
    }

    .nav-button {
      width: 32px;
      height: 32px;
    }

    .thumbnail-navigation {
      gap: 8px;
    }

    .thumbnail {
      width: 80px;
      height: 60px;
    }

    .screenshot-features {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .screenshot-feature {
      padding: 20px;
    }
  }

  @media (max-width: 480px) {
    .screenshot-navigation {
      width: calc(100% - 32px);
      bottom: 16px;
    }

    .thumbnail {
      width: 70px;
      height: 50px;
    }

    .screenshot-features {
      gap: 12px;
    }

    .screenshot-feature {
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }
  }
</style>