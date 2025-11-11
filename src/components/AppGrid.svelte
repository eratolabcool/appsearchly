<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { App } from '../stores/apps';
  import AppCard from './AppCard.svelte';

  export let filteredApps: App[] = [];

  const dispatch = createEventDispatcher();

  const handleAppSelect = (app: App) => {
    dispatch('select', app);
  };
</script>

<div class="app-grid">
  {#each filteredApps as app (app.id)}
    <AppCard {app} on:select={() => handleAppSelect(app)} />
  {/each}
</div>

<style lang="scss">
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  @media (max-width: 640px) {
    .app-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  @media (min-width: 1200px) {
    .app-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
  }
</style>