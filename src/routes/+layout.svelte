<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { initTheme } from '$lib/stores/theme';
  import { mobileMenuOpen, searchFocusRequest, isTypingTarget } from '$lib/stores/ui';

  onMount(() => {
    initTheme();

    if (!browser) return;

    // Global keyboard shortcuts: "/" or Ctrl/Cmd+K focuses search, Esc closes menus.
    function handleKeydown(event: KeyboardEvent) {
      // Ignore when the user is typing somewhere
      if (isTypingTarget(event.target)) return;

      if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        searchFocusRequest.update((n) => n + 1);
      } else if (event.key === 'Escape') {
        mobileMenuOpen.set(false);
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
  <Header />

  <main class="flex-1 w-full">
    <slot />
  </main>

  <Footer />
</div>
