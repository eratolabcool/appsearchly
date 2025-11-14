<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  let mobileMenuOpen = false;
  let searchQuery = '';
  let scrolled = false;

  // Handle scroll effect
  onMount(() => {
    if (browser) {
      const handleScroll = () => {
        scrolled = window.scrollY > 20;
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      closeMobileMenu();
    }
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  // Navigation items
  const navItems = [
    { name: 'Discover', href: '/', icon: '🔍' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Trending', href: '/trending', icon: '🔥' },
    { name: 'Alternatives', href: '/alternatives', icon: '🔄' },
    { name: 'Reviews', href: '/reviews', icon: '⭐' },
    { name: 'Blog', href: '/blog', icon: '📝' }
  ];
</script>

<header class="appsearchly-header {scrolled ? 'scrolled' : ''}">
  <div class="header-container">
    <!-- Logo -->
    <a href="/" class="logo">
      <span class="logo-text">Appsearchly</span>
      <span class="logo-domain">.org</span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="desktop-nav">
      {#each navItems as item}
        <a
          href="{item.href}"
          class="nav-link {$page.url.pathname === item.href ? 'active' : ''}"
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-text">{item.name}</span>
        </a>
      {/each}
    </nav>

    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search apps and software..."
          class="search-input"
          on:keydown={handleSearchKeydown}
        />
        <button class="search-button" on:click={handleSearch} aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- CTA Button -->
    <a href="/submit-app" class="cta-button">
      Submit App
    </a>

    <!-- Mobile Menu Button -->
    <button
      class="mobile-menu-button"
      on:click={toggleMobileMenu}
      aria-label="Toggle menu"
      aria-expanded={mobileMenuOpen}
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div class="mobile-menu-overlay" on:click={closeMobileMenu}>
      <nav class="mobile-menu" on:click|stopPropagation>
        <div class="mobile-search">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search apps..."
            class="mobile-search-input"
            on:keydown={handleSearchKeydown}
          />
          <button class="mobile-search-button" on:click={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>

        {#each navItems as item}
          <a
            href="{item.href}"
            class="mobile-nav-link {$page.url.pathname === item.href ? 'active' : ''}"
            on:click={closeMobileMenu}
          >
            <span class="mobile-nav-icon">{item.icon}</span>
            {item.name}
          </a>
        {/each}

        <a href="/submit-app" class="mobile-cta-button" on:click={closeMobileMenu}>
          Submit App
        </a>

        <a href="/analytics" class="mobile-nav-link" on:click={closeMobileMenu}>
          <span class="mobile-nav-icon">📊</span>
          Analytics
        </a>
      </nav>
    </div>
  {/if}
</header>

<style>
  .appsearchly-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 1000;
    transition: all 0.3s ease;
  }

  .appsearchly-header.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: baseline;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.4rem;
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .logo:hover {
    transform: scale(1.02);
  }

  .logo-text {
    color: var(--primary-color);
  }

  .logo-domain {
    color: var(--secondary-color);
    font-size: 1.1rem;
    margin-left: 2px;
  }

  /* Desktop Navigation */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    text-decoration: none;
    color: var(--text-secondary);
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .nav-link:hover {
    background: rgba(96, 165, 250, 0.1);
    color: var(--primary-color);
  }

  .nav-link.active {
    background: var(--gradient-primary);
    color: white;
  }

  .nav-icon {
    font-size: 1.1rem;
  }

  /* Search */
  .search-container {
    flex: 0 1 300px;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 16px;
    border: 2px solid var(--border-color);
    border-radius: 25px;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
    background: white;
  }

  .search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .search-button {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--gradient-primary);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .search-button:hover {
    transform: translateY(-50%) scale(1.05);
  }

  /* CTA Button */
  .cta-button {
    background: var(--gradient-secondary);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .cta-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
  }

  /* Mobile Menu Button */
  .mobile-menu-button {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    flex-direction: column;
    gap: 4px;
  }

  .hamburger-line {
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    transition: all 0.3s ease;
  }

  /* Mobile Menu */
  .mobile-menu-overlay {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .mobile-menu {
    background: white;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }

  .mobile-search {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .mobile-search-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
  }

  .mobile-search-input:focus {
    border-color: var(--primary-color);
  }

  .mobile-search-button {
    background: var(--gradient-primary);
    border: none;
    border-radius: 8px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    text-decoration: none;
    color: var(--text-secondary);
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .mobile-nav-link:hover {
    background: rgba(96, 165, 250, 0.1);
    color: var(--primary-color);
  }

  .mobile-nav-link.active {
    background: var(--gradient-primary);
    color: white;
  }

  .mobile-nav-icon {
    font-size: 1.2rem;
  }

  .mobile-cta-button {
    display: block;
    background: var(--gradient-secondary);
    color: white;
    padding: 16px;
    border-radius: 8px;
    text-decoration: none;
    text-align: center;
    font-weight: 600;
    margin-top: 20px;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .desktop-nav {
      display: none;
    }

    .mobile-menu-button {
      display: flex;
    }

    .search-container {
      display: none;
    }

    .header-container {
      padding: 0 16px;
    }
  }

  @media (max-width: 768px) {
    .logo {
      font-size: 1.2rem;
    }

    .logo-domain {
      font-size: 1rem;
    }

    .cta-button {
      display: none;
    }
  }
</style>