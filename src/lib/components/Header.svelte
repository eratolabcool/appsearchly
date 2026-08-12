<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import {
    Search as SearchIcon,
    Compass,
    FolderTree,
    TrendingUp,
    Replace,
    Star,
    FileText,
    Menu,
    X,
    PlusCircle,
    Moon,
    Sun
  } from 'lucide-svelte';
  import Fuse from 'fuse.js';
  import appsData from '../../../data/apps.json';
  import { theme, toggleTheme } from '$lib/stores/theme';
  import { mobileMenuOpen, searchFocusRequest } from '$lib/stores/ui';

  let searchQuery = '';
  let scrolled = false;
  let searchResults: any[] = [];
  let isSearchFocused = false;

  // Initialize Fuse.js for client-side search (legacy data uses appName)
  const fuse = new Fuse(appsData, {
    keys: ['appName', 'description', 'category', 'tags'],
    threshold: 0.3,
    includeScore: true
  });

  // Reactive search execution
  $: {
    if (searchQuery.trim().length > 1) {
      searchResults = fuse.search(searchQuery).slice(0, 5).map(result => result.item);
    } else {
      searchResults = [];
    }
  }

  // Handle scroll effect + respond to global search-focus requests
  onMount(() => {
    if (browser) {
      const handleScroll = () => {
        scrolled = window.scrollY > 20;
      };
      window.addEventListener('scroll', handleScroll);

      const unsubscribe = searchFocusRequest.subscribe((request) => {
        if (request > 0) {
          document.getElementById('global-search-input')?.focus();
        }
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        unsubscribe();
      };
    }
  });

  function toggleMobileMenu() {
    mobileMenuOpen.update((open) => !open);
  }

  function closeMobileMenu() {
    mobileMenuOpen.set(false);
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      closeMobileMenu();
      isSearchFocused = false;
    }
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  // Navigation items using Lucide icons
  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Categories', href: '/categories', icon: FolderTree },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
    { name: 'Alternatives', href: '/alternatives', icon: Replace },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Blog', href: '/blog', icon: FileText }
  ];
</script>

<header
  class="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b {scrolled
    ? 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-sm'
    : 'bg-white/80 dark:bg-slate-900/80 border-transparent'}"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">

      <!-- Logo -->
      <a href="/" class="flex-shrink-0 flex items-baseline gap-0.5 group">
        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">App Search</span>
        <span class="text-sm font-semibold text-slate-400 group-hover:text-blue-500 transition-colors">.org</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center space-x-1">
        {#each navItems as item}
          <a
            href="{item.href}"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors {
              $page.url.pathname === item.href
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }"
          >
            <svelte:component this={item.icon} size={16} strokeWidth={2.5} />
            <span>{item.name}</span>
          </a>
        {/each}
      </nav>

      <!-- Right Section: Search (flexible) + actions -->
      <div class="hidden md:flex items-center gap-3 flex-1 justify-end max-w-3xl">
        <!-- Search Bar with Autocomplete (prominent) -->
        <div class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <SearchIcon size={16} />
          </div>
          <input
            id="global-search-input"
            type="text"
            bind:value={searchQuery}
            on:focus={() => isSearchFocused = true}
            on:blur={() => setTimeout(() => isSearchFocused = false, 200)}
            placeholder="Search AI tools..."
            class="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-full leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
            on:keydown={handleSearchKeydown}
          />

          <!-- Search Results Dropdown -->
          {#if isSearchFocused && searchResults.length > 0}
            <div class="absolute top-full mt-2 w-full min-w-[300px] right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
              {#each searchResults as app}
                <a
                  href="/tools/{app.seo?.slug || app.id}"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
                  {#if app.icon && app.icon.startsWith('/')}
                    <img src={app.icon} alt={app.appName} class="w-8 h-8 rounded-lg object-cover" />
                  {:else}
                    <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                      {app.icon && !app.icon.startsWith('/') ? app.icon : app.appName.charAt(0)}
                    </div>
                  {/if}
                  <div>
                    <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{app.appName}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{app.description}</div>
                  </div>
                </a>
              {/each}
              <button
                class="w-full px-4 py-3 text-sm text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-medium transition-colors"
                on:click={handleSearch}
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          {/if}
        </div>

        <!-- Theme toggle -->
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
          on:click={toggleTheme}
        >
          {#if $theme === 'dark'}
            <Sun size={17} />
          {:else}
            <Moon size={17} />
          {/if}
        </button>

        <!-- Submit CTA -->
        <a
          href="/submit"
          class="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-sm font-medium rounded-full shadow-sm hover:shadow transition-all whitespace-nowrap"
        >
          <PlusCircle size={16} />
          <span>Submit</span>
        </a>
      </div>

      <!-- Mobile actions: theme toggle + menu button -->
      <div class="flex md:hidden items-center gap-1">
        <button
          type="button"
          class="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Toggle dark mode"
          on:click={toggleTheme}
        >
          {#if $theme === 'dark'}
            <Sun size={20} />
          {:else}
            <Moon size={20} />
          {/if}
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-expanded={$mobileMenuOpen}
          on:click={toggleMobileMenu}
        >
          <span class="sr-only">Open main menu</span>
          {#if $mobileMenuOpen}
            <X size={24} />
          {:else}
            <Menu size={24} />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if $mobileMenuOpen}
    <div class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div class="px-4 pt-4 pb-3 space-y-3">
        <!-- Mobile Search -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search AI tools..."
            class="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm"
            on:keydown={handleSearchKeydown}
          />
        </div>

        <!-- Mobile Nav Links -->
        <div class="grid grid-cols-2 gap-2 pt-2">
          {#each navItems as item}
            <a
              href="{item.href}"
              class="flex items-center gap-2 px-3 py-3 rounded-xl text-base font-medium transition-colors {
                $page.url.pathname === item.href
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-700'
              }"
              on:click={closeMobileMenu}
            >
              <svelte:component this={item.icon} size={18} />
              {item.name}
            </a>
          {/each}
        </div>

        <div class="pt-4 pb-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href="/submit"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-900 dark:bg-blue-600 text-white text-base font-medium rounded-xl active:bg-slate-800 dark:active:bg-blue-500 transition-colors"
            on:click={closeMobileMenu}
          >
            <PlusCircle size={18} />
            Submit a Tool
          </a>
        </div>
      </div>
    </div>
  {/if}
</header>
