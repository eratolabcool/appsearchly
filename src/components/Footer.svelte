<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let currentYear: number = new Date().getFullYear();
  let currentPath: string = '';

  // Get current path for active state
  onMount(() => {
    if (browser) {
      currentPath = window.location.pathname;
    }
  });
</script>

<footer class="appsearchly-footer">
  <div class="footer-container">
    <!-- Main Footer Content -->
    <div class="footer-main">
      <!-- About Section -->
      <div class="footer-section">
        <h3 class="footer-title">
          <span class="logo-text">App Search</span>
          <span class="logo-domain">.org</span>
        </h3>
        <p class="footer-description">
          Your intelligent app discovery platform. Find the perfect mobile apps and software tools with our AI-powered recommendation engine.
        </p>
        <div class="social-links">
          <a href="https://twitter.com/appsearchly" target="_blank" rel="noopener" class="social-link" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="https://github.com/appsearchly" target="_blank" rel="noopener" class="social-link" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="https://linkedin.com/company/appsearchly" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="footer-section">
        <h4 class="footer-heading">Discover</h4>
        <nav class="footer-nav">
          <a href="/" class="footer-link {currentPath === '/' ? 'active' : ''}">App Search</a>
          <a href="/categories" class="footer-link {currentPath === '/categories' ? 'active' : ''}">Categories</a>
          <a href="/trending" class="footer-link {currentPath === '/trending' ? 'active' : ''}">Trending Apps</a>
          <a href="/alternatives" class="footer-link {currentPath === '/alternatives' ? 'active' : ''}">App Alternatives</a>
          <a href="/reviews" class="footer-link {currentPath === '/reviews' ? 'active' : ''}">Reviews</a>
        </nav>
      </div>

      <!-- Categories -->
      <div class="footer-section">
        <h4 class="footer-heading">Categories</h4>
        <nav class="footer-nav">
          <a href="/category/productivity" class="footer-link">Productivity</a>
          <a href="/category/design" class="footer-link">Design & Creative</a>
          <a href="/category/development" class="footer-link">Development</a>
          <a href="/category/business" class="footer-link">Business</a>
          <a href="/category/education" class="footer-link">Education</a>
          <a href="/category/entertainment" class="footer-link">Entertainment</a>
        </nav>
      </div>

      <!-- Resources -->
      <div class="footer-section">
        <h4 class="footer-heading">Resources</h4>
        <nav class="footer-nav">
          <a href="/blog" class="footer-link {currentPath === '/blog' ? 'active' : ''}">Blog</a>
          <a href="/guides" class="footer-link {currentPath === '/guides' ? 'active' : ''}">Guides</a>
          <a href="/about" class="footer-link {currentPath === '/about' ? 'active' : ''}">About Us</a>
          <a href="/contact" class="footer-link {currentPath === '/contact' ? 'active' : ''}">Contact</a>
          <a href="/analytics" class="footer-link {currentPath === '/analytics' ? 'active' : ''}">Analytics</a>
        </nav>
      </div>

      <!-- Legal -->
      <div class="footer-section">
        <h4 class="footer-heading">Legal</h4>
        <nav class="footer-nav">
          <a href="/privacy" class="footer-link {currentPath === '/privacy' ? 'active' : ''}">Privacy Policy</a>
          <a href="/terms" class="footer-link {currentPath === '/terms' ? 'active' : ''}">Terms of Service</a>
          <a href="/affiliate-disclosure" class="footer-link {currentPath === '/affiliate-disclosure' ? 'active' : ''}">Affiliate Disclosure</a>
          <a href="/cookies" class="footer-link {currentPath === '/cookies' ? 'active' : ''}">Cookie Policy</a>
        </nav>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p class="copyright">
          © {currentYear} Appsearchly.org. All rights reserved.
        </p>
        <div class="footer-bottom-links">
          <span class="made-with">Made with ❤️ for app discovery</span>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  .appsearchly-footer {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #e2e8f0;
    margin-top: auto;
    width: 100%;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer-main {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 40px;
    padding: 60px 0 40px;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
  }

  .footer-title {
    display: flex;
    align-items: baseline;
    margin-bottom: 16px;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
  }

  .logo-text {
    color: #60a5fa;
  }

  .logo-domain {
    color: #34d399;
    font-size: 1.2rem;
    margin-left: 2px;
  }

  .footer-description {
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 20px;
    max-width: 280px;
  }

  .social-links {
    display: flex;
    gap: 12px;
  }

  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 8px;
    color: #94a3b8;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .social-link:hover {
    background: rgba(96, 165, 250, 0.2);
    color: #60a5fa;
    transform: translateY(-2px);
  }

  .footer-heading {
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .footer-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-link {
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .footer-link:hover {
    color: #60a5fa;
  }

  .footer-link.active {
    color: #34d399;
    font-weight: 500;
  }

  .footer-bottom {
    border-top: 1px solid rgba(148, 163, 184, 0.1);
    padding: 20px 0;
  }

  .footer-bottom-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .copyright {
    color: #64748b;
    margin: 0;
    font-size: 0.9rem;
  }

  .made-with {
    color: #64748b;
    font-size: 0.9rem;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .footer-main {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 30px;
    }

    .footer-section:first-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 768px) {
    .footer-main {
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      padding: 40px 0 30px;
    }

    .footer-section:first-child {
      grid-column: 1 / -1;
    }

    .footer-bottom-content {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .footer-main {
      grid-template-columns: 1fr;
      gap: 25px;
      padding: 30px 0 20px;
    }

    .footer-section {
      text-align: center;
    }

    .social-links {
      justify-content: center;
    }

    .footer-description {
      max-width: 100%;
    }
  }
</style>