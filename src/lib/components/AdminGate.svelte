<script lang="ts">
  import { Lock, LogIn } from 'lucide-svelte';
  import { adminToken } from '$lib/stores/admin';

  let input = '';
  let error = '';

  function login() {
    const token = input.trim();
    if (token.length < 32) {
      error = 'The admin token must be at least 32 characters.';
      return;
    }
    error = '';
    adminToken.set(token);
  }
</script>

{#if $adminToken}
  <slot />
{:else}
  <main class="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
      <Lock size={24} class="text-slate-500" />
    </div>
    <h1 class="mt-6 text-2xl font-bold">Admin access required</h1>
    <p class="mt-3 text-sm text-slate-500">
      Enter the AppSearchly admin API token to manage tools, submissions, and the acquisition pipeline.
      The token is stored locally in your browser.
    </p>
    <form
      class="mt-8 w-full"
      onsubmit={(e) => { e.preventDefault(); login(); }}
    >
      <input
        type="password"
        bind:value={input}
        placeholder="Admin API token"
        autocomplete="off"
        class="w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-mono text-sm focus:border-blue-500 focus:outline-none"
      />
      {#if error}
        <p class="mt-3 text-sm text-rose-600">{error}</p>
      {/if}
      <button
        type="submit"
        class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
      >
        <LogIn size={16} />
        Unlock admin
      </button>
    </form>
  </main>
{/if}
